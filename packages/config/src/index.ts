export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    AUTH: "/api/auth",
    PRODUCTS: "/api/products",
    CATEGORIES: "/api/categories",
    BRANDS: "/api/brands",
    ORDERS: "/api/orders",
    USERS: "/api/users",
    WISHLIST: "/api/wishlist",
    CART: "/api/cart",
    BANNERS: "/api/banners",
    ANALYTICS: "/api/analytics",
  },
};

export const PAYMENT_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  CURRENCY: "USD",
};

export const APP_CONFIG = {
  NAME: "BabyShop",
  DESCRIPTION: "Your trusted online baby store",
  VERSION: "1.0.0",
};
