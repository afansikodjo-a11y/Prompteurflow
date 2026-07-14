"use client";

import * as React from "react";
import { ChevronDown, FolderOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScriptListItem } from "./script-list-item";
import type { Script } from "../types";

interface ScriptsLibraryProps {
  scripts: Script[];
  currentId: string | null;
  currentTitle: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

/**
 * Bibliothèque de scripts : un déclencheur affichant le script courant, et un
 * tiroir (`Sheet`) pour créer, sélectionner, renommer et supprimer les scripts.
 */
export function ScriptsLibrary({
  scripts,
  currentId,
  currentTitle,
  onSelect,
  onCreate,
  onRename,
  onRemove,
}: ScriptsLibraryProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleCreate = () => {
    onCreate();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="max-w-[60vw] justify-start gap-2 sm:max-w-xs">
          <FolderOpen className="size-4 shrink-0" />
          <span className="truncate">{currentTitle}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>Mes scripts</SheetTitle>
          <SheetDescription>Créez, sélectionnez et gérez vos scripts.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 overflow-y-auto p-3">
          <Button onClick={handleCreate} className="w-full gap-2">
            <Plus className="size-4" />
            Nouveau script
          </Button>

          <ul className="flex flex-col gap-1">
            {scripts.map((script) => (
              <ScriptListItem
                key={script.id}
                script={script}
                active={script.id === currentId}
                canDelete={scripts.length > 1}
                onSelect={() => handleSelect(script.id)}
                onRename={(title) => onRename(script.id, title)}
                onRemove={() => onRemove(script.id)}
              />
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
