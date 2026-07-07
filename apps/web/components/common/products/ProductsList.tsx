import { createClient } from "@/lib/supabase/server";
import { Product } from "@entry/types";
import React from "react";
import ProductList from "./ProductList";

interface ProductsResponse {
  products: Product[];
}

const ProductsList = async () => {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
      .limit(10);
    products = (data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product));
  } catch (error) {
  }

  if (products?.length === 0) {
    return (
      <div className="bg-background p-5 rounded-md border">
        <p className="text-xl font-semibold">No Products Available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background border mt-3 rounded-md">
      <ProductList products={products} />
    </div>
  );
};

export default ProductsList;
