export interface CashfreeCheckoutItem {
  name: string;
  description?: string;
  amount: number; // in the smallest currency unit (e.g. cents/paise)
  currency: string;
  quantity: number;
  images?: string[];
}

export interface CheckoutSessionRequest {
  items: CashfreeCheckoutItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank" | "_modal";
      }) => Promise<unknown>;
    };
  }
}

const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";
const cashfreeMode: "sandbox" | "production" =
  process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
    ? "production"
    : "sandbox";

let sdkPromise: Promise<void> | null = null;

function loadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree SDK can only be loaded in the browser"));
  }
  if (window.Cashfree) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CASHFREE_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

// Create a Cashfree order and get back a payment session id
export const createCheckoutSession = async (
  data: CheckoutSessionRequest
): Promise<{ orderId: string; paymentSessionId: string } | { error: string }> => {
  try {
    const response = await fetch("/api/create-cashfree-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || "Failed to create Cashfree order");
    }

    return { orderId: json.orderId, paymentSessionId: json.paymentSessionId };
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Redirect to Cashfree's hosted checkout using the payment session id
export const redirectToCheckout = async (paymentSessionId: string) => {
  await loadCashfreeSdk();
  if (!window.Cashfree) throw new Error("Cashfree SDK failed to load");
  const cashfree = window.Cashfree({ mode: cashfreeMode });
  await cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
};
