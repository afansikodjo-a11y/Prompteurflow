"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_MAX_LENGTH, DURATION_OPTIONS, INSTRUCTION_MAX_LENGTH, TONE_OPTIONS, TOPIC_MAX_LENGTH } from "../constants";
import { useAiWriter } from "../hooks/use-ai-writer";

interface AiWriterDialogProps {
  /** Contenu actuel du script sélectionné, pré-rempli en mode « Améliorer ». */
  existingContent: string;
  /** Remplace le contenu du script courant par le résultat. */
  onApply: (content: string) => void;
  /** Enregistre le résultat comme nouveau script (double comme « annuler » sans perte). */
  onApplyAsNew: (content: string) => void;
}

type DialogMode = "generate" | "improve";

/** Valeur sentinelle pour un `Select` optionnel (Radix interdit une value vide). */
const UNSET = "__unset__";

/**
 * Assistant IA d'écriture de script — génère un texte à partir d'un sujet, ou
 * améliore un brouillon existant. Le résultat n'est jamais appliqué
 * automatiquement : toujours un clic explicite (Remplacer / Nouveau script)
 * entre la réponse de l'IA et une vraie modification du script.
 */
export function AiWriterDialog({ existingContent, onApply, onApplyAsNew }: AiWriterDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<DialogMode>("generate");
  const [topic, setTopic] = React.useState("");
  const [workingContent, setWorkingContent] = React.useState("");
  const [instruction, setInstruction] = React.useState("");
  const [toneHint, setToneHint] = React.useState(UNSET);
  const [durationHintSec, setDurationHintSec] = React.useState(UNSET);

  const writer = useAiWriter();

  // Resynchronise le formulaire uniquement à l'ouverture — le Dialog reste
  // monté en arrière-plan (Radix), son état ne se réinitialise pas tout seul
  // à la fermeture comme un démontage le ferait, et `existingContent` peut
  // avoir changé entre deux ouvertures (script différent sélectionné).
  React.useEffect(() => {
    if (!open) return;
    setMode(existingContent.trim() ? "improve" : "generate");
    setWorkingContent(existingContent);
    writer.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = () => {
    const tone = toneHint === UNSET ? undefined : toneHint;
    if (mode === "generate") {
      const duration = durationHintSec === UNSET ? undefined : Number(durationHintSec);
      void writer.generate({ topic, toneHint: tone, durationHintSec: duration });
    } else {
      void writer.improve({ content: workingContent, instruction, toneHint: tone });
    }
  };

  const handleApply = () => {
    if (!writer.result) return;
    onApply(writer.result);
    setOpen(false);
  };

  const handleApplyAsNew = () => {
    if (!writer.result) return;
    onApplyAsNew(writer.result);
    setOpen(false);
  };

  const canSubmit =
    mode === "generate"
      ? topic.trim().length > 0
      : workingContent.trim().length > 0 && instruction.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Sparkles className="size-4" />
          Écrire avec l&apos;IA
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        {writer.authLoading ? null : !writer.isAuthenticated ? (
          <>
            <DialogHeader>
              <DialogTitle>Connectez-vous pour utiliser l&apos;IA</DialogTitle>
              <DialogDescription>
                L&apos;assistant d&apos;écriture est réservé aux comptes connectés.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </DialogFooter>
          </>
        ) : writer.status === "success" && writer.result ? (
          <>
            <DialogHeader>
              <DialogTitle>Résultat</DialogTitle>
              <DialogDescription>
                Relisez avant d&apos;appliquer — rien n&apos;est modifié pour l&apos;instant.
                {writer.remaining !== null &&
                  ` Il vous reste ${writer.remaining} génération${writer.remaining > 1 ? "s" : ""} aujourd'hui.`}
              </DialogDescription>
            </DialogHeader>
            <Textarea value={writer.result} readOnly rows={10} className="resize-none" />
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={writer.reset}>
                Annuler
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleApplyAsNew}>
                  Enregistrer comme nouveau script
                </Button>
                <Button type="button" onClick={handleApply}>
                  Remplacer le script actuel
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Écrire avec l&apos;IA</DialogTitle>
              <DialogDescription>
                Générez un script à partir d&apos;un sujet, ou améliorez un brouillon.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "generate" ? "default" : "outline"}
                onClick={() => setMode("generate")}
              >
                Générer
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "improve" ? "default" : "outline"}
                onClick={() => setMode("improve")}
              >
                Améliorer
              </Button>
            </div>

            {mode === "generate" ? (
              <div className="flex flex-col gap-3">
                <Textarea
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  maxLength={TOPIC_MAX_LENGTH}
                  placeholder="De quoi voulez-vous parler ?"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Select value={toneHint} onValueChange={setToneHint}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Ton" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNSET}>Ton (optionnel)</SelectItem>
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={durationHintSec} onValueChange={setDurationHintSec}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNSET}>Durée (optionnel)</SelectItem>
                      {DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration.seconds} value={String(duration.seconds)}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Textarea
                  value={workingContent}
                  onChange={(event) => setWorkingContent(event.target.value)}
                  maxLength={CONTENT_MAX_LENGTH}
                  rows={6}
                />
                <Textarea
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  maxLength={INSTRUCTION_MAX_LENGTH}
                  placeholder="Ex. Raccourcis à 30 secondes, corrige la grammaire, rends le ton plus naturel à l'oral…"
                  rows={2}
                />
              </div>
            )}

            {writer.status === "error" && writer.error && <p className="text-destructive text-sm">{writer.error}</p>}

            <DialogFooter>
              <Button type="button" onClick={handleSubmit} disabled={!canSubmit || writer.status === "loading"}>
                {writer.status === "loading"
                  ? "Génération…"
                  : writer.status === "error"
                    ? "Réessayer"
                    : mode === "generate"
                      ? "Générer"
                      : "Améliorer"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
