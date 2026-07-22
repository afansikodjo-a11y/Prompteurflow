"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Pas de backend : le formulaire compose un message et ouvre une
 * conversation WhatsApp pré-remplie avec le support — rien n'est envoyé ni
 * stocké par PrompteurFlow, WhatsApp reste le seul canal de suivi.
 */
export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const lines = [`Bonjour, je m'appelle ${name.trim()}.`, "", message.trim()];
    if (email.trim()) lines.push("", `Mon email : ${email.trim()}`);

    const link = buildWhatsAppLink(siteConfig.supportWhatsAppPhone, lines.join("\n"));
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-name">Nom</Label>
        <Input
          id="contact-name"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">Email (optionnel)</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="w-full">
        Continuer sur WhatsApp
      </Button>
    </form>
  );
}
