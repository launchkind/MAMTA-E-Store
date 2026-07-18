"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { adsBannerImage } from "@/assets/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdsBanner {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  image: string;
  link?: string;
  bannerType: string;
  endTime?: string;
}

interface AdsSideBannerProps {
  className?: string;
}

const AdsSideBanner = ({ className }: AdsSideBannerProps) => {
  const [banner, setBanner] = useState<AdsBanner | null>(null);
  const [loading, setLoading] = useState(true);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch banner data from Supabase
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const { data } = await client
          .from("ads_banners")
          .select("id, title, image, link, position, end_time")
          .eq("is_active", true)
          .eq("position", "sidebar")
          .order("sort_order")
          .limit(1)
          .single();

        if (data) {
          setBanner({
            _id: data.id,
            name: data.title ?? "Special Offer",
            title: data.title ?? undefined,
            image: data.image,
            link: data.link ?? undefined,
            bannerType: "offer",
            endTime: data.end_time ?? undefined,
          });
        }
      } catch {
        // silent fail — fallback content is shown below
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  // Live countdown to the admin-set end time (falls back to 237 days from now if unset)
  useEffect(() => {
    if (loading) return;

    const targetDate = banner?.endTime
      ? new Date(banner.endTime)
      : new Date(Date.now() + 237 * 24 * 60 * 60 * 1000);

    const updateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [loading, banner?.endTime]);

  if (loading) {
    return (
      <div
        className={cn(
          "w-full h-full rounded-md mt-5 overflow-hidden",
          className,
        )}
      >
        <Skeleton className="w-full h-full bg-pink-100/50" />
      </div>
    );
  }

  // Fallback content if API fails or returns empty
  const bannerTitle = banner?.title || "Cyber Sale";
  const bannerDesc =
    banner?.description || "20% Off when buying and paying online";
  const bannerLink = banner?.link || "/shop";
  const bannerImage = banner?.image || adsBannerImage;

  return (
    <div
      className={cn(
        "relative w-full h-[400px] rounded-lg border overflow-hidden bg-[#fae2e4] flex flex-col items-center justify-start pt-10 group",
        className,
      )}
    >
      {/* Dynamic API Content Headers */}
      <div className="z-10 text-center px-4 mb-6">
        <h3 className="text-3xl font-bold text-foreground mb-2">
          {bannerTitle}
        </h3>
        <p className="text-sm font-medium text-muted-foreground">
          {bannerDesc}
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="z-10 flex gap-2 sm:gap-4 justify-center items-center mb-10 w-full px-4">
        <TimeBlock value={timeLeft.days} label="DAYS" />
        <TimeBlock value={timeLeft.hours} label="HRS" />
        <TimeBlock value={timeLeft.minutes} label="MINS" />
        <TimeBlock value={timeLeft.seconds} label="SECS" />
      </div>

      {/* Banner Image Background & Clickable Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 select-none pointer-events-none">
        <Image
          src={bannerImage}
          alt={bannerTitle}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-contain object-bottom"
          priority
        />
      </div>

      <div className="absolute bottom-8 z-20 w-full flex justify-center translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <Link
          href={bannerLink}
          className="bg-background text-foreground font-semibold px-8 py-3 rounded-md shadow-sm hover:shadow-md transition-shadow active:scale-95"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
};

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center gap-2">
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
      <span className="text-primary-foreground text-lg sm:text-xl font-bold tracking-wider">
        {value.toString().padStart(2, "0")}
      </span>
    </div>
    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground mb-1">
      {label}
    </span>
  </div>
);

export default AdsSideBanner;
