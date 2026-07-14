"use client";

import * as React from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";

/**
 * Point d'entrée unique des providers côté client.
 * Ajoutez ici les futurs providers (état global, requêtes, i18n…).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
