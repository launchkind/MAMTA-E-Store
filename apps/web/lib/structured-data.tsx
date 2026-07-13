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
      name: product.brand || "Mamta E-Store",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.mamtaestore.in${url}`,
      priceCurrency: "INR",
      price: product.price,
      availability: `https://schema.org/${product.availability || "InStock"}`,
      seller: {
        "@type": "Organization",
        name: "Mamta E-Store",
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
    name: "Mamta E-Store",
    url: "https://www.mamtaestore.in",
    logo: "https://www.mamtaestore.in/logo.png",
    description:
      "Mamta E-Store — your one-stop online electronics shopping destination",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "mamtaestore@gmail.com",
    },
    sameAs: [
      "https://www.facebook.com/share/1E2yGHyw3n/?mibextid=wwXIfr",
      "https://www.instagram.com/mamta_e_store",
      "https://youtube.com/@shahfaisaltechlife",
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mamta E-Store",
    url: "https://www.mamtaestore.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.mamtaestore.in/search?q={search_term_string}",
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
      item: `https://www.mamtaestore.in${item.url}`,
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
