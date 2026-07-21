"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import type { AdminCustomerRow } from "../types";

export interface UseAdminCustomersResult {
  customers: AdminCustomerRow[];
  loading: boolean;
  updatePhone: (id: string, phone: string) => Promise<void>;
  toggleStatus: (id: string, disabled: boolean) => Promise<{ error: string | null }>;
}

interface CustomerRow {
  id: string;
  email: string | null;
  role: string;
  phone: string | null;
  disabled_at: string | null;
  created_at: string;
}

/** Liste complète des comptes clients pour le panneau admin (lecture déjà admin-only via RLS). */
export function useAdminCustomers(): UseAdminCustomersResult {
  const [customers, setCustomers] = React.useState<AdminCustomerRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, role, phone, disabled_at, created_at")
      .order("created_at", { ascending: false });

    setCustomers(
      ((data ?? []) as CustomerRow[]).map((row) => ({
        id: row.id,
        email: row.email ?? "",
        role: row.role === "admin" ? "admin" : "user",
        phone: row.phone,
        disabledAt: row.disabled_at,
        createdAt: row.created_at,
      })),
    );
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const updatePhone = React.useCallback(
    async (id: string, phone: string) => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ phone: phone.trim() || null })
        .eq("id", id);
      await refresh();
    },
    [refresh],
  );

  const toggleStatus = React.useCallback(
    async (id: string, disabled: boolean): Promise<{ error: string | null }> => {
      try {
        const response = await fetch("/api/admin/customers/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, disabled }),
        });
        const body = await response.json();
        if (!response.ok) {
          return { error: body.error ?? "Impossible de modifier le statut du compte." };
        }
        await refresh();
        return { error: null };
      } catch {
        return { error: "Impossible de contacter le serveur. Vérifiez votre connexion." };
      }
    },
    [refresh],
  );

  return { customers, loading, updatePhone, toggleStatus };
}
