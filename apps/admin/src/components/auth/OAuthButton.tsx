import { useState } from "react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface OAuthButtonProps {
  provider: "google" | "github";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function OAuthButton({
  provider,
  children,
  className = "",
  disabled = false,
  onSuccess,
  onError,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, loginWithGitHub } = useAuthStore();
  const { toast } = useToast();

  const handleOAuthSignIn = async () => {
    setIsLoading(true);
    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else {
        await loginWithGitHub();
      }
      // Supabase redirects to /auth/callback — onSuccess fires after redirect
      onSuccess?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : `Failed to sign in with ${provider}`;
      onError?.(msg);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: msg,
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
