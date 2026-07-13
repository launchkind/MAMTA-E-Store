import { createClient } from "./supabase/client";

export interface CartItemVariant {
  _id: string;
  color?: string;
  storage?: string;
  price?: number;
  stock: number;
  images?: string[];
}

export interface CartItem {
  productId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    brand: string;
    stock: number;
    rating: number;
    reviews: number;
    createdAt: string;
    updatedAt: string;
  };
  quantity: number;
  variantId?: string;
  variant?: CartItemVariant;
}

export interface CartResponse {
  success: boolean;
  cart: CartItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    limit: number;
  };
  message: string;
}

const mapCartRow = (row: Record<string, unknown>): CartItem => {
  const product = (row.product || {}) as Record<string, unknown>;
  const variant = row.variant as Record<string, unknown> | null;
  return {
    productId: {
      _id: (product.id as string) || (row.product_id as string),
      name: (product.name as string) || "",
      description: (product.description as string) || "",
      price: (product.price as number) || 0,
      images: (product.images as string[]) || [],
      category: (product.category_id as string) || "",
      brand: (product.brand_id as string) || "",
      stock: (product.stock as number) || 0,
      rating: (product.average_rating as number) || 0,
      reviews: 0,
      createdAt: (product.created_at as string) || "",
      updatedAt: (product.updated_at as string) || "",
    },
    quantity: row.quantity as number,
    variantId: (row.variant_id as string) ?? undefined,
    variant: variant
      ? {
          _id: variant.id as string,
          color: (variant.color as string) ?? undefined,
          storage: (variant.storage as string) ?? undefined,
          price: (variant.price as number | null) ?? undefined,
          stock: (variant.stock as number) ?? 0,
          images: (variant.images as string[]) ?? [],
        }
      : undefined,
  };
};

export const getUserCart = async (
  page: number = 1,
  limit: number = 10
): Promise<CartResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: true, cart: [], message: "Not authenticated" };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("cart_items")
      .select("product_id, quantity, variant_id, product:products!cart_items_product_id_fkey(id, name, description, price, images, stock, average_rating, category_id, brand_id, created_at, updated_at), variant:product_variants!cart_items_variant_id_fkey(id, color, storage, price, stock, images)", { count: "exact" })
      .eq("user_id", session.user.id)
      .range(from, to);

    if (error) throw error;
    const total = count || 0;
    return {
      success: true,
      cart: (data || []).map(mapCartRow),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: page * limit < total,
        limit,
      },
      message: "Cart retrieved successfully",
    };
  } catch (error) {
    console.error("Get cart error:", error);
    return { success: false, cart: [], message: "Failed to get cart" };
  }
};

export const addToCart = async (
  _token: string,
  productId: string,
  quantity: number = 1,
  variantId?: string
): Promise<CartResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, cart: [], message: "Authentication required" };

    const { error } = await supabase.from("cart_items").upsert(
      { user_id: session.user.id, product_id: productId, variant_id: variantId ?? null, quantity },
      { onConflict: "user_id,product_id,variant_id" }
    );
    if (error) throw error;

    return getUserCart();
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, cart: [], message: "Failed to add to cart" };
  }
};

export const updateCartItem = async (
  _token: string,
  productId: string,
  quantity: number,
  variantId?: string
): Promise<CartResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, cart: [], message: "Authentication required" };

    let query = supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", session.user.id)
      .eq("product_id", productId);
    query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
    const { error } = await query;
    if (error) throw error;

    return getUserCart();
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, cart: [], message: "Failed to update cart item" };
  }
};

export const removeFromCart = async (
  _token: string,
  productId: string,
  variantId?: string
): Promise<CartResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, cart: [], message: "Authentication required" };

    let query = supabase
      .from("cart_items")
      .delete()
      .eq("user_id", session.user.id)
      .eq("product_id", productId);
    query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
    const { error } = await query;
    if (error) throw error;

    return getUserCart();
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, cart: [], message: "Failed to remove from cart" };
  }
};

export const clearCart = async (): Promise<CartResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, cart: [], message: "Authentication required" };

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", session.user.id);
    if (error) throw error;

    return { success: true, cart: [], message: "Cart cleared successfully" };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, cart: [], message: "Failed to clear cart" };
  }
};
