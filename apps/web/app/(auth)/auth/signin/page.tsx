import { Suspense } from "react";
import SignInForm from "@/components/pages/auth/SignInForm";
import Link from "next/link";
import { SignInSkeleton } from "@/components/pages/auth/AuthSkeletons";

function SignInContent() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-foreground">Customer Login</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Registered Customers */}
          <div className="bg-muted/30 p-8 rounded-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">
              Registered Customers
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              If you have an account, sign in with your email address.
            </p>
            <SignInForm />
          </div>

          {/* Right Column: New Customers */}
          <div className="bg-muted/30 p-8 rounded-sm border border-border h-fit">
            <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">
              New Customers
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Creating an account has many benefits: check out faster, keep more
              than one address, track orders and more.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-accent text-accent-foreground font-bold text-sm uppercase hover:opacity-90 transition-opacity rounded-sm"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInContent />
    </Suspense>
  );
}
