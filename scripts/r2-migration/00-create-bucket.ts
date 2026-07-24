// One-time helper: creates the R2 bucket via the S3-compatible API using
// the credentials already in .env. Public access (the pub-xxxx.r2.dev URL)
// can't be toggled through this API — that's a Cloudflare-dashboard-only
// setting — so this only creates the bucket itself.
//
// Run: pnpm exec tsx scripts/r2-migration/00-create-bucket.ts <bucket-name>

import "dotenv/config";
import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_ACCESS_KEY_SECRET;

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_ACCESS_KEY_SECRET in .env");
}

const bucketName = process.argv[2];
if (!bucketName) {
  console.error("Usage: pnpm exec tsx scripts/r2-migration/00-create-bucket.ts <bucket-name>");
  process.exit(1);
}

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function main() {
  try {
    await r2.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket "${bucketName}" already exists — nothing to do.`);
    return;
  } catch {
    // Doesn't exist yet — fall through to create it.
  }

  await r2.send(new CreateBucketCommand({ Bucket: bucketName }));
  console.log(`Created bucket "${bucketName}".`);
  console.log(`\nNext step (manual, Cloudflare dashboard only):`);
  console.log(`  1. Go to R2 → ${bucketName} → Settings → Public access`);
  console.log(`  2. Click "Allow Access" to enable the r2.dev public URL`);
  console.log(`  3. Copy the resulting https://pub-xxxxxxxx.r2.dev URL`);
  console.log(`  4. Set R2_BUCKET_NAME=${bucketName} and R2_PUBLIC_URL=<that URL> in .env and apps/web/.env`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
