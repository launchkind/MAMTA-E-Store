"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@entry/types";
import ProductDescription from "./ProductDescription";
import { createClient } from "@/lib/supabase/client";

interface ProductDescriptionClientProps {
  initialProduct: Product;
}

const ProductDescriptionClient: React.FC<ProductDescriptionClientProps> = ({
  initialProduct,
}) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh product data
  const refreshProduct = async () => {
    if (!initialProduct._id) return;

    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name), reviews:product_reviews(id, user_name, rating, comment, is_approved, created_at)")
        .eq("id", initialProduct._id)
        .single();
      if (data) {
        const rawReviews = (data.reviews ?? []) as Array<Record<string, unknown>>;
        const reviews = rawReviews.map((r) => ({
          _id: r.id as string,
          userName: r.user_name as string,
          rating: r.rating as number,
          comment: r.comment as string,
          isApproved: r.is_approved as boolean,
          createdAt: r.created_at as string,
        }));
        setProduct({ ...data, _id: data.id, discountPercentage: data.discount_percentage, averageRating: data.average_rating, reviews } as unknown as Product);
      }
    } catch (error) {
      console.error("Failed to refresh product:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update product when initialProduct changes (page navigation)
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  return (
    <>
      {isRefreshing && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
          Refreshing product data...
        </div>
      )}
      <ProductDescription
        product={product}
        onReviewSubmitted={refreshProduct}
      />
    </>
  );
};

export default ProductDescriptionClient;
