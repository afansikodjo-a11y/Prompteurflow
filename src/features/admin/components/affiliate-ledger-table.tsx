"use client";

import { Button } from "@/components/ui/button";
import { useAdminAffiliateLedger } from "../hooks/use-admin-affiliate-ledger";

function formatXof(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} XOF`;
}

/** Un affilié par ligne — filleuls, gains en attente/versés, marquage payé manuel. */
export function AffiliateLedgerTable() {
  const { rows, loading, markPaid } = useAdminAffiliateLedger();

  if (loading) return <p className="text-muted-foreground text-sm">Chargement…</p>;
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucun affilié pour l&apos;instant.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="pb-2 font-medium">Affilié</th>
            <th className="pb-2 font-medium">Filleuls</th>
            <th className="pb-2 font-medium">En attente</th>
            <th className="pb-2 font-medium">Déjà versé</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.affiliateId}>
              <td className="py-2">{row.email || "—"}</td>
              <td className="py-2 tabular-nums">{row.referredCount}</td>
              <td className="py-2 tabular-nums">{formatXof(row.accruedTotalXof)}</td>
              <td className="py-2 tabular-nums">{formatXof(row.paidTotalXof)}</td>
              <td className="py-2 text-right">
                {row.accruedTotalXof > 0 && (
                  <Button type="button" size="sm" variant="outline" onClick={() => void markPaid(row.affiliateId)}>
                    Marquer payé
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
