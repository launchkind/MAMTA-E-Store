import { createClient } from "./supabase/client";

// Track product view
export const trackProductView = async (productId: string) => {
  try {
    const supabase = createClient();
    await supabase.from("product_views").insert({ product_id: productId }).select().single();
  } catch (error) {
    // View tracking is non-critical — fail silently
  }
};
