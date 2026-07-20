import Link from "next/link";

import { cn } from "@/lib/utils";

const PRESETS = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
];

interface PeriodSelectorProps {
  activeDays: number;
}

/** Sélecteur de période server-rendu — navigue via `?days=`, pas de state client. */
export function PeriodSelector({ activeDays }: PeriodSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border p-1">
      {PRESETS.map((preset) => (
        <Link
          key={preset.days}
          href={`/admin?days=${preset.days}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            preset.days === activeDays
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {preset.label}
        </Link>
      ))}
    </div>
  );
}
