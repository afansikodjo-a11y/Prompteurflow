import { ContactForm } from "@/features/contact";
import { Reveal } from "./reveal";

/**
 * Section de fin de landing — même formulaire que `/contact` (ouvre
 * WhatsApp au submit, pas de backend), posée dans une carte pour se fondre
 * dans la direction artistique sombre de la landing plutôt que la coquille
 * `bg-card`/`border-border` utilisée sur la page dédiée.
 */
export function ContactSection() {
  return (
    <section id="contact" className="border-t border-white/[0.06] bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-lg px-4">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Une question ?
          </h2>
          <p className="mt-3 text-center text-neutral-400">
            Décrivez votre demande, on continue la conversation sur WhatsApp.
          </p>
        </Reveal>
        <Reveal delay={0.08} className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
