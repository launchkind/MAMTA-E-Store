"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
  Calendar,
  CreditCard,
  Truck,
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getOrderById, type Order } from "@/lib/orderApi";
import { useUserStore, useCartStore } from "@/lib/store";
import { pollOrderStatus } from "@/lib/paymentUtils";
import PriceFormatter from "@/components/common/PriceFormatter";
import Cookies from "js-cookie";
import Container from "@/components/common/Container";
import { SuccessPageSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";

/* ── helpers ── */
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const GATEWAY_LABELS: Record<string, string> = {
  cashfree: "Cashfree",
  sslcommerz: "SSLCommerz",
  cod: "Cash on Delivery",
};

/* ── Info card ── */
const InfoCard = ({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  accent?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow",
      accent,
    )}
  >
    <div className="flex items-start gap-3">
      <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-base font-bold text-foreground">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

/* ── Payment info row ── */
const PaymentRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);

/* ── What's next steps ── */
const STEPS = [
  {
    n: "1",
    icon: <Clock className="w-5 h-5" />,
    title: "Order Confirmed",
    desc: "You'll receive an email with your order details and tracking info.",
    color: "bg-blue-500",
  },
  {
    n: "2",
    icon: <Package className="w-5 h-5" />,
    title: "Processing",
    desc: "Our team is carefully preparing and packaging your order.",
    color: "bg-purple-500",
  },
  {
    n: "3",
    icon: <Truck className="w-5 h-5" />,
    title: "On the Way",
    desc: "Track your package in real-time as it heads to your doorstep.",
    color: "bg-primary",
  },
];

