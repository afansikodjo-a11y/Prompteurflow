import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Plan, PlanId } from "../types";

interface PlanRow {
  id: PlanId;
  name: string;
  price_xof: number;
  max_duration_sec: number | null;
  max_scripts: number | null;
  watermark: boolean;
  unlocked_filters: string[];
  script_import: boolean;
}

const COLUMNS =
  "id, name, price_xof, max_duration_sec, max_scripts, watermark, unlocked_filters, script_import";

function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    priceXof: row.price_xof,
    maxDurationSec: row.max_duration_sec,
    maxScripts: row.max_scripts,
    watermark: row.watermark,
    unlockedFilters: row.unlocked_filters as Plan["unlockedFilters"],
    scriptImport: row.script_import,
  };
}

/**
 * Équivalent server-side de `getAllPlans()` (`plans-db.ts`), qui utilise le
 * client navigateur — inadapté à un Server Component (page marketing publique,
 * lue au build/à la requête pour le SEO). Repli silencieux sur `[]` si la
 * lecture échoue : la section tarifs gère elle-même ce cas (pas de crash de
 * page pour un souci réseau ponctuel).
 */
export async function getAllPlansServer(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("plans").select(COLUMNS).order("price_xof");
  if (error || !data) return [];
  return (data as PlanRow[]).map(rowToPlan);
}
