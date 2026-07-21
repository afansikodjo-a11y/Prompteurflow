/**
 * Types du domaine « ai-writer » — contrat partagé entre le client
 * (`lib/fetch-ai-write.ts`) et la route API (`src/app/api/ai/write/route.ts`).
 */
export type AiWriterMode = "generate" | "improve";

export interface AiGenerateInput {
  mode: "generate";
  topic: string;
  toneHint?: string;
  durationHintSec?: number;
}

export interface AiImproveInput {
  mode: "improve";
  content: string;
  instruction: string;
  toneHint?: string;
}

export type AiWriteRequest = AiGenerateInput | AiImproveInput;

export interface AiWriteResult {
  result: string;
  /** Générations restantes aujourd'hui après cet appel. */
  remaining: number;
}

export type AiWriteErrorCode = "unauthenticated" | "validation" | "quota_exceeded" | "upstream_error";

export interface AiWriteError {
  error: string;
  code: AiWriteErrorCode;
}
