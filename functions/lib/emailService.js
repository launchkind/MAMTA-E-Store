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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const functions = __importStar(require("firebase-functions"));
// Email configuration
const createTransporter = () => {
    var _a, _b, _c, _d;
    const config = functions.config();
    return nodemailer_1.default.createTransport({
        host: ((_a = config.email) === null || _a === void 0 ? void 0 : _a.smtp_host) || "smtp.gmail.com",
        port: parseInt(((_b = config.email) === null || _b === void 0 ? void 0 : _b.smtp_port) || "587"),
        secure: false,
        auth: {
            user: (_c = config.email) === null || _c === void 0 ? void 0 : _c.smtp_user,
            pass: (_d = config.email) === null || _d === void 0 ? void 0 : _d.smtp_pass,
        },
    });
};
// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (userName, order) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const itemsHTML = order.items
        .map((item) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; vertical-align: top;">
        <div style="display: flex; align-items: center;">
          ${item.image
        ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px; border: 1px solid #e5e7eb;">`
        : `<div style="width: 60px; height: 60px; background-color: #f3f4f6; border-radius: 8px; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">No Image</div>`}
          <div>
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; text-align: right; vertical-align: top;">
        <div style="font-weight: 600; color: #111827;">${formatCurrency(item.price)}</div>
        <div style="color: #6b7280; font-size: 14px;">each</div>
      </td>
      <td style="padding: 12px 0; text-align: right; vertical-align: top;">
        <div style="font-weight: 600; color: #111827;">${formatCurrency(item.price * item.quantity)}</div>
      </td>
    </tr>
  `)
        .join("");
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - BabyMart</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
            🍼 BabyMart
          </h1>
          <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px;">
            Your trusted baby essentials store
          </p>
        </div>

        <!-- Order Confirmation -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-weight: 600; margin-bottom: 16px;">
              ✅ Order Confirmed
            </div>
            <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
              Thank you for your order, ${userName}!
            </h2>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">
              We've received your order and are preparing it for shipment.
            </p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
              Order Details
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
              <div>
                <span style="color: #6b7280;">Order Number:</span>
                <div style="font-weight: 600; color: #111827; margin-top: 4px;">
                  #${order.orderId}
                </div>
              </div>
              <div>
                <span style="color: #6b7280;">Order Date:</span>
                <div style="font-weight: 600; color: #111827; margin-top: 4px;">
                  ${formatDate(order.orderDate)}
                </div>
              </div>
              <div>
                <span style="color: #6b7280;">Payment Status:</span>
                <div style="font-weight: 600; color: #10b981; margin-top: 4px; text-transform: capitalize;">
                  ${"Paid"}
                </div>
              </div>
              <div>
                <span style="color: #6b7280;">Total Amount:</span>
                <div style="font-weight: 600; color: #111827; margin-top: 4px; font-size: 16px;">
                  ${formatCurrency(order.total)}
                </div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
              Items Ordered
            </h3>
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                      Product
                    </th>
                    <th style="padding: 16px; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                      Price
                    </th>
                    <th style="padding: 16px; text-align: right; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffffff;">
                  ${itemsHTML}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Shipping Address -->
          ${order.shippingAddress
        ? `
          <div style="margin-bottom: 30px;">
            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
              Shipping Address
            </h3>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
              <div style="color: #374151; line-height: 1.6;">
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </div>
            </div>
          </div>
          `
        : ""}

          <!-- Order Summary -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
              Order Summary
            </h3>
            <div style="space-y: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Subtotal:</span>
                <span style="color: #111827; font-weight: 500;">${formatCurrency(order.total)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Shipping:</span>
                <span style="color: #10b981; font-weight: 500;">FREE</span>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #111827; font-weight: 700; font-size: 18px;">Total:</span>
                  <span style="color: #111827; font-weight: 700; font-size: 18px;">${formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- What's Next -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">
              What's Next?
            </h3>
            <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <div style="color: #1e40af; font-size: 14px; line-height: 1.6;">
                📦 <strong>Processing:</strong> We're preparing your order<br>
                🚚 <strong>Shipping:</strong> You'll receive tracking info via email<br>
                📱 <strong>Updates:</strong> We'll keep you informed every step of the way
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_URL || "https://babymart.com"}/orders/${order.orderId}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Track Your Order
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
            Questions about your order? Contact us at 
            <a href="mailto:support@babymart.com" style="color: #667eea; text-decoration: none;">support@babymart.com</a>
          </p>
          <div style="margin-bottom: 16px;">
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px;">Facebook</a>
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px;">Instagram</a>
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 12px;">Twitter</a>
          </div>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            © 2025 BabyMart. All rights reserved.<br>
            This email was sent to confirm your order. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
// Send order confirmation email
const sendOrderConfirmationEmail = async (orderData) => {
    var _a, _b;
    try {
        const transporter = createTransporter();
        const config = functions.config();
        const htmlContent = generateOrderConfirmationHTML(orderData.customerName, orderData);
        const mailOptions = {
            from: `"BabyMart" <${((_a = config.email) === null || _a === void 0 ? void 0 : _a.from) || ((_b = config.email) === null || _b === void 0 ? void 0 : _b.smtp_user)}>`,
            to: orderData.customerEmail,
            subject: `Order Confirmation #${orderData.orderId} - BabyMart`,
            html: htmlContent,
            text: `
        Hi ${orderData.customerName},

        Thank you for your order! Your order #${orderData.orderId} has been confirmed.

        Order Details:
        - Order Number: #${orderData.orderId}
        - Total Amount: $${orderData.total}
        - Items: ${orderData.items
                .map((item) => `${item.name} (Qty: ${item.quantity})`)
                .join(", ")}

        We're preparing your order for shipment and will send you tracking information once it's on its way.

        Thanks for choosing BabyMart!

        If you have any questions, please contact us at support@babymart.com
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent:", info.messageId);
        return {
            success: true,
            messageId: info.messageId,
        };
    }
    catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error("Failed to send order confirmation email");
    }
};
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
//# sourceMappingURL=emailService.js.map