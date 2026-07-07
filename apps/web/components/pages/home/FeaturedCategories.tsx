import { supabase, mapCategory } from "@/lib/supabase";
import FeaturedCategoriesCarousel from "./FeaturedCategoriesCarousel";

const FeaturedCategories = async () => {
  const { data: rows } = await supabase
    .from("categories")
    .select("id, name, slug, image, icon_image, category_type, level, parent_id")
    .contains("category_type", ["Featured"])
    .eq("is_active", true)
    .order("sort_order")
    .limit(20);

  const categories = (rows ?? []).map(mapCategory);

  if (!categories.length) return null;

  return <FeaturedCategoriesCarousel categories={categories} />;
};

export default FeaturedCategories;
