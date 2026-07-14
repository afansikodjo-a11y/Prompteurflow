import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default function SettingsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
      <p className="text-muted-foreground mt-2">Écran en préparation.</p>
    </section>
  );
}
