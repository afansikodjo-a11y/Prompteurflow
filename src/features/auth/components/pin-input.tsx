"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

const DIGITS = 4;

interface PinInputProps {
  /** Réinitialisé (cases vidées, focus sur la première) à chaque changement de valeur — utile pour effacer après un mauvais code. */
  resetKey?: number;
  disabled?: boolean;
  onComplete: (pin: string) => void;
  "aria-label"?: string;
}

/** Saisie d'un code à 4 chiffres : une case par chiffre, avance automatique, retour arrière, collage du code complet géré. */
export function PinInput({ resetKey, disabled, onComplete, "aria-label": ariaLabel }: PinInputProps) {
  const [values, setValues] = React.useState<string[]>(Array(DIGITS).fill(""));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    setValues(Array(DIGITS).fill(""));
    inputRefs.current[0]?.focus();
  }, [resetKey]);

  const commitIfComplete = (next: string[]) => {
    if (next.every((digit) => digit !== "")) onComplete(next.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setValues((current) => {
      const next = [...current];
      next[index] = digit;
      commitIfComplete(next);
      return next;
    });
    if (digit && index < DIGITS - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (!digits) return;
    event.preventDefault();
    const next = Array(DIGITS)
      .fill("")
      .map((_, i) => digits[i] ?? "");
    setValues(next);
    commitIfComplete(next);
    inputRefs.current[Math.min(digits.length, DIGITS - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-3" role="group" aria-label={ariaLabel}>
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 w-12 text-center text-lg"
          aria-label={`Chiffre ${index + 1}`}
        />
      ))}
    </div>
  );
}
