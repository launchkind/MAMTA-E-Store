import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number;
  numReviews?: number;
  className?: string;
  showReviewCount?: boolean;
  starSize?: number;
  textClassName?: string;
}

const ProductRating = ({
  rating,
  numReviews = 0,
  className,
  showReviewCount = true,
  starSize = 16,
  textClassName = "text-sm",
}: ProductRatingProps) => {
  const validRating = Number.isFinite(rating) ? rating : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const isFilled = i < Math.floor(validRating);
          const isHalfFilled =
            i === Math.floor(validRating) && validRating % 1 >= 0.5;

          return (
            <Star
              key={i}
              size={starSize}
              className={
                isFilled
                  ? "fill-primary text-primary"
                  : isHalfFilled
                    ? "fill-primary/50 text-primary"
                    : "text-muted-foreground/30"
              }
              fill={isFilled || isHalfFilled ? "currentColor" : "none"}
            />
          );
        })}
      </div>
      <span
        className={cn(
          "font-bold text-foreground bg-muted px-2 py-0.5 rounded-md",
          textClassName,
        )}
      >
        {validRating.toFixed(1)}
      </span>
      {showReviewCount && (
        <a
          href="#reviews"
          className={cn(
            "font-medium text-muted-foreground hover:text-primary transition-colors ml-1",
            textClassName,
          )}
        >
          ({numReviews} {numReviews === 1 ? "Review" : "Reviews"})
        </a>
      )}
    </div>
  );
};

export default ProductRating;
