"use client";

import { Category } from "@entry/types";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedCategoriesCarouselProps {
  categories: Category[];
}

const FeaturedCategoriesCarousel = ({
  categories,
}: FeaturedCategoriesCarouselProps) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full border-0"
      >
        <div className="p-5">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Featured Categories
          </h2>
        </div>

        <div className="px-5 sm:px-12 py-6 pb-10 relative">
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category) => (
              <CarouselItem
                key={category._id}
                className="pl-2 md:pl-4 basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
              >
                <Link
                  href={`/shop?category=${category.slug || category._id}`}
                  className="group"
                >
                  <div className="flex flex-col items-center gap-3 hoverEffect">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-border flex items-center justify-center overflow-hidden hover:border-accent bg-primary-foreground hoverEffect">
                      {category.image || category.iconImage ? (
                        <Image
                          src={category.image || category.iconImage}
                          alt={category.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-110 hoverEffect"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl font-bold text-muted-foreground group-hover:scale-110 hoverEffect">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center text-foreground group-hover:text-accent hoverEffect">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          {categories.length > 2 && (
            <>
              <CarouselPrevious className="flex left-0 sm:left-2" />
              <CarouselNext className="flex right-0 sm:right-2" />
            </>
          )}
        </div>
      </Carousel>
    </div>
  );
};

export default FeaturedCategoriesCarousel;
