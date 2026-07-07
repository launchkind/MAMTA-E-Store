import { createClient } from "@/lib/supabase/server";
import { Product } from "@entry/types";
import React from "react";
import ProductTypeCarousel from "./ProductTypeCarousel";
import Link from "next/link";

interface GenericProductSectionProps {
  config: any; // Using any for simplicity as we know the shape from WebsiteConfig
}

interface ProductsResponse {
  products: Product[];
}

const GenericProductSection = async ({
  config,
}: GenericProductSectionProps) => {
  let products: Product[] = [];

  const settings = config.settings || {};
  const filter = settings.productFilter || {};

  const limit = settings.productsLimit || 10;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
      .limit(limit);

    if (filter.category) query = query.eq("category_id", filter.category);
    if (filter.brand) query = query.eq("brand_id", filter.brand);
    if (filter.minPrice) query = query.gte("price", filter.minPrice);
    if (filter.maxPrice) query = query.lte("price", filter.maxPrice);
    if (filter.isOnSale) query = query.gt("discount_percentage", 0);

    const { data } = await query;
    products = (data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product));
  } catch (error) {
    console.error(`Error fetching products for ${config.title}:`, error);
  }

  // Don't render if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-full bg-background border mt-3 rounded-md overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{config.title}</h2>
          {config.description && (
            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
          )}
        </div>
        <Link
          href={`/shop${queryString}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="w-full overflow-hidden">
        <ProductTypeCarousel products={products} />
      </div>
    </div>
  );
};

export default GenericProductSection;
