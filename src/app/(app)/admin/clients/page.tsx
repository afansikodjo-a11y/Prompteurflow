import { CustomersTable } from "@/features/admin";

/**
 * Panneau admin — liste des clients : téléphone (relance WhatsApp),
 * activation/désactivation de compte. Accès protégé par `layout.tsx`
 * (garde serveur + RLS).
 */
export default function AdminClientsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
      <p className="text-muted-foreground mt-2">
        Coordonnées et statut de chaque compte — désactiver bloque la connexion sans rien effacer.
      </p>
      <div className="mt-8">
        <CustomersTable />
      </div>
    </section>
  );
}
