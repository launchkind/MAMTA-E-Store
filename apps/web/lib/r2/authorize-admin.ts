import "server-only";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// R2 uploads are called from the admin SPA (a separate origin, no cookies
// shared with this app), so auth comes in as a bearer token rather than a
// session cookie. We verify the token, then check the caller's role with
// the service-role client (bypasses RLS — needed because a plain "seller"
// or "user" token shouldn't be able to read other users' role rows).
export async function authorizeAdminOrStaff(request: Request): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401, message: "Missing Authorization header" };

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await anon.auth.getUser(token);
  if (userError || !userData?.user) return { ok: false, status: 401, message: "Invalid or expired session" };

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) return { ok: false, status: 403, message: "No profile found" };
  if (profile.role !== "admin" && profile.role !== "employee" && profile.role !== "seller") {
    return { ok: false, status: 403, message: "Not authorized to upload images" };
  }

  return { ok: true };
}
