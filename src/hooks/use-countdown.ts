"use client";

import * as React from "react";

export interface UseCountdownResult {
  /** Valeur courante du décompte (ex. 3, 2, 1), ou `null` au repos. */
  count: number | null;
  isCounting: boolean;
  /** Démarre un décompte depuis `from`, puis appelle `onComplete` à 0. */
  start: (from: number, onComplete: () => void) => void;
  /** Annule le décompte en cours (le callback n'est pas appelé). */
  cancel: () => void;
}

/**
 * Compte à rebours simple, piloté par effet (un `setTimeout` par seconde).
 * Réutilisable — aucune logique métier, donc facilement testable.
 */
export function useCountdown(): UseCountdownResult {
  const [count, setCount] = React.useState<number | null>(null);
  const onCompleteRef = React.useRef<(() => void) | null>(null);

  const start = React.useCallback((from: number, onComplete: () => void) => {
    onCompleteRef.current = onComplete;
    setCount(Math.max(1, Math.floor(from)));
  }, []);

  const cancel = React.useCallback(() => {
    onCompleteRef.current = null;
    setCount(null);
  }, []);

  React.useEffect(() => {
    if (count === null) return;

    if (count <= 0) {
      const callback = onCompleteRef.current;
      onCompleteRef.current = null;
      setCount(null);
      callback?.();
      return;
    }

    const timer = window.setTimeout(() => {
      setCount((current) => (current === null ? null : current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [count]);

  return { count, isCounting: count !== null, start, cancel };
}
