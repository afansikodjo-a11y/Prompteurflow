import { createClient } from "@/lib/supabase/client";
import type { AffiliateStats } from "../types";

/**
 * Construit le lien de parrainage à partager, à partir du code de
 * l'utilisateur. Dérivé de `window.location.origin` plutôt que de
 * `NEXT_PUBLIC_APP_URL` — une variable d'environnement mal configurée (ou
 * pas redéployée) produirait silencieusement un lien relatif cassé,
 * constaté sur le checkout Moneroo pour la même raison.
 */
export function buildReferralLink(code: string): string {
  return `${window.location.origin}/?ref=${code}`;
}

/** Code d'affiliation de l'utilisateur connecté, ou `null` si non connecté / lecture échouée. */
export async function getMyAffiliateCode(): Promise<string | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("profiles").select("affiliate_code").eq("id", auth.user.id).single();
  return data?.affiliate_code ?? null;
}

interface AffiliateStatsRow {
  referred_count: number;
  accrued_total_xof: number;
  paid_total_xof: number;
}

/** Statistiques agrégées du programme d'affiliation pour l'utilisateur connecté. */
export async function getMyAffiliateStats(): Promise<AffiliateStats> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_my_affiliate_stats").single<AffiliateStatsRow>();
  if (error || !data) return { referredCount: 0, accruedTotalXof: 0, paidTotalXof: 0 };
  return {
    referredCount: data.referred_count,
    accruedTotalXof: data.accrued_total_xof,
    paidTotalXof: data.paid_total_xof,
  };
}

/** Taux de commission courant (%), défini par l'admin. */
export async function getCommissionRate(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("affiliate_settings")
    .select("commission_rate_percent")
    .eq("id", true)
    .single();
  return data?.commission_rate_percent ?? 0;
}
