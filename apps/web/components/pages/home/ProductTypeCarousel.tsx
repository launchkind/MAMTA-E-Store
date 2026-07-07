"use client";

import { Product } from "@entry/types";
import ProductCard from "../../common/products/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductTypeCarouselProps {
  products: Product[];
  rows?: number;
  navigationPosition?: "sides" | "bottom" | "responsive";
}

const ProductTypeCarousel = ({
  products,
  rows = 1,
  navigationPosition = "sides",
}: ProductTypeCarouselProps) => {
  const groupedProducts = [];
  for (let i = 0; i < products.length; i += rows) {
    groupedProducts.push(products.slice(i, i + rows));
  }

  return (
    <div
      className={`relative w-full ${
        navigationPosition === "bottom"
          ? "pb-16 pt-4"
          : navigationPosition === "responsive"
            ? "pb-16 lg:pb-0 py-4 lg:py-10"
            : "py-10"
      }`}
    >
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="">
          {groupedProducts.map((group, index) => (
            <CarouselItem
              key={index}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
            >
              <div className="w-full flex flex-col gap-4">
                {group.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {navigationPosition === "sides" ? (
          <>
            <CarouselPrevious className="-left-4 hidden md:flex" />
            <CarouselNext className="-right-4 hidden md:flex" />
          </>
        ) : navigationPosition === "responsive" ? (
          <>
            <div className="hidden lg:block">
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </div>
            <div className="lg:hidden absolute -bottom-12 left-0 right-0 flex justify-center items-center gap-3">
              <CarouselPrevious className="static translate-y-0 translate-x-0 mt-0" />
              <CarouselNext className="static translate-y-0 translate-x-0 mt-0" />
            </div>
          </>
        ) : (
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center items-center gap-3">
            <CarouselPrevious className="static translate-y-0 translate-x-0 mt-0" />
            <CarouselNext className="static translate-y-0 translate-x-0 mt-0" />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default ProductTypeCarousel;
