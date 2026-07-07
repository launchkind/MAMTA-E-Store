import { getOrderById, Order } from "./orderApi";

export interface PaymentStatusResult {
  success: boolean;
  order?: Order;
  message?: string;
}

/**
 * Polls for order status updates after returning from Cashfree checkout.
 * Cashfree redirects back to the same return_url regardless of outcome, so
 * the actual result must be confirmed via the webhook-updated payment_status
 * rather than assumed from the redirect itself.
 */
export const pollOrderStatus = async (
  orderId: string,
  token: string,
  expectedStatus: string = "paid",
  maxAttempts: number = 6,
  intervalMs: number = 5000
): Promise<PaymentStatusResult> => {
  return new Promise((resolve) => {
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const order = await getOrderById(orderId, token);

        if (order && order.paymentStatus === expectedStatus) {
          resolve({
            success: true,
            order,
            message: `Payment status updated to ${expectedStatus}`,
          });
          return;
        }

        if (order && order.paymentStatus === "failed") {
          resolve({
            success: false,
            order,
            message: "Payment failed",
          });
          return;
        }

        if (attempts >= maxAttempts) {
          resolve({
            success: false,
            message: "Timeout waiting for payment status update",
          });
          return;
        }

        setTimeout(poll, intervalMs);
      } catch (error) {
        console.error("PaymentUtils: Error polling order status:", error);
        resolve({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Error polling order status",
        });
      }
    };

    poll();
  });
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (
  status: string
): { text: string; color: string } => {
  switch (status) {
    case "paid":
      return { text: "Paid", color: "text-green-600" };
    case "pending":
      return { text: "Pending", color: "text-yellow-600" };
    case "completed":
      return { text: "Completed", color: "text-blue-600" };
    case "cancelled":
      return { text: "Cancelled", color: "text-red-600" };
    default:
      return { text: status, color: "text-gray-600" };
  }
};
