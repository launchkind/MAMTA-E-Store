import SignUpForm from "@/components/pages/auth/SignUpForm";

import Link from "next/link";
import { Suspense } from "react";
import { SignUpSkeleton } from "@/components/pages/auth/AuthSkeletons";

const SignUpContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Create New Customer Account
          </h1>
        </div>

        <div className="mt-8">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-accent hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
          <SignUpForm />
        </div>
      </main>
    </div>
  );
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpContent />
    </Suspense>
  );
}
