import { payment } from "@/assets/image";
import BackToHome from "@/components/common/buttons/BackToHome";
import Container from "@/components/common/Container";
import ProductDescriptionClient from "@/components/pages/product/ProductDescriptionClient";
import ProductActions from "@/components/pages/product/ProductActions";
import ProductDetailsClient from "@/components/pages/product/ProductDetailsClient";
import ProductImageGallery from "@/components/pages/product/ProductImageGallery";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/productHelpers";
import { Product } from "@entry/types";
import { Box, Truck } from "lucide-react";
import Image from "next/image";
import React from "react";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import ProductCard from "@/components/common/products/ProductCard";

const ProductDetails = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  // Fetch product with revalidation to enable static generation while keeping data fresh
  let product: Product | null = null;

  try {
    const supabase = await createClient();
    const query = supabase
      .from("products")
      .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name), variants:product_variants(id, color, storage, price, stock, images, sku, is_default), reviews:product_reviews(id, user_name, rating, comment, is_approved, created_at)");

    const { data } = isValidUUID(id)
      ? await query.or(`id.eq.${id},slug.eq.${id}`).single()
      : await query.eq("slug", id).single();

    if (data) {
      const rawVariants = (data.variants ?? []) as Array<Record<string, unknown>>;
      const variants = rawVariants
        .map((v) => ({
          _id: v.id as string,
          productId: data.id as string,
          color: (v.color as string) ?? undefined,
          storage: (v.storage as string) ?? undefined,
          price: (v.price as number | null) ?? undefined,
          stock: (v.stock as number) ?? 0,
          images: (v.images as string[]) ?? [],
          sku: (v.sku as string) ?? undefined,
          isDefault: (v.is_default as boolean) ?? false,
        }))
        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
      const rawReviews = (data.reviews ?? []) as Array<Record<string, unknown>>;
      const reviews = rawReviews.map((r) => ({
        _id: r.id as string,
        userName: r.user_name as string,
        rating: r.rating as number,
        comment: r.comment as string,
        isApproved: r.is_approved as boolean,
        createdAt: r.created_at as string,
      }));
      product = {
        ...data,
        _id: data.id,
        discountPercentage: data.discount_percentage,
        averageRating: data.average_rating,
        variants,
        reviews,
      } as unknown as Product;
    }
  } catch (error) {
    console.error("Error fetching product during build:", error);
    return (
      <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
        <h2 className="text-lg">
          No products found with <span className=" font-medium">#id</span>{" "}
          <span className="font-semibold text-primary underline">{id}</span>
        </h2>
        <BackToHome />
      </div>
    );
  }

  if (product && product.slug && isValidUUID(id)) {
    redirect(`/product/${product.slug}`);
  }

  // Fetch related products from the same category
  let relatedProducts: Product[] = [];
  if (product?.category?._id) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("products")
        .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
        .eq("category_id", product.category._id)
        .neq("id", product._id)
        .limit(4);
      relatedProducts = (data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id, discountPercentage: p.discount_percentage, averageRating: p.average_rating } as unknown as Product));
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  }

  const discountedPrice = product?.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : product?.price;

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col gap-2 items-center justify-center p-10">
        <h2 className="text-lg">
          No products found with <span className=" font-medium">#id</span>{" "}
          <span className="font-semibold text-primary underline">{id}</span>
        </h2>
        <BackToHome />
      </div>
    );
  }

  return (
    <div className="bg-muted min-h-screen pb-10">
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="pt-5 pb-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product?.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/shop?category=${product.category._id}`}>
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {product?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Main Product Section */}
        <div className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Gallery */}
            <ProductImageGallery
              images={
                product?.images && product.images.length > 0
                  ? product.images
                  : [product?.image]
              }
              productName={product?.name}
              discountPercentage={product?.discountPercentage}
              stock={product?.stock}
            />

            {/* Product Details */}
            <div className="flex flex-col gap-6">
              {/* Product Actions (Name, Wishlist, Quantity, Add to Cart) */}
              <ProductActions product={product} />

              {/* Client-side Product Details Component */}
              <ProductDetailsClient
                product={product}
                discountedPrice={discountedPrice}
              />

              {/* Delivery Information */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Truck className="text-primary mt-0.5" size={24} />
                  <div>
                    <p className="font-medium text-foreground">
                      Estimated Delivery
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(
                        Date.now() + 14 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Box className="text-primary mt-0.5" size={24} />
                  <div>
                    <p className="font-medium text-foreground">
                      Free Shipping & Returns
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      On all orders over $200.00
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Badge */}
              <div className="bg-muted flex flex-col items-center justify-center p-6 rounded-lg border border-muted-foreground/20">
                <Image
                  src={payment}
                  alt="paymentImage"
                  className="w-72 sm:w-80 mb-2"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Guaranteed safe & secure checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Tabs */}
        <div className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10 mt-6">
          <ProductDescriptionClient initialProduct={product} />
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-6">
            <div className="bg-background shadow-lg shadow-foreground/5 border border-muted-foreground/20 rounded-2xl p-6 md:p-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetails;
