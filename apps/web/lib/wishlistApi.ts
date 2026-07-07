import { createClient } from "./supabase/client";

export interface WishlistResponse {
  success: boolean;
  wishlist: string[];
  message?: string;
}

export interface WishlistProductsResponse {
  success: boolean;
  products: [];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasMore: boolean;
    limit: number;
  };
  message?: string;
}

export const addToWishlist = async (
  productId: string,
  _token?: string
): Promise<WishlistResponse> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required");

  const { error } = await supabase.from("wishlist_items").upsert(
    { user_id: session.user.id, product_id: productId },
    { onConflict: "user_id,product_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);

  return getUserWishlist(_token);
};

export const removeFromWishlist = async (
  productId: string,
  _token?: string
): Promise<WishlistResponse> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required");

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", session.user.id)
    .eq("product_id", productId);
  if (error) throw new Error(error.message);

  return getUserWishlist(_token);
};

export const getUserWishlist = async (_token?: string): Promise<WishlistResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: true, wishlist: [] };

    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", session.user.id);

    if (error) throw new Error(error.message);
    return { success: true, wishlist: (data || []).map((r) => r.product_id) };
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return { success: false, wishlist: [] };
  }
};

export const getWishlistProducts = async (
  productIds: string[],
  _token?: string,
  page: number = 1,
  limit: number = 10
): Promise<WishlistProductsResponse> => {
  try {
    const supabase = createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .in("id", productIds)
      .range(from, to);

    if (error) throw new Error(error.message);
    const total = count || 0;
    return {
      success: true,
      products: (data || []) as [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasMore: page * limit < total,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting wishlist products:", error);
    return { success: false, products: [] };
  }
};

export const clearWishlist = async (_token?: string): Promise<WishlistResponse> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, wishlist: [] };

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", session.user.id);

    if (error) throw new Error(error.message);
    return { success: true, wishlist: [] };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return { success: false, wishlist: [] };
  }
};
