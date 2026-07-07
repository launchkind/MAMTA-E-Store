"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@entry/types";
import ProductCard from "@/components/common/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Star, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
  total: number;
}

const ComfyApparelSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
          .order("created_at", { ascending: false })
          .limit(8);
        setProducts((data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id } as unknown as Product)));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background p-5 mt-5 rounded-md border">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-pink-500" />
            <Badge variant="outline" className="text-pink-500 border-pink-500">
              Trendy & Comfortable
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Comfy & Cute Apparel
          </h2>
          <p className="text-gray-600">
            Adorable outfits that keep your little one comfortable all day
          </p>
        </div>
        <Link href="/shop?category=apparel">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-colors"
          >
            Shop All Items
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <>
            {/* Placeholder products when no apparel products found */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-pink-50 rounded-lg p-4 mb-4">
                  <Shirt className="w-8 h-8 text-pink-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Baby Onesies</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Soft and comfortable onesies for everyday wear
                </p>
                <Link href="/shop?search=onesie">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <Star className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cute Dresses</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Adorable dresses for special occasions
                </p>
                <Link href="/shop?search=dress">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Baby Rompers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Stylish rompers for active little ones
                </p>
                <Link href="/shop?search=romper">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <Shirt className="w-8 h-8 text-green-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Baby Pants</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Comfortable pants for crawling and playing
                </p>
                <Link href="/shop?search=pants">
                  <Button className="w-full bg-pink-500 hover:bg-pink-600">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Promotional Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-linear-to-r from-pink-400 to-rose-400 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Baby Sleep Essentials</h3>
            <p className="text-pink-100 mb-4">
              Cozy pajamas and sleepwear for peaceful nights
            </p>
            <Link href="/shop?search=sleepwear">
              <Button
                variant="outline"
                className="bg-white text-pink-500 border-white hover:bg-pink-50"
              >
                Shop Sleepwear
              </Button>
            </Link>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
        </div>

        <div className="bg-linear-to-r from-orange-400 to-yellow-400 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Summer Collection</h3>
            <p className="text-orange-100 mb-4">
              Light and breathable outfits for warm weather
            </p>
            <Link href="/shop?search=summer">
              <Button
                variant="outline"
                className="bg-white text-orange-500 border-white hover:bg-orange-50"
              >
                Shop Summer
              </Button>
            </Link>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
        </div>
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/shop?category=apparel">
          <Button className="w-full bg-pink-500 hover:bg-pink-600">
            Shop All Apparel
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ComfyApparelSection;
