"use client";

import * as React from "react";
import { Download, Share, SquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInstallPrompt } from "../hooks/use-install-prompt";

/**
 * Bouton « Installer l'application », posé dans l'en-tête (visible sur toutes
 * les pages). Ne s'affiche que si l'app n'est pas déjà installée et qu'une
 * voie d'installation existe : invite native (Chrome/Edge/Android) ou
 * instructions manuelles (Safari iOS, qui n'a pas d'invite programmable).
 */
export function InstallButton() {
  const { isInstalled, canInstall, isIosSafari, promptInstall } = useInstallPrompt();
  const [iosDialogOpen, setIosDialogOpen] = React.useState(false);

  if (isInstalled || (!canInstall && !isIosSafari)) return null;

  if (isIosSafari) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          aria-label="Installer l'application"
          onClick={() => setIosDialogOpen(true)}
        >
          <Download className="size-4" />
          <span className="hidden sm:inline" aria-hidden="true">
            Installer
          </span>
        </Button>
        <Dialog open={iosDialogOpen} onOpenChange={setIosDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Installer l&apos;application</DialogTitle>
              <DialogDescription>Safari ne propose pas d&apos;installation automatique — deux étapes suffisent :</DialogDescription>
            </DialogHeader>
            <ol className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full font-medium">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Appuyez sur <Share className="size-4" /> Partager
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full font-medium">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Choisissez <SquarePlus className="size-4" /> Sur l&apos;écran d&apos;accueil
                </span>
              </li>
            </ol>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      aria-label="Installer l'application"
      onClick={() => void promptInstall()}
    >
      <Download className="size-4" />
      <span className="hidden sm:inline" aria-hidden="true">
        Installer
      </span>
    </Button>
  );
}
