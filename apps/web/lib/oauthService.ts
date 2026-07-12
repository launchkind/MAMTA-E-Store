import { createClient } from "./supabase/client";

export type OAuthProvider = "google" | "github";

class OAuthService {
  /**
   * Kick off a Supabase OAuth redirect flow. On success the browser
   * navigates away to the provider immediately; this only returns
   * (throwing) when Supabase rejects the request before redirecting,
   * e.g. the provider isn't enabled in the Supabase dashboard.
   */
  private async signInWithProvider(
    provider: OAuthProvider,
    redirectTo: string
  ): Promise<void> {
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("redirect", redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });

    if (error) throw error;
  }

  async signInWithGoogle(redirectTo: string = "/user/profile"): Promise<void> {
    return this.signInWithProvider("google", redirectTo);
  }

  async signInWithGitHub(redirectTo: string = "/user/profile"): Promise<void> {
    return this.signInWithProvider("github", redirectTo);
  }
}

export const oauthService = new OAuthService();
export default oauthService;
