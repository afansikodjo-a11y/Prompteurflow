"use client";

import * as React from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { resetPasswordForEmail, signIn, signOut, signUp, updatePassword } from "../lib/auth-client";
import type { AuthUser, UseAuthResult } from "../types";

export const AuthContext = React.createContext<UseAuthResult | null>(null);

/** Résout le rôle et le statut d'affiliation (`profiles`) de l'utilisateur authentifié. */
async function loadProfile(supabase: SupabaseClient, authUser: User): Promise<AuthUser> {
  const { data } = await supabase
    .from("profiles")
    .select("role, is_affiliate")
    .eq("id", authUser.id)
    .single();
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    role: data?.role === "admin" ? "admin" : "user",
    isAffiliate: data?.is_affiliate ?? false,
  };
}

/**
 * Fournit la session Supabase (+ rôle) à toute l'app — un seul abonnement
 * `onAuthStateChange`, partagé via contexte pour que chaque `useAuth()` ne
 * re-souscrive pas individuellement.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabaseRef = React.useRef<SupabaseClient>(undefined);
  supabaseRef.current ??= createClient();

  React.useEffect(() => {
    const supabase = supabaseRef.current!;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) void loadProfile(supabase, data.user).then(setUser);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadProfile(supabase, session.user).then(setUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = React.useMemo<UseAuthResult>(
    () => ({ user, loading, signUp, signIn, signOut, resetPasswordForEmail, updatePassword }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
