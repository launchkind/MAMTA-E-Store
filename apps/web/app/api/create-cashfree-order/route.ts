import { NextRequest, NextResponse } from "next/server";

const CASHFREE_MODE =
  process.env.CASHFREE_MODE === "production" ? "production" : "sandbox";
const CASHFREE_BASE_URL =
  CASHFREE_MODE === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

interface CheckoutItem {
  amount: number; // smallest currency unit
  currency: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const {
      items,
      successUrl,
      customerEmail,
      customerPhone,
      customerName,
      metadata,
    } = await request.json();

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error("Cashfree credentials are not configured");
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 }
      );
    }

    const totalAmount = (items as CheckoutItem[]).reduce(
      (sum, item) => sum + (item.amount / 100) * item.quantity,
      0
    );
    const currency =
      items[0]?.currency?.toUpperCase() === "USD" ? "USD" : "INR";

    const internalOrderId: string | undefined = metadata?.orderId;
    const cfOrderId = `order_${internalOrderId || Date.now()}_${Date.now()}`;

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: cfOrderId,
        order_amount: Number(totalAmount.toFixed(2)),
        order_currency: currency,
        customer_details: {
          customer_id: internalOrderId || `guest_${Date.now()}`,
          customer_email: customerEmail || "guest@example.com",
          customer_phone: customerPhone || "9999999999",
          customer_name: customerName || undefined,
        },
        order_meta: {
          return_url: successUrl,
        },
        order_note: internalOrderId ? `Order ${internalOrderId}` : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree order creation failed:", data);
      return NextResponse.json(
        { error: data.message || "Failed to create Cashfree order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
    });
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    return NextResponse.json(
      { error: "Failed to create Cashfree order" },
      { status: 500 }
    );
  }
}
