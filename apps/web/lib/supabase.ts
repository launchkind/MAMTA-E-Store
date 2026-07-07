import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Single client works for both server (SSR) and browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

// Helper: map a Supabase product row (with joined category & brand) to the @entry/types Product shape
export function mapProduct(r: any) {
  return {
    _id: r.id,
    name: r.name,
    slug: r.slug ?? r.id,
    description: r.description ?? '',
    aboutItems: r.about_items ?? [],
    price: r.price,
    discountPercentage: r.discount_percentage ?? 0,
    averageRating: r.average_rating ?? 0,
    numReviews: r.num_reviews ?? 0,
    image: r.image,
    images: r.images?.length ? r.images : [r.image],
    sold: r.sold ?? 0,
    stock: r.stock ?? 0,
    category: r.category
      ? {
          _id: r.category.id,
          name: r.category.name,
          slug: r.category.slug ?? '',
          image: r.category.image ?? '',
          iconImage: r.category.icon_image ?? '',
        }
      : { _id: '', name: '', image: '', iconImage: '' },
    brand: r.brand
      ? { _id: r.brand.id, name: r.brand.name, image: r.brand.image ?? '' }
      : { _id: '', name: '', image: '' },
  }
}

// Helper: map a Supabase category row to the @entry/types Category shape
export function mapCategory(r: any) {
  return {
    _id: r.id,
    name: r.name,
    slug: r.slug ?? '',
    image: r.image ?? '',
    iconImage: r.icon_image ?? '',
    categoryType: Array.isArray(r.category_type) ? r.category_type[0] : r.category_type ?? '',
    level: r.level ?? 0,
    parent: r.parent_id ? { _id: r.parent_id, name: '' } : null,
  }
}
