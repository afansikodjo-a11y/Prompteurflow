import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service-role — contourne totalement la RLS.
 * Réservé aux routes qui écrivent dans des tables sans aucun grant client
 * (`transactions`, `subscriptions`, `payment_events`) : le checkout et le
 * webhook Moneroo. Ne jamais importer ailleurs, ne jamais exposer au client.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
