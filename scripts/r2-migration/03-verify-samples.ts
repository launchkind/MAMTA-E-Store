// Reads the migration logs from steps 1 and 2, picks a handful of sample
// URLs per source, checks that each is actually reachable over HTTP at the
// new R2 public URL, and prints them so you can also click-check by hand.
// Does not touch the database.
//
// Run: pnpm run r2:verify

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const LOG_DIR = path.join(__dirname, "logs");
const SAMPLES_PER_SOURCE = 3;

interface MigratedEntry {
  publicUrl: string;
  [key: string]: unknown;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: "GET" });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: -1 };
  }
}

async function main() {
  if (!fs.existsSync(LOG_DIR)) {
    console.log("No logs found — run 01-copy-storage-buckets.ts and 02-migrate-base64-columns.ts first.");
    return;
  }

  const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith("-migrated.json"));
  if (files.length === 0) {
    console.log("No *-migrated.json logs found — nothing to verify yet.");
    return;
  }

  let totalChecked = 0;
  let totalOk = 0;

  for (const file of files) {
    const sourceName = file.replace("-migrated.json", "");
    const entries: MigratedEntry[] = JSON.parse(fs.readFileSync(path.join(LOG_DIR, file), "utf-8"));
    if (entries.length === 0) continue;

    // Evenly spaced sample so we're not just checking the first N.
    const step = Math.max(1, Math.floor(entries.length / SAMPLES_PER_SOURCE));
    const sample = entries.filter((_, i) => i % step === 0).slice(0, SAMPLES_PER_SOURCE);

    console.log(`\n=== ${sourceName} (${entries.length} total, sampling ${sample.length}) ===`);
    for (const entry of sample) {
      totalChecked++;
      const { ok, status } = await checkUrl(entry.publicUrl);
      if (ok) totalOk++;
      console.log(`  [${ok ? "OK " : "FAIL"} ${status}] ${entry.publicUrl}`);
    }
  }

  console.log(`\n${totalOk}/${totalChecked} sample URLs returned OK.`);
  console.log("Open a few of these in your browser to confirm the images actually render correctly.");
  console.log("Only proceed to 04-update-db-urls.ts once you've confirmed these look right.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
