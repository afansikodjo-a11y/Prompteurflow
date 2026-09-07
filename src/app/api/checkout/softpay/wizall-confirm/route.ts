import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { wizallConfirm } from "../../lib/paydunya-softpay";

export const runtime = "nodejs";

function errorResponse(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * Second appel du flux Wizall (Sénégal) : le code reçu par SMS après
 * `wizallInitiate`. Ne touche jamais `transactions`/`subscriptions` — la
 * facture d'origine (créée dans `/api/checkout/softpay`, `payment_reference`
 * = le token PayDunya) est créditée par le webhook existant une fois
 * PayDunya lui-même confirmé, exactement comme les autres opérateurs.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorResponse(401, "Connectez-vous pour vous abonner.");

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(400, "Requête invalide.");
  }

  const record = rawBody as Record<string, unknown>;
  const transactionId = typeof record.transactionId === "string" ? record.transactionId : null;
  const phone = typeof record.phone === "string" ? record.phone : null;
  const authorizationCode = typeof record.authorizationCode === "string" ? record.authorizationCode : null;
  if (!transactionId || !phone || !authorizationCode) {
    return errorResponse(400, "Requête invalide — vérifiez le code saisi.");
  }

  const result = await wizallConfirm({ transactionId, phone, authorizationCode });
  if (result.status === "error") {
    return NextResponse.json({ status: "error", message: result.message }, { status: 400 });
  }
  return NextResponse.json({ status: "success", message: result.message });
}
