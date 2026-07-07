import {
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  githubProvider,
  isFirebaseConfigured,
} from "./firebase";
import { toast } from "sonner";

export interface OAuthUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  providerData: {
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }[];
}

export interface BackendUserData {
  name: string;
  email: string;
  avatar?: string;
  authProvider: string;
  authUid: string;
  isOAuthUser: boolean;
}

class OAuthService {
  /**
   * Check if OAuth is available
   */
  private isOAuthAvailable(): boolean {
    if (!isFirebaseConfigured()) {
      toast.error("OAuth not configured", {
        description: "Social sign-in is not available at the moment",
        className: "bg-yellow-50 text-yellow-800 border-yellow-200",
      });
      return false;
    }
    return true;
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<OAuthUserData | null> {
    if (!this.isOAuthAvailable() || !auth || !googleProvider) {
      return null;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      return this.extractUserData(user, "google.com");
    } catch (error) {
      this.handleAuthError(error as AuthError, "Google");
      return null;
    }
  }

  /**
   * Sign in with GitHub OAuth
   */
  async signInWithGitHub(): Promise<OAuthUserData | null> {
    if (!this.isOAuthAvailable() || !auth || !githubProvider) {
      return null;
    }

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;

      return this.extractUserData(user, "github.com");
    } catch (error) {
      this.handleAuthError(error as AuthError, "GitHub");
      return null;
    }
  }

  /**
   * Sign out from Firebase
   */
  async signOut(): Promise<boolean> {
    if (!auth) {
      return true; // If auth is not configured, consider it a successful sign out
    }

    try {
      await firebaseSignOut(auth);
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Sign out failed", {
        description: "An error occurred while signing out",
        className: "bg-red-50 text-red-800 border-red-200",
      });
      return false;
    }
  }

  /**
   * Extract user data from Firebase user object
   */
  private extractUserData(
    user: FirebaseUser,
    expectedProviderId: string,
  ): OAuthUserData {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: expectedProviderId,
      providerData: user.providerData.map((provider) => ({
        providerId: provider.providerId,
        uid: provider.uid,
        displayName: provider.displayName,
        email: provider.email,
        photoURL: provider.photoURL,
      })),
    };
  }

  /**
   * Convert OAuth user data to backend format
   */
  convertToBackendUser(oauthUser: OAuthUserData): BackendUserData {
    // Extract provider name from providerId
    const providerName = oauthUser.providerId.split(".")[0]; // 'google' or 'github'

    return {
      name:
        oauthUser.displayName ||
        oauthUser.email?.split("@")[0] ||
        "Unknown User",
      email: oauthUser.email || "",
      // Only include avatar if photoURL exists and is not empty
      avatar:
        oauthUser.photoURL && oauthUser.photoURL.trim() !== ""
          ? oauthUser.photoURL
          : undefined,
      authProvider: providerName,
      authUid: oauthUser.uid,
      isOAuthUser: true,
    };
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: AuthError, provider: string): void {
    console.error(`${provider} authentication error:`, error);

    let message = `Failed to sign in with ${provider}`;

    switch (error.code) {
      case "auth/popup-closed-by-user":
        message = "Sign in was cancelled";
        break;
      case "auth/popup-blocked":
        message =
          "Popup was blocked by browser. Please allow popups and try again";
        break;
      case "auth/account-exists-with-different-credential":
        message =
          "An account already exists with the same email address but different sign-in credentials";
        break;
      case "auth/auth-domain-config-required":
        message = "Authentication configuration error. Please contact support";
        break;
      case "auth/cancelled-popup-request":
        message = "Sign in was cancelled";
        break;
      case "auth/operation-not-allowed":
        message = `${provider} authentication is not enabled. Please contact support`;
        break;
      case "auth/unauthorized-domain":
        message = "This domain is not authorized for authentication";
        break;
      case "auth/user-disabled":
        message = "This user account has been disabled";
        break;
      default:
        message = `An unexpected error occurred during ${provider} sign in`;
    }

    toast.error(`${provider} Sign In Failed`, {
      description: message,
      className: "bg-red-50 text-red-800 border-red-200",
      duration: 8000,
    });
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    if (!auth) {
      return null;
    }
    return auth.currentUser;
  }

  /**
   * Check if user is signed in with OAuth
   */
  isOAuthUser(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return user.providerData.some(
      (provider) =>
        provider.providerId === "google.com" ||
        provider.providerId === "github.com",
    );
  }

  /**
   * Get OAuth provider for current user
   */
  getOAuthProvider(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const oauthProvider = user.providerData.find(
      (provider) =>
        provider.providerId === "google.com" ||
        provider.providerId === "github.com",
    );

    return oauthProvider ? oauthProvider.providerId.split(".")[0] : null;
  }
}

// Export singleton instance
export const oauthService = new OAuthService();
export default oauthService;
