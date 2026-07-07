"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserDashboardLayout from "@/components/layouts/UserDashboardLayout";
import { useUserStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, authUser, auth_token, verifyAuth } = useUserStore();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  // Verify authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) {
        await verifyAuth();
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  useEffect(() => {
    // Only redirect after auth check is complete
    if (!authLoading && (!isAuthenticated || !authUser)) {
      router.replace("/auth/signin");
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !authUser) {
    return null;
  }

  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
