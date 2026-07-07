"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";

export interface Banner {
  _id: string;
  name: string;
  title: string;
  startFrom: number;
  image: string;
  bannerType: string;
  sale?: string;
  value?: string;
  weight?: number;
}

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md bg-gray-100 group">
      <AnimatePresence mode="popLayout">
        {banners.map(
          (banner, index) =>
            index === currentIndex && (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={banner.image}
                  alt={banner.name}
                  fill
                  priority={index === 0}
                  className="object-cover w-full h-full rounded-md"
                />
                {/* Overlay Content */}
                {/* <div className="absolute inset-0 bg-black/20" /> */}

                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-10 md:px-16 z-20">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4 items-start max-w-lg"
                  >
                    <motion.p
                      variants={itemVariants}
                      className="font-semibold text-base tracking-wide uppercase text-accent"
                    >
                      {banner.name}
                    </motion.p>

                    <motion.h2
                      variants={itemVariants}
                      className="text-4xl md:text-5xl font-bold capitalize leading-tight line-clamp-2"
                    >
                      {banner.title}
                    </motion.h2>

                    {banner.sale || banner.value ? (
                      <motion.div
                        variants={itemVariants}
                        className="flex flex-row items-center gap-2 font-medium text-lg"
                      >
                        {banner.sale && <span>{banner.sale}</span>}
                        {banner.value && (
                          <span className="font-bold text-xl">
                            {banner.value}
                          </span>
                        )}
                      </motion.div>
                    ) : (
                      banner.startFrom > 0 && (
                        <motion.p
                          variants={itemVariants}
                          className="font-medium text-lg"
                        >
                          Starting from{" "}
                          <span className="font-bold text-xl">
                            ${banner.startFrom}
                          </span>
                        </motion.p>
                      )
                    )}

                    <motion.div variants={itemVariants}>
                      <Link
                        href={"/shop"}
                        className="mt-4 bg-accent-foreground text-black rounded-lg px-8 py-3 border border-transparent hover:border-accent font-semibold hover:bg-accent hover:text-accent-foreground inline-block hoverEffect"
                      >
                        Shop Now
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute left-10 md:left-16 bottom-10 z-30 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 border border-white/50",
              currentIndex === index
                ? "bg-background w-8"
                : "bg-white/40 hover:bg-white/70",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
