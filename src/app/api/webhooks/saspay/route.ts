import crypto from "crypto";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PERIOD_DAYS: Record<string, number> = { monthly: 30, annual: 365 };
// Tolérance recommandée par la doc SasPay (docs.saspay.me/api-reference/webhooks).
const TIMESTAMP_TOLERANCE_SECONDS = 300;

/**
 * Signature SasPay : HMAC-SHA256 sur `"{timestamp}.{corps brut}"`, digest en
 * hex minuscules — distinct du schéma Moneroo (HMAC sur le corps seul).
 * Rejette aussi un timestamp trop ancien/futur (rejeu), avant même de
 * vérifier la signature.
 */
function verifySignature(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !timestamp) return false;

  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

/**
 * POST appelé par les serveurs SasPay, jamais par un navigateur — corps
 * brut lu en premier (jamais `request.json()` avant la vérification, le
 * HMAC porte sur les octets exacts envoyés). Miroir de
 * `webhooks/moneroo/route.ts` (même dédoublonnage via `payment_events`,
 * même activation d'abonnement) — seuls le schéma de signature et les noms
 * d'événements diffèrent entre les deux fournisseurs.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!verifySignature(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
  }

  const eventType = typeof payload.event === "string" ? payload.event : undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  // Doc SasPay : `data.id` (identifiant) et/ou `data.reference` selon les
  // événements — on tente les deux, la valeur retenue doit correspondre à
  // celle stockée dans `payment_reference` au moment du checkout
  // (`transactionId` renvoyé par `saspay.ts`).
  const transactionReference =
    typeof data?.id === "string" ? data.id : typeof data?.reference === "string" ? data.reference : undefined;

  // Clé de dédoublonnage : préfère un id d'événement de premier niveau s'il
  // existe, sinon compose "type:référence" — même raisonnement que le
  // webhook Moneroo (une seule référence de transaction est réutilisée par
  // plusieurs événements successifs : created/success/failed).
  const providerEventId =
    typeof payload.id === "string"
      ? payload.id
      : eventType && transactionReference
        ? `${eventType}:${transactionReference}`
        : undefined;

  if (!eventType || !providerEventId) {
    return NextResponse.json({ error: "Payload incomplet." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: inserted, error: insertError } = await admin
    .from("payment_events")
    .insert({ provider: "saspay", provider_event_id: providerEventId, event_type: eventType, payload })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Déjà traité (contrainte unique sur (provider, provider_event_id)) —
      // jamais rejouer les effets de bord (double activation d'abonnement).
      return NextResponse.json({ ok: true });
    }
    console.error("Échec de journalisation du webhook SasPay :", insertError);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  if (transactionReference) {
    const { data: transaction } = await admin
      .from("transactions")
      .select("id")
      .eq("provider", "saspay")
      .eq("payment_reference", transactionReference)
      .maybeSingle();

    if (transaction) {
      if (eventType === "transaction.success") {
        await admin.from("transactions").update({ status: "succeeded" }).eq("id", transaction.id);

        const { data: subscription } = await admin
          .from("subscriptions")
          .select("id, billing_period")
          .eq("provider", "saspay")
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
      } else if (eventType === "transaction.failed" || eventType === "transaction.cancelled") {
        await admin.from("transactions").update({ status: "failed" }).eq("id", transaction.id);
        await admin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("provider", "saspay")
          .eq("payment_reference", transactionReference);
      }
    }
  }

  await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("id", inserted.id);

  return NextResponse.json({ ok: true });
}
