import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image = "/og-image.jpg",
  url,
  type = "website",
  noIndex = false,
}: SEOProps): Metadata {
  const baseUrl = "https://entry.reactbd.com";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: [...keywords, "ecommerce", "entry ecommerce", "online shopping"],
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "Entry Ecommerce Platform",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
      creator: "@entryecommerce",
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

// Product SEO generator
export function generateProductSEO(product: {
  name: string;
  description: string;
  price: number;
  images?: string[];
  category?: string;
  brand?: string;
  slug: string;
}): Metadata {
  const keywords = [
    product.name,
    product.category || "",
    product.brand || "",
    "baby product",
    "buy online",
  ].filter(Boolean);

  return generateSEO({
    title: `${product.name} - Buy Online at Best Price`,
    description: `${product.description.substring(0, 155)}... Only ₹${product.price}. Fast delivery. Shop now!`,
    keywords,
    image: product.images?.[0] || "/og-image.jpg",
    url: `/product/${product.slug}`,
    type: "website",
  });
}

// Category SEO generator
export function generateCategorySEO(category: {
  name: string;
  description?: string;
  slug: string;
}): Metadata {
  return generateSEO({
    title: `${category.name} - Shop Baby ${category.name} Online`,
    description:
      category.description ||
      `Browse our collection of ${category.name.toLowerCase()} for babies. Premium quality products with fast delivery.`,
    keywords: [
      category.name,
      `baby ${category.name.toLowerCase()}`,
      "online shopping",
    ],
    url: `/shop?category=${category.slug}`,
  });
}
