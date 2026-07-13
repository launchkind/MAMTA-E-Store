"use client";

import {
  User,
  ShoppingBag,
  UserCircle,
  Heart,
  Settings,
  LogOut,
  Package,
  Bell,
  // Store, // used only by the commented-out Seller Dashboard link below
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Separator } from "../../ui/separator";
import { useRouter } from "next/navigation";
import { useAuthSidebarStore } from "@/lib/useAuthSidebarStore";
import { createClient } from "@/lib/supabase/client";

const UserButton = () => {
  const { isAuthenticated, authUser, logoutUser } = useUserStore();
  const { openLogin, openRegister } = useAuthSidebarStore();
  const [open, setOpen] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && authUser) {
      checkSellerStatus();
    }
  }, [isAuthenticated, authUser]);

  const checkSellerStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: seller } = await supabase
        .from("sellers")
        .select("id, status")
        .eq("user_id", session.user.id)
        .single();

      if (seller) {
        setIsSeller(true);
        setSellerStatus(seller.status);
      }
    } catch (error) {
      console.error("Failed to check seller status:", error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setOpen(false);
    router.push("/");
  };

  // If not authenticated, show sidebar triggers
  if (!isAuthenticated || !authUser) {
    return (
      <div className="flex items-center gap-2 group">
        <User size={30} className="shrink-0" />
        <span className="flex flex-col">
          <p className="text-xs font-medium">Welcome</p>
          <p className="font-semibold text-sm flex items-center gap-1">
            <button
              onClick={openLogin}
              className="hover:text-accent hoverEffect"
            >
              Sign In
            </button>
            <span className="opacity-50">/</span>
            <button
              onClick={openRegister}
              className="hover:text-accent hoverEffect"
            >
              Register
            </button>
          </p>
        </span>
      </div>
    );
  }

  // If authenticated, show dropdown menu
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 group hover:text-accent hoverEffect"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={(e) => {
            // Check if mouse is moving to the popover content
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (
              !relatedTarget ||
              !relatedTarget.closest('[data-slot="popover-content"]')
            ) {
              setOpen(false);
            }
          }}
        >
          <span className="w-10 h-10 border rounded-full p-1 group-hover:border-accent hoverEffect">
            {authUser.avatar ? (
              <Image
                src={authUser.avatar}
                alt="userImage"
                width={40}
                height={40}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold">
                {authUser.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </span>
          <span className="text-left">
            <p className="text-xs font-medium">Welcome</p>
            <p className="font-semibold text-sm">
              {authUser.name || "My Profile"}
            </p>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-2"
        align="end"
        sideOffset={8}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-1">
          {/* User Info Header */}
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold text-primary">
              {authUser.name}
            </p>
            <p className="text-xs text-muted-foreground">{authUser.email}</p>
          </div>

          <Separator />

          {/* Menu Items */}
          <div className="py-1 space-y-1">
            <Link
              href="/user/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              <span>My Profile</span>
            </Link>

            {/* Seller Dashboard Link - Visible to all for upsell */}
            {/* <Link
              href="/seller"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors font-medium"
            >
              <Store className="w-4 h-4" />
              <span>Seller Dashboard</span>
            </Link> */}

            <Link
              href="/user/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <Link
              href="/user/wishlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/user/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>

            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <Link
              href="/user/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>

          <Separator />

          {/* Logout Button */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-muted rounded-md transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserButton;
