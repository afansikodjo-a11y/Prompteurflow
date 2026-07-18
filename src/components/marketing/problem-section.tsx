import { AlertCircle, Clock, EyeOff, RotateCcw } from "lucide-react";

const PROBLEMS = [
  { icon: AlertCircle, text: "Vous oubliez votre texte au pire moment." },
  { icon: EyeOff, text: "Vous regardez ailleurs que l'objectif." },
  { icon: RotateCcw, text: "Vous recommencez, encore et encore." },
  { icon: Clock, text: "Vous perdez un temps précieux à chaque prise." },
];

const TAKE_COUNT = 13;

/**
 * Composition abstraite (pas une photo) illustrant les prises répétées —
 * remplaçable plus tard par une vraie photo/vidéo (`/assets/marketing/
 * problem-filming.*`) sans changer la structure de la section.
 */
function RetakeCounterVisual() {
  return (
    <div className="border-border bg-card mx-auto w-full max-w-sm rounded-2xl border p-6 shadow-sm">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Prises pour une seule vidéo
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: TAKE_COUNT }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold line-through decoration-red-500/70 decoration-2"
          >
            {n}
          </span>
        ))}
        <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold">
          14
        </span>
      </div>
      <p className="text-muted-foreground mt-4 text-sm italic">
        « Euh… c&apos;était quoi la suite déjà ? »
      </p>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section className="bg-muted/30 border-t">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <RetakeCounterVisual />
        </div>
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Une idée de vidéo ne devrait jamais rester dans votre tête.
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            Le problème n&apos;est pas que vous ne savez pas parler — c&apos;est que vous essayez de faire
            deux choses en même temps : vous souvenir de votre texte, et rester naturel face à la
            caméra.
          </p>
          <ul className="flex flex-col gap-4">
            {PROBLEMS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-red-500" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
