"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "../constants";
import { useAuth } from "../hooks/use-auth";

/**
 * Nouveau mot de passe — n'a de sens qu'après avoir suivi un lien de
 * réinitialisation (session temporaire déjà établie par `/auth/callback`) ;
 * sans session active, affiche un message d'erreur au lieu du formulaire.
 */
export function ResetPasswordForm() {
  const { user, loading: authLoading, updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/studio");
      router.refresh();
    }, 1500);
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <p className="text-sm">
        Ce lien de réinitialisation est invalide ou a expiré.{" "}
        <Link href="/mot-de-passe-oublie" className="underline">
          Redemandez un email
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return <p className="text-sm">Mot de passe mis à jour. Redirection…</p>;
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password">Nouveau mot de passe</Label>
        <Input
          id="reset-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11"
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </Button>
    </form>
  );
}