/* ── Main client content ── */
const SuccessPageContent = ({
  initialOrder,
}: {
  initialOrder: Order | null;
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder); // skip loading if server gave us data
  const [authLoading, setAuthLoading] = useState(!initialOrder);
  const [statusUpdated, setStatusUpdated] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { auth_token, authUser, verifyAuth } = useUserStore();
  const { clearCart } = useCartStore();

  const orderId = searchParams.get("orderId");
  const paymentStatus = searchParams.get("payment");

  // Auth check — only needed if we didn't get an order from the server
  useEffect(() => {
    if (initialOrder) {
      setAuthLoading(false);
      return;
    }
    const check = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) await verifyAuth();
      setAuthLoading(false);
    };
    check();
  }, [auth_token, authUser, verifyAuth, initialOrder]);

  // Fetch order client-side only when server fetch didn't return one
  useEffect(() => {
    if (authLoading || initialOrder) return;
    if (!orderId) {
      router.push("/user/orders");
      return;
    }

    const token = Cookies.get("auth_token") || auth_token;
    if (!token) {
      toast.error("Authentication required");
      router.push("/auth/signin");
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(orderId, token);
        if (data) {
          setOrder(data);
          if (
            data.isPaid ||
            data.paymentStatus === "paid" ||
            paymentStatus === "success"
          ) {
            await clearCart();
          }
        }
      } catch {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId, auth_token, router, authLoading, initialOrder]);

  // Cart clear when we have an initial server order that's paid
  useEffect(() => {
    if (
      initialOrder &&
      (initialOrder.isPaid ||
        initialOrder.paymentStatus === "paid" ||
        paymentStatus === "success")
    ) {
      clearCart();
    }
  }, [initialOrder]);

  // Poll for the webhook-confirmed payment status. Cashfree redirects back
  // to this page regardless of whether the payment succeeded or failed, so
  // the outcome can only be trusted once payment_status is updated server-side.
  useEffect(() => {
    if (!order || statusUpdated || order.paymentStatus !== "pending") return;
    const token = Cookies.get("auth_token") || auth_token;
    if (!token || !orderId) return;

    const poll = async () => {
      try {
        const result = await pollOrderStatus(orderId, token, "paid", 6, 5000);
        if (result.success && result.order) {
          setOrder(result.order);
          setStatusUpdated(true);
          toast.success("Payment status updated!");
        } else if (result.order?.paymentStatus === "failed") {
          setOrder(result.order);
          setStatusUpdated(true);
          toast.error("Payment failed. Please try again.");
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    };
    poll();
  }, [order, statusUpdated, orderId, auth_token]);

  if (loading || authLoading) return <SuccessPageSkeleton />;

  return (
    <div className="min-h-screen bg-muted">
      <Container className="py-6 sm:py-10 max-w-5xl">
        {/* ── Hero card ── */}
        <div className="relative rounded-2xl bg-primary text-primary-foreground overflow-hidden mb-6 p-8 sm:p-12 text-center shadow-lg">
          {/* Background shimmer rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border border-white/10 absolute" />
            <div className="w-96 h-96 rounded-full border border-white/5 absolute" />
            <div className="w-[32rem] h-[32rem] rounded-full border border-white/5 absolute" />
          </div>

          <div className="relative z-10">
            {/* Icon with celebration dots */}
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-xl mx-auto">
                <CheckCircle
                  className="w-10 h-10 text-white"
                  strokeWidth={2.5}
                />
              </div>
              {/* Animated particles */}
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping" />
              <span className="absolute -top-3 -right-0 w-2 h-2 rounded-full bg-white/70 animate-ping [animation-delay:200ms]" />
              <span className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-pink-300 animate-ping [animation-delay:400ms]" />
              <span className="absolute -bottom-2 -right-2 w-2.5 h-2.5 rounded-full bg-blue-300 animate-ping [animation-delay:150ms]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-primary-foreground/80 text-sm sm:text-base max-w-md mx-auto mb-8">
              Thank you for your purchase! Your order is confirmed and being
              prepared with care.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderId && (
                <Link href={`/user/orders/${orderId}`}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-lg gap-2 font-semibold"
                  >
                    <Truck className="w-4 h-4" />
                    Track Order
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Link href="/user/orders">
                <Button
                  size="lg"
                  className="w-full sm:w-auto border border-white/40 bg-white/10 text-white hover:bg-white/20 gap-2 backdrop-blur-sm"
                >
                  <Package className="w-4 h-4" />
                  My Orders
                </Button>
              </Link>
              <Link href="/shop">
                <Button
                  size="lg"
                  className="w-full sm:w-auto border border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Order summary info cards ── */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <InfoCard
              icon={<Package className="w-5 h-5" />}
              label="Order ID"
              value={
                <span className="font-mono">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              }
              sub={fmt(order.createdAt)}
            />
            <InfoCard
              icon={
                order.paymentStatus === "paid" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )
              }
              label="Payment"
              value={
                <span
                  className={
                    order.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {order.paymentStatus === "paid" ? "Confirmed" : "Processing…"}
                </span>
              }
              sub={
                order.payment_info?.gateway
                  ? GATEWAY_LABELS[order.payment_info.gateway]
                  : undefined
              }
            />
            <InfoCard
              icon={<CreditCard className="w-5 h-5" />}
              label="Total Paid"
              value={
                <PriceFormatter
                  amount={order.total}
                  className="text-xl font-bold text-foreground"
                />
              }
              sub={`${order.items.length} item${order.items.length !== 1 ? "s" : ""}`}
            />
          </div>
        )}

        {/* ── Shipping address ── */}
        {order?.shippingAddress && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              Shipping Address
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {[
                order.shippingAddress.street,
                order.shippingAddress.city,
                order.shippingAddress.state,
                order.shippingAddress.country,
                order.shippingAddress.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        )}

        {/* ── Payment details ── */}
        {order?.payment_info && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              Payment Details
            </h2>
            <div className="divide-y divide-border/50">
              <PaymentRow
                label="Gateway"
                value={
                  order.payment_info.gateway
                    ? GATEWAY_LABELS[order.payment_info.gateway]
                    : "—"
                }
              />
              {order.payment_info.currency && (
                <PaymentRow
                  label="Currency"
                  value={order.payment_info.currency}
                />
              )}
              {order.payment_info.gateway === "cashfree" &&
                order.payment_info.cashfree && (
                  <>
                    {order.payment_info.cashfree.paymentMethod && (
                      <PaymentRow
                        label="Method"
                        value={order.payment_info.cashfree.paymentMethod}
                      />
                    )}
                    {order.payment_info.cashfree.bankReference && (
                      <PaymentRow
                        label="Bank Reference"
                        value={order.payment_info.cashfree.bankReference}
                      />
                    )}
                    {order.payment_info.cashfree.paymentId && (
                      <PaymentRow
                        label="Transaction ID"
                        value={order.payment_info.cashfree.paymentId}
                      />
                    )}
                  </>
                )}
            </div>
          </div>
        )}

        {/* ── Order items ── */}
        {order && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              Order Items
              <span className="text-muted-foreground font-normal">
                ({order.items.length})
              </span>
            </h2>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Qty {item.quantity} ×{" "}
                      <PriceFormatter amount={item.price} className="inline" />
                    </p>
                  </div>
                  <PriceFormatter
                    amount={item.price * item.quantity}
                    className="text-sm font-bold text-foreground shrink-0"
                  />
                </div>
              ))}
            </div>

            {/* Total row */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Order Total
              </span>
              <PriceFormatter
                amount={order.total}
                className="text-xl font-bold text-primary"
              />
            </div>
          </div>
        )}

        {/* ── What's next ── */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground flex items-center justify-center gap-2 mb-5 text-center">
            <Calendar className="w-4 h-4 text-primary" />
            What Happens Next?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md mb-3",
                    step.color,
                  )}
                >
                  {step.icon}
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom actions ── */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-center">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            Need Help?
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Questions about your order? Our support team is always ready to
            help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link href={`/user/orders/${orderId}`}>
                <Button className="gap-2 w-full sm:w-auto">
                  <Truck className="w-4 h-4" />
                  Track Order
                </Button>
              </Link>
            )}
            <Link href="/user/orders">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto hover:bg-primary/10"
              >
                <Package className="w-4 h-4" />
                My Orders
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

/* ── Exported component (wrapped in Suspense for searchParams) ── */
const SuccessPageClient = ({
  initialOrder,
}: {
  initialOrder?: Order | null;
}) => (
  <Suspense fallback={<SuccessPageSkeleton />}>
    <SuccessPageContent initialOrder={initialOrder ?? null} />
  </Suspense>
);

export default SuccessPageClient;
