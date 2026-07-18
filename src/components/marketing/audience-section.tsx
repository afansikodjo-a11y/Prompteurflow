import { Briefcase, GraduationCap, Megaphone, ShoppingBag, Sparkles, Video } from "lucide-react";

import { Reveal } from "./reveal";

const AUDIENCES = [
  { icon: Video, label: "Créateurs de contenu", offset: "sm:-translate-y-2" },
  { icon: Briefcase, label: "Entrepreneurs", offset: "" },
  { icon: GraduationCap, label: "Formateurs & coachs", offset: "sm:translate-y-3" },
  { icon: Megaphone, label: "Community managers", offset: "sm:-translate-y-1" },
  { icon: ShoppingBag, label: "Commerçants", offset: "sm:translate-y-2" },
  { icon: Sparkles, label: "Entreprises", offset: "" },
];

export function AudienceSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pour qui est fait PrompteurFlow ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-pretty text-neutral-300">
            Peu importe ce que vous créez, PrompteurFlow vous aide à mieux vous exprimer face à
            la caméra.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {AUDIENCES.map(({ icon: Icon, label, offset }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 ${offset}`}
            >
              <Icon className="size-4 text-violet-300" />
              {label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
