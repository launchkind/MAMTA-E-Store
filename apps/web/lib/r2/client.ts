import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_ACCESS_KEY_SECRET;
const bucket = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
  throw new Error(
    "Missing R2 env vars. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_ACCESS_KEY_SECRET, R2_BUCKET_NAME, R2_PUBLIC_URL"
  );
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

export const R2_BUCKET = bucket;
export const R2_PUBLIC_URL = publicUrl.replace(/\/$/, "");

export function r2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function r2KeyFromPublicUrl(url: string): string | null {
  if (!url.startsWith(`${R2_PUBLIC_URL}/`)) return null;
  return url.slice(R2_PUBLIC_URL.length + 1);
}
