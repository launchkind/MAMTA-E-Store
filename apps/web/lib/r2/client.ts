import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

// Every export here resolves env vars lazily (on first real call) rather
// than at module load. Next.js evaluates route modules during the build's
// "collect page data" step for every route regardless of whether it's ever
// requested — a top-level throw for a missing R2 var would fail the entire
// build, not just requests to this route.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_ACCESS_KEY_SECRET");
  cachedClient = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

export function getR2Bucket(): string {
  return requireEnv("R2_BUCKET_NAME");
}

function getR2PublicBase(): string {
  return requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
}

export function r2PublicUrl(key: string): string {
  return `${getR2PublicBase()}/${key}`;
}

export function r2KeyFromPublicUrl(url: string): string | null {
  const base = getR2PublicBase();
  if (!url.startsWith(`${base}/`)) return null;
  return url.slice(base.length + 1);
}
