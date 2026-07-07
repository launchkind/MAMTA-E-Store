import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse bg-background border border-muted-foreground/20 rounded-md overflow-hidden shadow-sm">
      {/* Image skeleton */}
      <div className="relative bg-gray-200 aspect-square">
        <div className="absolute top-2 left-2 w-12 h-6 bg-gray-300 rounded-full"></div>
        <div className="absolute top-2 right-2 w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

      <hr />

      {/* Content skeleton */}
      <div className="px-4 py-2 space-y-1">
        {/* Category skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>

        {/* Title skeleton */}
        <div className="space-y-1 h-10">
          <div className="h-3.5 bg-gray-200 rounded w-full"></div>
          <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Price skeleton */}
        <div className="flex items-center gap-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-9 bg-gray-200 rounded-full w-full"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
