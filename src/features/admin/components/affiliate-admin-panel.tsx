"use client";

import { useAdminAffiliateLedger } from "../hooks/use-admin-affiliate-ledger";
import { AffiliateAccessForm } from "./affiliate-access-form";
import { AffiliateLedgerTable } from "./affiliate-ledger-table";

/**
 * Compose le formulaire d'activation et le registre des affiliés sur un
 * seul hook partagé — évite deux instances séparées de
 * `useAdminAffiliateLedger()` qui se désynchroniseraient après une
 * activation (le formulaire ne « verrait » pas la table se rafraîchir).
 */
export function AffiliateAdminPanel() {
  const { rows, loading, markPaid, revoke, grantByEmail } = useAdminAffiliateLedger();

  return (
    <div className="flex flex-col gap-6">
      <AffiliateAccessForm onGrant={grantByEmail} />
      <div>
        <h2 className="font-semibold">Affiliés activés</h2>
        <div className="mt-3">
          <AffiliateLedgerTable rows={rows} loading={loading} onMarkPaid={markPaid} onRevoke={revoke} />
        </div>
      </div>
    </div>
  );
}
