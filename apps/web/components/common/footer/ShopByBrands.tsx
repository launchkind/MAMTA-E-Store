import React from "react";
import { supabase } from "@/lib/supabase";
import ShopByBrandsCarousel from "./ShopByBrandsCarousel";

export default async function ShopByBrands() {
  const { data: rows } = await supabase
    .from("brands")
    .select("id, name, image")
    .order("name");

  const brands = (rows ?? []).map((r) => ({
    _id: r.id,
    name: r.name,
    image: r.image ?? "",
  }));

  if (!brands.length) return null;

  return <ShopByBrandsCarousel brands={brands} />;
}
