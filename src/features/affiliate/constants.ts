/**
 * Constantes du programme d'affiliation — fichier feuille, aucun import.
 * Lu à la fois par `middleware.ts` (runtime Edge) et par `auth-client.ts`
 * (import par chemin direct, jamais via le barrel — voir `index.ts`), doit
 * rester sans dépendance pour les deux.
 */
export const REFERRAL_COOKIE_NAME = "pf_ref";
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 jours
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{8}$/;
