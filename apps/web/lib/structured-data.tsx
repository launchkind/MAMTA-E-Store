// Structured data for SEO (JSON-LD)

export interface Product {
  name: string;
  description: string;
  price: number;
  images?: string[];
  brand?: string;
  sku?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  rating?: number;
  reviewCount?: number;
}

export function generateProductSchema(product: Product, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images || [],
    sku: product.sku || "",
    brand: {
      "@type": "Brand",
      name: product.brand || "Entry",
    },
    offers: {
      "@type": "Offer",
      url: `http://entry.reactbd.com${url}`,
      priceCurrency: "USD",
      price: product.price,
      availability: `https://schema.org/${product.availability || "InStock"}`,
      seller: {
        "@type": "Organization",
        name: "Entry Ecommerce Platform",
      },
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 0,
        }
      : undefined,
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Entry Ecommerce Platform",
    url: "http://entry.reactbd.com",
    logo: "http://entry.reactbd.com/logo.png",
    description:
      "Entry Ecommerce Platform — your all-in-one online shopping destination",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@entry.reactbd.com",
    },
    sameAs: [
      "https://www.facebook.com/entryecommerce",
      "https://www.instagram.com/entryecommerce",
      "https://twitter.com/entryecommerce",
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Entry Ecommerce Platform",
    url: "http://entry.reactbd.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "http://entry.reactbd.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `http://entry.reactbd.com${item.url}`,
    })),
  };
}

// Helper component to inject JSON-LD
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
