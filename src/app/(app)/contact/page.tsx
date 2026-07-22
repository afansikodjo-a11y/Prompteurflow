import type { Metadata } from "next";

import { ContactForm } from "@/features/contact";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Nous contacter</h1>
      <p className="text-muted-foreground mt-2">
        Décrivez votre demande, on continue la conversation sur WhatsApp.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
  );
}
