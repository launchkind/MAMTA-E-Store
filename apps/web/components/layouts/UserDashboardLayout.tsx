"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  User,
  Package,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/common/Container";
import { useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { authUser, logoutUser } = useUserStore();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      href: "/user/profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      href: "/user/orders",
      label: "Orders",
      icon: <Package className="w-4 h-4" />,
    },
    {
      href: "/user/analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      href: "/user/notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      href: "/user/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-muted">
      <Container className="py-6 max-w-7xl">
        {/* Mobile / Tablet horizontal tab bar */}
        <div className="lg:hidden mb-4 overflow-x-auto">
          <div className="flex items-center gap-1 bg-card rounded-xl border border-border px-2 py-1.5 w-max min-w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop: two-pane layout */}
        <div className="hidden lg:flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 sticky top-24 space-y-2">
            {/* User mini-card */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center gap-2 mb-4 shadow-sm">
              {authUser?.avatar ? (
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30 shrink-0">
                  <Image
                    src={authUser.avatar}
                    alt={authUser.name ?? "User"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                  {authUser?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
              <div className="min-w-0 w-full">
                <p className="font-semibold text-foreground text-sm truncate">
                  {authUser?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {authUser?.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                  {authUser?.role}
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2 relative",
                      isActive
                        ? "border-l-primary bg-primary/5 text-primary"
                        : "border-l-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    )}
                  </Link>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium w-full border-l-2 border-l-transparent text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main content panel */}
          <main className="flex-1 min-w-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {children}
          </main>
        </div>

        {/* Mobile content panel */}
        <div className="lg:hidden bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {children}
        </div>
      </Container>
    </div>
  );
}
