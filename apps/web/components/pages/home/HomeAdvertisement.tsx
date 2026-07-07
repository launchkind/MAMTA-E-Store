"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AdsSideBanner from "./AdsSideBanner";
import { supabase } from "@/lib/supabase";

interface AdsBanner {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
}

const HomeAdvertisement = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<AdsBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ads_banners")
      .select("id, title, image, link")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setBanners(data ?? []);
        setIsLoading(false);
      });
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="w-full bg-gray-200 rounded-lg h-[400px] md:h-[500px] animate-pulse mt-3" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="w-full mt-3 flex flex-col lg:flex-row items-stretch gap-4">
      <div className="relative group flex-1 lg:w-8/12 rounded-lg overflow-hidden border">
        <div className="relative w-full h-[400px] overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-500 flex flex-col md:flex-row ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Text Content */}
              <div className="absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-8 md:py-0 z-10 bg-muted/90 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
                <div className="flex flex-col gap-2 md:gap-4 items-start max-w-sm pointer-events-auto">
                  {banner.title && (
                    <h2 className="text-3xl font-bold text-foreground leading-tight">
                      {banner.title}
                    </h2>
                  )}
                  <Link
                    href={banner.link ?? "/shop"}
                    className="mt-2 md:mt-4 bg-transparent text-foreground border border-primary hover:bg-primary hover:text-primary-foreground px-6 py-2.5 min-w-[140px] text-center rounded-md font-semibold transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="absolute inset-y-0 right-0 w-full md:w-1/2 h-full">
                <Image
                  src={banner.image}
                  alt={banner.title ?? `Advertisement ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-8 left-8 md:left-16 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 border border-muted-foreground/30 ${
                  index === currentSlide
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-4/12 min-w-[320px]">
        <AdsSideBanner />
      </div>
    </div>
  );
};

export default HomeAdvertisement;
