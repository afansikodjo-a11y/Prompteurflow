import type { AiWriteError, AiWriteRequest, AiWriteResult } from "../types";

export type FetchAiWriteResult = { ok: true; data: AiWriteResult } | { ok: false; error: AiWriteError };

/** Appelle `/api/ai/write` et normalise succès/erreur en résultat typé. */
export async function fetchAiWrite(request: AiWriteRequest): Promise<FetchAiWriteResult> {
  try {
    const response = await fetch("/api/ai/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const body = await response.json();

    if (!response.ok) {
      return { ok: false, error: body as AiWriteError };
    }

    return { ok: true, data: body as AiWriteResult };
  } catch {
    return {
      ok: false,
      error: {
        error: "Impossible de contacter l'assistant IA. Vérifiez votre connexion.",
        code: "upstream_error",
      },
    };
  }
}
