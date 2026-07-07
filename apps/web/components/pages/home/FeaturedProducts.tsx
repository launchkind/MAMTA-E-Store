import { createClient } from "@/lib/supabase/server";
import { Product } from "@entry/types";
import React from "react";
import ProductTypeCarousel from "./ProductTypeCarousel";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
}

interface FeaturedProductsProps {
  title?: string;
  description?: string;
  productFilter?: {
    tags?: string[];
  };
  categoryIds?: string[];
  brandIds?: string[];
}

const FeaturedProducts = async ({
  title = "Featured Products",
  description,
  productFilter,
  categoryIds,
  brandIds,
}: FeaturedProductsProps = {}) => {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name), product_product_types!inner(product_types!inner(name))")
      .eq("product_product_types.product_types.name", "featured")
      .limit(20);

    if (categoryIds && categoryIds.length > 0) query = query.in("category_id", categoryIds);
    if (brandIds && brandIds.length > 0) query = query.in("brand_id", brandIds);

    const { data } = await query;
    products = (data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product));

    // Fallback: If no featured products found, fetch regular products
    if (products.length === 0) {
      let fallback = supabase.from("products").select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)").limit(20);
      if (categoryIds && categoryIds.length > 0) fallback = fallback.in("category_id", categoryIds);
      if (brandIds && brandIds.length > 0) fallback = fallback.in("brand_id", brandIds);
      const { data: fallbackData } = await fallback;
      products = (fallbackData || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product));
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-full bg-background border mt-3 rounded-md">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <Link
          href="/products?productType=featured"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="w-full">
        <ProductTypeCarousel products={products} />
      </div>
    </div>
  );
};

export default FeaturedProducts;
