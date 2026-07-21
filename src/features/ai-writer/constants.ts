/**
 * Constantes de l'assistant IA d'écriture de script — source unique
 * partagée par l'UI (affichage du quota) et la route API
 * (`src/app/api/ai/write/`), pour qu'elles ne puissent jamais diverger.
 */
export const DAILY_QUOTA = 20;

export const TOPIC_MAX_LENGTH = 500;
export const CONTENT_MAX_LENGTH = 6000;
export const INSTRUCTION_MAX_LENGTH = 300;

export const DURATION_HINT_MIN_SEC = 10;
export const DURATION_HINT_MAX_SEC = 1800;

export interface ToneOption {
  value: string;
  label: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { value: "neutre", label: "Neutre" },
  { value: "professionnel", label: "Professionnel" },
  { value: "chaleureux", label: "Chaleureux" },
  { value: "dynamique", label: "Dynamique" },
  { value: "inspirant", label: "Inspirant" },
];

export interface DurationOption {
  seconds: number;
  label: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { seconds: 30, label: "30 secondes" },
  { seconds: 60, label: "1 minute" },
  { seconds: 120, label: "2 minutes" },
  { seconds: 300, label: "5 minutes" },
];
