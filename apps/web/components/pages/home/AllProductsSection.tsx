import { supabase, mapProduct } from "@/lib/supabase";
import React from "react";
import ProductTypeCarousel from "./ProductTypeCarousel";
import Link from "next/link";

interface AllProductsSectionProps {
  title?: string;
  description?: string;
}

const PRODUCT_SELECT = `
  id, name, slug, description, price, discount_percentage,
  average_rating, num_reviews, image, images, stock, sold,
  category:categories!category_id(id, name, slug, image, icon_image),
  brand:brands!brand_id(id, name, image)
`;

const AllProductsSection = async ({
  title = "All Products",
  description,
}: AllProductsSectionProps = {}) => {
  const { data: rows } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  const products = (rows ?? []).map(mapProduct);

  if (!products.length) return null;

  return (
    <div className="w-full max-w-full mt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <Link
          href="/shop"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="w-full">
        <ProductTypeCarousel
          products={products as any}
          rows={2}
          navigationPosition="bottom"
        />
      </div>
    </div>
  );
};

export default AllProductsSection;
