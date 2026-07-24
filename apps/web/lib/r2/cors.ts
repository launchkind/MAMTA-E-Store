import "server-only";

// Comma-separated list of origins allowed to call the R2 upload API routes
// from the browser (the admin SPA runs on its own origin, e.g. Vite dev
// server or admin.entry.reactbd.com in production).
const ALLOWED_ORIGINS = (process.env.R2_ADMIN_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}
