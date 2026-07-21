"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAffiliateSettings } from "../hooks/use-admin-affiliate-settings";

/** Taux de commission global du programme d'affiliation — un seul champ, même moule qu'une carte de plan. */
export function AffiliateRateForm() {
  const { ratePercent, loading, update } = useAdminAffiliateSettings();
  const [draft, setDraft] = React.useState(ratePercent);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => setDraft(ratePercent), [ratePercent]);

  if (loading) return <p className="text-muted-foreground text-sm">Chargement…</p>;

  const handleSave = async () => {
    setSaving(true);
    await update(draft);
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Taux de commission</h3>
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="affiliate-rate">Pourcentage sur chaque paiement d&apos;un filleul</Label>
          <Input
            id="affiliate-rate"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={draft}
            onChange={(event) => {
              setSaved(false);
              setDraft(Number(event.target.value) || 0);
            }}
            className="w-32"
          />
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          Enregistrer
        </Button>
        {saved && <span className="text-muted-foreground text-sm">Enregistré.</span>}
      </div>
    </div>
  );
}
