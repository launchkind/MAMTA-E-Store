/**
 * Validate required environment variables
 * This runs at build time to ensure all necessary env vars are present
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optionalEnvVars = [
  "CASHFREE_APP_ID",
  "CASHFREE_SECRET_KEY",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error("\n⚠️  Build will continue but may fail or have issues.");
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn("⚠️  Missing optional environment variables:");
    warnings.forEach((v) => console.warn(`   - ${v}`));
  }

  // Log environment info for debugging

}

// Run validation
if (process.env.NODE_ENV !== "test") {
  validateEnv();
}
