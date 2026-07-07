import { createClient } from "@/lib/supabase/server";
import { Category, ProductType } from "@entry/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

interface CategoriesResponse {
  categories: Category[];
}

interface ProductTypesResponse {
  productTypes: ProductType[];
}

const CategoriesSidebar = async () => {
  let productTypes: ProductType[] = [];
  let rootCategories: Category[] = [];
  let hotCategories: Category[] = [];
  let error: string | null = null;

  try {
    const supabase = await createClient();

    const { data: ptData } = await supabase
      .from("product_types")
      .select("id, name, description")
      .limit(10);
    productTypes = (ptData || []).map((pt: Record<string, unknown>) => ({ _id: pt.id, name: pt.name, description: pt.description } as unknown as ProductType));

    const { data: rootData } = await supabase
      .from("categories")
      .select("id, name, image, category_type, parent_id")
      .is("parent_id", null)
      .limit(15);
    rootCategories = (rootData || []).map((c: Record<string, unknown>) => ({ _id: c.id, name: c.name, image: c.image, categoryType: c.category_type } as unknown as Category));

    const { data: hotData } = await supabase
      .from("categories")
      .select("id, name, image, category_type")
      .eq("category_type", "Hot Categories")
      .limit(10);
    hotCategories = (hotData || []).map((c: Record<string, unknown>) => ({ _id: c.id, name: c.name, image: c.image, categoryType: c.category_type } as unknown as Category));
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred";
    console.error("Error fetching sidebar data:", error, err);
  }

  // Helper function to render a single category
  const renderCategory = (category: Category) => {
    return (
      <Link
        key={category._id}
        href={{
          pathname: "/shop",
          query: { category: category._id },
        }}
        className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-3 rounded-md hoverEffect"
      >
        {category.image && (
          <Image
            src={category.image}
            alt="categoryImage"
            width={50}
            height={50}
            className="w-7 h-7 object-contain"
          />
        )}
        <p className="font-medium">{category.name}</p>
      </Link>
    );
  };

  const renderProductType = (type: ProductType) => (
    <Link
      key={type._id}
      href={{
        pathname: "/shop",
        query: { productType: type.type },
      }}
      className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-3 rounded-md hoverEffect"
    >
      <div
        className="w-4 h-4 rounded-full border border-gray-200"
        style={{ backgroundColor: type.color || "#ccc" }}
      />
      <p className="font-medium">{type.name}</p>
    </Link>
  );

  // Content component to be reused in both Sidebar and Sheet
  const CategoriesContent = () => (
    <div className="min-w-80">
      {/* Product Types Section */}
      {productTypes.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-lg mb-3">Shop by Type</p>
          <div>{productTypes.map((type) => renderProductType(type))}</div>
        </div>
      )}

      {/* Root Categories Section */}
      {rootCategories.length > 0 && (
        <div className="mb-6 border-t border-gray-200 pt-6">
          <p className="font-semibold text-lg mb-3">Categories</p>
          <div>
            {rootCategories.map((category) => renderCategory(category))}
          </div>
        </div>
      )}

      {/* Hot Categories Section */}
      {hotCategories.length > 0 && (
        <div className="mb-6 border-t border-gray-200 pt-6">
          <p className="font-semibold text-lg mb-3">Hot Categories</p>
          <div>{hotCategories.map((category) => renderCategory(category))}</div>
        </div>
      )}

      {/* Quick Links Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="font-semibold text-lg mb-3">Quick Links</p>
        <div className="space-y-2">
          <Link
            href="/shop"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">🛍️</span>
            <p>All Products</p>
          </Link>
          <Link
            href="/new-arrivals"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">🆕</span>
            <p>New Arrivals</p>
          </Link>
          <Link
            href="/shop?priceRange=0-50"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">💰</span>
            <p>Under $50</p>
          </Link>
          <Link
            href="/user/orders"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">📦</span>
            <p>My Orders</p>
          </Link>
        </div>
      </div>

      {/* Customer Support Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="font-semibold text-lg mb-3">Customer Support</p>
        <div className="space-y-2">
          <Link
            href="/help"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">❓</span>
            <p>Help Center</p>
          </Link>
          <Link
            href="/help/shipping"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">🚚</span>
            <p>Shipping Info</p>
          </Link>
          <Link
            href="/help/returns"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">↩️</span>
            <p>Returns & Exchanges</p>
          </Link>
          <Link
            href="/help/contact"
            className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-sm"
          >
            <span className="text-primary">📞</span>
            <p>Contact Us</p>
          </Link>
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="font-semibold text-lg mb-3">Special Offers</p>
        <div className="bg-linear-to-r from-primary/10 to-primary/5 p-3 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary">🎉</span>
            <p className="font-medium text-sm">Free Shipping</p>
          </div>
          <p className="text-xs text-gray-600 mb-2">On orders over $75</p>
          <Link
            href="/shop"
            className="text-xs text-primary hover:underline font-medium"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* Age Groups Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="font-semibold text-lg mb-3">Shop by Age</p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/shop?search=newborn"
            className="flex flex-col items-center gap-1 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-xs"
          >
            <span className="text-lg">👶</span>
            <p>0-6 Months</p>
          </Link>
          <Link
            href="/shop?search=infant"
            className="flex flex-col items-center gap-1 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-xs"
          >
            <span className="text-lg">🍼</span>
            <p>6-12 Months</p>
          </Link>
          <Link
            href="/shop?search=toddler"
            className="flex flex-col items-center gap-1 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-xs"
          >
            <span className="text-lg">🚼</span>
            <p>1-2 Years</p>
          </Link>
          <Link
            href="/shop?search=kids"
            className="flex flex-col items-center gap-1 hover:text-primary hover:bg-primary/10 p-2 rounded-md hoverEffect text-xs"
          >
            <span className="text-lg">👧</span>
            <p>2+ Years</p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View - Sheet */}
      <div className="md:hidden w-full mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 bg-background p-3 rounded-md border text-babyshopDark hover:bg-gray-50 hoverEffect">
              <MenuIcon className="w-5 h-5" />
              <span className="font-medium">Shop by Category</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left">Categories</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <CategoriesContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View - Sidebar */}
      <div className="hidden md:flex flex-col bg-background h-full p-5 border rounded-md w-[300px] shrink-0">
        <CategoriesContent />
      </div>
    </>
  );
};

export default CategoriesSidebar;
