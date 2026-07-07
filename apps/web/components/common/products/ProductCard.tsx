import { Product } from "@entry/types";
import Image from "next/image";
import Link from "next/link";
import PriceContainer from "../PriceContainer";
import DiscountBadge from "../DiscountBadge";
import ProductRating from "@/components/common/products/ProductRating";
import ProductCardActions from "./ProductCardActions";
import ProductCardAddToCart from "./ProductCardAddToCart";
import { getProductUrl } from "@/lib/productHelpers";
import { cn } from "@/lib/utils";

const ProductCard = ({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "group relative w-full rounded-md border border-border bg-card overflow-hidden transition-all duration-300",
        className,
      )}
    >
      {/* Image */}
      <div className="relative block overflow-hidden rounded-t-md">
        <Link href={getProductUrl(product)}>
          <Image
            src={product?.images?.[0] || product?.image}
            width={500}
            height={500}
            alt={product?.name}
            className="h-[250px] w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
        </Link>

        <DiscountBadge
          discountPercentage={product?.discountPercentage}
          className="absolute left-3 top-3 z-10"
        />

        {/* Action buttons — visible on hover via CSS */}
        <ProductCardActions product={product} />
      </div>

      {/* Body */}
      <div className="px-4 py-2 flex flex-col gap-1">
        <ProductRating
          rating={product?.averageRating || product?.rating || 0}
          numReviews={product?.numReviews}
          showReviewCount={false}
          starSize={14}
          textClassName="text-xs"
          className="mb-0.5"
        />
        <Link
          href={getProductUrl(product)}
          className="line-clamp-2 h-10 text-sm font-medium text-foreground transition-colors hover:text-accent leading-tight"
        >
          {product?.name}
        </Link>

        {/* Price (shown by default) / Add to cart (shown on hover) */}
        <div className="relative h-7 overflow-hidden">
          {/* Price — slides out right on hover */}
          <div className="absolute inset-0 flex items-center transition-all duration-200 ease-in group-hover:opacity-0 group-hover:translate-x-[70%]">
            <PriceContainer
              price={product?.price}
              discountPercentage={product?.discountPercentage}
            />
          </div>

          {/* Add to cart — slides in from left on hover */}
          <div className="absolute inset-0 flex items-center opacity-0 -translate-x-[70%] transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0">
            <ProductCardAddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
