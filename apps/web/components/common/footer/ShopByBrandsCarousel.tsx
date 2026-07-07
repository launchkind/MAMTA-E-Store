"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "../Container";
import { Title } from "../text";
import { cn } from "@/lib/utils";

interface Brand {
  _id: string;
  name: string;
  image: string;
}

interface ShopByBrandsCarouselProps {
  brands: Brand[];
}

export default function ShopByBrandsCarousel({
  brands,
}: ShopByBrandsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      // Use > 1 to avoid fractional pixel issues on some screens where it technically isn't 0.00
      setCanScrollLeft(scrollLeft > 1);
      // Ensure we ceil the right bounds to account for floating point errors
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    // Initial check after mount
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [brands]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Scroll by approximately one item width * 2 for a good jump
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      // Force an immediate check just in case onScroll is sluggish
      setTimeout(checkScroll, 100);
      setTimeout(checkScroll, 300);
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className="w-full bg-white border-b py-10">
      <Container>
        <div className="px-4 md:px-0 relative group">
          <div className="flex items-center justify-between mb-8">
            <Title className="text-xl font-bold">Shop By Brands</Title>
            {brands.length > 7 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "size-8 rounded-full",
                    !canScrollLeft &&
                      "border-gray-300 text-gray-300 cursor-not-allowed",
                  )}
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft
                    className={cn(!canScrollLeft && "text-gray-300")}
                  />
                  <span className="sr-only">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "size-8 rounded-full",
                    !canScrollRight &&
                      "border-gray-300 text-gray-300 cursor-not-allowed",
                  )}
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                >
                  <ChevronRight
                    className={cn(!canScrollRight && "text-gray-300")}
                  />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            )}
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex flex-nowrap gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="snap-start min-w-0 shrink-0 grow-0 w-[45%] sm:w-[30%] md:w-[22%] lg:w-[calc(14.2857%-1rem)]"
              >
                <Link href={`/shop?brand=${brand._id}`}>
                  <div className="flex flex-col items-center gap-3 hoverEffect">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-border bg-background flex items-center justify-center overflow-hidden hover:border-primary hoverEffect p-4">
                      {brand.image ? (
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-400 text-center">
                          {brand.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center text-foreground hover:text-accent transition-colors">
                      {brand.name}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
