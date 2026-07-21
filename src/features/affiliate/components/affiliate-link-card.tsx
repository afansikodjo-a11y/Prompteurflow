"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AffiliateLinkCardProps {
  link: string;
}

/** Lien de parrainage à partager, avec copie en un clic. */
export function AffiliateLinkCard({ link }: AffiliateLinkCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-sm font-medium">Votre lien de parrainage</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Partagez-le : chaque inscription via ce lien vous rapporte une commission à vie sur ses paiements.
      </p>
      <div className="mt-3 flex gap-2">
        <Input value={link} readOnly onFocus={(event) => event.target.select()} />
        <Button type="button" variant="outline" onClick={() => void handleCopy()} className="shrink-0 gap-1.5">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
    </div>
  );
}
