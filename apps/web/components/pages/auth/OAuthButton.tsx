"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { oauthService } from "../../../lib/oauthService";
import { toast } from "sonner";

interface OAuthButtonProps {
  provider: "google" | "github";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  redirectTo?: string;
  onError?: (error: string) => void;
}

export function OAuthButton({
  provider,
  children,
  className = "",
  disabled = false,
  redirectTo = "/user/profile",
  onError,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignIn = async () => {
    setIsLoading(true);

    try {
      // Triggers a full-page redirect to the provider on success — this
      // promise only resolves/rejects before that navigation happens.
      if (provider === "google") {
        await oauthService.signInWithGoogle(redirectTo);
      } else {
        await oauthService.signInWithGitHub(redirectTo);
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${provider}`;

      onError?.(errorMessage);
      toast.error("Sign in failed", {
        description: errorMessage,
        className: "bg-red-50 text-red-800 border-red-200",
        duration: 7000,
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full ${className}`}
      disabled={disabled || isLoading}
      onClick={handleOAuthSignIn}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Signing in...
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
