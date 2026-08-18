"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { deriveKey, encryptRefreshToken, generateSalt } from "../lib/quick-access-crypto";
import { setQuickAccessKey } from "../lib/quick-access-key";
import { markQuickAccessOffered, saveQuickAccessBlob } from "../lib/quick-access-storage";
import { PinInput } from "./pin-input";

interface QuickAccessSetupDialogProps {
  open: boolean;
  /** Appelé une fois terminé, que le code ait été défini ou refusé — jamais reproposé après ça sur cet appareil. */
  onDone: () => void;
}

/**
 * Proposée une seule fois, juste après une connexion réussie par mot de
 * passe : définir un code à 4 chiffres pour un accès plus rapide la
 * prochaine fois SUR CET APPAREIL. Local et révocable — jamais un
 * remplacement du mot de passe (voir `quick-access-crypto.ts` pour le
 * compromis de sécurité assumé).
 */
export function QuickAccessSetupDialog({ open, onDone }: QuickAccessSetupDialogProps) {
  const [step, setStep] = React.useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [resetKey, setResetKey] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const skip = () => {
    markQuickAccessOffered();
    onDone();
  };

  const handleFirstEntry = (pin: string) => {
    setFirstPin(pin);
    setStep("confirm");
    setResetKey((key) => key + 1);
  };

  const handleConfirmEntry = async (pin: string) => {
    if (pin !== firstPin) {
      setError("Les deux codes ne correspondent pas — réessayez.");
      setStep("enter");
      setFirstPin(null);
      setResetKey((key) => key + 1);
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const refreshToken = session?.refresh_token;
      if (!refreshToken) {
        setError("Impossible d'activer l'accès rapide pour l'instant.");
        setSaving(false);
        return;
      }

      const salt = generateSalt();
      const key = await deriveKey(pin, salt);
      const { iv, ciphertext } = await encryptRefreshToken(key, refreshToken);
      saveQuickAccessBlob({ salt, iv, ciphertext });
      setQuickAccessKey(key);
      markQuickAccessOffered();
      onDone();
    } catch {
      setError("Impossible d'activer l'accès rapide pour l'instant.");
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && skip()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accès rapide sur cet appareil</DialogTitle>
          <DialogDescription>
            {step === "enter"
              ? "Définissez un code à 4 chiffres pour vous reconnecter plus vite la prochaine fois, sans retaper votre mot de passe. Propre à cet appareil, jamais un remplacement de votre mot de passe."
              : "Confirmez le code."}
          </DialogDescription>
        </DialogHeader>

        <PinInput
          key={step}
          resetKey={resetKey}
          disabled={saving}
          onComplete={(pin) => void (step === "enter" ? handleFirstEntry(pin) : handleConfirmEntry(pin))}
          aria-label={step === "enter" ? "Nouveau code" : "Confirmer le code"}
        />

        {error && <p className="text-destructive text-center text-sm">{error}</p>}

        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={skip} disabled={saving}>
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
