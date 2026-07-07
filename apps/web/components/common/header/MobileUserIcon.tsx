"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  User,
  UserCircle,
  Package,
  Heart,
  ShoppingBag,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthSidebarStore } from "@/lib/useAuthSidebarStore";
import { useUserStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MobileUserIcon = () => {
  const { isAuthenticated, authUser, logoutUser } = useUserStore();
  const { openLogin } = useAuthSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Not mounted yet or not authenticated → plain User icon that opens login
  if (!mounted || !isAuthenticated || !authUser) {
    return (
      <button
        onClick={openLogin}
        className="hover:text-accent hoverEffect"
        aria-label="Sign in"
      >
        <User size={24} />
      </button>
    );
  }

  // Authenticated → avatar + dropdown menu
  const handleLogout = () => {
    logoutUser();
    setIsPopoverOpen(false);
    router.push("/");
  };

  return (
    <div ref={popoverRef} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setIsPopoverOpen((o) => !o)}
        aria-label="User menu"
        className="w-8 h-8 border-2 border-primary-foreground/40 hover:border-accent rounded-full overflow-hidden flex items-center justify-center hoverEffect"
      >
        {authUser.avatar ? (
          <Image
            src={authUser.avatar}
            alt={authUser.name ?? "User"}
            className="w-full h-full object-cover rounded-full"
            width={32}
            height={32}
          />
        ) : (
          <span className="w-full h-full rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center text-sm font-bold">
            {authUser.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isPopoverOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card text-card-foreground rounded-xl shadow-2xl border border-border z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">
              {authUser.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {authUser.email}
            </p>
          </div>

          {/* Links */}
          <nav className="py-1">
            {(
              [
                {
                  href: "/user/profile",
                  icon: UserCircle,
                  label: "My Profile",
                },
                { href: "/user/orders", icon: Package, label: "Orders" },
                { href: "/user/wishlist", icon: Heart, label: "Wishlist" },
                {
                  href: "/shop",
                  icon: ShoppingBag,
                  label: "Continue Shopping",
                },
                { href: "/user/settings", icon: Settings, label: "Settings" },
              ] as const
            ).map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsPopoverOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileUserIcon;
