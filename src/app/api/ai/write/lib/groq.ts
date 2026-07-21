import "server-only";

import type { AiWriteRequest } from "@/features/ai-writer/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
/** Modèle Groq — nom vérifié disponible en production au moment d'écrire ceci. */
const GROQ_MODEL = "llama-3.3-70b-versatile";
const WORDS_PER_MINUTE_FR = 150;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_TOKENS = 2000;

const SYSTEM_PROMPT = `Tu es un rédacteur professionnel de scripts pour prompteur vidéo, en français.
Le texte que tu écris est destiné à être LU À VOIX HAUTE par une personne filmée en train de parler — pas lu sur un écran. Écris donc :
- des phrases courtes, au rythme naturel de la parole ;
- une ponctuation pensée pour la respiration (virgules et points fréquents) ;
- aucun markdown, aucune liste à puces, aucun emoji, aucun titre ;
- aucune didascalie ni indication de mise en scène, sauf si on te le demande explicitement.
Réponds uniquement avec le texte final du script, sans introduction, sans explication, sans guillemets englobants.`;

export class GroqUpstreamError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "GroqUpstreamError";
    this.status = status;
  }
}

function buildUserMessage(request: AiWriteRequest): string {
  if (request.mode === "generate") {
    const parts = [`Sujet : ${request.topic}`];
    if (request.toneHint) parts.push(`Ton souhaité : ${request.toneHint}`);
    if (request.durationHintSec) {
      const minutes = request.durationHintSec / 60;
      const words = Math.round(minutes * WORDS_PER_MINUTE_FR);
      parts.push(`Durée visée : environ ${minutes.toFixed(1)} minute(s), soit environ ${words} mots.`);
    }
    return `Génère un script de prompteur à partir de ce brief.\n${parts.join("\n")}`;
  }

  const parts = [`Instruction : ${request.instruction}`];
  if (request.toneHint) parts.push(`Ton souhaité : ${request.toneHint}`);
  return `Améliore ce script de prompteur selon l'instruction ci-dessous.\n${parts.join("\n")}\n\nScript actuel :\n${request.content}`;
}

/** Filet de sécurité contre d'éventuels préambules/fences que le prompt système interdit déjà (les modèles ne s'y conforment pas toujours). */
function stripPreamble(text: string): string {
  return text
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/, "")
    .replace(/^(voici|here is|here's)[^:\n]*:\s*/i, "")
    .trim();
}

export async function callGroq(request: AiWriteRequest): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqUpstreamError("GROQ_API_KEY manquante côté serveur.");
  }

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: request.mode === "generate" ? 0.7 : 0.45,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(request) },
        ],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new GroqUpstreamError(error instanceof Error ? error.message : "Erreur réseau vers Groq.");
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new GroqUpstreamError(`Groq a répondu ${response.status} : ${bodyText}`, response.status);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new GroqUpstreamError("Réponse Groq vide ou inattendue.");
  }

  return stripPreamble(content.trim());
}
