import { createClient } from "./supabase/server";

export async function getAuthToken(): Promise<string | undefined> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  } catch {
    return undefined;
  }
}

export async function verifyToken(_token?: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

export async function getServerUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
