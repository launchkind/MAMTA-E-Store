"use client";

import React, { useEffect, useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore, useUserStore } from "@/lib/store";
import { useCartSidebarStore } from "@/lib/useCartSidebarStore";
import PriceFormatter from "@/components/common/PriceFormatter";
import Image from "next/image";
import Link from "next/link";
import { getProductUrl } from "@/lib/productHelpers";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  X,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { processDirectCheckout } from "@/lib/checkoutDirect";

// ──────────────────────────────────────────────────────────────────────────────

export default function CartSidebar() {
  const { isOpen, close } = useCartSidebarStore();
  const { isAuthenticated, auth_token } = useUserStore();
  const {
    cartItemsWithQuantities,
    removeFromCart,
    updateCartItemQuantity,
    loadCartPage,
    totalCartItems,
  } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Load cart when sidebar opens
  useEffect(() => {
    if (isOpen && auth_token) {
      setIsLoading(true);
      loadCartPage(1, 10).finally(() => setIsLoading(false));
    }
  }, [isOpen, auth_token, loadCartPage]);

  const subtotal = cartItemsWithQuantities.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const freeDeliveryThreshold = parseFloat(
    process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD || "999",
  );
  const defaultShipping = parseFloat(
    process.env.NEXT_PUBLIC_SHIPPING_COST || "15",
  );
  const shipping = subtotal > freeDeliveryThreshold ? 0 : defaultShipping;
  const taxRate = parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0");
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = async (itemId: string, qty: number) => {
    if (qty < 1) {
      await handleRemove(itemId);
      return;
    }
    try {
      await updateCartItemQuantity(itemId, qty);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await removeFromCart(itemId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to checkout");
      return;
    }

    const userProfile = useUserStore.getState().authUser;

    await processDirectCheckout(
      userProfile,
      auth_token,
      cartItemsWithQuantities,
      {
        onStart: () => setIsCheckingOut(true),
        onSuccess: () => {
          toast.success("Redirecting to secure gateway...");
          close();
          setIsCheckingOut(false);
        },
        onError: (message) => {
          toast.error(message);
          setIsCheckingOut(false);
        },
      }
    );
  };

  // ── Progress bar toward free shipping ────────────────────────────────────
  const progressPct = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);
  const remaining = freeDeliveryThreshold - subtotal;

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] p-0 flex flex-col gap-0"
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <SheetHeader className="flex-row items-center justify-between px-5 py-4 border-b">
          <SheetTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Cart
            {totalCartItems > 0 && (
              <span className="ml-1 rounded-full bg-accent text-accent-foreground text-xs font-bold w-5 h-5 flex items-center justify-center">
                {totalCartItems > 99 ? "99+" : totalCartItems}
              </span>
            )}
          </SheetTitle>
          <button
            onClick={close}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close cart"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        {/* ── Free shipping progress ──────────────────────────────────── */}
        {isAuthenticated && subtotal > 0 && (
          <div className="px-5 pt-4 pb-3 border-b bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">
              {remaining > 0 ? (
                <>
                  Add{" "}
                  <PriceFormatter
                    amount={remaining}
                    className="font-semibold text-foreground inline"
                  />{" "}
                  more for{" "}
                  <span className="font-semibold text-green-600">
                    free shipping
                  </span>
                </>
              ) : (
                <span className="text-green-600 font-semibold">
                  🎉 You've unlocked free shipping!
                </span>
              )}
            </p>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-green-500"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            /* Not logged in */
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingCart className="size-16 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Sign in to view your cart
              </p>
              <Button
                className="rounded-full px-6"
                onClick={() => {
                  close();
                  router.push("/auth/signin");
                }}
              >
                Sign In
              </Button>
            </div>
          ) : isLoading ? (
            /* Loading */
            <div className="flex items-center justify-center h-full">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : cartItemsWithQuantities.length === 0 ? (
            /* Empty cart */
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="size-10 text-muted-foreground/40" />
              </div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add items to get started
              </p>
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={() => {
                  close();
                  router.push("/shop");
                }}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            /* Cart items */
            <ul className="divide-y">
              <AnimatePresence initial={false}>
                {cartItemsWithQuantities.map((item) => (
                  <motion.li
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="flex gap-3 px-5 py-4"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={getProductUrl(item.product)}
                      onClick={close}
                      className="shrink-0"
                    >
                      <div className="w-[72px] h-[72px] rounded-lg border bg-muted overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || item.product.image}
                          alt={item.product.name}
                          width={72}
                          height={72}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={getProductUrl(item.product)}
                        onClick={close}
                        className="block text-sm font-medium line-clamp-2 hover:text-accent transition-colors"
                      >
                        {item.product.name}
                      </Link>

                      <div className="mt-1">
                        <PriceFormatter
                          amount={item.product.price}
                          className="text-sm text-muted-foreground"
                        />
                      </div>

                      {/* Qty controls + remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product._id,
                                item.quantity - 1,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium border-x py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product._id,
                                item.quantity + 1,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.product._id)}
                          disabled={removingId === item.product._id}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                          aria-label="Remove item"
                        >
                          {removingId === item.product._id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Line subtotal */}
                    <div className="shrink-0 text-right">
                      <PriceFormatter
                        amount={item.product.price * item.quantity}
                        className="text-sm font-semibold"
                      />
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* ── Footer / Totals ─────────────────────────────────────────── */}
        {isAuthenticated && cartItemsWithQuantities.length > 0 && (
          <div className="border-t bg-background px-5 pt-4 pb-6 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <PriceFormatter amount={subtotal} className="font-medium" />
            </div>

            {/* Shipping */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              {shipping === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                <PriceFormatter amount={shipping} className="font-medium" />
              )}
            </div>

            {/* Tax */}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <PriceFormatter amount={tax} className="font-medium" />
              </div>
            )}

            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <PriceFormatter amount={total} className="font-bold text-base" />
            </div>

            {/* Actions */}
            <Button
              className="w-full h-11 rounded-lg font-semibold mt-1"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="size-4 mr-2" />
              )}
              Checkout
            </Button>

            <Link href="/user/cart" onClick={close}>
              <Button
                variant="outline"
                className="w-full h-10 rounded-lg text-sm"
              >
                View Full Cart
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>

      <Dialog open={isCheckingOut}>
        <DialogContent className="sm:max-w-md [&>button]:hidden flex flex-col items-center justify-center p-8 z-[100]" aria-describedby={undefined}>
          <DialogTitle className="hidden">Processing Order</DialogTitle>
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3 text-center">Processing Your Order</h2>
          <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
            Please wait while we secure your items and prepare your secure checkout. <br/>
            <span className="font-medium text-foreground">Do not close this window.</span>
          </p>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
