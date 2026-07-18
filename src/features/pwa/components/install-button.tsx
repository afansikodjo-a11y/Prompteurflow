"use client";

import * as React from "react";
import { Download, Menu, Share, SquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useInstallPrompt } from "../hooks/use-install-prompt";

function InstructionStep({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full font-medium">
        {number}
      </span>
      <span className="flex items-center gap-1.5">{children}</span>
    </li>
  );
}

/**
 * Bouton « Installer l'application », posé dans l'en-tête (visible sur toutes
 * les pages) — permanent : reste affiché tant que l'app n'est pas installée,
 * même avant que le navigateur ne juge le moment opportun pour sa propre
 * invite (`beforeinstallprompt` ne se déclenche pas immédiatement, selon des
 * heuristiques d'engagement propres à chaque navigateur).
 *
 * Au clic : invite native si disponible (Chrome/Edge/Android déjà prêts),
 * sinon des instructions manuelles — spécifiques à Safari iOS (aucune invite
 * programmable là-bas), ou génériques ailleurs (menu du navigateur).
 */
interface InstallButtonProps {
  /** Fusionné avec les classes par défaut — pour s'adapter à un en-tête sombre (landing) vs adaptatif (app). */
  className?: string;
  /** Cache le libellé sous 640px (icône seule) — utile dans un en-tête compact, pas dans un menu déjà plein écran. Par défaut `true`. */
  hideLabelOnMobile?: boolean;
}

export function InstallButton({ className, hideLabelOnMobile = true }: InstallButtonProps) {
  const { isInstalled, canInstall, isIosSafari, promptInstall } = useInstallPrompt();
  const [instructionsOpen, setInstructionsOpen] = React.useState(false);

  if (isInstalled) return null;

  const handleClick = () => {
    if (canInstall) {
      void promptInstall();
      return;
    }
    setInstructionsOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1.5", className)}
        aria-label="Installer l'application"
        onClick={handleClick}
      >
        <Download className="size-4" />
        <span className={cn(hideLabelOnMobile && "hidden sm:inline")} aria-hidden="true">
          Installer
        </span>
      </Button>

      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Installer l&apos;application</DialogTitle>
            <DialogDescription>
              {isIosSafari
                ? "Safari ne propose pas d'installation automatique — deux étapes suffisent :"
                : "Ajoutez PrompteurFlow à votre écran d'accueil pour y accéder en un tap :"}
            </DialogDescription>
          </DialogHeader>
          {isIosSafari ? (
            <ol className="flex flex-col gap-3 text-sm">
              <InstructionStep number={1}>
                Appuyez sur <Share className="size-4" /> Partager
              </InstructionStep>
              <InstructionStep number={2}>
                Choisissez <SquarePlus className="size-4" /> Sur l&apos;écran d&apos;accueil
              </InstructionStep>
            </ol>
          ) : (
            <ol className="flex flex-col gap-3 text-sm">
              <InstructionStep number={1}>
                Ouvrez le menu <Menu className="size-4" /> de votre navigateur
              </InstructionStep>
              <InstructionStep number={2}>
                Choisissez « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil »
              </InstructionStep>
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
