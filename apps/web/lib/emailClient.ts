import { OrderConfirmationData } from "./types/email";

/**
 * Sends order confirmation email via Firebase Cloud Function
 * This function is called after a successful order placement
 */
export async function sendOrderConfirmationEmail(
  orderData: OrderConfirmationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const firebaseFunctionUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL;

    if (!firebaseFunctionUrl) {
      console.error("Firebase function URL not configured");
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const response = await fetch(
      `${firebaseFunctionUrl}/sendOrderConfirmationEmail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: orderData.customerEmail,
          userName: orderData.customerName,
          order: orderData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sends order status update email via Firebase Cloud Function
 */
export async function sendOrderStatusUpdateEmail(
  orderId: string,
  status: string,
  userEmail: string,
  userName?: string,
  orderData?: OrderConfirmationData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const firebaseFunctionUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL;

    if (!firebaseFunctionUrl) {
      console.error("Firebase function URL not configured");
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const response = await fetch(
      `${firebaseFunctionUrl}/sendOrderStatusUpdateEmail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
          userEmail,
          userName,
          order: orderData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
