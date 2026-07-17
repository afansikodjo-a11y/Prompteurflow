import Link from "next/link";
import { Clapperboard } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { UserMenu } from "@/features/auth";

/**
 * En-tête applicatif (coquille réutilisable).
 * La navigation détaillée sera branchée avec les features.
 */
export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Clapperboard className="size-5" />
          <span>{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
