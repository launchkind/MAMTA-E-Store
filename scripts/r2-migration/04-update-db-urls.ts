// Rewrites DB columns to point at the new R2 URLs, using the mapping logs
// produced by 01-copy-storage-buckets.ts and 02-migrate-base64-columns.ts.
// Before touching any row, the CURRENT value is written to a timestamped
// backup folder so this can be rolled back with 05-rollback.ts.
//
// Only run this after 03-verify-samples.ts and after you've clicked through
// sample R2 URLs yourself and confirmed they load correctly.
//
// Run: pnpm run r2:update-db

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { supabaseAdmin } from "./lib/supabase-admin";

const LOG_DIR = path.join(__dirname, "logs");
const BACKUP_DIR = path.join(LOG_DIR, "backups", new Date().toISOString().replace(/[:.]/g, "-"));
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL in .env");

function readLog<T>(file: string): T[] {
  const p = path.join(LOG_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function supabaseStorageUrl(bucket: string, filePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
}

interface MigratedFile {
  supabaseBucket: string;
  supabasePath: string;
  r2Key: string;
  publicUrl: string;
}

// ─── Part A: products.image / products.images[] (real "products" bucket) ────
async function updateProductsImages() {
  const migrated = readLog<MigratedFile>("products-migrated.json");
  if (migrated.length === 0) {
    console.log("products: nothing to update (no migrated log — run step 1 first)");
    return;
  }

  const urlMap = new Map<string, string>();
  for (const m of migrated) urlMap.set(supabaseStorageUrl(m.supabaseBucket, m.supabasePath), m.publicUrl);

  const { data: rows, error } = await supabaseAdmin.from("products").select("id, image, images");
  if (error) throw error;

  const backup: { id: string; image: string | null; images: string[] | null }[] = [];
  let updatedCount = 0;

  for (const row of (rows || []) as { id: string; image: string | null; images: string[] | null }[]) {
    const newImage = row.image && urlMap.has(row.image) ? urlMap.get(row.image)! : row.image;
    const newImages = Array.isArray(row.images) ? row.images.map((u) => urlMap.get(u) ?? u) : row.images;

    const changed = newImage !== row.image || JSON.stringify(newImages) !== JSON.stringify(row.images);
    if (!changed) continue;

    backup.push({ id: row.id, image: row.image, images: row.images });
    const { error: updErr } = await supabaseAdmin
      .from("products")
      .update({ image: newImage, images: newImages })
      .eq("id", row.id);
    if (updErr) {
      console.log(`  FAILED products/${row.id}: ${updErr.message}`);
      continue;
    }
    updatedCount++;
  }

  fs.writeFileSync(path.join(BACKUP_DIR, "products.json"), JSON.stringify(backup, null, 2));
  console.log(`products: updated ${updatedCount} row(s)`);
}

// ─── Part B: page_components.settings.images[] (real "banners" bucket) ──────
async function updatePageComponents() {
  const migrated = readLog<MigratedFile>("banners-migrated.json");
  if (migrated.length === 0) {
    console.log("page_components: nothing to update (no migrated log — run step 1 first)");
    return;
  }

  const urlMap = new Map<string, string>();
  for (const m of migrated) urlMap.set(supabaseStorageUrl(m.supabaseBucket, m.supabasePath), m.publicUrl);

  const { data: rows, error } = await supabaseAdmin.from("page_components").select("id, settings");
  if (error) throw error;

  const backup: { id: string; settings: unknown }[] = [];
  let updatedCount = 0;

  for (const row of (rows || []) as { id: string; settings: { images?: string[] } | null }[]) {
    const images = row.settings?.images;
    if (!Array.isArray(images) || images.length === 0) continue;

    const newImages = images.map((u) => urlMap.get(u) ?? u);
    if (JSON.stringify(newImages) === JSON.stringify(images)) continue;

    backup.push({ id: row.id, settings: row.settings });
    const newSettings = { ...row.settings, images: newImages };
    const { error: updErr } = await supabaseAdmin
      .from("page_components")
      .update({ settings: newSettings })
      .eq("id", row.id);
    if (updErr) {
      console.log(`  FAILED page_components/${row.id}: ${updErr.message}`);
      continue;
    }
    updatedCount++;
  }

  fs.writeFileSync(path.join(BACKUP_DIR, "page_components.json"), JSON.stringify(backup, null, 2));
  console.log(`page_components: updated ${updatedCount} row(s)`);
}

// ─── Part C: base64 columns (from 02-migrate-base64-columns.ts logs) ────────
interface BaseColumnTarget {
  table: string;
  column: string;
  isArray?: boolean;
}

const BASE64_TARGETS: BaseColumnTarget[] = [
  { table: "users", column: "avatar" },
  { table: "categories", column: "image" },
  { table: "categories", column: "icon_image" },
  { table: "brands", column: "image" },
  { table: "sellers", column: "logo" },
  { table: "banners", column: "image" },
  { table: "banners", column: "mobile_image" },
  { table: "ads_banners", column: "image" },
  { table: "product_banners", column: "image" },
  { table: "product_types", column: "icon" },
  { table: "product_types", column: "banner_images", isArray: true },
  { table: "social_media", column: "icon" },
  { table: "website_icons", column: "url" },
  { table: "product_variants", column: "images", isArray: true },
];

interface MigratedItem {
  table: string;
  id: string;
  column: string;
  index: number | null;
  r2Key: string;
  publicUrl: string;
}

async function updateBase64Target(target: BaseColumnTarget) {
  const migrated = readLog<MigratedItem>(`${target.table}-${target.column}-migrated.json`);
  if (migrated.length === 0) return;

  const byId = new Map<string, MigratedItem[]>();
  for (const item of migrated) {
    if (!byId.has(item.id)) byId.set(item.id, []);
    byId.get(item.id)!.push(item);
  }

  const { data: rows, error } = await supabaseAdmin
    .from(target.table)
    .select(`id, ${target.column}`)
    .in("id", Array.from(byId.keys()));
  if (error) throw error;

  const backup: { id: string; value: unknown }[] = [];
  let updatedCount = 0;

  for (const row of (rows || []) as Record<string, unknown>[]) {
    const id = String(row.id);
    const items = byId.get(id);
    if (!items) continue;

    const currentValue = row[target.column];
    let newValue: unknown;

    if (target.isArray) {
      const arr = Array.isArray(currentValue) ? [...(currentValue as string[])] : [];
      for (const item of items) {
        if (item.index === null || item.index >= arr.length) continue;
        arr[item.index] = item.publicUrl;
      }
      newValue = arr;
    } else {
      newValue = items[0].publicUrl;
    }

    backup.push({ id, value: currentValue });
    const { error: updErr } = await supabaseAdmin
      .from(target.table)
      .update({ [target.column]: newValue })
      .eq("id", id);
    if (updErr) {
      console.log(`  FAILED ${target.table}.${target.column}/${id}: ${updErr.message}`);
      continue;
    }
    updatedCount++;
  }

  fs.writeFileSync(path.join(BACKUP_DIR, `${target.table}-${target.column}.json`), JSON.stringify(backup, null, 2));
  console.log(`${target.table}.${target.column}: updated ${updatedCount} row(s)`);
}

async function main() {
  console.log(`Backups will be written to: ${BACKUP_DIR}\n`);

  await updateProductsImages();
  await updatePageComponents();
  for (const target of BASE64_TARGETS) {
    await updateBase64Target(target);
  }

  console.log(`\nDone. To roll back everything from this run:`);
  console.log(`  pnpm exec tsx scripts/r2-migration/05-rollback.ts "${BACKUP_DIR}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
