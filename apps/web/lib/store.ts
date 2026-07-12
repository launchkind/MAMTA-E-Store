import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { createClient } from "./supabase/client";
import { Product, User } from "@entry/types";
import { Order } from "./orderApi";

// Helper function to map server cart item to local format
interface CartServerItem {
  productId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPercentage?: number;
    stock: number;
    averageRating?: number;
    image?: string;
    category:
      | string
      | {
          _id: string;
          name: string;
          image: string;
          categoryType: string;
        };
    brand:
      | string
      | {
          _id: string;
          name: string;
        };
    seller?: any;
    ratings?: [];
  };
  quantity: number;
}

interface CartProductWithQuantity {
  product: Product;
  quantity: number;
}

const mapCartItemToProduct = (
  item: CartServerItem,
): CartProductWithQuantity => ({
  product: {
    _id: item.productId._id,
    name: item.productId.name,
    description: item.productId.description,
    price: item.productId.price,
    discountPercentage: item.productId.discountPercentage || 0,
    stock: item.productId.stock,
    averageRating: item.productId.averageRating || 0,
    image: item.productId.image || "",
    category:
      typeof item.productId.category === "string"
        ? {
            _id: item.productId.category,
            name: "",
            image: "",
            categoryType: "",
          }
        : item.productId.category,
    brand:
      typeof item.productId.brand === "string"
        ? { _id: item.productId.brand, name: "" }
        : item.productId.brand,
    seller: item.productId.seller,
    ratings: item.productId.ratings || [],
  },
  quantity: item.quantity,
});

