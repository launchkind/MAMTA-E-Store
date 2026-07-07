import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default async function FeaturedOffers() {
  const { data: rows } = await supabase
    .from("product_banners")
    .select("id, title, image, link, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const banners = rows ?? [];

  if (!banners.length) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="flex justify-between items-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Our Featured Offers
        </h2>
        <Link
          href="/shop"
          className="text-sm font-semibold hover:underline flex items-center gap-1 underline-offset-4"
        >
          View More
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {banners.map((banner) => (
          <div key={banner.id} className="flex flex-col items-center text-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-full flex items-center justify-center mb-6 relative overflow-hidden group">
              <Image
                src={banner.image}
                alt={banner.title ?? "Featured offer"}
                fill
                className="object-cover group-hover:scale-105 hoverEffect"
                sizes="(max-width: 768px) 192px, 240px"
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-3 leading-snug">
              {banner.title}
            </h3>
            {banner.link && (
              <Link
                href={banner.link}
                className="mt-auto px-6 py-2.5 border border-border rounded-sm hover:bg-black hover:text-white text-sm font-medium hoverEffect"
              >
                Shop Now
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
