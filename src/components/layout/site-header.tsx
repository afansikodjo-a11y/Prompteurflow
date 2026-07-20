import Link from "next/link";
import { Clapperboard } from "lucide-react";

import { siteConfig } from "@/config/site";
import { UserMenu } from "@/features/auth";
import { InstallButton } from "@/features/pwa";

/**
 * En-tête applicatif (coquille réutilisable) — mêmes couleurs (fond sombre,
 * accent vert) que la landing marketing, thème désormais forcé en sombre
 * dans toute l'app (voir `app-providers.tsx`), donc plus de bascule
 * clair/sombre à afficher ici.
 */
export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-foreground flex items-center gap-2 font-semibold">
          <Clapperboard className="text-brand-bright size-5" />
          <span>{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-3">
          <InstallButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
