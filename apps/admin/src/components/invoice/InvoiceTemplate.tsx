import React from "react";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  terms: string;
  order: Order;
}

interface InvoiceTemplateProps {
  invoiceData: InvoiceData;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoiceData }) => {
  const { order } = invoiceData;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-blue-600">Entry</h1>
          <div className="text-sm text-gray-600">
            <p>123 Business Street</p>
            <p>City, State 12345</p>
            <p>contact@entry.reactbd.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Invoice #:</span>{" "}
              {invoiceData.invoiceNumber}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(invoiceData.invoiceDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Due Date:</span>{" "}
              {new Date(invoiceData.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To and Order Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
          <div className="space-y-1">
            <p className="font-medium text-gray-800">{order.user.name}</p>
            <p className="text-gray-600">{order.user.email}</p>
            <div className="text-gray-600">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Order Details:
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Order ID:</span> {order._id}
            </p>
            <p>
              <span className="font-medium">Order Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Payment Method:</span> Credit Card
            </p>
            <div className="flex items-center gap-2">
              <span className="font-medium">Payment Status:</span>
              <Badge
                variant={
                  order.paymentStatus === "paid" ? "default" : "secondary"
                }
                className={
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-800">
                Item Description
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-800">
                Quantity
              </th>
              <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-800">
                Unit Price
              </th>
              <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-800">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: OrderItem, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 text-gray-800">
                  {item.product.name}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-gray-800">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right text-gray-800">
                  ${item.price.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right text-gray-800">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-800">$0.00</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-800">$0.00</span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between py-2 text-lg font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="text-gray-800">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Notes:</h4>
          <p className="text-gray-600 text-sm">{invoiceData.notes}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">
            Terms & Conditions:
          </h4>
          <p className="text-gray-600 text-sm">{invoiceData.terms}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p>Entry - Your trusted partner for baby products</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
