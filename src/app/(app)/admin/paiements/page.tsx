import { PaymentProvidersForm } from "@/features/admin";

/**
 * Panneau admin — activation des fournisseurs de paiement (SasPay/Moneroo).
 * Accès protégé par `layout.tsx` (garde serveur + RLS).
 */
export default function AdminPaiementsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
      <p className="text-muted-foreground mt-2">
        Fournisseur proposé aux clients au paiement — SasPay tenté en premier, Moneroo en secours si désactivé.
      </p>
      <div className="mt-8">
        <PaymentProvidersForm />
      </div>
    </section>
  );
}
