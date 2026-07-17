"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrderById, Order } from "@/lib/orderApi";
import { useUserStore } from "@/lib/store";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p);

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  address_confirmed: { label: "Address Confirmed", bg: "bg-blue-100", text: "text-blue-700", icon: <MapPin className="w-3 h-3" /> },
  confirmed: { label: "Confirmed", bg: "bg-blue-100", text: "text-blue-700", icon: <CheckCircle className="w-3 h-3" /> },
  processing: { label: "Processing", bg: "bg-purple-100", text: "text-purple-700", icon: <RefreshCw className="w-3 h-3" /> },
  packed: { label: "Packed", bg: "bg-indigo-100", text: "text-indigo-700", icon: <Package className="w-3 h-3" /> },
  shipped: { label: "Shipped", bg: "bg-cyan-100", text: "text-cyan-700", icon: <Truck className="w-3 h-3" /> },
  delivering: { label: "Out for Delivery", bg: "bg-cyan-100", text: "text-cyan-700", icon: <Truck className="w-3 h-3" /> },
  delivered: { label: "Delivered", bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
};

const PROGRESS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const stepIndex = (status: Order["status"]) => {
  switch (status) {
    case "pending":
    case "address_confirmed":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
    case "packed":
      return 2;
    case "shipped":
    case "delivering":
      return 3;
    case "delivered":
    case "completed":
      return 4;
    default:
      return -1; // cancelled
  }
};

const OrderDetailPage = () => {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const { auth_token, verifyAuth, authUser } = useUserStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      if (auth_token && !authUser) await verifyAuth();
      const data = await getOrderById(orderId, auth_token || undefined);
      setOrder(data);
    } finally {
      setLoading(false);
    }
  }, [orderId, auth_token, authUser, verifyAuth]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Order not found</h3>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn&apos;t find this order. It may have been removed, or you may
          not have access to it.
        </p>
        <Link href="/user/orders">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const currentStep = stepIndex(order.status);
  const subtotal = order.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const extras = order.total - subtotal;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            href="/user/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 flex-wrap">
            <Package className="w-5 h-5 text-primary" />
            Order #{order._id.slice(-8).toUpperCase()}
            <Badge
              variant="outline"
              className={`font-medium border-0 gap-1.5 pl-2 ${status.bg} ${status.text}`}
            >
              {status.icon}
              {status.label}
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Button
          onClick={fetchOrder}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2 h-9 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center">
            {PROGRESS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const cfg = STATUS_CONFIG[step];
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle className="w-4 h-4" /> : cfg.icon}
                    </div>
                    <span
                      className={`text-[11px] font-medium text-center ${
                        done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-5 ${
                        i < currentStep ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Items ({order.items.length})
            </h3>
          </div>
          <ul className="divide-y divide-border">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.productId}`}
                    className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar: payment + shipping + totals */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={`border-0 font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "failed" ? "Failed" : order.paymentStatus === "refunded" ? "Refunded" : "Unpaid"}
                </Badge>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium text-foreground uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-background rounded-xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              Shipping Address
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="bg-background rounded-xl border border-border p-4 shadow-sm">
            <h3 className="font-semibold text-foreground mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {extras > 0.005 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping & Tax</span>
                  <span className="text-foreground">{formatPrice(extras)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border font-semibold text-base">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
