import { createOrderFromCart } from "@/lib/orderApi";
import { createCheckoutSession, redirectToCheckout, CashfreeCheckoutItem } from "@/lib/cashfree";
import { useCartStore } from "@/lib/store";

export const processDirectCheckout = async (
  authUser: any | null,
  auth_token: string | null,
  cartItemsWithQuantities: any[],
  callbacks: {
    onStart?: () => void;
    onSuccess?: () => void;
    onError?: (message: string) => void;
  }
) => {
  if (!authUser || !auth_token) {
    callbacks.onError?.("You must be logged in to place an order.");
    return;
  }

  if (!cartItemsWithQuantities || cartItemsWithQuantities.length === 0) {
    callbacks.onError?.("Your cart is empty.");
    return;
  }

  callbacks.onStart?.();

  try {
    // Resolve user address or use a dummy fallback since we are bypassing the checkout form
    let selectedAddress;
    if (authUser.addresses && authUser.addresses.length > 0) {
      // Prefer default address, otherwise use the first one
      const defaultAddress = authUser.addresses.find((addr: any) => addr.isDefault);
      selectedAddress = defaultAddress || authUser.addresses[0];
    } else {
      // Use fallback required fields for the backend if user has no address specified in profile yet
      selectedAddress = {
        street: "N/A",
        city: "N/A",
        state: "N/A",
        country: "N/A",
        postalCode: "00000",
      };
    }

    const orderItems = cartItemsWithQuantities.map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || item.product.image,
    }));

    // 1. Create the pending order in the database
    const orderResponse = await createOrderFromCart(
      auth_token,
      orderItems,
      selectedAddress
    );

    if (!orderResponse.success || !orderResponse.order) {
      console.error("❌ Order creation failed:", orderResponse);
      throw new Error(orderResponse.message || "Failed to create order");
    }

    const finalOrder = orderResponse.order;

    // 2. Format items for Cashfree
    const cashfreeItems: CashfreeCheckoutItem[] = finalOrder.items.map((item: any) => ({
      name: item.name,
      description: `Quantity: ${item.quantity}`,
      amount: Math.round(item.price * 100), // smallest currency unit
      currency: "inr",
      quantity: item.quantity,
      images: item.image ? [item.image] : undefined,
    }));

    // Calculate shipping and tax explicitly based on cart logic
    const subtotal = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const freeDeliveryThreshold = parseFloat(
      process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD || "999"
    );
    const shipping = subtotal > freeDeliveryThreshold 
      ? 0 
      : parseFloat(process.env.NEXT_PUBLIC_SHIPPING_COST || "15");
    const taxRate = parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0");
    const tax = subtotal * taxRate;

    if (shipping > 0) {
      cashfreeItems.push({
        name: "Shipping",
        description: "Standard shipping",
        amount: Math.round(shipping * 100),
        currency: "inr",
        quantity: 1,
      });
    }

    if (tax > 0) {
      cashfreeItems.push({
        name: "Tax",
        description: "Sales tax",
        amount: Math.round(tax * 100),
        currency: "inr",
        quantity: 1,
      });
    }

    // 3. Create Cashfree order
    const originUrl = typeof window !== "undefined" ? window.location.origin : "";
    const cashfreeResult = await createCheckoutSession({
      items: cashfreeItems,
      customerEmail: authUser?.email,
      customerPhone: authUser?.phone,
      customerName: authUser?.name,
      successUrl: `${originUrl}/success?orderId=${finalOrder._id}`,
      cancelUrl: `${originUrl}/user/orders/${finalOrder._id}`,
      metadata: {
        orderId: finalOrder._id,
        shippingAddress: JSON.stringify(selectedAddress),
      },
    });

    if ("paymentSessionId" in cashfreeResult && cashfreeResult.paymentSessionId) {
      // 4. Redirect to Cashfree's hosted checkout
      useCartStore.getState().clearCart(); // Clear the cart before redirect
      callbacks.onSuccess?.();
      await redirectToCheckout(cashfreeResult.paymentSessionId);
    } else if ("error" in cashfreeResult && cashfreeResult.error) {
      throw new Error(cashfreeResult.error);
    } else {
      throw new Error("Failed to get Cashfree payment session");
    }

  } catch (error) {
    console.error("❌ Direct Checkout Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment failed. Please try again.";
    callbacks.onError?.(errorMessage);
  }
};
