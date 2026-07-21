import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { DAILY_QUOTA } from "@/features/ai-writer/constants";
import type { AiWriterMode } from "@/features/ai-writer/types";

const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface QuotaCheck {
  allowed: boolean;
  /** Nombre d'appels déjà effectués sur la fenêtre glissante de 24h. */
  usedCount: number;
}

/**
 * Vérifie le quota glissant de 24h pour un utilisateur (ne l'incrémente pas).
 * `supabase` doit être le client de la session de l'utilisateur (pas
 * service-role) : la RLS de `ai_generations` sert de garde-fou en
 * profondeur si jamais ce `eq('user_id', ...)` avait un bug.
 */
export async function checkQuota(supabase: SupabaseClient, userId: string): Promise<QuotaCheck> {
  const since = new Date(Date.now() - ROLLING_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("ai_generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  const usedCount = count ?? 0;
  return { allowed: usedCount < DAILY_QUOTA, usedCount };
}

/** Enregistre un appel — à appeler seulement après une réponse Groq réussie. */
export async function recordGeneration(
  supabase: SupabaseClient,
  userId: string,
  mode: AiWriterMode,
): Promise<void> {
  await supabase.from("ai_generations").insert({ user_id: userId, mode });
}
