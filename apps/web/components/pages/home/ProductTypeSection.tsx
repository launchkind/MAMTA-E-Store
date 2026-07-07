import { supabase, mapProduct } from "@/lib/supabase";
import React from "react";
import ProductTypeCarousel from "./ProductTypeCarousel";
import Link from "next/link";

interface ProductType {
  _id: string;
  name: string;
  type: string;
  displayOrder: number;
  color?: string;
}

interface ProductTypeSectionProps {
  productType: ProductType;
}

const PRODUCT_SELECT = `
  id, name, slug, description, price, discount_percentage,
  average_rating, num_reviews, image, images, stock, sold,
  category:categories!category_id(id, name, slug, image, icon_image),
  brand:brands!brand_id(id, name, image)
`;

const ProductTypeSection = async ({ productType }: ProductTypeSectionProps) => {
  // Step 1: resolve product_type id from type string
  const { data: ptRow } = await supabase
    .from("product_types")
    .select("id")
    .eq("type", productType.type)
    .single();

  if (!ptRow) return null;

  // Step 2: get product ids for this type
  const { data: links } = await supabase
    .from("product_product_types")
    .select("product_id")
    .eq("product_type_id", ptRow.id);

  const productIds = (links ?? []).map((l: any) => l.product_id);
  if (!productIds.length) return null;

  // Step 3: fetch those products
  const { data: rows } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", productIds)
    .eq("approval_status", "approved")
    .limit(20);

  const products = (rows ?? []).map(mapProduct);
  if (!products.length) return null;

  const getViewMoreLink = (type: string) => {
    if (type === "_new_arrivals") return "/new-arrivals";
    if (type === "_featured_products") return "/features";
    return `/shop?productType=${type}`;
  };

  return (
    <div className="w-full mt-10 rounded-md">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{productType.name}</h2>
        <Link
          href={getViewMoreLink(productType.type)}
          className="text-sm underline underline-offset-4 hover:text-accent hoverEffect"
        >
          View More
        </Link>
      </div>
      <ProductTypeCarousel products={products as any} navigationPosition="responsive" />
    </div>
  );
};

export default ProductTypeSection;
