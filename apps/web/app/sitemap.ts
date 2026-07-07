import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "http://entry.reactbd.com";
  const currentDate = new Date();

  // Static pages
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/account",
    "/help",
    "/privacy",
    "/terms",
    "/returns",
    "/track-order",
    "/testimonials",
    "/wishlist",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic product pages (you can fetch from API in production)
  // Example structure - you should fetch real product slugs from your API
  const productRoutes: { slug: string; lastModified: Date }[] = [
    // { slug: 'baby-stroller-deluxe', lastModified: new Date('2025-01-15') },
    // Add more products dynamically from API
  ];

  const formattedProductRoutes = productRoutes.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.lastModified,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...formattedProductRoutes];
}
