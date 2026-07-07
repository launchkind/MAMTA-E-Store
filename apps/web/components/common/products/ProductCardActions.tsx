"use client";

import { Product } from "@entry/types";
import React from "react";
import { Eye, Shuffle } from "lucide-react";
import WishlistButton from "./WishlistButton";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProductCardActionsProps {
  product: Product;
}

const ActionBtn = ({
  children,
  title,
  onClick,
  className,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-white hover:border-accent hover:shadow-md transition-all duration-200 active:scale-95",
          className,
        )}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="left" className="font-medium">
      <p>{title}</p>
    </TooltipContent>
  </Tooltip>
);

const ProductCardActions = ({ product }: ProductCardActionsProps) => {
  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast("Premium Feature", {
      description: "Detailed product comparison is available in the premium version.",
      action: {
        label: "Get Source",
        onClick: () => {
          const buyLink = process.env.NEXT_PUBLIC_PURCHASE_LINK || "https://reactbd.com/products/entry";
          window.open(buyLink, "_blank");
        },
      },
      icon: <Shuffle className="w-4 h-4 text-accent" />,
      duration: 5000,
    });
  };

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
      {/* Wishlist */}
      <WishlistButton
        product={product}
        className="h-9 w-9 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-white hover:border-accent hover:shadow-md transition-all duration-200 active:scale-95"
      />

      <ActionBtn
        title="Compare"
        onClick={handleCompareClick}
      >
        <Shuffle className="h-4 w-4" />
      </ActionBtn>

      <ActionBtn title="Quick View">
        <Eye className="h-4 w-4" />
      </ActionBtn>
    </div>
  );
};

export default ProductCardActions;
