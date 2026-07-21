"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AffiliateAccessFormProps {
  onGrant: (email: string) => Promise<{ error: string | null }>;
}

/** Active le programme d'affiliation pour un compte, par email — sur demande, jamais automatique. */
export function AffiliateAccessForm({ onGrant }: AffiliateAccessFormProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const result = await onGrant(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setEmail("");
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3 rounded-lg border p-4">
      <div>
        <h3 className="text-lg font-semibold">Activer l&apos;affiliation</h3>
        <p className="text-muted-foreground text-sm">
          Programme sur demande — active-le pour un compte via son email.
        </p>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="affiliate-access-email">Email du compte</Label>
          <Input
            id="affiliate-access-email"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setSuccess(false);
              setEmail(event.target.value);
            }}
          />
        </div>
        <Button type="submit" disabled={submitting}>
          Activer
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {success && <p className="text-muted-foreground text-sm">Affiliation activée.</p>}
    </form>
  );
}
