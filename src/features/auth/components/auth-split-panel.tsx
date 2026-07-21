import Image from "next/image";

interface AuthSplitPanelProps {
  children: React.ReactNode;
}

/**
 * Mise en page partagée login/signup : visuel produit à gauche (masqué sur
 * mobile — pas de place pour lui sans écraser le formulaire), carte sombre
 * à droite avec le formulaire. Réutilise le GIF déjà posé en hero de la
 * landing, pour une continuité visuelle entre marketing et auth.
 */
export function AuthSplitPanel({ children }: AuthSplitPanelProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl items-center px-4 py-10">
      <div className="border-border grid w-full overflow-hidden rounded-3xl border shadow-2xl shadow-black/40 lg:grid-cols-2">
        <div className="relative hidden aspect-square lg:block">
          <Image
            src="/images/teleprompter.gif"
            alt="Une personne filme une vidéo avec son téléphone sur trépied, le script PrompteurFlow défilant à l'écran."
            fill
            unoptimized
            sizes="384px"
            className="object-cover"
          />
          {/* Décoratif — un seul visuel aujourd'hui, pas un vrai carrousel. */}
          <div aria-hidden className="absolute inset-x-0 bottom-5 flex justify-center gap-1.5">
            <span className="h-1.5 w-5 rounded-full bg-white/85" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
          </div>
        </div>
        <div className="bg-card flex flex-col justify-center gap-6 px-6 py-10 sm:px-10">{children}</div>
      </div>
    </div>
  );
}
