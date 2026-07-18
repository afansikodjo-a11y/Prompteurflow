import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Garde d'accès admin — Server Component (seule dérogation à la convention
 * `"use client"` du projet) : seul un check serveur empêche le HTML/JS de
 * cette page d'atteindre un navigateur non-admin. La vraie barrière reste la
 * RLS sur `plans` ; ce check est une seconde ligne de défense, jamais la
 * seule.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/studio");

  return <>{children}</>;
}
