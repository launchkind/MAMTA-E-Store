import React from "react";

const ShopSkeleton = () => {
  // Create an array of skeleton cards matching the product card design
  const skeletonCards = Array.from({ length: 8 }).map((_, index) => (
    <div
      key={index}
      className="animate-pulse bg-background border border-muted-foreground/20 rounded-lg overflow-hidden shadow-sm"
    >
      {/* Image skeleton */}
      <div className="relative bg-gray-200 aspect-square">
        <div className="absolute top-2 left-2 w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-3 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Category/Brand skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>

        {/* Price skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded"></div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="h-9 bg-gray-200 rounded-full w-full"></div>
      </div>
    </div>
  ));

  return (
    <div className="w-full space-y-6">
      {/* Filter skeleton */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-muted-foreground/20">
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse ml-auto"></div>
      </div>

      {/* Products grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {skeletonCards}
      </div>
    </div>
  );
};

export default ShopSkeleton;
