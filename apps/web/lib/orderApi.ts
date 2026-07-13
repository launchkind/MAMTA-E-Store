import { createClient } from "./supabase/client";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface StatusUpdate {
  timestamp: string;
  by?: {
    _id: string;
    name: string;
    role: string;
  };
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "address_confirmed"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "delivering"
    | "delivered"
    | "completed"
    | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: "cashfree" | "sslcommerz" | "cod";
  shippingAddress: ShippingAddress;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  isPaid?: boolean;
  payment_info?: {
    gateway?: "cashfree" | "sslcommerz" | "cod";
    cashfree?: {
      orderId?: string;
      paymentId?: string;
      paymentMethod?: string;
      bankReference?: string;
    };
    paidAmount?: number;
    currency?: string;
    paidAt?: string;
  };
  status_updates?: Record<string, StatusUpdate>;
}

interface SupabaseOrderRow {
  id: string;
  user_id: string;
  status: Order["status"];
  payment_status?: Order["paymentStatus"];
  payment_method?: Order["paymentMethod"];
  total: number;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal_code: string;
  paid_amount?: number;
  currency?: string;
  paid_at?: string;
  cashfree_order_id?: string;
  cashfree_payment_id?: string;
  cashfree_payment_method?: string;
  cashfree_bank_reference?: string;
  created_at: string;
  updated_at: string;
  order_items?: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant_label?: string;
  }>;
}

function mapOrderRow(row: SupabaseOrderRow): Order {
  return {
    _id: row.id,
    userId: row.user_id,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    total: row.total,
    shippingAddress: {
      street: row.shipping_street,
      city: row.shipping_city,
      state: row.shipping_state,
      country: row.shipping_country,
      postalCode: row.shipping_postal_code,
    },
    items: (row.order_items || []).map((item) => ({
      productId: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variantLabel: item.variant_label,
    })),
    cashfreeOrderId: row.cashfree_order_id,
    cashfreePaymentId: row.cashfree_payment_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPaid: row.payment_status === "paid",
    payment_info: row.cashfree_order_id
      ? {
          gateway: row.payment_method,
          cashfree: {
            orderId: row.cashfree_order_id,
            paymentId: row.cashfree_payment_id,
            paymentMethod: row.cashfree_payment_method,
            bankReference: row.cashfree_bank_reference,
          },
          paidAmount: row.paid_amount,
          currency: row.currency,
          paidAt: row.paid_at,
        }
      : undefined,
  };
}

const ORDER_SELECT = `
  id, user_id, status, payment_status, payment_method, total,
  shipping_street, shipping_city, shipping_state, shipping_country, shipping_postal_code,
  paid_amount, currency, paid_at,
  cashfree_order_id, cashfree_payment_id, cashfree_payment_method, cashfree_bank_reference,
  created_at, updated_at,
  order_items(product_id, name, price, quantity, image, variant_label)
`;

export const getUserOrders = async (_token?: string): Promise<Order[]> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as SupabaseOrderRow[]).map(mapOrderRow);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const getAllOrders = async (
  _token?: string,
  params?: {
    page?: number;
    perPage?: number;
    status?: string;
    paymentStatus?: string;
    sortOrder?: string;
  }
): Promise<{ orders: Order[]; total: number; totalPages: number }> => {
  try {
    const supabase = createClient();
    const page = params?.page || 1;
    const perPage = params?.perPage || 20;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from("orders")
      .select(ORDER_SELECT, { count: "exact" })
      .order("created_at", { ascending: params?.sortOrder === "asc" })
      .range(from, to);

    if (params?.status) query = query.eq("status", params.status);
    if (params?.paymentStatus) query = query.eq("payment_status", params.paymentStatus);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count || 0;
    return {
      orders: (data as SupabaseOrderRow[]).map(mapOrderRow),
      total,
      totalPages: Math.ceil(total / perPage),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [], total: 0, totalPages: 0 };
  }
};

export const getOrderById = async (orderId: string, _token?: string): Promise<Order | null> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", orderId)
      .single();

    if (error) throw error;
    return mapOrderRow(data as SupabaseOrderRow);
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export const deleteOrder = async (
  orderId: string,
  _token?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) throw error;
    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  _token?: string
): Promise<{ success: boolean; order?: Order; message?: string }> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select(ORDER_SELECT)
      .single();

    if (error) throw error;
    return { success: true, order: mapOrderRow(data as SupabaseOrderRow) };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update order status",
    };
  }
};

export const updatePaymentStatus = async (
  orderId: string,
  status: "paid" | "pending" | "failed" | "refunded",
  _token?: string,
  cashfreeOrderId?: string,
  cashfreePaymentId?: string
): Promise<{ success: boolean; order?: Order; message?: string }> => {
  try {
    const supabase = createClient();
    const updateData: Record<string, unknown> = { payment_status: status };
    if (status === "paid") updateData.paid_at = new Date().toISOString();
    if (cashfreeOrderId) updateData.cashfree_order_id = cashfreeOrderId;
    if (cashfreePaymentId) updateData.cashfree_payment_id = cashfreePaymentId;

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select(ORDER_SELECT)
      .single();

    if (error) throw error;
    return { success: true, order: mapOrderRow(data as SupabaseOrderRow) };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update payment status",
    };
  }
};