interface UserState {
  authUser: User | null;
  auth_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
  setAuthToken: (token: string | null, refreshToken?: string | null) => void;
  logoutUser: () => void;
  verifyAuth: () => Promise<void>;
  loadUserData: (token: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
}

interface CartState {
  cartItems: Product[];
  cartItemsWithQuantities: Array<{ product: Product; quantity: number }>;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (
    productId: string,
    quantity: number,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  setCartItems: (items: Array<{ product: Product; quantity: number }>) => void;
  getCartItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  syncCartFromServer: () => Promise<void>;
  // Pagination support
  loadCartPage: (
    page: number,
    limit?: number,
  ) => Promise<{ hasMore: boolean; currentPage: number }>;
  currentPage: number;
  hasMoreCart: boolean;
  totalCartItems: number;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  loadOrders: (token: string) => Promise<void>;
  getOrdersCount: () => number;
  clearOrders: () => void;
}

interface WishlistState {
  wishlistItems: Product[];
  wishlistIds: string[];
  totalWishlistItems: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  setWishlistItems: (products: Product[]) => void;
  setWishlistIds: (ids: string[]) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
}

interface CurrencyState {
  selectedCurrency: string;
  currencies: Currency[];
  setCurrency: (currencyCode: string) => void;
  getCurrentCurrency: () => Currency;
  convertPrice: (price: number) => number;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      authUser: null,
      authLoading: false,
      auth_token: Cookies.get("auth_token") || null,
      refresh_token: Cookies.get("refresh_token") || null,
      isAuthenticated: !!Cookies.get("auth_token"),
      updateUser: (user) => {
        set({ authUser: user, isAuthenticated: true });
      },
      setAuthToken: (token, refreshToken) => {
        if (token) {
          Cookies.set("auth_token", token, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });

          if (refreshToken) {
            Cookies.set("refresh_token", refreshToken, {
              expires: 7,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }

          set({
            auth_token: token,
            refresh_token: refreshToken || null,
            isAuthenticated: true,
          });

          setTimeout(() => {
            loadAllUserData(token);
          }, 150);
        } else {
          Cookies.remove("auth_token");
          Cookies.remove("refresh_token");
          set({
            auth_token: null,
            refresh_token: null,
            isAuthenticated: false,
            authUser: null,
          });
        }
      },

      loadUserData: async (token: string) => {
        try {
          const promises = [
            (async () => {
              try {
                const { getUserWishlist } = await import("./wishlistApi");
                const { useWishlistStore } = await import("./store");
                const wishlistResponse = await getUserWishlist(token);
                if (wishlistResponse.success) {
                  useWishlistStore
                    .getState()
                    .setWishlistIds(wishlistResponse.wishlist);
                }
              } catch (error) {
                console.warn("Failed to load wishlist on login:", error);
              }
            })(),
            (async () => {
              try {
                const { useCartStore } = await import("./store");
                await useCartStore.getState().syncCartFromServer();
              } catch (error) {
                console.warn("Failed to load cart on login:", error);
              }
            })(),
            (async () => {
              try {
                const { useOrderStore } = await import("./store");
                await useOrderStore.getState().loadOrders(token);
              } catch (error) {
                console.warn("Failed to load orders on login:", error);
              }
            })(),
          ];

          await Promise.allSettled(promises);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      },
      logoutUser: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch (e) {
          console.warn("Store: Supabase signOut error:", e);
        }
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        set({
          authUser: null,
          auth_token: null,
          refresh_token: null,
          isAuthenticated: false,
        });

        // Clear wishlist, cart, and orders on logout using dynamic imports
        try {
          const { useWishlistStore } = await import("./store");
          useWishlistStore.getState().clearWishlist();
        } catch (error) {
          console.warn("Store: Failed to clear wishlist on logout:", error);
        }

        try {
          const { useCartStore } = await import("./store");
          const cartStore = useCartStore.getState();
          // Clear all cart state including pagination
          cartStore.setCartItems([]);
          useCartStore.setState({
            totalCartItems: 0,
            currentPage: 1,
            hasMoreCart: false,
          });
        } catch (error) {
          console.warn("Store: Failed to clear cart on logout:", error);
        }

        try {
          const { useOrderStore } = await import("./store");
          useOrderStore.getState().clearOrders();
        } catch (error) {
          console.warn("Store: Failed to clear orders on logout:", error);
        }
      },
      verifyAuth: async () => {
        const currentState = get();
        if (currentState.authUser && currentState.isAuthenticated) return;

        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set({ isAuthenticated: false, authUser: null, auth_token: null, refresh_token: null });
            return;
          }

          const token = session.access_token;
          // Fetch user profile from users table
          const { data: userProfile } = await supabase
            .from("users")
            .select("id, name, email, role, avatar, auth_provider, has_set_password")
            .eq("id", session.user.id)
            .single();

          const authUser = userProfile
            ? {
                _id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                role: userProfile.role,
                image: userProfile.avatar,
                avatar: userProfile.avatar,
                authProvider: userProfile.auth_provider,
                isOAuthUser: userProfile.auth_provider !== "local",
                hasSetPassword: userProfile.has_set_password,
              } as unknown as User
            : null;

          set({ authUser, isAuthenticated: true, auth_token: token, refresh_token: session.refresh_token });

          try {
            const { getUserWishlist } = await import("./wishlistApi");
            const { useWishlistStore } = await import("./store");
            const wishlistResponse = await getUserWishlist(token);
            if (wishlistResponse.success) {
              useWishlistStore.getState().setWishlistIds(wishlistResponse.wishlist);
            }
          } catch (wishlistError) {
            console.warn("Store: Failed to load wishlist:", wishlistError);
          }

          try {
            const { useCartStore } = await import("./store");
            await useCartStore.getState().syncCartFromServer();
          } catch (cartError) {
            console.warn("Store: Failed to load cart:", cartError);
          }

          try {
            const { useOrderStore } = await import("./store");
            await useOrderStore.getState().loadOrders(token);
          } catch (orderError) {
            console.warn("Store: Failed to load orders:", orderError);
          }
        } catch (error) {
          console.error("Store: Verify auth error:", error);
          set({ authUser: null, auth_token: null, refresh_token: null, isAuthenticated: false });
        }
      },
      register: async (data) => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { data: { name: data.name, role: data.role || "user" } },
          });
          if (error) throw error;
        } catch (error) {
          console.error("Store: Register error:", error);
          throw error;
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ... (rest of the file remains unchanged: useCartStore, useOrderStore, useWishlistStore, and loadAllUserData)

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartItemsWithQuantities: [],
      isLoading: false,
      // Pagination properties
      currentPage: 1,
      hasMoreCart: false,
      totalCartItems: 0,

      addToCart: async (product, quantity = 1) => {
        const { auth_token } = useUserStore.getState();
        if (!auth_token) {
          throw new Error("Authentication required");
        }

        set({ isLoading: true });
        try {
          const { addToCart } = await import("./cartApi");
          const response = await addToCart(auth_token, product._id, quantity);

          if (response.success) {
            const cartItemsWithQuantities =
              response.cart.map(mapCartItemToProduct);

            set({
              cartItemsWithQuantities,
              cartItems: cartItemsWithQuantities.map((item) => item.product),
            });
          }
        } catch (error) {
          console.error("Add to cart error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (productId) => {
        const { auth_token } = useUserStore.getState();
        if (!auth_token) {
          throw new Error("Authentication required");
        }

        set({ isLoading: true });
        try {
          const { removeFromCart } = await import("./cartApi");
          const response = await removeFromCart(auth_token, productId);

          if (response.success) {
            const cartItemsWithQuantities =
              response.cart.map(mapCartItemToProduct);

            set({
              cartItemsWithQuantities,
              cartItems: cartItemsWithQuantities.map((item) => item.product),
            });
          }
        } catch (error) {
          console.error("Remove from cart error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartItemQuantity: async (productId, quantity) => {
        const { auth_token } = useUserStore.getState();
        if (!auth_token) {
          throw new Error("Authentication required");
        }

        set({ isLoading: true });
        try {
          const { updateCartItem } = await import("./cartApi");
          const response = await updateCartItem(
            auth_token,
            productId,
            quantity,
          );

          if (response.success) {
            const cartItemsWithQuantities =
              response.cart.map(mapCartItemToProduct);

            set({
              cartItemsWithQuantities,
              cartItems: cartItemsWithQuantities.map((item) => item.product),
            });
          }
        } catch (error) {
          console.error("Update cart item error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        const { auth_token } = useUserStore.getState();
        if (!auth_token) {
          throw new Error("Authentication required");
        }

        set({ isLoading: true });
        try {
          const { clearCart } = await import("./cartApi");
          const response = await clearCart();

          if (response.success) {
            set({
              cartItemsWithQuantities: [],
              cartItems: [],
              totalCartItems: 0,
              currentPage: 1,
              hasMoreCart: false,
            });
          }
        } catch (error) {
          console.error("Clear cart error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setCartItems: (items) => {
        set({
          cartItemsWithQuantities: items,
          cartItems: items.map((item) => item.product),
        });
      },

      getCartItemQuantity: (productId) => {
        const state = get();
        const item = state.cartItemsWithQuantities.find(
          (item) => item.product._id === productId,
        );
        return item ? item.quantity : 0;
      },

      isInCart: (productId) => {
        const state = get();
        return state.cartItems.some((item) => item._id === productId);
      },

      loadCartPage: async (page: number, limit: number = 10) => {
        const { auth_token } = useUserStore.getState();
        if (!auth_token) {
          return { hasMore: false, currentPage: 1 };
        }

        set({ isLoading: page === 1 });
        try {
          const { getUserCart } = await import("./cartApi");
          const response = await getUserCart(page, limit);

          if (response.success) {
            const cartItemsWithQuantities =
              response.cart.map(mapCartItemToProduct);
            const currentCartItems =
              page === 1 ? [] : get().cartItemsWithQuantities;

            set({
              cartItemsWithQuantities: [
                ...currentCartItems,
                ...cartItemsWithQuantities,
              ],
              cartItems: [...currentCartItems, ...cartItemsWithQuantities].map(
                (item) => item.product,
              ),
              currentPage: page,
              hasMoreCart: response.pagination?.hasMore || false,
              totalCartItems: response.pagination?.totalItems || 0,
            });

            return {
              hasMore: response.pagination?.hasMore || false,
              currentPage: page,
            };
          }
        } catch (error) {
          console.error("Load cart page error:", error);
        } finally {
          set({ isLoading: false });
        }

        return { hasMore: false, currentPage: page };
      },

      syncCartFromServer: async () => {
        const { auth_token } = useUserStore.getState();
        if (!auth_token) {
          set({
            cartItems: [],
            cartItemsWithQuantities: [],
            currentPage: 1,
            hasMoreCart: false,
            totalCartItems: 0,
          });
          return;
        }

        set({ isLoading: true });
        try {
          const { getUserCart } = await import("./cartApi");
          const response = await getUserCart(1, 10);

          if (response.success) {
            const cartItemsWithQuantities =
              response.cart.map(mapCartItemToProduct);

            set({
              cartItemsWithQuantities,
              cartItems: cartItemsWithQuantities.map((item) => item.product),
              currentPage: 1,
              hasMoreCart: response.pagination?.hasMore || false,
              totalCartItems: response.pagination?.totalItems || 0,
            });
          }
        } catch (error) {
          console.error("Sync cart from server error:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      addOrder: (order) =>
        set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (order) =>
        set((state) => ({
          orders: state.orders.map((o) => (o._id === order._id ? order : o)),
        })),
      loadOrders: async (token: string) => {
        set({ isLoading: true });
        try {
          const { getUserOrders } = await import("./orderApi");
          const orders = await getUserOrders(token);
          set({ orders, isLoading: false });
        } catch (error) {
          console.error("Failed to load orders:", error);
          set({ isLoading: false });
        }
      },
      getOrdersCount: () => get().orders.length,
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: "order-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      wishlistIds: [],
      totalWishlistItems: 0,
      addToWishlist: (product) =>
        set((state) => {
          if (!state.wishlistIds.includes(product._id)) {
            const newWishlistItems = [...state.wishlistItems, product];
            const newWishlistIds = [...state.wishlistIds, product._id];
            return {
              wishlistItems: newWishlistItems,
              wishlistIds: newWishlistIds,
              totalWishlistItems: newWishlistIds.length,
            };
          }
          return state;
        }),
      removeFromWishlist: (productId) =>
        set((state) => {
          const newWishlistIds = state.wishlistIds.filter(
            (id) => id !== productId,
          );
          return {
            wishlistItems: state.wishlistItems.filter(
              (item) => item._id !== productId,
            ),
            wishlistIds: newWishlistIds,
            totalWishlistItems: newWishlistIds.length,
          };
        }),
      setWishlistItems: (products) =>
        set({
          wishlistItems: products,
          wishlistIds: products.map((product) => product._id),
          totalWishlistItems: products.length,
        }),
      setWishlistIds: (ids) =>
        set((state) => ({
          wishlistIds: ids,
          totalWishlistItems: ids.length,
          wishlistItems: state.wishlistItems.filter((item) =>
            ids.includes(item._id),
          ),
        })),
      clearWishlist: () =>
        set({ wishlistItems: [], wishlistIds: [], totalWishlistItems: 0 }),
      isInWishlist: (productId) => {
        const state = get();
        return state.wishlistIds.includes(productId);
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const loadAllUserData = async (token: string) => {
  try {
    const promises = [
      (async () => {
        try {
          const { getUserWishlist } = await import("./wishlistApi");
          const wishlistResponse = await getUserWishlist(token);
          if (wishlistResponse.success) {
            useWishlistStore
              .getState()
              .setWishlistIds(wishlistResponse.wishlist);
          }
        } catch (error) {
          console.warn("Failed to load wishlist:", error);
        }
      })(),
      (async () => {
        try {
          await useCartStore.getState().syncCartFromServer();
        } catch (error) {
          console.warn("Failed to load cart:", error);
        }
      })(),
      (async () => {
        try {
          await useOrderStore.getState().loadOrders(token);
        } catch (error) {
          console.warn("Failed to load orders:", error);
        }
      })(),
    ];

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error loading user data:", error);
  }
};

// Currency Store with 12 different currencies
export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: "USD",
      currencies: [
        { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
        { code: "EUR", name: "Euro", symbol: "€", rate: 0.85 },
        { code: "GBP", name: "British Pound", symbol: "£", rate: 0.73 },
        { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 110.0 },
        { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.25 },
        { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.35 },
        { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.92 },
        { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 6.45 },
        { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 74.5 },
        { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", rate: 84.8 },
        { code: "KRW", name: "South Korean Won", symbol: "₩", rate: 1180.0 },
        { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 1.35 },
      ],
      setCurrency: (currencyCode: string) => {
        set({ selectedCurrency: currencyCode });
      },
      getCurrentCurrency: () => {
        const state = get();
        return (
          state.currencies.find((c) => c.code === state.selectedCurrency) ||
          state.currencies[0]
        );
      },
      convertPrice: (price: number) => {
        const state = get();
        const currency = state.getCurrentCurrency();
        return price * currency.rate;
      },
    }),
    {
      name: "currency-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
