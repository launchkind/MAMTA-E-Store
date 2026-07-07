"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { Product } from "@entry/types";
import WishlistButton from "@/components/common/products/WishlistButton";
import ProductRating from "@/components/common/products/ProductRating";
import { toast } from "sonner";
import { useCartStore, useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const { addToCart } = useCartStore(); // Remove isLoading from here
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      router.push("/auth/signin");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, quantity);
      toast.success("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = localLoading; // Only use localLoading

  return (
    <>
      {/* Product Rating and Title */}
      <div className="flex flex-col gap-3">
        {/* Rating Stars */}
        <ProductRating
          rating={product?.averageRating || product?.rating || 0}
          numReviews={product?.numReviews}
          starSize={16}
          textClassName="text-sm"
        />

        {/* Product name with wishlist button */}
        <div className="flex items-start justify-between gap-5">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            {product?.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <WishlistButton
              product={product}
              className="border border-border/50 hover:border-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Quantity and Add to Cart */}
      <div className="pt-2">
        <p className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Quantity
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center justify-between border border-border bg-background rounded-xl px-2 h-12 w-full sm:w-36 shadow-sm">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              disabled={isButtonLoading}
              aria-label="Decrease quantity"
            >
              <Minus size={18} />
            </button>
            <span className="font-semibold text-base w-8 text-center select-none">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              disabled={isButtonLoading}
              aria-label="Increase quantity"
            >
              <Plus size={18} />
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isButtonLoading}
            size="lg"
            className="flex-1 h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isButtonLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Adding to Cart...
              </>
            ) : (
              "Add to Cart"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductActions;
