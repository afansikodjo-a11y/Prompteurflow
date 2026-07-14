"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface ControlSliderProps {
  label: string;
  icon?: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  /** Formatage optionnel de la valeur affichée (ex. `44px`). */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

/**
 * Slider étiqueté réutilisable (label + valeur courante + curseur).
 * Factorise les réglages « Vitesse » et « Taille » du prompteur.
 */
export function ControlSlider({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  onValueChange,
  formatValue,
  disabled,
  className,
}: ControlSliderProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <span className="flex items-center gap-1.5">
          {Icon ? <Icon className="size-3.5" /> : null}
          {label}
        </span>
        <span className="tabular-nums">{formatValue ? formatValue(value) : value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(values) => onValueChange(values[0] ?? value)}
        aria-label={label}
      />
    </div>
  );
}
