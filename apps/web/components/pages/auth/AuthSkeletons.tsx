import { Skeleton } from "@/components/ui/skeleton";

export const AuthHeaderSkeleton = () => {
  return (
    <div className="w-full bg-primary h-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        <Skeleton className="h-5 w-16 bg-primary-foreground/20" />
        <Skeleton className="h-8 w-36 bg-primary-foreground/20" />
        <div className="w-20" />
      </div>
    </div>
  );
};

export const SignInSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column Skeleton */}
          <div className="bg-muted/30 p-8 rounded-sm border border-border">
            <Skeleton className="h-8 w-48 mb-4 border-b border-border pb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="pt-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="bg-muted/30 p-8 rounded-sm border border-border h-fit">
            <Skeleton className="h-8 w-40 mb-4 border-b border-border pb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </main>
    </div>
  );
};

export const SignUpSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <AuthHeaderSkeleton /> {/* Optional: if header is part of layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-10 w-80 mb-8" />
        <div className="bg-muted/30 p-8 rounded-sm border border-border">
          <Skeleton className="h-8 w-56 mb-4 border-b border-border pb-2" />
          <Skeleton className="h-4 w-full max-w-lg mb-6" />

          <div className="space-y-8">
            {/* Personal Info */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <Skeleton className="h-5 w-48" />
            </div>

            {/* Sign-in Info */}
            <div>
              <Skeleton className="h-8 w-48 mb-4 mt-8" />
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Skeleton className="h-10 w-48" />
            </div>

            <div className="pt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const ForgotPasswordSkeleton = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10 flex flex-col items-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="h-10 w-64 mb-3" />
            <Skeleton className="h-6 w-80" />
          </div>

          <div className="bg-card rounded-3xl shadow-lg border border-border p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-48 mx-auto mt-8" />
        </div>
      </main>
    </div>
  );
};
