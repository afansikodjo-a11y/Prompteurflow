"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clearQuickAccessKey } from "../lib/quick-access-key";
import { clearQuickAccess, getQuickAccessBlob } from "../lib/quick-access-storage";

/** Gestion de l'accès rapide (code à 4 chiffres) sur cet appareil — visibilité + désactivation. */
export function QuickAccessSettingsCard() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    setEnabled(getQuickAccessBlob() !== null);
  }, []);

  const disable = () => {
    clearQuickAccess();
    clearQuickAccessKey();
    setEnabled(false);
  };

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-6">
      <div>
        <p className="font-medium">Accès rapide sur cet appareil</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {enabled
            ? "Un code à 4 chiffres est actif — il permet de se reconnecter sans mot de passe, uniquement sur cet appareil."
            : "Aucun code actif sur cet appareil. Proposé automatiquement à la prochaine connexion par mot de passe."}
        </p>
      </div>
      {enabled && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-fit">
              Désactiver
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Désactiver l&apos;accès rapide ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le code sera supprimé de cet appareil. Vous pourrez toujours en redéfinir un à la prochaine
                connexion par mot de passe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={disable}>Désactiver</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
