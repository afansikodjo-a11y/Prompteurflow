import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface UserGrowthPoint {
  /** Jour au format YYYY-MM-DD. */
  date: string;
  count: number;
}

export interface RecentSignup {
  id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

/** Nombre total de comptes créés (tous rôles confondus). */
export async function getTotalUsers(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  return count ?? 0;
}

/**
 * Nouvelles inscriptions par jour sur les `days` derniers jours, un point par
 * jour même sans inscription (0), pour un graphique continu.
 */
export async function getUserGrowth(days: number): Promise<UserGrowthPoint[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  // Agrégation en mémoire plutôt qu'une fonction SQL dédiée : le volume
  // actuel est faible, pas besoin de cette complexité pour l'instant.
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const points: UserGrowthPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    points.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return points;
}

/** Dernières inscriptions, les plus récentes en premier. */
export async function getRecentSignups(limit: number): Promise<RecentSignup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email ?? "",
    role: row.role === "admin" ? "admin" : "user",
    createdAt: row.created_at,
  }));
}
