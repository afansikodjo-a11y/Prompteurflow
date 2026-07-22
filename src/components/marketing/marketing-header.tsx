"use client";

import * as React from "react";
import Link from "next/link";
import { Clapperboard, Menu, X } from "lucide-react";

import { FEATURE_FLAGS } from "@/config/flags";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/features/pwa";

const NAV_LINKS = [
  { href: "#features", label: "Fonctionnalités" },
  ...(FEATURE_FLAGS.pricingVisible ? [{ href: "#pricing", label: "Tarifs" }] : []),
  { href: "#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/**
 * Header propre à la landing — minimal, sur fond transparent qui se pose sur
 * la scène sombre du hero. Distinct du `SiteHeader` de l'app (adaptatif clair/
 * sombre) : la landing a sa propre direction artistique, fixe.
 */
export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-neutral-950/70 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <Clapperboard className="text-brand-bright size-5" />
            {siteConfig.name}
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <InstallButton className="border-white/15 bg-white/5 text-white hover:bg-white/10" />
            <Link
              href="/login"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-brand shadow-brand/20 hover:bg-brand-bright text-black shadow-lg"
            >
              <Link href="/studio">Commencer gratuitement</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="flex size-9 items-center justify-center rounded-full text-white md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-white/[0.06] px-4 pt-2 pb-6 md:hidden">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-3 text-base text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-3 text-base text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-3 text-base text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              Connexion
            </Link>
            <Button asChild className="bg-brand hover:bg-brand-bright mt-3 text-black">
              <Link href="/studio" onClick={() => setMenuOpen(false)}>
                Commencer gratuitement
              </Link>
            </Button>
          </nav>
        )}
      </header>

      {/* Flottant, toujours visible sur mobile — plus caché derrière un tap sur
        le burger comme avant (le header repliable ne laissait plus de place
        pour ce bouton dans la barre du haut). */}
      <div
        className="fixed inset-x-4 z-40 flex justify-center md:hidden"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <InstallButton
          hideLabelOnMobile={false}
          className="border-white/15 bg-neutral-900/90 text-white shadow-lg backdrop-blur hover:bg-neutral-800"
        />
      </div>
    </>
  );
}
