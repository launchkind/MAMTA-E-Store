"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrderStatusUpdate = exports.orderConfirmationWebhook = exports.sendOrderEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const emailService_1 = require("./emailService");
// Initialize Firebase Admin
admin.initializeApp();
//  Cloud Function to send order confirmation email
// This can be called directly when an order is placed
exports.sendOrderEmail = functions.https.onCall(async (data, context) => {
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
            throw new functions.https.HttpsError("invalid-argument", "Order details and customer email are required.");
        }
        // Send the order confirmation email
        const result = await (0, emailService_1.sendOrderConfirmationEmail)(data);
        return {
            success: true,
            messageId: result.messageId,
            message: "Order confirmation email sent successfully",
        };
    }
    catch (error) {
        console.error("Error sending order confirmation:", error);
        throw new functions.https.HttpsError("internal", "Failed to send order confirmation email", error);
    }
});
// HTTP function to handle order confirmation (for webhook integration)
exports.orderConfirmationWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const webhookSecret = (_a = functions.config().webhook) === null || _a === void 0 ? void 0 : _a.secret;
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
        const result = await (0, emailService_1.sendOrderConfirmationEmail)(order);
        res.status(200).json({
            success: true,
            messageId: result.messageId,
            message: "Order confirmation email sent successfully",
        });
    }
    catch (error) {
        console.error("Error in order confirmation webhook:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send order confirmation email",
            error: error.message,
        });
    }
});
// Background function to handle order status updates
exports.onOrderStatusUpdate = functions.https.onCall(async (data, context) => {
    try {
        // Verify the user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
        }
        const { orderId, status, userEmail, userName, order } = data;
        // Validate required data
        if (!orderId || !status || !userEmail) {
            throw new functions.https.HttpsError("invalid-argument", "Order ID, status, and user email are required.");
        }
        // Send order status update email based on status
        let emailResult;
        switch (status) {
            case "confirmed":
                emailResult = await (0, emailService_1.sendOrderConfirmationEmail)(order);
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
    }
    catch (error) {
        console.error("Error sending order status update:", error);
        throw new functions.https.HttpsError("internal", "Failed to send order status update", error);
    }
});
//# sourceMappingURL=index.js.map