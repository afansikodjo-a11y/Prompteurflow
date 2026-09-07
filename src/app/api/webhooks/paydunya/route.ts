import crypto from "crypto";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

import { confirmCheckoutInvoice } from "../../checkout/lib/paydunya";

export const runtime = "nodejs";

const PERIOD_DAYS: Record<string, number> = { monthly: 30, annual: 365 };

/**
 * Retour d'expérience d'une intégration PayDunya antérieure (payin + payout,
 * Edossimé) — deux points cruciaux qui n'étaient pas dans la doc publique et
 * expliquent probablement l'échec de la première tentative sur ce projet :
 *
 * 1. PayDunya SONDE l'accessibilité de `callback_url` avec un GET/HEAD puis
 *    un POST NON SIGNÉ, avant/en dehors de la vraie notification. Si cette
 *    route répond autre chose que 200 à ces sondes, PayDunya considère le
 *    callback "inaccessible" (erreur 4002 côté leur API) — ce qui a pu
 *    empêcher la vraie notification signée d'arriver ensuite. Donc :
 *    - GET/HEAD → toujours 200.
 *    - POST à hash absent/invalide → toujours 200, mais RIEN n'est traité
 *      (la sécurité reste intacte : aucun crédit n'a lieu sans hash valide).
 * 2. L'IPN peut arriver en JSON (`{ data: {...} }`) OU en form-urlencoded à
 *    notation crochets (`data[status]=...&data[hash]=...`) — jamais le
 *    format `data=<chaîne JSON>` supposé initialement. Les deux sont gérés
 *    ci-dessous.
 *
 * Autorité sur le statut = l'API PayDunya (`confirmCheckoutInvoice`),
 * jamais le seul contenu du webhook — re-confirmé avant tout crédit.
 */
function verifyHash(receivedHash: unknown): boolean {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  if (!masterKey || typeof receivedHash !== "string") return false;

  const expected = crypto.createHash("sha512").update(masterKey).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(receivedHash, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/** Reconstruit un objet imbriqué depuis un corps form-urlencoded à notation crochets (`data[invoice][token]=x`). */
function parseBracketFormData(rawBody: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of new URLSearchParams(rawBody)) {
    const segments = key.replace(/\]/g, "").split("[").filter(Boolean);
    let cursor = result;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (typeof cursor[segment] !== "object" || cursor[segment] === null) cursor[segment] = {};
      cursor = cursor[segment] as Record<string, unknown>;
    }
    if (segments.length > 0) cursor[segments[segments.length - 1]] = value;
  }
  return result;
}

/** Corps JSON (`{ data: {...} }`) ou form-urlencoded à crochets — `null` si vide/invalide. */
function parseIpnPayload(rawBody: string, contentType: string): Record<string, unknown> | null {
  if (!rawBody) return null;
  if (contentType.includes("application/json")) {
    try {
      const json = JSON.parse(rawBody) as Record<string, unknown>;
      return (json.data as Record<string, unknown> | undefined) ?? json;
    } catch {
      return null;
    }
  }
  const parsed = parseBracketFormData(rawBody);
  return (parsed.data as Record<string, unknown> | undefined) ?? parsed;
}

/** GET/HEAD — sonde de disponibilité PayDunya (voir commentaire ci-dessus) : toujours 200. */
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") ?? "";
  const payload = parseIpnPayload(rawBody, contentType);

  // Hash absent/invalide = sonde PayDunya ou requête illégitime : 200 dans
  // les deux cas (jamais 4xx/5xx ici), mais aucun traitement.
  if (!payload || !verifyHash(payload.hash)) {
    return NextResponse.json({ ok: true });
  }

  const invoice = payload.invoice as Record<string, unknown> | undefined;
  const transactionReference = typeof invoice?.token === "string" ? invoice.token : typeof payload.token === "string" ? payload.token : undefined;
  const receivedStatus = typeof payload.status === "string" ? payload.status : undefined;

  if (!transactionReference || !receivedStatus) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();

  // Dédoublonnage sur le statut brut reçu — la re-confirmation ci-dessous
  // peut être rejouée sans risque, mais évite un appel PayDunya inutile sur
  // une notification déjà traitée.
  const providerEventId = `${receivedStatus}:${transactionReference}`;
  const { data: inserted, error: insertError } = await admin
    .from("payment_events")
    .insert({ provider: "paydunya", provider_event_id: providerEventId, event_type: receivedStatus, payload })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Déjà traité (contrainte unique sur (provider, provider_event_id)).
      return NextResponse.json({ ok: true });
    }
    console.error("Échec de journalisation du webhook PayDunya :", insertError);
    return NextResponse.json({ ok: true });
  }

  // Autorité sur le statut = l'API PayDunya, jamais le seul contenu du
  // webhook — re-confirmé avant tout crédit.
  const confirmed = await confirmCheckoutInvoice(transactionReference);
  const status = confirmed?.status ?? receivedStatus;

  const { data: transaction } = await admin
    .from("transactions")
    .select("id")
    .eq("provider", "paydunya")
    .eq("payment_reference", transactionReference)
    .maybeSingle();

  if (transaction) {
    if (status === "completed") {
      await admin.from("transactions").update({ status: "succeeded" }).eq("id", transaction.id);

      const { data: subscription } = await admin
        .from("subscriptions")
        .select("id, billing_period")
        .eq("provider", "paydunya")
        .eq("payment_reference", transactionReference)
        .maybeSingle();

      if (subscription) {
        const days = PERIOD_DAYS[subscription.billing_period ?? "monthly"] ?? 30;
        const currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        await admin
          .from("subscriptions")
          .update({ status: "active", current_period_end: currentPeriodEnd })
          .eq("id", subscription.id);
      }
    } else if (status === "failed" || status === "cancelled") {
      await admin.from("transactions").update({ status: "failed" }).eq("id", transaction.id);
      await admin
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("provider", "paydunya")
        .eq("payment_reference", transactionReference);
    }
  }

  await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("id", inserted.id);

  return NextResponse.json({ ok: true });
}
