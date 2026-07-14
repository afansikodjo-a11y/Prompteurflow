"use client";

import * as React from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Script } from "../types";

interface ScriptListItemProps {
  script: Script;
  active: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onRemove: () => void;
}

/**
 * Ligne de la bibliothèque : sélection au clic, renommage inline, suppression.
 */
export function ScriptListItem({
  script,
  active,
  canDelete,
  onSelect,
  onRename,
  onRemove,
}: ScriptListItemProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(script.title);

  React.useEffect(() => setDraft(script.title), [script.title]);

  const commit = () => {
    onRename(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(script.title);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") cancel();
          }}
          aria-label="Renommer le script"
        />
        <Button size="icon" variant="ghost" onClick={commit} aria-label="Valider">
          <Check className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={cancel} aria-label="Annuler">
          <X className="size-4" />
        </Button>
      </li>
    );
  }

  return (
    <li className={cn("group flex items-center gap-1 rounded-md", active && "bg-accent")}>
      <button
        type="button"
        onClick={onSelect}
        className="hover:bg-accent flex min-w-0 flex-1 items-center rounded-md px-3 py-2 text-left text-sm"
      >
        <span className="truncate">{script.title}</span>
      </button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setEditing(true)}
        aria-label="Renommer"
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Pencil className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            disabled={!canDelete}
            aria-label="Supprimer"
            className="text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-30"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce script ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {script.title} » sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRemove}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/40 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
