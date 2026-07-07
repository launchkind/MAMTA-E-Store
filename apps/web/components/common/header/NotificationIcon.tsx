"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useUserStore } from "../../../lib/store";
import { useIsHydrated } from "../../../hooks";

const NotificationIcon = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const isHydrated = useIsHydrated();

  // Only show for authenticated users and after hydration
  if (!isAuthenticated || !authUser || !isHydrated) {
    return null;
  }

  return (
    <Link
      href="/user/notifications"
      className="relative hover:text-accent hoverEffect"
      title="Notifications"
    >
      <Bell size={24} />
    </Link>
  );
};

export default NotificationIcon;
