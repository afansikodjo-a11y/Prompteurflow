"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // TODO: brancher un service de reporting (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Une erreur est survenue</h1>
      <p className="text-muted-foreground mt-2">
        Quelque chose s&apos;est mal passé. Veuillez réessayer.
      </p>
      <Button onClick={reset} className="mt-6">
        Réessayer
      </Button>
    </section>
  );
}
