import { NextResponse } from "next/server";

import {
  CONTENT_MAX_LENGTH,
  DAILY_QUOTA,
  DURATION_HINT_MAX_SEC,
  DURATION_HINT_MIN_SEC,
  INSTRUCTION_MAX_LENGTH,
  TOPIC_MAX_LENGTH,
} from "@/features/ai-writer/constants";
import type { AiWriteErrorCode, AiWriteRequest } from "@/features/ai-writer/types";
import { createClient } from "@/lib/supabase/server";

import { GroqUpstreamError, callGroq } from "./lib/groq";
import { checkQuota, recordGeneration } from "./lib/quota";

export const runtime = "nodejs";
// Un appel Groq + deux aller-retours Supabase peuvent dépasser le timeout
// par défaut d'une fonction serverless — à vérifier contre le palier Vercel
// réel une fois déployé.
export const maxDuration = 30;

function errorResponse(status: number, code: AiWriteErrorCode, error: string) {
  return NextResponse.json({ error, code }, { status });
}

function validate(body: unknown): AiWriteRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;

  if (record.mode === "generate") {
    const topic = record.topic;
    if (typeof topic !== "string" || !topic.trim() || topic.length > TOPIC_MAX_LENGTH) return null;

    const toneHint = typeof record.toneHint === "string" ? record.toneHint : undefined;
    const durationHintSec = typeof record.durationHintSec === "number" ? record.durationHintSec : undefined;
    if (
      durationHintSec !== undefined &&
      (durationHintSec < DURATION_HINT_MIN_SEC || durationHintSec > DURATION_HINT_MAX_SEC)
    ) {
      return null;
    }

    return { mode: "generate", topic: topic.trim(), toneHint, durationHintSec };
  }

  if (record.mode === "improve") {
    const content = record.content;
    const instruction = record.instruction;
    if (typeof content !== "string" || !content.trim() || content.length > CONTENT_MAX_LENGTH) return null;
    if (typeof instruction !== "string" || !instruction.trim() || instruction.length > INSTRUCTION_MAX_LENGTH) {
      return null;
    }

    const toneHint = typeof record.toneHint === "string" ? record.toneHint : undefined;
    return { mode: "improve", content: content.trim(), instruction: instruction.trim(), toneHint };
  }

  return null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ne jamais s'appuyer sur FEATURE_FLAGS.openAccess ici : ce flag ne
  // concerne que les limites de plan, pas l'authentification. Cette
  // fonctionnalité exige un compte connecté, point final.
  if (!user) {
    return errorResponse(401, "unauthenticated", "Connectez-vous pour utiliser l'assistant IA.");
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return errorResponse(400, "validation", "Requête invalide.");
  }

  const parsed = validate(rawBody);
  if (!parsed) {
    return errorResponse(400, "validation", "Requête invalide — vérifiez les champs saisis.");
  }

  // Le quota se vérifie avant tout appel Groq : une requête déjà au-dessus
  // du quota ne doit jamais consommer le budget Groq partagé de l'app.
  const quota = await checkQuota(supabase, user.id);
  if (!quota.allowed) {
    return errorResponse(
      429,
      "quota_exceeded",
      `Vous avez atteint votre quota quotidien de ${DAILY_QUOTA} générations IA. Réessayez plus tard.`,
    );
  }

  let result: string;
  try {
    result = await callGroq(parsed);
  } catch (error) {
    if (error instanceof GroqUpstreamError) {
      if (error.status === 429) {
        return errorResponse(
          503,
          "upstream_error",
          "Trop de demandes en ce moment sur l'assistant IA, réessayez dans quelques secondes.",
        );
      }
      if (error.status !== undefined && error.status >= 400 && error.status < 500) {
        console.error("Erreur Groq (clé/requête) :", error.message);
        return errorResponse(500, "upstream_error", "L'assistant IA a rencontré une erreur. Réessayez plus tard.");
      }
      console.error("Erreur Groq (upstream) :", error.message);
      return errorResponse(
        error.status !== undefined ? 502 : 503,
        "upstream_error",
        "L'assistant IA est momentanément indisponible. Réessayez dans quelques instants.",
      );
    }
    console.error("Échec inattendu de l'appel Groq :", error);
    return errorResponse(503, "upstream_error", "L'assistant IA est momentanément indisponible. Réessayez dans quelques instants.");
  }

  // Le quota n'est consommé qu'après un succès Groq — un appel raté ne doit
  // jamais coûter une génération à l'utilisateur.
  await recordGeneration(supabase, user.id, parsed.mode);

  return NextResponse.json({ result, remaining: DAILY_QUOTA - quota.usedCount - 1 });
}
