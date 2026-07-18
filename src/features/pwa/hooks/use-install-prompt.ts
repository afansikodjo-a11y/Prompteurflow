"use client";

import * as React from "react";

/** Événement non-standard (Chromium) — absent de lib.dom.d.ts. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UseInstallPromptResult {
  /** `true` si l'app tourne déjà en mode installé (standalone) — rien à proposer. */
  isInstalled: boolean;
  /** `true` si le navigateur peut déclencher l'invite native (Chrome/Edge, Android). */
  canInstall: boolean;
  /** `true` sur Safari iOS — aucune invite programmable là-bas, il faut guider manuellement (Partager → Sur l'écran d'accueil). */
  isIosSafari: boolean;
  /** Déclenche l'invite native ; sans effet si `canInstall` est faux. */
  promptInstall: () => Promise<void>;
}

/**
 * Détecte si l'app peut être installée et expose de quoi le proposer.
 *
 * Deux navigateurs, deux mécanismes : Chrome/Edge/Android exposent
 * `beforeinstallprompt` (invite programmable) ; Safari iOS n'a aucune API et
 * exige un geste manuel (Partager → Sur l'écran d'accueil) — d'où `isIosSafari`,
 * à utiliser pour afficher des instructions plutôt qu'un bouton d'action.
 */
export function useInstallPrompt(): UseInstallPromptResult {
  const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  // Calculé côté client uniquement (useEffect, jamais useMemo) : `navigator`
  // n'existe pas côté serveur, donc dériver cette valeur pendant le rendu
  // ferait diverger le premier rendu client du HTML serveur (mismatch
  // d'hydratation constaté en test — le rendu client initial doit rester
  // identique au serveur, `false` ici, et ne se corriger qu'après montage).
  const [isIosSafari, setIsIosSafari] = React.useState(false);

  React.useEffect(() => {
    const standaloneMql = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standaloneMql || iosStandalone);

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    setIsIosSafari(isIos && isSafari);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPromptRef.current = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = React.useCallback(async () => {
    const deferred = deferredPromptRef.current;
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferredPromptRef.current = null;
    setCanInstall(false);
  }, []);

  return { isInstalled, canInstall, isIosSafari, promptInstall };
}
