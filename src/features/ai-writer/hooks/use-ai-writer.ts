"use client";

import * as React from "react";

import { useAuth } from "@/features/auth";
import { fetchAiWrite } from "../lib/fetch-ai-write";
import type { AiWriteRequest } from "../types";

type Status = "idle" | "loading" | "success" | "error";

export interface UseAiWriterResult {
  authLoading: boolean;
  isAuthenticated: boolean;
  status: Status;
  result: string | null;
  remaining: number | null;
  error: string | null;
  generate: (input: { topic: string; toneHint?: string; durationHintSec?: number }) => Promise<void>;
  improve: (input: { content: string; instruction: string; toneHint?: string }) => Promise<void>;
  reset: () => void;
}

/**
 * État + appels de l'assistant IA d'écriture de script. Lit la session via
 * `useAuth()` en interne (même idiome que `useSubscription`) — pas besoin de
 * faire descendre l'état d'auth depuis le composant appelant.
 */
export function useAiWriter(): UseAiWriterResult {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<string | null>(null);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async (request: AiWriteRequest) => {
    setStatus("loading");
    setError(null);
    const outcome = await fetchAiWrite(request);
    if (!outcome.ok) {
      setStatus("error");
      setError(outcome.error.error);
      return;
    }
    setResult(outcome.data.result);
    setRemaining(outcome.data.remaining);
    setStatus("success");
  }, []);

  const generate = React.useCallback<UseAiWriterResult["generate"]>(
    (input) => run({ mode: "generate", ...input }),
    [run],
  );

  const improve = React.useCallback<UseAiWriterResult["improve"]>(
    (input) => run({ mode: "improve", ...input }),
    [run],
  );

  const reset = React.useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    authLoading,
    isAuthenticated: !authLoading && user !== null,
    status,
    result,
    remaining,
    error,
    generate,
    improve,
    reset,
  };
}
