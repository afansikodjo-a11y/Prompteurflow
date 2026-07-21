/**
 * API publique de la feature « affiliate ». Barrel client-safe — aucun
 * fichier `server-only` dans ce dossier. `constants.ts` n'est pas
 * ré-exporté ici : `auth-client.ts` doit l'importer par chemin direct
 * (`@/features/affiliate/constants`), jamais via ce barrel, pour éviter un
 * cycle d'import avec `@/features/auth`.
 */
export { AffiliateDashboard } from "./components/affiliate-dashboard";
export type { AffiliateStats } from "./types";
