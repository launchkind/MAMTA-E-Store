import { fetchWithConfig } from "./config";

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OAuthUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  addresses: Address[];
  isOAuthUser: boolean;
  authProvider: string;
  hasSetPassword: boolean;
}

export interface UserLike {
  isOAuthUser?: boolean;
  hasSetPassword?: boolean;
}

export interface SetPasswordData {
  password: string;
}

class OAuthUserService {
  /**
   * Set password for OAuth user
   */
  async setPassword(
    password: string,
    token: string
  ): Promise<{ success: boolean; message: string; hasSetPassword?: boolean }> {
    try {
      const response = await fetchWithConfig<{
        success: boolean;
        message: string;
        data?: { hasSetPassword: boolean };
      }>("/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      return {
        success: response.success,
        message: response.message,
        hasSetPassword: response.data?.hasSetPassword,
      };
    } catch (error) {
      console.error("Set password error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to set password"
      );
    }
  }

  /**
   * Update OAuth user profile
   */
  async updateProfile(
    profileData: Partial<Pick<OAuthUser, "name" | "avatar">>,
    token: string
  ): Promise<{ success: boolean; message: string; user?: Partial<OAuthUser> }> {
    try {
      const response = await fetchWithConfig<{
        success: boolean;
        message: string;
        data?: Partial<OAuthUser>;
      }>("/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      return {
        success: response.success,
        message: response.message,
        user: response.data,
      };
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(token: string): Promise<OAuthUser> {
    try {
      const response = await fetchWithConfig<OAuthUser>("/auth/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      console.error("Get profile error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to get user profile"
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

  /**
   * Format OAuth user data for display
   */
  formatUserForDisplay(user: OAuthUser): {
    name: string;
    email: string;
    avatar: string;
    authProvider: string;
    hasSetPassword: boolean;
    accountType: string;
  } {
    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: this.getProviderDisplayName(user.authProvider),
      hasSetPassword: user.hasSetPassword,
      accountType: user.isOAuthUser ? "OAuth Account" : "Regular Account",
    };
  }
}

// Export singleton instance
export const oauthUserService = new OAuthUserService();
export default oauthUserService;
