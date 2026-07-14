"use client";

import * as React from "react";

/**
 * État React synchronisé avec `localStorage`.
 *
 * SSR-safe : la valeur initiale est utilisée au premier rendu (serveur + client),
 * puis la valeur stockée est chargée après montage — ce qui évite tout écart
 * d'hydratation. L'écriture n'a lieu qu'après ce chargement.
 *
 * @param key   Clé de stockage.
 * @param initialValue Valeur par défaut si rien n'est stocké.
 * @returns `[value, setValue, hydrated]` — `hydrated` passe à `true` une fois
 *          la valeur persistée relue.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [value, setValue] = React.useState<T>(initialValue);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // localStorage indisponible ou JSON invalide : on garde la valeur par défaut.
    }
    setHydrated(true);
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota dépassé ou stockage bloqué : on ignore silencieusement.
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
