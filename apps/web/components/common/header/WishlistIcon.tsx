"use client";
import { Heart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useUserStore, useWishlistStore } from "../../../lib/store";
import { useIsHydrated } from "../../../hooks";

const WishlistIcon = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const { wishlistIds, totalWishlistItems } = useWishlistStore();
  const isHydrated = useIsHydrated();

  // Only show for authenticated users and after hydration
  if (!isAuthenticated || !authUser || !isHydrated) {
    return null;
  }

  // Use totalWishlistItems for accurate count, fallback to wishlistIds length
  const totalItems =
    totalWishlistItems > 0 ? totalWishlistItems : wishlistIds.length;

  return (
    <Link
      href="/user/wishlist"
      className="relative hover:text-accent hoverEffect"
      title="My Wishlist"
    >
      <Heart size={24} />
      <span className="absolute -right-2 -top-2 bg-accent text-white text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </Link>
  );
};

export default WishlistIcon;
