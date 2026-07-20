import { AlertCircle } from "lucide-react";

const ROADMAP_ITEMS = [
  {
    metric: "Revenus, MRR, ARR, churn, LTV, ARPU",
    requirement: "Brancher le checkout et le webhook Moneroo réels — remplira la table transactions.",
  },
  {
    metric: "Utilisateurs actifs (DAU/WAU/MAU), fonctionnalités les plus utilisées",
    requirement:
      "Instrumenter le Studio pour envoyer des événements d'usage au serveur — scripts et vidéos restent aujourd'hui 100% sur l'appareil.",
  },
  {
    metric: "Funnel visiteur → client, sources d'acquisition, CAC",
    requirement: "Ajouter un suivi des visites sur la landing — aucun tracking de pages vues aujourd'hui.",
  },
  {
    metric: "Rétention par cohorte, prévisions",
    requirement: "Dépend des deux points ci-dessus — nécessite un historique d'activité qui n'existe pas encore.",
  },
];

/**
 * Feuille de route visible : ce qui manque pour activer chaque métrique
 * absente, jamais un chiffre inventé à la place.
 */
export function RoadmapPanel() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2">
        <AlertCircle className="text-muted-foreground size-4" aria-hidden="true" />
        <h3 className="font-semibold">Pas encore disponible</h3>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Ces métriques ne sont pas affichées faute de données réelles. Voici ce qu&apos;il faut construire pour les
        activer.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {ROADMAP_ITEMS.map((item) => (
          <li key={item.metric} className="text-sm">
            <p className="font-medium">{item.metric}</p>
            <p className="text-muted-foreground mt-0.5">{item.requirement}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
