import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Plan, PlanId } from "../types";

interface PlanRow {
  id: PlanId;
  name: string;
  price_xof: number;
  price_barred_xof: number | null;
  annual_price_xof: number | null;
  annual_price_barred_xof: number | null;
  max_duration_sec: number | null;
  max_scripts: number | null;
  watermark: boolean;
  script_import: boolean;
  ai_writer: boolean;
  is_active: boolean;
}

const COLUMNS =
  "id, name, price_xof, price_barred_xof, annual_price_xof, annual_price_barred_xof, max_duration_sec, max_scripts, watermark, script_import, ai_writer, is_active";

function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    priceXof: row.price_xof,
    priceBarredXof: row.price_barred_xof,
    annualPriceXof: row.annual_price_xof,
    annualPriceBarredXof: row.annual_price_barred_xof,
    maxDurationSec: row.max_duration_sec,
    maxScripts: row.max_scripts,
    watermark: row.watermark,
    scriptImport: row.script_import,
    aiWriter: row.ai_writer,
    isActive: row.is_active,
  };
}

/**
 * Équivalent server-side de `getAllPlans()` (`plans-db.ts`), qui utilise le
 * client navigateur — inadapté à un Server Component (page marketing publique,
 * lue au build/à la requête pour le SEO). Repli silencieux sur `[]` si la
 * lecture échoue : la section tarifs gère elle-même ce cas (pas de crash de
 * page pour un souci réseau ponctuel). Seul point d'entrée filtré sur
 * `is_active` : c'est la vitrine publique, contrairement à `getAllPlans()`
 * (admin, doit tout voir) et `getPlan(id)` (doit résoudre même un plan
 * désactivé pour un abonnement existant).
 */
export async function getAllPlansServer(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("price_xof");
  if (error || !data) return [];
  return (data as PlanRow[]).map(rowToPlan);
}
