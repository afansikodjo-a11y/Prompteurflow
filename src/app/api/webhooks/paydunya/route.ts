import crypto from "crypto";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PERIOD_DAYS: Record<string, number> = { monthly: 30, annual: 365 };

/**
 * ⚠️ Enveloppe et noms de champs déduits de la doc publique
 * (developers.paydunya.com/doc/FR/http_json) — jamais reçu de vraie
 * notification IPN au moment d'écrire ceci. Deux points confirmés par
 * plusieurs sources concordantes, le reste (noms exacts des champs status/
 * token dans `data`) est du best-effort :
 * - PayDunya poste en `application/x-www-form-urlencoded`, la charge utile
 *   est dans le champ `data` sous forme de chaîne JSON (pas un body JSON
 *   direct comme Moneroo/SasPay).
 * - Authenticité vérifiée via `hash` = SHA-512(PAYDUNYA_MASTER_KEY) — une
 *   valeur constante à comparer en temps constant, pas une signature HMAC
 *   par requête (limite documentée du côté de PayDunya, pas une erreur
 *   d'implémentation ici).
 * À vérifier avec un vrai appel avant d'activer ce fournisseur dans
 * `payment_providers` (désactivé par défaut, voir migration 0019).
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

/**
 * POST appelé par les serveurs PayDunya (IPN), jamais par un navigateur.
 * Miroir de `webhooks/moneroo/route.ts` (dédoublonnage via `payment_events`,
 * activation d'abonnement) — seuls le format d'enveloppe et le mécanisme
 * d'authenticité diffèrent.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  let dataJson: string | null = null;
  try {
    dataJson = new URLSearchParams(rawBody).get("data");
  } catch {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
  }
  if (!dataJson) {
    return NextResponse.json({ error: "Payload incomplet." }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(dataJson);
  } catch {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
  }

  if (!verifyHash(payload.hash)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 403 });
  }

  const invoice = payload.invoice as Record<string, unknown> | undefined;
  const transactionReference = typeof invoice?.token === "string" ? invoice.token : typeof payload.token === "string" ? payload.token : undefined;
  const status = typeof payload.status === "string" ? payload.status : undefined;

  if (!transactionReference || !status) {
    return NextResponse.json({ error: "Payload incomplet." }, { status: 400 });
  }

  // PayDunya ne fournit pas d'id d'événement dédié — même raisonnement que
  // Moneroo pour la clé de dédoublonnage : "statut:référence".
  const providerEventId = `${status}:${transactionReference}`;

  const admin = createAdminClient();

  const { data: inserted, error: insertError } = await admin
    .from("payment_events")
    .insert({ provider: "paydunya", provider_event_id: providerEventId, event_type: status, payload })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Déjà traité (contrainte unique sur (provider, provider_event_id)) —
      // jamais rejouer les effets de bord (double activation d'abonnement).
      return NextResponse.json({ ok: true });
    }
    console.error("Échec de journalisation du webhook PayDunya :", insertError);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

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
