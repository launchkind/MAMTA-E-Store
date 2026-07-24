// Follow-up to 04-update-db-urls.ts: catches DB columns that reference the
// real Supabase Storage buckets (products, banners, categories) from a
// TABLE other than the one the bucket is named after — e.g. brand logos
// living under the "products" bucket's brands/ subfolder, or ads_banners
// rows pointing at files in the "banners" bucket. Same backup-before-write
// safety as the main script.
//
// Run: pnpm exec tsx scripts/r2-migration/04b-update-remaining-bucket-urls.ts

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { supabaseAdmin } from "./lib/supabase-admin";

const LOG_DIR = path.join(__dirname, "logs");
const BACKUP_DIR = path.join(LOG_DIR, "backups", new Date().toISOString().replace(/[:.]/g, "-") + "-remaining");
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL in .env");

interface MigratedFile {
  supabaseBucket: string;
  supabasePath: string;
  r2Key: string;
  publicUrl: string;
}

function readLog(file: string): MigratedFile[] {
  const p = path.join(LOG_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

// Build one combined map from every real-bucket copy log, keyed by the
// original Supabase public URL, regardless of which table references it.
const urlMap = new Map<string, string>();
for (const logFile of ["products-migrated.json", "banners-migrated.json", "categories-migrated.json", "avatars-migrated.json", "icons-migrated.json", "product-migrated.json"]) {
  for (const m of readLog(logFile)) {
    const originalUrl = `${SUPABASE_URL}/storage/v1/object/public/${m.supabaseBucket}/${m.supabasePath}`;
    urlMap.set(originalUrl, m.publicUrl);
  }
}

console.log(`Loaded ${urlMap.size} known bucket-file URL mappings.\n`);

interface ColumnTarget {
  table: string;
  column: string;
  isArray?: boolean;
}

const TARGETS: ColumnTarget[] = [
  { table: "banners", column: "image" },
  { table: "banners", column: "mobile_image" },
  { table: "categories", column: "image" },
  { table: "categories", column: "icon_image" },
  { table: "brands", column: "image" },
  { table: "ads_banners", column: "image" },
  { table: "product_banners", column: "image" },
  { table: "sellers", column: "logo" },
  { table: "users", column: "avatar" },
];

async function updateTarget(target: ColumnTarget) {
  const { data: rows, error } = await supabaseAdmin.from(target.table).select(`id, ${target.column}`);
  if (error) {
    console.log(`${target.table}.${target.column}: ERROR ${error.message}`);
    return;
  }

  const backup: { id: string; value: unknown }[] = [];
  let updatedCount = 0;

  for (const row of (rows || []) as Record<string, unknown>[]) {
    const id = String(row.id);
    const current = row[target.column];

    let newValue: unknown = current;
    let changed = false;

    if (typeof current === "string" && urlMap.has(current)) {
      newValue = urlMap.get(current)!;
      changed = true;
    }

    if (!changed) continue;

    backup.push({ id, value: current });
    const { error: updErr } = await supabaseAdmin.from(target.table).update({ [target.column]: newValue }).eq("id", id);
    if (updErr) {
      console.log(`  FAILED ${target.table}.${target.column}/${id}: ${updErr.message}`);
      continue;
    }
    updatedCount++;
  }

  if (backup.length > 0) {
    fs.writeFileSync(path.join(BACKUP_DIR, `${target.table}-${target.column}.json`), JSON.stringify(backup, null, 2));
  }
  console.log(`${target.table}.${target.column}: updated ${updatedCount} row(s)`);
}

async function main() {
  console.log(`Backups will be written to: ${BACKUP_DIR}\n`);
  for (const target of TARGETS) {
    await updateTarget(target);
  }
  console.log(`\nDone. To roll back this pass:`);
  console.log(`  pnpm exec tsx scripts/r2-migration/05-rollback.ts "${BACKUP_DIR}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
