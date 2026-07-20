import { ArrowRight, Check, X } from "lucide-react";

import { Reveal } from "./reveal";

const BEFORE = ["Une idée.", "Une caméra.", "Un trou de mémoire.", "Une nouvelle prise.", "Encore une."];

const AFTER = ["Ton script devant toi.", "Ta caméra devant toi.", "Tu parles.", "Tu enregistres."];

export function NarrativeSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Tu sais quoi dire. Mais dès que la caméra s&apos;allume, tu oublies tout.
          </h2>
        </Reveal>

        <div className="mt-14 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <Reveal delay={0.05} className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6">
            <p className="text-sm font-semibold text-red-400">Avant</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <X className="mt-0.5 size-4 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="hidden justify-center py-4 lg:flex">
            <div className="border-brand/20 bg-brand/10 flex size-10 items-center justify-center rounded-full border">
              <ArrowRight className="text-brand-bright size-4" />
            </div>
          </div>

          <Reveal delay={0.1} className="border-brand/20 bg-brand/[0.05] rounded-2xl border p-6">
            <p className="text-brand-bright text-sm font-semibold">Avec Prompteur Flow</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-200">
                  <Check className="text-brand-bright mt-0.5 size-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
