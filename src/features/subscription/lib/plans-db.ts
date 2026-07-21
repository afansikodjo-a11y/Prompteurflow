import { createClient } from "@/lib/supabase/client";
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
  unlocked_filters: string[];
  script_import: boolean;
  ai_writer: boolean;
}

const COLUMNS =
  "id, name, price_xof, price_barred_xof, annual_price_xof, annual_price_barred_xof, max_duration_sec, max_scripts, watermark, unlocked_filters, script_import, ai_writer";

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
    unlockedFilters: row.unlocked_filters as Plan["unlockedFilters"],
    scriptImport: row.script_import,
    aiWriter: row.ai_writer,
  };
}

/** Retourne un plan par id, ou `null` s'il est absent / la lecture échoue. */
export async function getPlan(id: PlanId): Promise<Plan | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("plans").select(COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  return rowToPlan(data as PlanRow);
}

/** Retourne tous les plans, dans l'ordre Basique/Standard/Pro (prix croissant). */
export async function getAllPlans(): Promise<Plan[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("plans").select(COLUMNS).order("price_xof");
  if (error || !data) return [];
  return (data as PlanRow[]).map(rowToPlan);
}

/** Met à jour un plan (admin uniquement — appliqué via RLS, pas côté client). */
export async function updatePlan(id: PlanId, patch: Partial<Plan>): Promise<void> {
  const supabase = createClient();
  const update: Partial<PlanRow> = {};
  if (patch.priceXof !== undefined) update.price_xof = patch.priceXof;
  if (patch.priceBarredXof !== undefined) update.price_barred_xof = patch.priceBarredXof;
  if (patch.annualPriceXof !== undefined) update.annual_price_xof = patch.annualPriceXof;
  if (patch.annualPriceBarredXof !== undefined) update.annual_price_barred_xof = patch.annualPriceBarredXof;
  if (patch.maxDurationSec !== undefined) update.max_duration_sec = patch.maxDurationSec;
  if (patch.maxScripts !== undefined) update.max_scripts = patch.maxScripts;
  if (patch.watermark !== undefined) update.watermark = patch.watermark;
  if (patch.unlockedFilters !== undefined) update.unlocked_filters = patch.unlockedFilters;
  if (patch.scriptImport !== undefined) update.script_import = patch.scriptImport;
  if (patch.aiWriter !== undefined) update.ai_writer = patch.aiWriter;
  await supabase.from("plans").update(update).eq("id", id);
}
