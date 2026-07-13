"use client";
import { Button } from "../../../components/ui/button";
import { useCartStore, useUserStore } from "../../../lib/store";
import { cn } from "../../../lib/utils";
import { Product } from "@entry/types";
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addToCart, updateCartItemQuantity, getCartItemQuantity } =
    useCartStore();
  const { isAuthenticated } = useUserStore();
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();

  const defaultVariant =
    product.variants && product.variants.length > 0
      ? (product.variants.find((v) => v.isDefault) ?? product.variants[0])
      : undefined;
  const cartQuantity = getCartItemQuantity(product._id, defaultVariant?._id);
  const isInCart = cartQuantity > 0;
  const availableStock = defaultVariant?.stock ?? product?.stock ?? 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      router.push("/auth/signin");
      return;
    }

    if (availableStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (cartQuantity >= availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, 1, defaultVariant?._id);
      toast.success("Added to cart successfully!", {
        description: `Name: ${product?.name}`,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    e: React.MouseEvent,
    newQuantity: number
  ) => {
    e.preventDefault();

    if (newQuantity < 1) return;

    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    setLocalLoading(true);
    try {
      await updateCartItemQuantity(product._id, newQuantity, defaultVariant?._id);
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error("Failed to update quantity");
    } finally {
      setLocalLoading(false);
    }
  };

  // If product is in cart, show quantity controls
  // if (isInCart) {
  //   return (
  //     <div
  //       className={cn(
  //         "flex items-center justify-between gap-2 mt-1",
  //         className
  //       )}
  //     >
  //       <div className="flex items-center gap-1 border rounded-full overflow-hidden">
  //         <Button
  //           onClick={(e) => handleUpdateQuantity(e, cartQuantity - 1)}
  //           disabled={localLoading || cartQuantity <= 1}
  //           variant="ghost"
  //           size="sm"
  //           className="h-8 w-8 rounded-none p-0 hover:bg-primary hover:text-primary"
  //         >
  //           <Minus className="w-3 h-3" />
  //         </Button>

  //         <span className="px-3 text-sm font-medium min-w-8 text-center">
  //           {cartQuantity}
  //         </span>

  //         <Button
  //           onClick={(e) => handleUpdateQuantity(e, cartQuantity + 1)}
  //           disabled={localLoading || cartQuantity >= availableStock}
  //           variant="ghost"
  //           size="sm"
  //           className="h-8 w-8 rounded-none p-0 hover:bg-primary hover:text-primary"
  //         >
  //           <Plus className="w-3 h-3" />
  //         </Button>
  //       </div>

  //       <span className="text-xs text-muted-foreground">In Cart</span>
  //     </div>
  //   );
  // }

  // Default "Add to Cart" button
  return (
    <Button
      onClick={handleAddToCart}
      variant="outline"
      disabled={localLoading || availableStock === 0}
      className={cn("w-full", className)}

    >
      {localLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Adding...
        </>
      ) : availableStock === 0 ? (
        "Out of Stock"
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to cart
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;
