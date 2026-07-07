"use client";
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@entry/types";
import { useIsHydrated } from "../../../hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = "",
}) => {
  const isHydrated = useIsHydrated();
  const isInWishlistState = false; // Hardcode to false for now, as it's a premium feature

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    e.stopPropagation();

    toast("Premium Feature", {
      description: "Saving items to your wishlist is available in the premium version.",
      action: {
        label: "Get Source",
        onClick: () => {
          const buyLink = process.env.NEXT_PUBLIC_PURCHASE_LINK || "https://reactbd.com/products/entry";
          window.open(buyLink, "_blank");
        },
      },
      icon: <Heart className="w-4 h-4 text-accent fill-accent" />,
      duration: 5000,
    });
  };

  // if (!isAuthenticated || !isHydrated) {
  //   return null;
  // }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleWishlistToggle}
          disabled={false}
          className={`p-2 rounded-full transition-colors hover:bg-accent hover:text-white text-muted-foreground ${className}`}
        >
          <Heart
            size={20}
            fill="none"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        <p>Save to wishlist</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default WishlistButton;
