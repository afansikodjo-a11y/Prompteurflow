import type { RecentSignup } from "../lib/user-metrics";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

interface RecentSignupsTableProps {
  signups: RecentSignup[];
}

export function RecentSignupsTable({ signups }: RecentSignupsTableProps) {
  if (signups.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucune inscription pour l&apos;instant.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Rôle</th>
            <th className="pb-2 font-medium">Inscrit le</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {signups.map((signup) => (
            <tr key={signup.id}>
              <td className="py-2">{signup.email || "—"}</td>
              <td className="py-2">{signup.role === "admin" ? "Admin" : "Utilisateur"}</td>
              <td className="text-muted-foreground py-2 tabular-nums">
                {DATE_FORMATTER.format(new Date(signup.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
