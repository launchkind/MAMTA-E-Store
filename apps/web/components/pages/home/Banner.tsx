import BannerCarousel from "./BannerCarousel";
import CategorySidebar from "../../common/CategorySidebar";
import { supabase, mapCategory } from "@/lib/supabase";

const Banner = async ({
  showCategoryMenu = true,
}: {
  showCategoryMenu?: boolean;
}) => {
  const [bannerQuery, { data: catRows }] = await Promise.all([
    supabase
      .from("banners")
      .select("id, title, subtitle, image, mobile_image, link, show_button")
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

  let bannerRows: Array<{
    id: string;
    title: string | null;
    subtitle: string | null;
    image: string;
    mobile_image: string | null;
    link: string | null;
    show_button: boolean;
  }> | null = bannerQuery.data;

  if (bannerQuery.error) {
    // `mobile_image` column may not exist yet if migration 023 hasn't been
    // applied — fall back so the banner section doesn't disappear entirely.
    const fallbackQuery = await supabase
      .from("banners")
      .select("id, title, subtitle, image, link, show_button")
      .eq("is_active", true)
      .order("sort_order");
    bannerRows = (fallbackQuery.data ?? []).map((r) => ({
      ...r,
      mobile_image: null,
    }));
  }

  const banners = (bannerRows ?? []).map((r) => ({
    _id: r.id,
    name: r.subtitle ?? "",
    title: r.title ?? "",
    image: r.image,
    mobileImage: r.mobile_image ?? undefined,
    link: r.link ?? undefined,
    showButton: r.show_button !== false,
    startFrom: 0,
    bannerType: "default",
  }));

  const rootCategories = (catRows ?? []).map(mapCategory);

  if (banners.length === 0) return null;

  return (
    <div className="block lg:flex lg:items-stretch">
      {showCategoryMenu && rootCategories.length > 0 && (
        <CategorySidebar
          categories={rootCategories}
          className="hidden lg:flex w-72 h-[400px] md:h-[500px] p-3"
        />
      )}
      <div className="relative group overflow-hidden rounded-xl aspect-[4/5] md:aspect-auto md:h-[430px] lg:aspect-auto lg:h-[500px] lg:flex-1 lg:pl-5 pt-5">
        <BannerCarousel banners={banners} />
      </div>
    </div>
  );
};

export default Banner;
