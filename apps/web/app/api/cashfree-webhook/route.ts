import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Service-role client bypasses RLS so the webhook can update any order.
// Falls back to the anon key (which only works if RLS permits) when the
// service key isn't configured.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "",
    { auth: { persistSession: false } }
  );
}

// Cashfree signs webhooks as base64(HMAC-SHA256(secretKey, timestamp + rawBody))
function verifySignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.CASHFREE_SECRET_KEY || "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  return expected === signature;
}

// Our internal order id is embedded in Cashfree's order_id as order_<uuid>_<ts>
function extractInternalOrderId(cfOrderId: string): string | undefined {
  const match = cfOrderId.match(
    /^order_([0-9a-fA-F-]{36})_\d+$/
  );
  return match?.[1];
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") || "";
    const timestamp = request.headers.get("x-webhook-timestamp") || "";

    if (!signature || !timestamp || !verifySignature(rawBody, timestamp, signature)) {
      console.error("Cashfree webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const orderMeta = event?.data?.order;
    const paymentData = event?.data?.payment;
    const cfOrderId: string | undefined = orderMeta?.order_id;

    if (!cfOrderId) {
      console.error("Cashfree webhook: no order_id in payload");
      return NextResponse.json({ received: true });
    }

    const internalOrderId = extractInternalOrderId(cfOrderId);
    if (!internalOrderId) {
      console.error(
        "Cashfree webhook: could not extract internal order id from",
        cfOrderId
      );
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabaseAdmin();

    if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          paid_amount: paymentData?.payment_amount,
          currency: orderMeta?.order_currency,
          cashfree_order_id: cfOrderId,
          cashfree_payment_id: paymentData?.cf_payment_id
            ? String(paymentData.cf_payment_id)
            : undefined,
          cashfree_payment_method: paymentData?.payment_group,
          cashfree_bank_reference: paymentData?.bank_reference,
        })
        .eq("id", internalOrderId);
      if (error) {
        console.error(`Webhook: Error updating order ${internalOrderId}:`, error);
        // Don't return an error to Cashfree — the payment succeeded; the
        // success page's polling fallback acts as a backstop.
      }
    } else if (event.type === "PAYMENT_FAILED_WEBHOOK") {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "failed", cashfree_order_id: cfOrderId })
        .eq("id", internalOrderId);
      if (error) {
        console.error(`Webhook: Error updating order ${internalOrderId}:`, error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Cashfree webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
