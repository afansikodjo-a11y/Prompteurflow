import crypto from "crypto";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PERIOD_DAYS: Record<string, number> = { monthly: 30, annual: 365 };

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.MONEROO_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signatureHeader, "utf8");
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

/**
 * POST appelé par les serveurs Moneroo, jamais par un navigateur — corps
 * brut lu en premier (jamais `request.json()` avant la vérification, le
 * HMAC porte sur les octets exacts envoyés).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-moneroo-signature");

  if (!verifySignature(rawBody, signature)) {
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
  const transactionReference = typeof data?.id === "string" ? data.id : undefined;

  // Clé de dédoublonnage : préfère un id d'événement de premier niveau s'il
  // existe (non garanti par la doc publique de Moneroo), sinon compose
  // "type:référence" — pas juste la référence de transaction seule, qui
  // serait partagée par plusieurs types d'événements successifs
  // (initiated/success/failed) pour un même paiement et les ferait se
  // dédoublonner à tort entre eux.
  const monerooEventId =
    typeof payload.id === "string"
      ? payload.id
      : eventType && transactionReference
        ? `${eventType}:${transactionReference}`
        : undefined;

  if (!eventType || !monerooEventId) {
    return NextResponse.json({ error: "Payload incomplet." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: inserted, error: insertError } = await admin
    .from("payment_events")
    .insert({ moneroo_event_id: monerooEventId, event_type: eventType, payload })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Déjà traité (contrainte unique sur moneroo_event_id) — jamais
      // rejouer les effets de bord (double activation d'abonnement).
      return NextResponse.json({ ok: true });
    }
    console.error("Échec de journalisation du webhook Moneroo :", insertError);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  if (transactionReference) {
    const { data: transaction } = await admin
      .from("transactions")
      .select("id")
      .eq("moneroo_payment_reference", transactionReference)
      .maybeSingle();

    if (transaction) {
      if (eventType === "payment.success") {
        await admin.from("transactions").update({ status: "succeeded" }).eq("id", transaction.id);

        const { data: subscription } = await admin
          .from("subscriptions")
          .select("id, billing_period")
          .eq("moneroo_payment_reference", transactionReference)
          .maybeSingle();

        if (subscription) {
          const days = PERIOD_DAYS[subscription.billing_period ?? "monthly"] ?? 30;
          const currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
          await admin
            .from("subscriptions")
            .update({ status: "active", current_period_end: currentPeriodEnd })
            .eq("id", subscription.id);
        }
      } else if (eventType === "payment.failed" || eventType === "payment.cancelled") {
        await admin.from("transactions").update({ status: "failed" }).eq("id", transaction.id);
        await admin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("moneroo_payment_reference", transactionReference);
      }
    }
  }

  await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("id", inserted.id);

  return NextResponse.json({ ok: true });
}
