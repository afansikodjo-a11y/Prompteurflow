import { Briefcase, GraduationCap, Megaphone, ShoppingBag, Sparkles, Video } from "lucide-react";

const AUDIENCES = [
  {
    icon: Video,
    title: "Créateurs de contenu",
    description: "Publiez plus régulièrement sans passer des heures à mémoriser vos scripts.",
  },
  {
    icon: Briefcase,
    title: "Entrepreneurs",
    description: "Présentez vos produits, services et offres avec plus de confiance.",
  },
  {
    icon: GraduationCap,
    title: "Formateurs et coachs",
    description: "Enregistrez vos cours et tutoriels avec un fil conducteur clair.",
  },
  {
    icon: Megaphone,
    title: "Community managers",
    description: "Créez rapidement des vidéos pour vos clients.",
  },
  {
    icon: ShoppingBag,
    title: "Commerçants",
    description: "Présentez vos produits sans oublier les arguments importants.",
  },
  {
    icon: Sparkles,
    title: "Entreprises",
    description: "Créez vos vidéos de communication et présentations internes.",
  },
];

export function AudienceSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pour qui est fait PrompteurFlow ?
        </h2>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {AUDIENCES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="border-border bg-card rounded-xl border p-6">
            <Icon className="size-6" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
