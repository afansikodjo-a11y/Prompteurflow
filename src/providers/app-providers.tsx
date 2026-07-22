"use client";

import * as React from "react";
import { SerwistProvider } from "@serwist/next/react";

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
      {/* `next.config.ts` ne génère `/sw.js` qu'en production (`disable`
          identique côté build) — sans ce provider, le fichier était bien
          construit mais jamais enregistré dans le navigateur : aucun
          service worker actif, ce qui rend l'installation PWA peu fiable
          (Android en particulier) même quand l'invite native s'affichait. */}
      <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"}>
        <AuthProvider>{children}</AuthProvider>
      </SerwistProvider>
    </ThemeProvider>
  );
}
