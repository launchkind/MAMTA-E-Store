"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useCartStore, useUserStore } from "@/lib/store";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import PriceFormatter from "@/components/common/PriceFormatter";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { processDirectCheckout } from "@/lib/checkoutDirect";
import { Checkbox } from "@/components/ui/checkbox";
import { getProductUrl } from "@/lib/productHelpers";

const CartPageClient = () => {
  const {
    cartItemsWithQuantities,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadCartPage,
    currentPage,
    hasMoreCart,
    totalCartItems,
  } = useCartStore();
  const { auth_token } = useUserStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const router = useRouter();

  // Initialize cart with pagination
  const initializeCart = useCallback(async () => {
    if (auth_token) {
      try {
        setIsLoading(true);
        setHasInitializedSelection(false); // Reset on cart reload
        await loadCartPage(1, 10);
      } catch (error) {
        console.error("Failed to load cart:", error);
        toast.error("Failed to load cart");
      }
    }
    setIsLoading(false);
  }, [auth_token, loadCartPage]);

  // Select items based on context (Buy Now or normal cart view)
  useEffect(() => {
    if (cartItemsWithQuantities.length > 0 && !hasInitializedSelection) {
      // Check if coming from "Buy Now" flow
      const buyNowProductId = sessionStorage.getItem("buyNowProductId");

      if (buyNowProductId) {
        // Only select the Buy Now product
        setSelectedItems(new Set([buyNowProductId]));
        // Clear the flag after using it
        sessionStorage.removeItem("buyNowProductId");
      } else {
        // Select all items by default for normal cart view
        const allItemIds = new Set(
          cartItemsWithQuantities.map((item) => item.product._id),
        );
        setSelectedItems(allItemIds);
      }
      setHasInitializedSelection(true);
    }
  }, [cartItemsWithQuantities, hasInitializedSelection]);

  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Infinite scroll effect
  const loadMoreItems = useCallback(async () => {
    if (!auth_token || loadingMore || !hasMoreCart) return;

    try {
      setLoadingMore(true);
      await loadCartPage(currentPage + 1, 10);
    } catch (error) {
      console.error("Failed to load more items:", error);
      toast.error("Failed to load more items");
    } finally {
      setLoadingMore(false);
    }
  }, [auth_token, loadingMore, hasMoreCart, loadCartPage, currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !loadingMore &&
        hasMoreCart
      ) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreItems, loadingMore, hasMoreCart]);

  const calculateSubtotal = () => {
    return cartItemsWithQuantities
      .filter((item) => selectedItems.has(item.product._id))
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedItems.size === cartItemsWithQuantities.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(cartItemsWithQuantities.map((item) => item.product._id)),
      );
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const freeDeliveryThreshold = parseFloat(
      process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD || "999",
    );
    const defaultShipping = parseFloat(
      process.env.NEXT_PUBLIC_SHIPPING_COST || "15",
    );
    const shipping = subtotal > freeDeliveryThreshold ? 0 : defaultShipping; // Free shipping over threshold
    const taxRate = parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0");
    const tax = subtotal * taxRate;
    return subtotal + shipping + tax;
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const handleClearCart = () => {
    setShowClearDialog(true);
  };

  const confirmClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to checkout");
      return;
    }

    try {
      if (!auth_token) {
        toast.error("You must be logged in to place an order.");
        return;
      }

      // Filter cart items to only include selected ones
      const selectedCartItems = cartItemsWithQuantities.filter((item) =>
        selectedItems.has(item.product._id)
      );

      const userProfile = useUserStore.getState().authUser;

      await processDirectCheckout(
        userProfile,
        auth_token,
        selectedCartItems,
        {
          onStart: () => setIsCheckingOut(true),
          onSuccess: () => {
            toast.success("Redirecting to secure gateway...");
            setIsCheckingOut(false);
          },
          onError: (message) => {
            toast.error(message);
            setIsCheckingOut(false);
          },
        }
      );
    } catch (error) {
      console.error("Error creating direct checkout:", error);
      toast.error("Failed to process checkout. Please try again.");
      setIsCheckingOut(false);
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <Container className="py-8">
        {/* Breadcrumb */}
        <PageBreadcrumb
          items={[{ label: "User", href: "/user/profile" }]}
          currentPage="Cart"
          showSocialShare={false}
        />

        {/* Title Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-24 mb-2" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Cart Items Section Skeleton */}
          <div className="xl:col-span-3">
            <div className="bg-background rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Table Header Skeleton - Desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
                <div className="col-span-6">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>

              {/* Cart Items Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                  >
                    {/* Mobile Layout Skeleton */}
                    <div className="block lg:hidden">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-8" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout Skeleton */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                      <div className="lg:col-span-6 flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="lg:col-span-2 text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </div>
                      <div className="lg:col-span-2 flex justify-center">
                        <Skeleton className="h-10 w-32" />
                      </div>
                      <div className="lg:col-span-2 text-center">
                        <Skeleton className="h-5 w-20 mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <Skeleton className="h-12 w-full sm:w-48" />
                <Skeleton className="h-12 w-full sm:w-32" />
              </div>
            </div>
          </div>

          {/* Cart Totals Skeleton */}
          <div className="xl:col-span-1">
            <div className="bg-background rounded-2xl p-6 sticky top-4 border border-gray-100 shadow-sm">
              <Skeleton className="h-6 w-24 mb-6" />

              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}

                <div className="my-4">
                  <Skeleton className="h-px w-full" />
                </div>

                <div className="flex justify-between items-center py-2">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              <Skeleton className="h-12 w-full mt-6" />

              <div className="mt-4 text-center">
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (cartItemsWithQuantities.length === 0) {
    return (
      <Container className="py-16">
        <div className="bg-background rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
              <ShoppingCart className="w-16 h-16 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is currently empty.
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              You may check out all the available products and buy some in the
              shop.
            </p>
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium"
              >
                Return to shop
              </Button>
            </Link>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  High Quality Selection
                </h3>
                <p className="text-sm text-gray-600">
                  Total product quality control for peace of mind
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowLeft className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Affordable Prices
                </h3>
                <p className="text-sm text-gray-600">
                  Factory direct prices for maximum savings
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Express Shipping
                </h3>
                <p className="text-sm text-gray-600">
                  Fast, reliable delivery from global warehouse
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[{ label: "User", href: "/user/profile" }]}
        currentPage="Cart"
        showSocialShare={false}
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cart</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Cart Items Section */}
        <div className="xl:col-span-3">
          <div className="bg-background rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Cart Table Header - Only visible on larger screens */}
            <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
              <div className="col-span-1 flex items-center justify-center">
                <Checkbox
                  checked={
                    selectedItems.size === cartItemsWithQuantities.length &&
                    cartItemsWithQuantities.length > 0
                  }
                  onCheckedChange={handleToggleAll}
                  className="h-5 w-5"
                />
              </div>
              <div className="col-span-5 text-sm font-medium text-gray-900 uppercase tracking-wide">
                Product
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Price
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Quantity
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Subtotal
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItemsWithQuantities.map((cartItem) => (
                <div
                  key={cartItem.product._id}
                  className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                >
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <Checkbox
                          checked={selectedItems.has(cartItem.product._id)}
                          onCheckedChange={() =>
                            handleToggleItem(cartItem.product._id)
                          }
                          className="h-5 w-5"
                        />
                      </div>
                      {/* Product Image */}
                      <Link href={getProductUrl(cartItem.product)}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer">
                          {cartItem.product.images?.[0] ||
                          cartItem.product.image ? (
                            <Image
                              src={
                                cartItem.product.images?.[0] ||
                                cartItem.product.image
                              }
                              alt={cartItem.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={getProductUrl(cartItem.product)}>
                          <h3 className="font-medium text-gray-900 mb-2 text-sm leading-5 hover:text-blue-600 transition-colors cursor-pointer">
                            {cartItem.product.name}
                          </h3>
                        </Link>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Price
                            </span>
                            <PriceFormatter
                              amount={cartItem.product.price}
                              className="text-sm font-medium text-gray-900"
                            />
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.product._id,
                                  cartItem.quantity - 1,
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <div className="h-8 w-10 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-xs font-medium">
                              {cartItem.quantity}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.product._id,
                                  cartItem.quantity + 1,
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Subtotal and Remove */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Subtotal
                            </span>
                            <PriceFormatter
                              amount={
                                cartItem.product.price * cartItem.quantity
                              }
                              className="text-sm font-semibold text-gray-900"
                            />
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveItem(cartItem.product._id)
                            }
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 h-auto text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                    {/* Checkbox */}
                    <div className="lg:col-span-1 flex items-center justify-center">
                      <Checkbox
                        checked={selectedItems.has(cartItem.product._id)}
                        onCheckedChange={() =>
                          handleToggleItem(cartItem.product._id)
                        }
                        className="h-5 w-5"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="lg:col-span-5 flex items-center gap-4">
                      <Link href={getProductUrl(cartItem.product)}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer">
                          {cartItem.product.images?.[0] ||
                          cartItem.product.image ? (
                            <Image
                              src={
                                cartItem.product.images?.[0] ||
                                cartItem.product.image
                              }
                              alt={cartItem.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={getProductUrl(cartItem.product)}>
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                            {cartItem.product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveItem(cartItem.product._id)
                            }
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-auto text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-2 text-center">
                      <PriceFormatter
                        amount={cartItem.product.price}
                        className="text-base font-medium text-gray-900"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.product._id,
                              cartItem.quantity - 1,
                            )
                          }
                          className="h-10 w-10 p-0 hover:bg-gray-50 border-0 rounded-none"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="h-10 w-12 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-sm font-medium">
                          {cartItem.quantity}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.product._id,
                              cartItem.quantity + 1,
                            )
                          }
                          className="h-10 w-10 p-0 hover:bg-gray-50 border-0 rounded-none"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="lg:col-span-2 text-center">
                      <PriceFormatter
                        amount={cartItem.product.price * cartItem.quantity}
                        className="text-base font-semibold text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 size={20} className="animate-spin" />
                  Loading more items...
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMoreCart && cartItemsWithQuantities.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                You&apos;ve loaded all {totalCartItems} items in your cart
              </div>
            )}

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
              <Link href="/shop" className="flex-1 sm:flex-initial">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleClearCart}
                className="w-full sm:w-auto rounded-full px-8 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Cart Totals */}
        <div className="xl:col-span-1">
          <div className="bg-background rounded-2xl p-6 sticky top-30 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Cart totals
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <PriceFormatter
                  amount={calculateSubtotal()}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-base font-medium">
                  {calculateSubtotal() >
                  parseFloat(
                    process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD || "999",
                  ) ? (
                    <span className="text-green-600">Free shipping</span>
                  ) : (
                    <PriceFormatter
                      amount={parseFloat(
                        process.env.NEXT_PUBLIC_SHIPPING_COST || "15",
                      )}
                      className="text-base font-medium text-gray-900"
                    />
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tax</span>
                <PriceFormatter
                  amount={
                    calculateSubtotal() *
                    parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0")
                  }
                  className="text-base font-medium text-gray-900"
                />
              </div>

              {calculateSubtotal() >
                parseFloat(
                  process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD || "999",
                ) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <PriceFormatter
                  amount={calculateTotal()}
                  className="text-xl font-bold text-gray-900"
                />
              </div>
            </div>

            {selectedItems.size > 0 &&
              selectedItems.size < cartItemsWithQuantities.length && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm font-medium">
                    {selectedItems.size} of {cartItemsWithQuantities.length}{" "}
                    items selected
                  </p>
                </div>
              )}

            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut || selectedItems.size === 0}
              className="w-full mt-6 bg-black hover:bg-gray-800 text-white rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Order...
                </>
              ) : selectedItems.size === 0 ? (
                "Select items to checkout"
              ) : (
                `Proceed to checkout (${selectedItems.size} ${selectedItems.size === 1 ? "item" : "items"})`
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure checkout • SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all items from your cart? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearCart}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Processing Order Modal */}
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
    </Container>
  );
};

export default CartPageClient;
