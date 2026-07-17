"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  CURRENT_SCRIPT_STORAGE_KEY,
  SCRIPTS_STORAGE_KEY,
  UNTITLED_SCRIPT,
} from "../constants";
import type { Script } from "../types";

export interface UseScriptsResult {
  /** Collection de scripts (le plus récemment créé en tête). */
  scripts: Script[];
  /** Script actuellement sélectionné, ou `null` avant hydratation. */
  currentScript: Script | null;
  currentId: string | null;
  /** `true` une fois la collection relue depuis le stockage. */
  hydrated: boolean;
  select: (id: string) => void;
  /** Crée un script vide, le sélectionne et retourne son id ; `null` si le plafond (plan Basique) est atteint. */
  create: () => string | null;
  rename: (id: string, title: string) => void;
  /** Supprime un script (sans effet s'il ne reste qu'un seul script). */
  remove: (id: string) => void;
  updateContent: (id: string, content: string) => void;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createScript(input?: Partial<Pick<Script, "title" | "content">>): Script {
  const now = Date.now();
  return {
    id: generateId(),
    title: input?.title?.trim() || UNTITLED_SCRIPT,
    content: input?.content ?? "",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Source de vérité des scripts (liste + sélection), persistée dans `localStorage`.
 *
 * Ce hook est la **frontière d'abstraction du stockage** : migrer vers IndexedDB
 * plus tard ne changerait que l'implémentation ici, pas les composants.
 *
 * @param seedContent Contenu du script créé automatiquement au premier lancement.
 * @param maxScripts Nombre max de scripts (plan Basique) ; `undefined` = illimité (Standard/Pro).
 */
export function useScripts(seedContent = "", maxScripts?: number): UseScriptsResult {
  const [scripts, setScripts, hydrated] = useLocalStorage<Script[]>(SCRIPTS_STORAGE_KEY, []);
  const [currentId, setCurrentId] = useLocalStorage<string | null>(
    CURRENT_SCRIPT_STORAGE_KEY,
    null,
  );

  // Amorce un premier script au tout premier lancement (stockage vide).
  React.useEffect(() => {
    if (!hydrated || scripts.length > 0) return;
    const first = createScript({ title: "Mon premier script", content: seedContent });
    setScripts([first]);
    setCurrentId(first.id);
  }, [hydrated, scripts.length, seedContent, setScripts, setCurrentId]);

  // Garantit que `currentId` pointe toujours vers un script existant.
  React.useEffect(() => {
    if (!hydrated || scripts.length === 0) return;
    if (!scripts.some((script) => script.id === currentId)) {
      setCurrentId(scripts[0].id);
    }
  }, [hydrated, scripts, currentId, setCurrentId]);

  const currentScript = React.useMemo(
    () => scripts.find((script) => script.id === currentId) ?? scripts[0] ?? null,
    [scripts, currentId],
  );

  const select = React.useCallback((id: string) => setCurrentId(id), [setCurrentId]);

  const create = React.useCallback(() => {
    if (maxScripts !== undefined && scripts.length >= maxScripts) return null;
    const script = createScript();
    setScripts((list) => [script, ...list]);
    setCurrentId(script.id);
    return script.id;
  }, [scripts.length, maxScripts, setScripts, setCurrentId]);

  const rename = React.useCallback(
    (id: string, title: string) => {
      setScripts((list) =>
        list.map((script) =>
          script.id === id
            ? { ...script, title: title.trim() || UNTITLED_SCRIPT, updatedAt: Date.now() }
            : script,
        ),
      );
    },
    [setScripts],
  );

  const remove = React.useCallback(
    (id: string) => {
      setScripts((list) => (list.length <= 1 ? list : list.filter((script) => script.id !== id)));
    },
    [setScripts],
  );

  const updateContent = React.useCallback(
    (id: string, content: string) => {
      setScripts((list) =>
        list.map((script) =>
          script.id === id ? { ...script, content, updatedAt: Date.now() } : script,
        ),
      );
    },
    [setScripts],
  );

  return {
    scripts,
    currentScript,
    currentId,
    hydrated,
    select,
    create,
    rename,
    remove,
    updateContent,
  };
}
