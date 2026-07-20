import { Briefcase, GraduationCap, Megaphone, Sparkles, Video } from "lucide-react";

import { Reveal } from "./reveal";

const AUDIENCES = [
  {
    icon: Video,
    title: "Créateurs",
    tag: "Reels, TikTok, Shorts, YouTube",
    message: "Tu veux publier plus souvent sans refaire la même vidéo 15 fois.",
  },
  {
    icon: GraduationCap,
    title: "Formateurs & coachs",
    tag: "Cours, tutoriels et formations",
    message: "Ton expertise est déjà dans ta tête. Pas besoin de mémoriser chaque phrase pour la partager.",
  },
  {
    icon: Briefcase,
    title: "Entrepreneurs",
    tag: "Vente, personal branding, présentation",
    message: "Tu as une entreprise à développer. Pas un texte entier à mémoriser.",
  },
  {
    icon: Sparkles,
    title: "Débutants",
    tag: "Enfin parler face caméra sans tout mémoriser",
    message: "Tu sais quoi dire. Ton script t'accompagne pendant que tu apprends à être à l'aise.",
  },
  {
    icon: Megaphone,
    title: "Marketeurs & UGC",
    tag: "Publicités, témoignages, contenu de marque",
    message: "Plus de contenu. Moins de prises inutiles.",
  },
];

export function AudienceSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Quelle vidéo veux-tu créer aujourd&apos;hui ?
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, tag, message }, index) => (
            <Reveal
              key={title}
              delay={index * 0.05}
              className="flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:items-start sm:text-left"
            >
              <div className="border-brand/25 bg-brand/10 flex size-10 items-center justify-center rounded-full border">
                <Icon className="text-brand-bright size-4.5" />
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{tag}</p>
              <p className="mt-3 text-sm text-pretty text-neutral-300">{message}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
