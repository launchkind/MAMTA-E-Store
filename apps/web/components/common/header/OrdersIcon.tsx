"use client";
import { Package } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useUserStore, useOrderStore } from "../../../lib/store";
import { useIsHydrated } from "../../../hooks";

const OrdersIcon = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const { getOrdersCount, isLoading } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const isHydrated = useIsHydrated();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only show for authenticated users and after hydration
  if (!isAuthenticated || !authUser || !isHydrated) {
    return null;
  }

  // Prevent hydration mismatch by not rendering count on server
  if (!mounted) {
    return (
      <Link
        href="/user/orders"
        className="relative hover:text-primary hoverEffect"
        title="My Orders"
      >
        <Package size={24} />
        <span className="absolute -right-2 -top-2 bg-primary text-background text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          0
        </span>
      </Link>
    );
  }

  const ordersCount = getOrdersCount();

  return (
    <Link
      href="/user/orders"
      className="relative hover:text-accent hoverEffect"
      title="My Orders"
    >
      <Package size={24} />
      {!isLoading && ordersCount > 0 && (
        <span className="absolute -right-2 -top-2 bg-accent text-white text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          {ordersCount > 99 ? "99+" : ordersCount}
        </span>
      )}
    </Link>
  );
};

export default OrdersIcon;
