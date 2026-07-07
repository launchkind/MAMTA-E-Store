"use client";
import { useState, useEffect } from "react";
import { useCartStore, useUserStore } from "../../../lib/store";
import { useCartSidebarStore } from "@/lib/useCartSidebarStore";
import { ShoppingBag } from "lucide-react";
import React from "react";

const CartIcon = () => {
  const { cartItemsWithQuantities, totalCartItems } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const { open } = useCartSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems =
    !mounted || !isAuthenticated
      ? 0
      : totalCartItems > 0
        ? totalCartItems
        : cartItemsWithQuantities.length;

  return (
    <button
      onClick={open}
      aria-label="Open cart"
      className="relative hover:text-accent hoverEffect"
    >
      <ShoppingBag />
      <span className="absolute -right-2 -top-2 bg-accent text-white text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </button>
  );
};

export default CartIcon;
