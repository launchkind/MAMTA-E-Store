"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Truck,
  Package,
  Eye,
  Home,
  RefreshCw,
  ShoppingBag,
  Clock,
  CreditCard,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import {
  getUserOrders,
  getAllOrders,
  deleteOrder,
  Order,
} from "@/lib/orderApi";
import { OrderTableSkeleton } from "@/components/skeleton/OrderSkeleton";

/* ── helpers ── */
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <Clock className="w-3 h-3" />,
  },
  paid: {
    label: "Paid",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <CreditCard className="w-3 h-3" />,
  },
  processing: {
    label: "Processing",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: <RefreshCw className="w-3 h-3" />,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  paid: { label: "Paid", bg: "bg-green-100", text: "text-green-700" },
  pending: { label: "Unpaid", bg: "bg-yellow-100", text: "text-yellow-700" },
  failed: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
  refunded: { label: "Refunded", bg: "bg-blue-100", text: "text-blue-700" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    p,
  );

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// --- Custom Components removed for elegant Table replacing ---

/* ── Empty state ── */
const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
      <ShoppingBag className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">
      No orders yet
    </h3>
    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
      You haven&apos;t placed any orders yet. Start shopping to see them here.
    </p>
    <Link href="/shop">
      <Button className="gap-2">
        <ShoppingBag className="w-4 h-4" />
        Start Shopping
      </Button>
    </Link>
  </div>
);

/* ── Success state ── */
const PaymentSuccess = ({ orderId }: { orderId: string }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
    <p className="text-muted-foreground mb-2">
      Thank you for your purchase. Your order is being processed.
    </p>
    <div className="bg-muted rounded-lg px-4 py-2 mb-6 font-mono text-sm text-muted-foreground">
      Order ID: {orderId}
    </div>
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href="/shop">
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Package className="w-4 h-4" />
          Continue Shopping
        </Button>
      </Link>
      <Link href="/">
        <Button className="gap-2 w-full sm:w-auto">
          <Home className="w-4 h-4" />
          Go to Homepage
        </Button>
      </Link>
    </div>
  </div>
);

/* ── Main content ── */
const OrdersPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authUser, auth_token, isAuthenticated, verifyAuth } = useUserStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) await verifyAuth();
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  const fetchOrders = useCallback(async () => {
    if (!auth_token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const isAdminOrStaff =
        authUser?.role === "admin" || authUser?.role === "employee";
      if (isAdminOrStaff) {
        const result = await getAllOrders(auth_token, {
          page: 1,
          perPage: 100,
          sortOrder: "desc",
        });
        setOrders(result.orders);
      } else {
        setOrders(await getUserOrders(auth_token));
      }
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [auth_token, authUser]);

  useEffect(() => {
    if (success === "true") {
      toast.success("Payment completed! Your order has been placed.");
      const p = new URLSearchParams(searchParams);
      p.delete("success");
      p.delete("orderId");
      router.replace(`/user/orders?${p.toString()}`);
      setTimeout(fetchOrders, 1000);
    }
  }, [success]);

  useEffect(() => {
    if (!authLoading) fetchOrders();
  }, [fetchOrders, authLoading]);

  // Auto-refresh for pending orders
  useEffect(() => {
    if (!orders.some((o) => o.status === "pending")) return;
    const t = setInterval(fetchOrders, 30000);
    return () => clearInterval(t);
  }, [orders, fetchOrders]);

  const handleDeleteOrder = async (id: string) => {
    if (!auth_token) return;
    setDeletingOrder(id);
    try {
      const r = await deleteOrder(id, auth_token);
      if (r.success) {
        toast.success("Order deleted");
        setOrders((o) => o.filter((x) => x._id !== id));
      } else toast.error(r.message || "Failed to delete order");
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeletingOrder(null);
    }
  };

  if (success === "true" && orderId)
    return <PaymentSuccess orderId={orderId} />;
  if (authLoading) return <OrderTableSkeleton />;

  if (!authUser || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
        <p className="text-sm text-muted-foreground mb-6">
          You need to sign in to view your orders.
        </p>
        <Link href="/auth/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            My Orders
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
                {orders.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your order history
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2 h-9"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Table Controls (Tabs & Search) */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto overflow-x-auto"
          >
            <TabsList className="bg-muted/50 p-1 w-max">
              <TabsTrigger value="all" className="w-[80px] text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="w-[80px] text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="processing" className="w-[90px] text-xs">
                Processing
              </TabsTrigger>
              <TabsTrigger value="shipped" className="w-[80px] text-xs">
                Shipped
              </TabsTrigger>
              <TabsTrigger value="delivered" className="w-[80px] text-xs">
                Delivered
              </TabsTrigger>
              <TabsTrigger value="completed" className="w-[90px] text-xs">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="w-[80px] text-xs">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search order ID..."
              className="w-full pl-9 h-9 text-sm rounded-lg bg-muted/30 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Table Content */}
        {loading ? (
          <div className="p-8 flex justify-center items-center h-48 max-w-full">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading orders...</p>
            </div>
          </div>
        ) : orders.filter(
            (o) =>
              (activeTab === "all" || o.status === activeTab) &&
              o._id.toLowerCase().includes(searchQuery.toLowerCase()),
          ).length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="overflow-x-auto text-sm w-full">
            <Table>
              <TableHeader className="bg-muted/30 hover:bg-muted/30 pointer-events-none sticky top-0 z-10 w-full">
                <TableRow>
                  <TableHead className="w-[120px] font-medium text-foreground py-4">
                    Order ID
                  </TableHead>
                  <TableHead className="min-w-[130px] font-medium text-foreground">
                    Date
                  </TableHead>
                  <TableHead className="min-w-[200px] font-medium text-foreground">
                    Items
                  </TableHead>
                  <TableHead className="min-w-[100px] font-medium text-foreground">
                    Total
                  </TableHead>
                  <TableHead className="font-medium text-foreground">
                    Payment
                  </TableHead>
                  <TableHead className="w-[120px] font-medium text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-medium text-foreground w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders
                  .filter(
                    (o) =>
                      (activeTab === "all" || o.status === activeTab) &&
                      o._id.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((order) => {
                    const status =
                      STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
                    const payment =
                      PAYMENT_STATUS_CONFIG[order.paymentStatus ?? "pending"] ??
                      PAYMENT_STATUS_CONFIG["pending"];
                    const extra = order.items.length - 2;

                    return (
                      <TableRow
                        key={order._id}
                        className="group hover:bg-muted/50 cursor-default transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground py-4">
                          <Link
                            href={`/user/orders/${order._id}`}
                            className="hover:text-primary transition-colors hover:underline"
                          >
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatDate(order.createdAt)}
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Mini avatars for products */}
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 2).map((item, i) => (
                                <div
                                  key={i}
                                  className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden"
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                                      <Package className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              ))}
                              {extra > 0 && (
                                <div className="h-8 w-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-medium text-secondary-foreground">
                                  +{extra}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground ml-1 hidden sm:block">
                              <span className="font-medium text-foreground">
                                {order.items.length}
                              </span>{" "}
                              item(s)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`font-medium ${payment.bg} ${payment.text} border-0`}
                          >
                            {payment.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-medium border-0 gap-1.5 pl-2 ${status.bg} ${status.text}`}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end">
                          <Link href={`/user/orders/${order._id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

const OrdersPage = () => (
  <Suspense fallback={<OrderTableSkeleton />}>
    <OrdersPageContent />
  </Suspense>
);

export default OrdersPage;
