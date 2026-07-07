import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isReadOnly } = usePermissions();
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out overflow-hidden shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-none bg-slate-50",
          "lg:ml-20",
          sidebarOpen && "lg:ml-72",
        )}
      >
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {isReadOnly && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                👁️ Read-Only Mode: You can view all pages and data but cannot
                make any changes
              </span>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
