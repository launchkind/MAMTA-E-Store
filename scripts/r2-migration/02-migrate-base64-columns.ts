// Scans DB columns that store images as inline base64 data URIs (this admin
// UI's `ImageUpload` component saves `data:image/...;base64,...` strings
// directly into text columns instead of uploading to storage), decodes each
// one, and uploads it to R2. Writes a mapping log per table but does NOT
// write anything back to the database — that happens in 04-update-db-urls.ts.
//
// Run: pnpm run r2:migrate-base64

import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, r2PublicUrl } from "./lib/r2-client";
import { supabaseAdmin } from "./lib/supabase-admin";

const LOG_DIR = path.join(__dirname, "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

interface ColumnTarget {
  table: string;
  column: string;
  isArray?: boolean;
}

// Every column found in Step 0 that goes through the base64 `ImageUpload`
// component instead of real Supabase Storage.
const TARGETS: ColumnTarget[] = [
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
  index: number | null; // null for scalar columns, array index for array columns
  r2Key: string;
  publicUrl: string;
  byteLength: number;
}
interface FailedItem {
  table: string;
  id: string;
  column: string;
  index: number | null;
  error: string;
}

function parseDataUri(value: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(value);
  if (!match) return null;
  const [, mime, base64] = match;
  return { mime, buffer: Buffer.from(base64, "base64") };
}

function keyFor(table: string, column: string, id: string, index: number | null, mime: string): string {
  const ext = EXT_BY_MIME[mime] || "bin";
  const hash = crypto.createHash("sha256").update(`${table}:${column}:${id}:${index ?? "x"}`).digest("hex").slice(0, 8);
  const suffix = index === null ? "" : `-${index}`;
  return `${table}/${column}/${id}${suffix}-${hash}.${ext}`;
}

async function migrateTarget(target: ColumnTarget) {
  const { table, column, isArray } = target;
  console.log(`\n=== ${table}.${column}${isArray ? " (array)" : ""} ===`);

  const { data: rows, error } = await supabaseAdmin.from(table).select(`id, ${column}`);
  if (error) {
    console.log(`  Skipped — could not read table: ${error.message}`);
    return;
  }
  if (!rows || rows.length === 0) {
    console.log("  No rows");
    return;
  }

  const migrated: MigratedItem[] = [];
  const failures: FailedItem[] = [];
  let base64Count = 0;

  for (const row of rows as Record<string, unknown>[]) {
    const id = String(row.id);
    const raw = row[column];

    const values: { value: unknown; index: number | null }[] = isArray
      ? Array.isArray(raw)
        ? (raw as unknown[]).map((v, i) => ({ value: v, index: i }))
        : []
      : [{ value: raw, index: null }];

    for (const { value, index } of values) {
      if (typeof value !== "string" || !value.startsWith("data:")) continue;

      base64Count++;
      const parsed = parseDataUri(value);
      if (!parsed) {
        failures.push({ table, id, column, index, error: "Could not parse data URI" });
        continue;
      }

      try {
        const key = keyFor(table, column, id, index, parsed.mime);
        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: parsed.buffer,
            ContentType: parsed.mime,
          })
        );
        migrated.push({ table, id, column, index, r2Key: key, publicUrl: r2PublicUrl(key), byteLength: parsed.buffer.length });
      } catch (err) {
        failures.push({ table, id, column, index, error: (err as Error).message });
      }
    }
  }

  console.log(`  Rows: ${rows.length}, base64 values found: ${base64Count}, migrated: ${migrated.length}, failed: ${failures.length}`);

  const safeName = `${table}-${column}`;
  fs.writeFileSync(path.join(LOG_DIR, `${safeName}-migrated.json`), JSON.stringify(migrated, null, 2));
  if (failures.length > 0) {
    fs.writeFileSync(path.join(LOG_DIR, `${safeName}-failures.json`), JSON.stringify(failures, null, 2));
  }
}

async function main() {
  console.log(`Target R2 bucket: ${R2_BUCKET}`);
  for (const target of TARGETS) {
    await migrateTarget(target);
  }
  console.log(`\nDone. Per-column results in ${LOG_DIR}`);
  console.log("Next: run 03-verify-samples.ts, then confirm before 04-update-db-urls.ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
