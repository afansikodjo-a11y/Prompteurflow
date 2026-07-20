import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface RevenueSummary {
  /** `false` tant qu'aucune transaction n'a été enregistrée — jamais un montant à zéro présenté comme une vraie donnée. */
  hasData: boolean;
  totalXof: number;
  transactionCount: number;
}

/**
 * Résumé des revenus sur la période, depuis `transactions` (voir migration
 * `0004_transactions.sql`). Cette table reste vide tant que le checkout/
 * webhook Moneroo réel n'est pas branché — logique de calcul déjà prête,
 * pour s'activer automatiquement le jour où de vraies lignes arrivent, sans
 * modification de ce fichier.
 */
export async function getRevenueSummary(days: number): Promise<RevenueSummary> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("transactions")
    .select("amount_xof")
    .eq("status", "succeeded")
    .gte("created_at", since.toISOString());

  const rows = data ?? [];
  if (rows.length === 0) return { hasData: false, totalXof: 0, transactionCount: 0 };

  return {
    hasData: true,
    totalXof: rows.reduce((sum, row) => sum + row.amount_xof, 0),
    transactionCount: rows.length,
  };
}
