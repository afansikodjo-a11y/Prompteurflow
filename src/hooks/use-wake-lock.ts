"use client";

import * as React from "react";

/**
 * Empêche l'écran de s'éteindre/se verrouiller tant que `active` est vrai.
 *
 * Sans ça, un enregistrement long où personne ne touche l'écran (cas
 * courant : parler face caméra) finit par voir le téléphone se verrouiller
 * tout seul — le navigateur suspend alors le flux caméra (l'image se fige)
 * pendant que l'enregistrement continue en apparence (le minuteur avance),
 * et le son finit aussi par s'interrompre peu après. Constaté sur un
 * enregistrement de 16 minutes.
 *
 * Support variable selon les navigateurs (Screen Wake Lock API, pas
 * disponible partout, ex. Firefox desktop) : échoue silencieusement là où
 * elle n'existe pas ou est refusée, sans jamais bloquer l'enregistrement
 * pour autant — c'est un filet, pas une dépendance dure.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = React.useRef<WakeLockSentinel | null>(null);

  React.useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
      } catch {
        // Refus (rare, ex. batterie critique sur certains navigateurs) : on
        // continue sans, l'enregistrement lui-même n'en dépend pas.
      }
    };

    void acquire();

    // Le verrou est automatiquement relâché par le navigateur dès que
    // l'onglet devient invisible (bascule d'appli, mise en veille
    // manuelle) — on le redemande dès qu'il redevient visible, tant que
    // l'enregistrement est toujours actif.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !sentinelRef.current) {
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [active]);
}
