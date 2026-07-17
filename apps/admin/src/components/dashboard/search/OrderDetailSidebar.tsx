import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  productId?: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
  product?: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
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
  totalAmount: number;
  total?: number;
  status:
    | "pending"
    | "address_confirmed"
    | "confirmed"
    | "packed"
    | "delivering"
    | "delivered"
    | "completed"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "cod_collected";
  paymentMethod?: "stripe" | "cod";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailSidebarProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function OrderDetailSidebar({
  orderId,
  isOpen,
  onClose,
  onUpdate,
}: OrderDetailSidebarProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  const isAdmin = currentUser?.role === "admin";

  const [formData, setFormData] = useState({
    status: "" as Order["status"],
    paymentStatus: "" as Order["paymentStatus"],
  });

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isOpen]);

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, user:users!user_id(id, name, email), order_items(*)")
        .eq("id", orderId)
        .single();
      if (error) throw error;

      const row = data as Record<string, any>;
      setOrder({
        _id: row.id,
        orderId: row.id,
        user: {
          _id: row.user?.id || "",
          name: row.user?.name || "Unknown User",
          email: row.user?.email || "",
        },
        items: (row.order_items || []).map((item: any) => ({
          productId: item.product_id,
          name: item.name,
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image,
          variantLabel: item.variant_label,
        })),
        totalAmount: row.total || 0,
        total: row.total || 0,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        shippingAddress: {
          street: row.shipping_street || "",
          city: row.shipping_city || "",
          state: row.shipping_state || "",
          zipCode: row.shipping_postal_code || "",
          country: row.shipping_country || "",
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission if in edit mode
    if (!isEditMode) return;
    if (!isAdmin || !orderId) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("orders").update({ status: formData.status, payment_status: formData.paymentStatus }).eq("id", orderId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      setIsEditMode(false);
      await fetchOrderDetails();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update order",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isEditMode) {
      toast({
        title: "Unsaved Changes",
        description: "Please save or cancel your changes before closing.",
        variant: "destructive",
      });
      return;
    }
    if (!open) {
      handleClose();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      address_confirmed: "bg-blue-500",
      confirmed: "bg-indigo-500",
      packed: "bg-purple-500",
      delivering: "bg-orange-500",
      delivered: "bg-green-500",
      completed: "bg-emerald-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      paid: "bg-green-500",
      failed: "bg-red-500",
      refunded: "bg-orange-500",
      cod_collected: "bg-blue-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        onInteractOutside={(e) => {
          if (isEditMode) {
            e.preventDefault();
            toast({
              title: "Unsaved Changes",
              description: "Please save or cancel your changes before closing.",
              variant: "destructive",
            });
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Details
            {isEditMode && (
              <Badge variant="secondary" className="ml-auto">
                Editing
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update order status and payment"
              : "View order details and information"}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : order ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {/* Order Header */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <span className="font-mono font-semibold">{order.orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Amount
                </span>
                <span className="font-semibold text-lg">
                  ₹{(order.totalAmount || order.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge
                  className={cn(getStatusColor(order.status), "capitalize")}
                >
                  {order.status.replace("_", " ")}
                </Badge>
                <Badge
                  className={cn(
                    getPaymentStatusColor(order.paymentStatus),
                    "capitalize"
                  )}
                >
                  {order.paymentStatus.replace("_", " ")}
                </Badge>
                {order.paymentMethod && (
                  <Badge variant="outline" className="capitalize">
                    {order.paymentMethod}
                  </Badge>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <Label>Customer</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="font-medium">{order.user?.name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  {order.user?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <Label>Order Items ({order.items?.length || 0})</Label>
              <div className="mt-2 space-y-2">
                {order.items?.map((item, idx) => {
                  const itemName =
                    item.name || item.product?.name || "Unknown Product";
                  const itemImage =
                    item.image ||
                    item.product?.image ||
                    "/placeholder-product.png";
                  const itemPrice = item.price || item.product?.price || 0;

                  return (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{itemName}</p>
                        {item.variantLabel && (
                          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          ₹{itemPrice.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{(itemPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <Label>Shipping Address</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.zipCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as Order["status"],
                    })
                  }
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="address_confirmed">
                      Address Confirmed
                    </SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="delivering">Delivering</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      paymentStatus: value as Order["paymentStatus"],
                    })
                  }
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="cod_collected">COD Collected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Created At</Label>
                <Input
                  value={new Date(order.createdAt).toLocaleString()}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Updated At</Label>
                <Input
                  value={new Date(order.updatedAt).toLocaleString()}
                  disabled
                  className="mt-2"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <SheetFooter className="flex-row gap-2 pt-6 border-t sticky bottom-0 bg-background pb-4">
              {isAdmin ? (
                isEditMode ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditMode(false);
                        // Reset form data to original order values
                        if (order) {
                          setFormData({
                            status: order.status,
                            paymentStatus: order.paymentStatus,
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClose();
                      }}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditMode(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Order
                    </Button>
                  </>
                )
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
