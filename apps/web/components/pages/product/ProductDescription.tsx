"use client";
import React, { useState } from "react";
import { Product } from "@entry/types";
import { Package, Tag, Star, ChevronLeft, ChevronRight } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ProductDescriptionProps {
  product?: Product;
  onReviewSubmitted?: () => void;
}

const ProductDescription = ({
  product,
  onReviewSubmitted,
}: ProductDescriptionProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewsPerPage = 10;

  const brandName = product?.brand
    ? typeof product.brand === "object"
      ? product.brand.name
      : product.brand
    : null;

  // Get approved reviews
  const approvedReviews = product?.reviews?.filter((r) => r.isApproved) || [];
  const totalReviews = approvedReviews.length;

  // Handler for when review is submitted
  const handleReviewSubmitted = () => {
    setCurrentPage(1); // Reset to first page
    setShowReviewForm(false); // Close form
    onReviewSubmitted?.(); // Call parent callback
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;

  // Get sorted reviews and then paginate
  const sortedReviews = [...approvedReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const displayedReviews = sortedReviews.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate rating statistics
  const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
  approvedReviews.forEach((review) => {
    const rating = Number(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating - 1]++;
    }
  });

  const averageRating =
    totalReviews > 0
      ? approvedReviews.reduce(
          (sum, review) => sum + Number(review.rating),
          0,
        ) / totalReviews
      : 0;

  return (
    <div className="w-full space-y-8">
      {/* Description Section */}
      <section id="description" className="scroll-mt-20">
        <div className="bg-background border border-border/50 shadow-sm rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Package className="text-primary" size={24} />
            </div>
            Product Description
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/85 leading-relaxed text-base">
              {product?.description ||
                "No description available for this product."}
            </p>
          </div>

          {/* Key Features */}
          <div className="mt-8 p-6 bg-muted/40 rounded-xl border border-border/40">
            <h3 className="font-semibold text-foreground mb-4 text-base flex items-center gap-2">
              <Star size={16} className="text-primary" />
              Key Features
            </h3>
            <ul className="space-y-4 text-foreground/80">
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  High-quality materials ensuring durability and safety
                </span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Easy to clean and maintain</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Suitable for babies and toddlers</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Meets all safety standards and regulations</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specifications" className="scroll-mt-20">
        <div className="bg-background border border-border/50 shadow-sm rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Tag className="text-primary" size={24} />
            </div>
            Product Specifications
          </h2>
          <div className="bg-muted/30 rounded-xl border border-border/50 overflow-hidden">
            <div className="divide-y divide-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground mb-1 md:mb-0">
                  Product Name
                </span>
                <span className="text-foreground/80">
                  {product?.name || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground mb-1 md:mb-0">
                  Price
                </span>
                <span className="text-foreground font-semibold text-lg">
                  ${product?.price || "N/A"}
                </span>
              </div>
              {product?.originalPrice && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-foreground mb-1 md:mb-0">
                    Original Price
                  </span>
                  <span className="text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                </div>
              )}
              {product?.discountPercentage && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-foreground mb-1 md:mb-0">
                    Discount
                  </span>
                  <span className="text-primary font-bold">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                <span className="font-medium text-foreground mb-1 md:mb-0">
                  Stock Status
                </span>
                <span
                  className={`font-medium ${product?.stock && product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {product?.stock && product.stock > 0
                    ? `In Stock (${product.stock} available)`
                    : "Out of Stock"}
                </span>
              </div>
              {product?.category && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-foreground mb-1 md:mb-0">
                    Category
                  </span>
                  <span className="text-foreground/80">
                    {product.category.name}
                  </span>
                </div>
              )}
              {brandName && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-foreground mb-1 md:mb-0">
                    Brand
                  </span>
                  <span className="text-foreground/80">{brandName}</span>
                </div>
              )}
              {product?.averageRating !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 p-5 hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-foreground mb-1 md:mb-0">
                    Average Rating
                  </span>
                  <span className="text-foreground/80 flex items-center gap-1.5 font-medium">
                    {product.averageRating.toFixed(1)}{" "}
                    <Star
                      size={16}
                      className="text-primary"
                      fill="currentColor"
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="scroll-mt-20">
        <div className="bg-background border border-border/50 shadow-sm rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Star className="text-primary" size={24} />
            </div>
            Customer Reviews ({totalReviews})
          </h2>

          {/* Rating Statistics */}
          {totalReviews > 0 && (
            <div className="bg-muted/30 border border-border/50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Average Rating */}
                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl border border-border/30 shadow-sm">
                  <div className="text-6xl font-extrabold text-foreground mb-3">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={22}
                        className={
                          i < Math.round(averageRating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Based on {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-3 flex flex-col justify-center">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingCounts[rating - 1];
                    const percentage =
                      totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground w-12 flex items-center gap-1">
                          {rating}{" "}
                          <Star size={12} className="fill-foreground" />
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Approved Reviews */}
          {displayedReviews.length > 0 ? (
            <>
              <div className="space-y-5 mb-8">
                {displayedReviews.map((review) => (
                  <div
                    key={review._id}
                    className="bg-background rounded-xl border border-border/50 p-6 hover:shadow-md transition-shadow hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base">
                              {review.userName}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < Number(review.rating)
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground/30"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                        {new Date(review.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <p className="text-foreground/85 leading-relaxed pl-12 text-sm sm:text-base">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-8">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="border-muted-foreground/30 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === "..." ? (
                        <span className="px-2 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className={`min-w-9 ${
                            currentPage === page
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                          }`}
                        >
                          {page}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-muted-foreground/30 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-muted rounded-lg border border-muted-foreground/20 p-8 text-center mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center text-muted-foreground">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} />
                  ))}
                </div>
                <p className="text-foreground/70">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            </div>
          )}

          {/* Review Actions & Form Sheet */}
          <div className="border-t border-border/50 pt-8 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Write a Review
              </h3>
              <p className="text-sm text-muted-foreground mr-4">
                Share your thoughts with other customers
              </p>
            </div>

            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary hover:bg-primary/90 shadow-md font-semibold whitespace-nowrap"
              size="lg"
            >
              <Star size={18} className="mr-2" />
              Add Review
            </Button>

            <Sheet open={showReviewForm} onOpenChange={setShowReviewForm}>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl font-bold">
                    Write a Review
                  </SheetTitle>
                  <SheetDescription>
                    Share your experience with <strong>{product?.name}</strong>.
                  </SheetDescription>
                </SheetHeader>

                <div className="py-2">
                  <ReviewForm
                    productId={product?._id || ""}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDescription;
