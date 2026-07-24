// Copies files from Supabase Storage buckets into the R2 bucket, under
// "<bucket-name>/<original-path>" keys. Copy-only — does not touch the
// database and does not delete anything from Supabase. Safe to re-run:
// files that already exist in R2 (by key) are skipped.
//
// Run: pnpm --filter=. exec tsx scripts/r2-migration/01-copy-storage-buckets.ts
// (or: pnpm run r2:copy-buckets)

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, r2PublicUrl } from "./lib/r2-client";
import { supabaseAdmin } from "./lib/supabase-admin";

// All buckets that exist in the Supabase project. Only "products" and
// "banners" are actually written to by app code (see investigation notes);
// the rest are scanned in case of stray/manually-uploaded files.
const BUCKETS = ["products", "banners", "categories", "avatars", "icons", "product"];

const LOG_DIR = path.join(__dirname, "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });

interface MigratedFile {
  supabaseBucket: string;
  supabasePath: string;
  r2Key: string;
  publicUrl: string;
}
interface FailedFile {
  supabaseBucket: string;
  path: string;
  error: string;
}

async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function listAllFiles(bucket: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(prefix: string) {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data) return;

    for (const entry of data) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Supabase Storage lists sub-folders as entries with id === null and no metadata.
      if (entry.id === null && entry.metadata === null) {
        await walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await walk("");
  return files;
}

async function migrateBucket(bucket: string) {
  console.log(`\n=== Bucket: ${bucket} ===`);

  let files: string[];
  try {
    files = await listAllFiles(bucket);
  } catch (err) {
    console.log(`  Skipped — bucket not found or inaccessible: ${(err as Error).message}`);
    return;
  }

  console.log(`  Found ${files.length} file(s)`);
  if (files.length === 0) return;

  const migrated: MigratedFile[] = [];
  const failures: FailedFile[] = [];
  let processed = 0;

  for (const file of files) {
    const r2Key = `${bucket}/${file}`;
    try {
      if (await existsInR2(r2Key)) {
        migrated.push({ supabaseBucket: bucket, supabasePath: file, r2Key, publicUrl: r2PublicUrl(r2Key) });
        processed++;
        continue;
      }

      const { data, error } = await supabaseAdmin.storage.from(bucket).download(file);
      if (error || !data) throw new Error(error?.message || "download returned no data");

      const buffer = Buffer.from(await data.arrayBuffer());
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: r2Key,
          Body: buffer,
          ContentType: data.type || "application/octet-stream",
        })
      );

      migrated.push({ supabaseBucket: bucket, supabasePath: file, r2Key, publicUrl: r2PublicUrl(r2Key) });
      processed++;
      if (processed % 10 === 0 || processed === files.length) {
        console.log(`  Migrated ${processed}/${files.length}`);
      }
    } catch (err) {
      processed++;
      failures.push({ supabaseBucket: bucket, path: file, error: (err as Error).message });
      console.log(`  FAILED (${processed}/${files.length}): ${file} — ${(err as Error).message}`);
    }
  }

  fs.writeFileSync(path.join(LOG_DIR, `${bucket}-migrated.json`), JSON.stringify(migrated, null, 2));
  if (failures.length > 0) {
    fs.writeFileSync(path.join(LOG_DIR, `${bucket}-failures.json`), JSON.stringify(failures, null, 2));
  }
  console.log(`  Done: ${migrated.length} migrated, ${failures.length} failed`);
}

async function main() {
  console.log(`Target R2 bucket: ${R2_BUCKET}`);
  for (const bucket of BUCKETS) {
    await migrateBucket(bucket);
  }
  console.log(`\nAll buckets processed. Per-bucket results in ${LOG_DIR}`);
  console.log("Next: run 02-migrate-base64-columns.ts, then 03-verify-samples.ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
