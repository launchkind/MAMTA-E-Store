import { createClient } from "@/lib/supabase/server";
import { Product } from "@entry/types";
import React from "react";
import ProductTypeCarousel from "./ProductTypeCarousel";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
}

interface TrendingProductsProps {
  title?: string;
  description?: string;
}

const TrendingProducts = async ({
  title = "Trending Products",
  description,
}: TrendingProductsProps = {}) => {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name), product_product_types!inner(product_types!inner(name))")
      .eq("product_product_types.product_types.name", "trending")
      .limit(20);
    products = (data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product));

    if (products.length === 0) {
      const { data: fallbackData } = await supabase.from("products").select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)").limit(20);
      products = (fallbackData || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product));
    }
  } catch (error) {
    console.error("Error fetching trending products:", error);
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
          href="/products?productType=trending"
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

export default TrendingProducts;
