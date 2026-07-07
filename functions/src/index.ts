import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  sendOrderConfirmationEmail,
  OrderConfirmationData,
} from "./emailService";

// Initialize Firebase Admin
admin.initializeApp();

//  Cloud Function to send order confirmation email
// This can be called directly when an order is placed
export const sendOrderEmail = functions.https.onCall(
  async (data: OrderConfirmationData, context) => {
    try {
      // Optional: Verify the user is authenticated
      // if (!context.auth) {
      //   throw new functions.https.HttpsError(
      //     "unauthenticated",
      //     "User must be authenticated to send order confirmation."
      //   );
      // }

      // Validate required data
      if (!data || !data.customerEmail || !data.orderId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Order details and customer email are required."
        );
      }

      // Send the order confirmation email
      const result = await sendOrderConfirmationEmail(data);

      return {
        success: true,
        messageId: result.messageId,
        message: "Order confirmation email sent successfully",
      };
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send order confirmation email",
        error
      );
    }
  }
);

// HTTP function to handle order confirmation (for webhook integration)
export const orderConfirmationWebhook = functions.https.onRequest(
  async (req: any, res: any) => {
    try {
      // CORS headers
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (req.method === "OPTIONS") {
        res.status(200).send();
        return;
      }

      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      // Verify webhook secret (optional but recommended)
      const webhookSecret = functions.config().webhook?.secret;
      if (webhookSecret && req.headers["x-webhook-secret"] !== webhookSecret) {
        res.status(401).send("Unauthorized");
        return;
      }

      const { order, userEmail, userName } = req.body;

      // Validate required data
      if (!order || !userEmail) {
        res.status(400).json({
          success: false,
          message: "Order details and user email are required",
        });
        return;
      }

      // Send the order confirmation email
      const result = await sendOrderConfirmationEmail(order);

      res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: "Order confirmation email sent successfully",
      });
    } catch (error) {
      console.error("Error in order confirmation webhook:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send order confirmation email",
        error: (error as Error).message,
      });
    }
  }
);

// Background function to handle order status updates
export const onOrderStatusUpdate = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      // Verify the user is authenticated
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated."
        );
      }

      const { orderId, status, userEmail, userName, order } = data;

      // Validate required data
      if (!orderId || !status || !userEmail) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Order ID, status, and user email are required."
        );
      }

      // Send order status update email based on status
      let emailResult;
      switch (status) {
        case "confirmed":
          emailResult = await sendOrderConfirmationEmail(order);
          break;
        case "shipped":
          // You can add shipping notification email here
          emailResult = { messageId: "shipping-notification" };
          break;
        case "delivered":
          // You can add delivery notification email here
          emailResult = { messageId: "delivery-notification" };
          break;
        default:
          return {
            success: true,
            message: "No email notification for this status",
          };
      }

      return {
        success: true,
        messageId: emailResult.messageId,
        message: `Order ${status} notification sent successfully`,
      };
    } catch (error) {
      console.error("Error sending order status update:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send order status update",
        error
      );
    }
  }
);
