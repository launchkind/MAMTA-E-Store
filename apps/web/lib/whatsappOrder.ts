import { getProductUrl } from "@/lib/productHelpers";

export interface WhatsAppOrderItem {
  name: string;
  price: number;
  quantity: number;
  product?: { _id: string; slug?: string };
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

const formatPrice = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const buildItemLine = (item: WhatsAppOrderItem, origin: string) => {
  const lines = [
    `• ${item.name}`,
    `  Qty: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`,
  ];
  if (item.product) {
    lines.push(`  Link: ${origin}${getProductUrl(item.product)}`);
  }
  return lines.join("\n");
};

export const buildWhatsAppOrderMessage = (items: WhatsAppOrderItem[]): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const lines = [
    "Hi! I'd like to place an order for:",
    "",
    ...items.map((item) => buildItemLine(item, origin)),
    "",
    `Total: ${formatPrice(total)}`,
  ];

  return lines.join("\n");
};

export const getWhatsAppOrderLink = (items: WhatsAppOrderItem[]): string => {
  const message = buildWhatsAppOrderMessage(items);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const redirectToWhatsAppOrder = (items: WhatsAppOrderItem[]) => {
  if (typeof window === "undefined") return;
  window.location.href = getWhatsAppOrderLink(items);
};
