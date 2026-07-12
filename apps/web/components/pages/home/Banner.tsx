import BannerCarousel from "./BannerCarousel";
import CategorySidebar from "../../common/CategorySidebar";
import { supabase, mapCategory } from "@/lib/supabase";

const Banner = async ({
  showCategoryMenu = true,
}: {
  showCategoryMenu?: boolean;
}) => {
  const [{ data: bannerRows }, { data: catRows }] = await Promise.all([
    supabase
      .from("banners")
      .select("id, title, subtitle, image, link, show_button")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("categories")
      .select("id, name, slug, image, icon_image, category_type, level, parent_id")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("sort_order")
      .limit(10),
  ]);

  const banners = (bannerRows ?? []).map((r) => ({
    _id: r.id,
    name: r.subtitle ?? "",
    title: r.title ?? "",
    image: r.image,
    link: r.link ?? undefined,
    showButton: r.show_button !== false,
    startFrom: 0,
    bannerType: "default",
  }));

  const rootCategories = (catRows ?? []).map(mapCategory);

  if (banners.length === 0) return null;

  return (
    <div className="flex items-stretch">
      {showCategoryMenu && rootCategories.length > 0 && (
        <CategorySidebar
          categories={rootCategories}
          className="hidden lg:flex w-72 h-[400px] md:h-[500px] p-3"
        />
      )}
      <div className="relative group overflow-hidden rounded-md flex-1 h-[400px] md:h-[500px] md:pl-5 pt-5">
        <BannerCarousel banners={banners} />
      </div>
    </div>
  );
};

export default Banner;
