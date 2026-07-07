import { Product } from "@entry/types";

/**
 * Generate a product URL using slug if available, otherwise fallback to ID
 */
export function getProductUrl(
  product: Product | { _id: string; slug?: string }
): string {
  if (product.slug) {
    return `/product/${product.slug}`;
  }
  return `/product/${product._id}`;
}

/**
 * Check if a string is a valid Postgres/Supabase UUID
 */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id
  );
}
