"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Store,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface SellerStatus {
  isSeller: boolean;
  seller: {
    id: string;
    storeName: string;
    status: "pending" | "approved" | "rejected";
    logo?: string;
  } | null;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/seller",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/seller/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    name: "Analytics",
    href: "/seller/analytics",
    icon: BarChart3,
  },
  {
    name: "Store Settings",
    href: "/seller/settings",
    icon: Settings,
  },
];

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSellerInfo();
  }, []);

  const fetchSellerInfo = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data: seller } = await supabase
        .from("sellers")
        .select("id, store_name, status, logo")
        .eq("user_id", session.user.id)
        .single();

      if (seller) {
        setSellerStatus({
          isSeller: true,
          seller: {
            id: seller.id,
            storeName: seller.store_name,
            status: seller.status,
            logo: seller.logo,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch seller info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border/60 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo / Store Name */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/60">
            <Link href="/seller" className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground truncate max-w-[140px]">
                {sellerStatus?.seller?.storeName || "My Store"}
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Navigation */}
          <div className="border-t border-border/60 p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="truncate">Back to Main Store</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/60 bg-white/80 backdrop-blur-md px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator for mobile */}
          <div className="h-6 w-px bg-border/60 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">
              {navigation.find((item) => item.href === pathname)?.name ||
                "Dashboard"}
            </h1>

            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                  {sellerStatus?.seller?.storeName || "Seller"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
