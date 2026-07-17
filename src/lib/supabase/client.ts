import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Client Supabase navigateur (singleton) — pour les composants et hooks
 * `"use client"`. Un seul instance évite l'avertissement Supabase
 * « Multiple GoTrueClient instances detected ».
 */
export function createClient(): SupabaseClient {
  client ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
