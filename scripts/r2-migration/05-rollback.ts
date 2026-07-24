// Restores DB columns from a backup folder written by 04-update-db-urls.ts.
// Does not touch R2 or Supabase Storage — only reverts the database rows.
//
// Run: pnpm exec tsx scripts/r2-migration/05-rollback.ts scripts/r2-migration/logs/backups/<timestamp>

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { supabaseAdmin } from "./lib/supabase-admin";

async function restoreFile(filePath: string) {
  const name = path.basename(filePath, ".json");
  const entries = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!Array.isArray(entries) || entries.length === 0) return;

  if (name === "products") {
    for (const e of entries as { id: string; image: string | null; images: string[] | null }[]) {
      await supabaseAdmin.from("products").update({ image: e.image, images: e.images }).eq("id", e.id);
    }
    console.log(`Restored products: ${entries.length} row(s)`);
    return;
  }

  if (name === "page_components") {
    for (const e of entries as { id: string; settings: unknown }[]) {
      await supabaseAdmin.from("page_components").update({ settings: e.settings }).eq("id", e.id);
    }
    console.log(`Restored page_components: ${entries.length} row(s)`);
    return;
  }

  // Base64-column backups are named "<table>-<column>.json"
  const dashIndex = name.lastIndexOf("-");
  const table = name.slice(0, dashIndex);
  const column = name.slice(dashIndex + 1);
  for (const e of entries as { id: string; value: unknown }[]) {
    await supabaseAdmin.from(table).update({ [column]: e.value }).eq("id", e.id);
  }
  console.log(`Restored ${table}.${column}: ${entries.length} row(s)`);
}

async function main() {
  const backupDir = process.argv[2];
  if (!backupDir || !fs.existsSync(backupDir)) {
    console.error("Usage: pnpm exec tsx scripts/r2-migration/05-rollback.ts <backup-dir-printed-by-step-4>");
    process.exit(1);
  }

  const files = fs.readdirSync(backupDir).filter((f) => f.endsWith(".json"));
  console.log(`Rolling back ${files.length} file(s) from ${backupDir}`);
  for (const file of files) {
    await restoreFile(path.join(backupDir, file));
  }
  console.log("Rollback complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
