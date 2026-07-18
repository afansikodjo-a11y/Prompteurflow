import { Check, X } from "lucide-react";

const BEFORE = [
  "Script mémorisé difficilement",
  "Nombreuses prises",
  "Stress avant de filmer",
  "Temps perdu",
  "Vidéos repoussées",
];

const AFTER = [
  "Script sous les yeux",
  "Présentation plus fluide",
  "Moins de prises inutiles",
  "Création plus rapide",
  "Plus de contenu publié",
];

export function BeforeAfterSection() {
  return (
    <section className="bg-muted/30 border-t">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          La différence en un coup d&apos;œil
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="border-card bg-card rounded-2xl border p-6">
            <p className="text-sm font-semibold text-red-500">Avant</p>
            <ul className="mt-4 flex flex-col gap-3">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <X className="mt-0.5 size-4 shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-card bg-card rounded-2xl border p-6">
            <p className="text-sm font-semibold text-emerald-600">Après</p>
            <ul className="mt-4 flex flex-col gap-3">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
