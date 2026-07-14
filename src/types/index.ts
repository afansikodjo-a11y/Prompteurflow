/**
 * Types transverses partagés dans toute l'application.
 * Les types propres à une feature vivent dans `features/<feature>/types`.
 */

export type Nullable<T> = T | null;

export type WithChildren<T = unknown> = T & {
  children: React.ReactNode;
};
