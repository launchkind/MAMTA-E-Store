import { createClient } from "./supabase/client";

export interface UserLike {
  isOAuthUser?: boolean;
  hasSetPassword?: boolean;
}

class OAuthUserService {
  /**
   * Set a password for an OAuth user so they can also sign in with
   * email/password going forward.
   */
  async setPassword(
    password: string
  ): Promise<{ success: boolean; message: string; hasSetPassword?: boolean }> {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;

      const { error: dbError } = await supabase
        .from("users")
        .update({ has_set_password: true })
        .eq("id", session.user.id);
      if (dbError) throw dbError;

      return {
        success: true,
        message: "Password set successfully",
        hasSetPassword: true,
      };
    } catch (error) {
      console.error("Set password error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to set password"
      );
    }
  }

  /**
   * Check if current user is OAuth user
   */
  isOAuthUser(user: UserLike | null | undefined): boolean {
    return user?.isOAuthUser === true;
  }

  /**
   * Get OAuth provider display name
   */
  getProviderDisplayName(provider: string): string {
    switch (provider?.toLowerCase()) {
      case "google":
        return "Google";
      case "github":
        return "GitHub";
      default:
        return "Unknown Provider";
    }
  }

  /**
   * Check if OAuth user has set a password
   */
  hasSetPassword(user: UserLike | null | undefined): boolean {
    return user?.hasSetPassword === true;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const oauthUserService = new OAuthUserService();
export default oauthUserService;
