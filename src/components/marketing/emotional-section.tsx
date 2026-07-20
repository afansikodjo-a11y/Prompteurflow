import { Reveal } from "./reveal";

const BURDENS = ["Le message.", "Les mots.", "L'ordre des phrases.", "Le regard.", "L'expression."];

export function EmotionalSection() {
  return (
    <section className="border-t border-white/[0.06] bg-neutral-950 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Tu n&apos;as pas besoin d&apos;être meilleur devant la caméra.
          </h2>
          <p className="mt-3 text-xl text-pretty text-neutral-400">
            Tu as peut-être simplement besoin d&apos;arrêter d&apos;essayer de tout mémoriser.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 flex flex-col items-center gap-1.5">
          {BURDENS.map((item) => (
            <p key={item} className="text-neutral-500">
              {item}
            </p>
          ))}
          <p className="mt-4 max-w-md text-sm text-pretty text-neutral-500">
            Tout essayer de retenir en même temps rend la création plus difficile qu&apos;elle ne
            devrait l&apos;être.
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="text-brand-bright mt-10 text-2xl font-bold text-balance">
            Ton script est là pour t&apos;aider. Pas pour te remplacer.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
