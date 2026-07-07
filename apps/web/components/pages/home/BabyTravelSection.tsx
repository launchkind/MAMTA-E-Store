"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@entry/types";
import ProductCard from "@/components/common/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
  total: number;
}

const BabyTravelSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
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
            <Plane className="w-5 h-5 text-primary" />
            <Badge
              variant="outline"
              className="text-primary border-primary"
            >
              Travel Ready
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Baby Travel Essentials
          </h2>
          <p className="text-gray-600">
            Everything you need for safe and comfortable travels with your
            little one
          </p>
        </div>
        <Link href="/shop?category=travel">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            Shop All Items
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.length > 0 ? (
          products
            .slice(0, 8)
            .map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
        ) : (
          <>
            {/* Placeholder products when no travel products found */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <Plane className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Travel Strollers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Lightweight and compact strollers perfect for travel
                </p>
                <Link href="/shop?search=stroller">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <MapPin className="w-8 h-8 text-green-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Car Seats</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Safe and secure car seats for every journey
                </p>
                <Link href="/shop?search=car seat">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <Plane className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Travel Bags</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Organized storage for all your baby&apos;s travel needs
                </p>
                <Link href="/shop?search=diaper bag">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-orange-50 rounded-lg p-4 mb-4">
                  <MapPin className="w-8 h-8 text-orange-600 mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Baby Carriers</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Comfortable carriers for hands-free travel
                </p>
                <Link href="/shop?search=carrier">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Promotional Banner */}
      <div className="bg-linear-to-r from-primary to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Travel Smart</h3>
            <p className="text-blue-100">
              Discover our curated collection of travel essentials for
              stress-free adventures
            </p>
          </div>
          <Link href="/shop?category=travel">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-primary border-white hover:bg-gray-100"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/shop?category=travel">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Shop All Travel Items
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BabyTravelSection;
