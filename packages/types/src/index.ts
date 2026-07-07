// Common types shared across the entire monorepo

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "vendor" | "employee" | "seller";
  token?: string;
  addresses?: Address[];
  createdAt?: Date;
  updatedAt?: Date;
  // OAuth fields
  isOAuthUser?: boolean;
  authProvider?: "local" | "google" | "github";
  hasSetPassword?: boolean;
  avatar?: string;
  emailVerified?: boolean;
}

export interface Vendor {
  _id: string;
  userId: string | User;
  storeName: string;
  description: string;
  logo?: string;
  status: "pending" | "approved" | "rejected";
  contactEmail: string;
  contactPhone?: string;
  address?: Address;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Seller extends Vendor {}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface AddressInput {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  image: string;
  iconImage: string;
  categoryType?: string;
  level?: number;
  parent?: {
    _id: string;
    name: string;
  } | null;
  childrenCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Brand {
  _id: string;
  name: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductType {
  _id: string;
  name: string;
  type: string;
  description?: string;
  bannerImages?: string[];
  isActive: boolean;
  displayOrder?: number;
  icon?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SocialMedia {
  _id: string;
  name: string;
  platform:
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "tiktok"
    | "pinterest"
    | "whatsapp"
    | "telegram"
    | "other";
  href: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  // Sensitive data fields (only for admin)
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  webhookUrl?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  aboutItems?: string[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock?: number;
  countInStock?: number;
  averageRating?: number;
  rating?: number;
  numReviews?: number;
  images: string[]; // Array of product images
  image: string; // Deprecated: kept for backward compatibility, use images[0]
  category: Category;
  brand: Brand | string;
  vendor?: Vendor | string; // Reference to the vendor
  approvalStatus?: "pending" | "approved" | "rejected"; // Product approval status
  ratings?: any[];
  reviews?: Review[];
  viewCount?: number;
  views?: any[];
  sold?: number;
  quantity?: number;
  productType?: "base" | "trending" | "featured" | "deals" | "new-arrival";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  product: Product;
  productId?: Product;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  _id: string;
  userId?: string;
  user?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  shippingAddress: Address;
  paymentMethod?: string;
  total?: number;
  totalPrice?: number;
  shippingPrice?: number;
  taxPrice?: number;
  status?: "pending" | "paid" | "completed" | "cancelled";
  isPaid?: boolean;
  paidAt?: Date;
  isDelivered?: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CategoriesResponse extends PaginatedResponse<Category> {
  categories: Category[];
}

export interface ProductsResponse extends PaginatedResponse<Product> {
  products: Product[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
