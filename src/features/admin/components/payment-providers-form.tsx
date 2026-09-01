"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { useAdminPaymentProviders, type AdminPaymentProviderRow } from "../hooks/use-admin-payment-providers";

const PROVIDER_LABELS: Record<AdminPaymentProviderRow["id"], string> = {
  paydunya: "PayDunya",
  moneroo: "Moneroo",
};

interface ProviderCardProps {
  provider: AdminPaymentProviderRow;
  onToggle: (enabled: boolean) => Promise<void>;
}

function ProviderCard({ provider, onToggle }: ProviderCardProps) {
  const [saving, setSaving] = React.useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaving(true);
    await onToggle(event.target.checked);
    setSaving(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <h3 className="text-lg font-semibold">{PROVIDER_LABELS[provider.id]}</h3>
        <p className="text-muted-foreground text-sm">
          {provider.enabled ? "Actif — proposé aux clients au paiement." : "Désactivé — jamais proposé aux clients."}
        </p>
      </div>
      <Label className="flex items-center gap-2">
        <input type="checkbox" checked={provider.enabled} disabled={saving} onChange={(event) => void handleChange(event)} />
        Actif
      </Label>
    </div>
  );
}

/**
 * Formulaire admin d'activation des fournisseurs de paiement — l'ordre
 * d'essai (PayDunya avant Moneroo) est fixe, pas éditable ici, seule
 * l'activation/désactivation l'est (voir `providers.ts:PROVIDER_ORDER`).
 */
export function PaymentProvidersForm() {
  const { providers, loading, setEnabled } = useAdminPaymentProviders();

  if (loading) return <p className="text-muted-foreground text-sm">Chargement…</p>;

  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} onToggle={(enabled) => setEnabled(provider.id, enabled)} />
      ))}
    </div>
  );
}
