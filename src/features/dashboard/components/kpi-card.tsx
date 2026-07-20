interface KpiCardProps {
  label: string;
  value: string;
  /** Précision courte sous la valeur — ex. "sur 30 jours" ou un état "pas encore disponible". */
  hint?: string;
  /** `true` pour une carte en attente de données réelles (style atténué, pas une vraie valeur). */
  pending?: boolean;
}

/** Carte KPI simple — valeur, libellé, précision optionnelle. */
export function KpiCard({ label, value, hint, pending = false }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${pending ? "text-muted-foreground text-xl" : ""}`}>
        {value}
      </p>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </div>
  );
}
