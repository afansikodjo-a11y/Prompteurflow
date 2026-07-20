"use client";

import * as React from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/features/auth";

/**
 * Point d'entrée unique des providers côté client.
 * Ajoutez ici les futurs providers (état global, requêtes, i18n…).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // Thème forcé en sombre (`.dark`) : la landing marketing est déjà fixe
    // en sombre+vert, et le reste de l'app (studio, admin, login…) doit
    // s'aligner sur la même direction artistique — plus de bascule clair/
    // sombre à proposer, voir `ModeToggle` retiré de `SiteHeader`.
    <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
