import ShopPage from "@/components/pages/shop/ShopPageClient";
import { createClient } from "@/lib/supabase/server";
import { Brand, Category, ProductType, Seller } from "@entry/types";

const ShopPageServer = async () => {
  let brands: Brand[] = [];
  let categories: Category[] = [];
  let productTypes: ProductType[] = [];
  let sellers: Seller[] = [];

  try {
    const supabase = await createClient();

    const [brandsRes, categoriesRes, ptRes, sellersRes] = await Promise.all([
      supabase.from("brands").select("id, name, image, is_active").eq("is_active", true),
      supabase.from("categories").select("id, name, image, category_type, parent_id"),
      supabase.from("product_types").select("id, name, description, is_active").eq("is_active", true),
      supabase.from("sellers").select("id, store_name, status, logo").eq("status", "approved"),
    ]);

    brands = (brandsRes.data || []).map((b: Record<string, unknown>) => ({ _id: b.id, name: b.name, image: b.image } as unknown as Brand));
    categories = (categoriesRes.data || []).map((c: Record<string, unknown>) => ({ _id: c.id, name: c.name, image: c.image, categoryType: c.category_type } as unknown as Category));
    productTypes = (ptRes.data || []).map((pt: Record<string, unknown>) => ({ _id: pt.id, name: pt.name, description: pt.description, isActive: pt.is_active } as unknown as ProductType));
    sellers = (sellersRes.data || []).map((s: Record<string, unknown>) => ({ _id: s.id, storeName: s.store_name, status: s.status, logo: s.logo } as unknown as Seller));
  } catch (err) {
    console.error("Failed to fetch shop data:", err);
  }

  return (
    <div>
      <ShopPage
        categories={categories}
        brands={brands}
        productTypes={productTypes}
        sellers={sellers}
      />
    </div>
  );
};

export default ShopPageServer;
