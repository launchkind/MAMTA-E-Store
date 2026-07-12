import { supabase } from "@/lib/supabase";

export interface BaseConfig {
  sidebar: boolean;
  banner: boolean;
  showAds: boolean;
  showCategoryMenu: boolean;
  showBecomeSeller: boolean;
  search: {
    enabled: boolean;
    voice: boolean;
    image: boolean;
  };
  revalidationTime: number;
  bottomHeader: {
    enabled: boolean;
    categoryMenu: boolean;
    navList: boolean;
  };
}

const DEFAULT_CONFIG: BaseConfig = {
  sidebar: true,
  banner: true,
  showAds: true,
  showCategoryMenu: true,
  showBecomeSeller: true,
  search: { enabled: true, voice: true, image: true },
  revalidationTime: 60,
  bottomHeader: { enabled: true, categoryMenu: true, navList: true },
};

export async function getBaseConfig(): Promise<BaseConfig> {
  try {
    const { data, error } = await supabase
      .from("base_config")
      .select("layout_settings")
      .limit(1)
      .maybeSingle();

    if (error || !data?.layout_settings) return DEFAULT_CONFIG;

    const ls = data.layout_settings as Partial<BaseConfig>;
    return {
      sidebar: ls.sidebar ?? true,
      banner: ls.banner ?? true,
      showAds: ls.showAds ?? true,
      showCategoryMenu: ls.showCategoryMenu ?? true,
      showBecomeSeller: ls.showBecomeSeller ?? true,
      search: {
        enabled: ls.search?.enabled ?? true,
        voice: ls.search?.voice ?? true,
        image: ls.search?.image ?? true,
      },
      revalidationTime: ls.revalidationTime ?? 60,
      bottomHeader: {
        enabled: ls.bottomHeader?.enabled ?? true,
        categoryMenu: ls.bottomHeader?.categoryMenu ?? true,
        navList: ls.bottomHeader?.navList ?? true,
      },
    };
  } catch (error) {
    console.error("Failed to fetch base config:", error);
    return DEFAULT_CONFIG;
  }
}
