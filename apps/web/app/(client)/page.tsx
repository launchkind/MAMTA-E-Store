import Container from "@/components/common/Container";
import Banner from "@/components/pages/home/Banner";
import FeaturedCategories from "@/components/pages/home/FeaturedCategories";
import HomeAdvertisement from "@/components/pages/home/HomeAdvertisement";
import BecomeSeller from "@/components/pages/home/BecomeSeller";
import ProductTypeSection from "@/components/pages/home/ProductTypeSection";
import AllProductsSection from "@/components/pages/home/AllProductsSection";
import FeaturedOffers from "@/components/pages/home/FeaturedOffers";
import { getSellerConfig } from "@/lib/sellerConfig";
import { getBaseConfig } from "@/lib/baseConfig";
import ShopByBrands from "@/components/common/footer/ShopByBrands";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "http://localhost:3000" },
};
export const dynamic = "force-dynamic";

interface ProductType {
  _id: string;
  name: string;
  type: string;
  displayOrder: number;
  color?: string;
  isActive: boolean;
}

export default async function Home() {
  const [sellerConfig, baseConfig] = await Promise.all([
    getSellerConfig(),
    getBaseConfig(),
  ]);

  // Fetch product types from Supabase
  let productTypes: ProductType[] = [];
  try {
    const { data } = await supabase
      .from("product_types")
      .select("id, name, type, description, color")
      .order("name");

    // Map to expected shape; sort_order doesn't exist in our schema,
    // so assign displayOrder based on array index
    productTypes = (data ?? []).map((pt, i) => ({
      _id: pt.id,
      name: pt.name,
      type: pt.type,
      displayOrder: i + 1,
      color: pt.color ?? undefined,
      isActive: true,
    }));
  } catch (error) {
    console.error("Error fetching product types:", error);
  }

  const firstTwo = productTypes.slice(0, 2);
  const middleTwo = productTypes.slice(2, 4);
  const remaining = productTypes.slice(4);

  return (
    <div className="bg-primary-foreground">
      <Container className="min-h-screen flex flex-col md:flex-row gap-3">
        <div className="flex-1 min-w-0">
          {baseConfig.banner && (
            <Banner
              showCategoryMenu={
                baseConfig.sidebar && baseConfig.showCategoryMenu
              }
            />
          )}

          <FeaturedCategories />

          {firstTwo.map((productType) => (
            <ProductTypeSection key={productType._id} productType={productType} />
          ))}

          {baseConfig.showAds && <HomeAdvertisement />}

          {middleTwo.map((productType) => (
            <ProductTypeSection key={productType._id} productType={productType} />
          ))}

          {baseConfig.showBecomeSeller && (
            <BecomeSeller config={sellerConfig} isVendor={false} />
          )}

          {remaining.map((productType) => (
            <ProductTypeSection key={productType._id} productType={productType} />
          ))}

          <FeaturedOffers />
          <AllProductsSection />
          <ShopByBrands />
        </div>
      </Container>
    </div>
  );
}
