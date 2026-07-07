"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();
  const { verifyAuth, isAuthenticated } = useUserStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        // Supabase handles email verification via magic link — the token in the URL
        // is processed by the Supabase auth callback. Here we just verify the session.
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          await verifyAuth();
          setTimeout(() => {
            router.push(isAuthenticated ? "/user/profile" : "/auth/signin");
          }, 3000);
        } else {
          setStatus("error");
          setMessage("Verification failed. The link may be invalid or expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    };

    verifyEmail();
  }, [token, router, verifyAuth, isAuthenticated]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-400">
              {isAuthenticated ? "Redirecting to your profile..." : "Redirecting to login page..."}
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href={isAuthenticated ? "/user/profile" : "/auth/signin"}>
                {isAuthenticated ? "Go to Profile" : "Go to Login"}
              </Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/auth/signin">Back to Login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
