"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, RefreshCw, ShoppingBag, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/common/products/ProductCard";
import { useUserStore, useWishlistStore } from "@/lib/store";
import {
  getUserWishlist,
  getWishlistProducts,
  removeFromWishlist,
  clearWishlist,
} from "@/lib/wishlistApi";
import { mapProduct } from "@/lib/supabase";
import { Product } from "@entry/types";

const EmptyWishlist = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
      <Heart className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">
      Your wishlist is empty
    </h3>
    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
      Tap the heart icon on any product to save it here for later.
    </p>
    <Link href="/shop">
      <Button className="gap-2">
        <ShoppingBag className="w-4 h-4" />
        Browse Products
      </Button>
    </Link>
  </div>
);

const WishlistPage = () => {
  const { authUser, auth_token, isAuthenticated, verifyAuth } = useUserStore();
  const { setWishlistIds } = useWishlistStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) await verifyAuth();
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  const fetchWishlist = useCallback(async () => {
    if (!auth_token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { wishlist } = await getUserWishlist(auth_token);
      setWishlistIds(wishlist);
      if (wishlist.length === 0) {
        setProducts([]);
        return;
      }
      const res = await getWishlistProducts(wishlist, auth_token, 1, 100);
      setProducts(
        (res.products as Record<string, unknown>[]).map(
          (p) => mapProduct(p) as unknown as Product
        )
      );
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [auth_token, setWishlistIds]);

  useEffect(() => {
    if (!authLoading) fetchWishlist();
  }, [fetchWishlist, authLoading]);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    try {
      const res = await removeFromWishlist(productId, auth_token || undefined);
      setWishlistIds(res.wishlist);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await clearWishlist(auth_token || undefined);
      if (res.success) {
        setWishlistIds([]);
        setProducts([]);
        toast.success("Wishlist cleared");
      } else {
        toast.error("Failed to clear wishlist");
      }
    } catch {
      toast.error("Failed to clear wishlist");
    } finally {
      setClearing(false);
    }
  };

  if (!authLoading && (!authUser || !isAuthenticated)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
        <p className="text-sm text-muted-foreground mb-6">
          You need to sign in to view your wishlist.
        </p>
        <Link href="/auth/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            My Wishlist
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
                {products.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Products you saved for later
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchWishlist}
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {products.length > 0 && (
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              disabled={clearing}
              className="gap-2 h-9 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {loading || authLoading ? (
        <div className="p-8 flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading wishlist...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="relative group">
              <ProductCard product={product} />
              <Button
                variant="secondary"
                size="icon"
                title="Remove from wishlist"
                disabled={removing === product._id}
                onClick={() => handleRemove(product._id)}
                className="absolute top-2 left-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
