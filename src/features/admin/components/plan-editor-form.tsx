"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FILTER_PRESETS, type VideoFilterId } from "@/features/recorder";
import type { Plan, PlanId } from "@/features/subscription";
import { useAdminPlans } from "../hooks/use-admin-plans";

const FILTER_IDS: VideoFilterId[] = ["none", "warm", "cool", "bw", "cinema"];

/** Convertit un champ vide en « illimité » (`null`), sinon parse un entier positif. */
function parseLimit(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

interface PlanCardProps {
  plan: Plan;
  onSave: (id: PlanId, patch: Partial<Plan>) => Promise<void>;
}

function PlanCard({ plan, onSave }: PlanCardProps) {
  const [draft, setDraft] = React.useState(plan);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => setDraft(plan), [plan]);

  const toggleFilter = (filter: VideoFilterId) => {
    setSaved(false);
    setDraft((current) => ({
      ...current,
      unlockedFilters: current.unlockedFilters.includes(filter)
        ? current.unlockedFilters.filter((value) => value !== filter)
        : [...current.unlockedFilters, filter],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(plan.id, draft);
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{plan.name}</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`price-${plan.id}`}>Prix (XOF)</Label>
          <Input
            id={`price-${plan.id}`}
            type="number"
            min={0}
            step={1}
            value={draft.priceXof}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, priceXof: Number(event.target.value) || 0 }));
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`duration-${plan.id}`}>Durée max (s) — vide = illimité</Label>
          <Input
            id={`duration-${plan.id}`}
            type="number"
            min={0}
            value={draft.maxDurationSec ?? ""}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, maxDurationSec: parseLimit(event.target.value) }));
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`scripts-${plan.id}`}>Scripts max — vide = illimité</Label>
          <Input
            id={`scripts-${plan.id}`}
            type="number"
            min={0}
            value={draft.maxScripts ?? ""}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, maxScripts: parseLimit(event.target.value) }));
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`price-barred-${plan.id}`}>Prix mensuel barré — vide = aucun</Label>
          <Input
            id={`price-barred-${plan.id}`}
            type="number"
            min={0}
            step={1}
            value={draft.priceBarredXof ?? ""}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, priceBarredXof: parseLimit(event.target.value) }));
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`annual-price-${plan.id}`}>Prix annuel (XOF) — vide = pas de palier annuel</Label>
          <Input
            id={`annual-price-${plan.id}`}
            type="number"
            min={0}
            step={1}
            value={draft.annualPriceXof ?? ""}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, annualPriceXof: parseLimit(event.target.value) }));
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`annual-price-barred-${plan.id}`}>Prix annuel barré — vide = aucun</Label>
          <Input
            id={`annual-price-barred-${plan.id}`}
            type="number"
            min={0}
            step={1}
            value={draft.annualPriceBarredXof ?? ""}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, annualPriceBarredXof: parseLimit(event.target.value) }));
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Label className="w-fit">
          <input
            type="checkbox"
            checked={draft.watermark}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, watermark: event.target.checked }));
            }}
          />
          Filigrane à l&apos;export
        </Label>

        <Label className="w-fit">
          <input
            type="checkbox"
            checked={draft.scriptImport}
            onChange={(event) => {
              setSaved(false);
              setDraft((current) => ({ ...current, scriptImport: event.target.checked }));
            }}
          />
          Import de script (.txt)
        </Label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Filtres débloqués</span>
        <div className="flex flex-wrap gap-3">
          {FILTER_IDS.map((filter) => (
            <Label key={filter} className="w-fit">
              <input
                type="checkbox"
                checked={draft.unlockedFilters.includes(filter)}
                onChange={() => toggleFilter(filter)}
              />
              {FILTER_PRESETS[filter].label}
            </Label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          Enregistrer
        </Button>
        {saved && <span className="text-muted-foreground text-sm">Enregistré.</span>}
      </div>
    </div>
  );
}

/**
 * Formulaire admin d'édition des plans tarifaires (Basique/Standard/Pro) :
 * prix XOF et limites, éditables à chaud sans déploiement de code.
 */
export function PlanEditorForm() {
  const { plans, loading, update } = useAdminPlans();

  if (loading) return <p className="text-muted-foreground text-sm">Chargement…</p>;

  return (
    <div className="flex flex-col gap-4">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} onSave={update} />
      ))}
    </div>
  );
}
