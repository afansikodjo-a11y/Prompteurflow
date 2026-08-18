"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { deriveKey, decryptRefreshToken } from "../lib/quick-access-crypto";
import { setQuickAccessKey } from "../lib/quick-access-key";
import {
  clearQuickAccess,
  getQuickAccessBlob,
  incrementFailCount,
  MAX_QUICK_ACCESS_ATTEMPTS,
  resetFailCount,
} from "../lib/quick-access-storage";
import { LoginForm } from "./login-form";
import { PinInput } from "./pin-input";

/**
 * Devant `<LoginForm />` sur `/login` : si un code d'accès rapide est
 * configuré sur cet appareil, propose le pavé PIN en premier (avec un
 * repli vers le mot de passe) — sinon `LoginForm` directement, comportement
 * inchangé pour qui n'a jamais activé la fonctionnalité.
 *
 * `mode` démarre à `"password"` (identique au rendu serveur, aucun
 * `localStorage` accessible côté serveur) puis bascule sur `"pin"` après
 * montage si un code est trouvé — même motif d'hydratation que
 * `useLocalStorage`.
 */
export function LoginGate() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"password" | "pin">("password");
  const [resetKey, setResetKey] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);

  React.useEffect(() => {
    if (getQuickAccessBlob()) setMode("pin");
  }, []);

  const handlePin = async (pin: string) => {
    const blob = getQuickAccessBlob();
    if (!blob) {
      setMode("password");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const key = await deriveKey(pin, blob.salt);
      const refreshToken = await decryptRefreshToken(key, blob.iv, blob.ciphertext);

      const supabase = createClient();
      const { error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (refreshError) throw refreshError;

      resetFailCount();
      setQuickAccessKey(key);
      router.push("/studio");
      router.refresh();
    } catch {
      const attempts = incrementFailCount();
      setVerifying(false);
      setResetKey((value) => value + 1);
      if (attempts >= MAX_QUICK_ACCESS_ATTEMPTS) {
        clearQuickAccess();
        setMode("password");
        setError("Code oublié trop de fois — reconnectez-vous avec votre mot de passe.");
      } else {
        setError(`Code incorrect (${MAX_QUICK_ACCESS_ATTEMPTS - attempts} essai${MAX_QUICK_ACCESS_ATTEMPTS - attempts > 1 ? "s" : ""} restant${MAX_QUICK_ACCESS_ATTEMPTS - attempts > 1 ? "s" : ""}).`);
      }
    }
  };

  if (mode === "password") {
    return (
      <>
        {error && <p className="text-destructive mb-4 text-sm">{error}</p>}
        <LoginForm />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-sm">Entrez votre code à 4 chiffres.</p>
      <PinInput
        resetKey={resetKey}
        disabled={verifying}
        onComplete={(pin) => void handlePin(pin)}
        aria-label="Code d'accès rapide"
      />
      {error && <p className="text-destructive text-center text-sm">{error}</p>}
      <Button variant="ghost" size="sm" onClick={() => setMode("password")} disabled={verifying}>
        Utiliser mon mot de passe
      </Button>
    </div>
  );
}
