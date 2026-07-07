"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { useCartStore, useUserStore } from "../../../lib/store";
import { Product } from "@entry/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CartButtonProps {
  product: Product;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  showQuantity?: boolean;
  className?: string;
}

export default function CartButton({
  product,
  variant = "default",
  size = "md",
  showQuantity = true,
  className = "",
}: CartButtonProps) {
  const {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getCartItemQuantity,
  } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();

  const currentQuantity = getCartItemQuantity(product._id);
  const isInCart = currentQuantity > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth/signin");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to update your cart");
      return;
    }

    setLocalLoading(true);
    try {
      if (newQuantity === 0) {
        await removeFromCart(product._id);
        toast.success("Item removed from cart");
      } else {
        await updateCartItemQuantity(product._id, newQuantity);
        toast.success("Cart updated");
      }
    } catch (error) {
      console.error("Update cart error:", error);
      toast.error("Failed to update cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = localLoading;

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 px-3 text-xs";
      case "lg":
        return "h-12 px-6 text-base";
      default:
        return "h-10 px-4 text-sm";
    }
  };

  if (isInCart && showQuantity) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateQuantity(currentQuantity - 1)}
            disabled={isButtonLoading}
            className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
          >
            {isButtonLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
          </Button>
          <div className="h-8 w-10 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-xs font-medium">
            {currentQuantity}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateQuantity(currentQuantity + 1)}
            disabled={isButtonLoading}
            className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
          >
            {isButtonLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={handleAddToCart}
      disabled={isButtonLoading}
      className={`${getSizeClasses()} ${className}`}
    >
      {isButtonLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isInCart ? "In Cart" : "Add to Cart"}
        </>
      )}
    </Button>
  );
}
