import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailSidebar from "@/components/dashboard/search/UserDetailSidebar";
import ProductDetailSidebar from "@/components/dashboard/search/ProductDetailSidebar";
import OrderDetailSidebar from "@/components/dashboard/search/OrderDetailSidebar";
import {
  Search,
  Users,
  Package,
  ShoppingCart,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SearchResult = {
  _id: string;
  type: "user" | "product" | "order";
  displayText: string;
  subText: string;
  route: string;
  [key: string]: unknown;
};

type SearchResults = {
  users: SearchResult[];
  products: SearchResult[];
  orders: SearchResult[];
  total: number;
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    users: [],
    products: [],
    orders: [],
    total: 0,
  });
  const [activeFilter, setActiveFilter] = useState<
    "all" | "users" | "products" | "orders"
  >("all");

  // Sidebar states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [isProductSidebarOpen, setIsProductSidebarOpen] = useState(false);
  const [isOrderSidebarOpen, setIsOrderSidebarOpen] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query, activeFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Auto-search with debounce
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is empty
    if (!searchQuery.trim()) {
      setResults({ users: [], products: [], orders: [], total: 0 });
      return;
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      setSearchParams({ q: searchQuery.trim() });
    }, 300);

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, setSearchParams]);

  const performSearch = async (q: string, type: string) => {
    if (!q.trim()) {
      setResults({ users: [], products: [], orders: [], total: 0 });
      return;
    }
    setLoading(true);
    try {
      const limit = 20;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let users: any[] = [], products: any[] = [], orders: any[] = [];

      if (type === "all" || type === "users") {
        const { data } = await supabase
          .from("users")
          .select("id, name, email, avatar, role, created_at")
          .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
          .limit(limit);
        users = (data ?? []).map((u) => ({
          ...u,
          _id: u.id,
          type: "user" as const,
          displayText: u.name ?? u.email ?? u.id,
          subText: u.email ?? "",
          route: `/dashboard/users/${u.id}`,
        }));
      }

      if (type === "all" || type === "products") {
        const { data } = await supabase
          .from("products")
          .select("id, name, slug, price, image, approval_status, created_at")
          .ilike("name", `%${q}%`)
          .limit(limit);
        products = (data ?? []).map((p) => ({
          ...p,
          _id: p.id,
          type: "product" as const,
          displayText: p.name ?? p.slug ?? p.id,
          subText: p.price != null ? `$${p.price}` : p.slug ?? "",
          route: `/dashboard/products/${p.id}`,
        }));
      }

      if (type === "all" || type === "orders") {
        const { data } = await supabase
          .from("orders")
          .select(
            "id, total, status, payment_status, created_at, user:users!user_id(name, email)"
          )
          .ilike("id", `${q}%`)
          .limit(limit);
        orders = (data ?? []).map((o) => ({
          ...o,
          _id: o.id,
          type: "order" as const,
          displayText: `Order #${o.id}`,
          subText: o.status ?? o.payment_status ?? "",
          route: `/dashboard/orders/${o.id}`,
        }));
      }

      setResults({
        users,
        products,
        orders,
        total: users.length + products.length + orders.length,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description:
          (error as { message?: string })?.message ||
          "Failed to perform search",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Clear debounce timer and search immediately
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setResults({ users: [], products: [], orders: [], total: 0 });
    setSearchParams({});
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "user":
        setSelectedUserId(result._id);
        setIsUserSidebarOpen(true);
        break;
      case "product":
        setSelectedProductId(result._id);
        setIsProductSidebarOpen(true);
        break;
      case "order":
        setSelectedOrderId(result._id);
        setIsOrderSidebarOpen(true);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-5 w-5" />;
      case "product":
        return <Package className="h-5 w-5" />;
      case "order":
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "product":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "order":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const filteredResults = () => {
    switch (activeFilter) {
      case "users":
        return results.users;
      case "products":
        return results.products;
      case "orders":
        return results.orders;
      default:
        return [...results.users, ...results.products, ...results.orders];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-600 mt-1 md:mt-2">
          Search across users, products, and orders
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-sm border"
      >
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, email, order ID, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-muted"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { value: "all", label: "All Results", icon: Search },
            { value: "users", label: "Users", icon: Users },
            { value: "products", label: "Products", icon: Package },
            { value: "orders", label: "Orders", icon: ShoppingCart },
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newFilter = filter.value as
                  | "all"
                  | "users"
                  | "products"
                  | "orders";
                setActiveFilter(newFilter);
                if (searchQuery.trim()) {
                  performSearch(searchQuery, filter.value);
                }
              }}
              className={cn(
                "gap-2",
                activeFilter === filter.value && "shadow-md"
              )}
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
              {filter.value === "all" && results.total > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {results.total}
                </Badge>
              )}
              {filter.value === "users" && results.users.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {results.users.length}
                </Badge>
              )}
              {filter.value === "products" && results.products.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {results.products.length}
                </Badge>
              )}
              {filter.value === "orders" && results.orders.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {results.orders.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredResults().length > 0 ? (
          <div className="divide-y">
            {filteredResults().map((result, index) => (
              <motion.div
                key={`${result.type}-${result._id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleResultClick(result)}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-lg border flex items-center justify-center shrink-0",
                      getResultColor(result.type)
                    )}
                  >
                    {getResultIcon(result.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {result.displayText}
                      </h3>
                      <Badge variant="outline" className="capitalize text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {result.subText}
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search query or filters
            </p>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start searching
            </h3>
            <p className="text-gray-600">
              Enter a search query to find users, products, or orders
            </p>
          </div>
        )}
      </motion.div>

      {/* Detail Sidebars */}
      <UserDetailSidebar
        userId={selectedUserId}
        isOpen={isUserSidebarOpen}
        onClose={() => {
          setIsUserSidebarOpen(false);
          setSelectedUserId(null);
        }}
        onUpdate={() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery, activeFilter);
          }
        }}
      />

      <ProductDetailSidebar
        productId={selectedProductId}
        isOpen={isProductSidebarOpen}
        onClose={() => {
          setIsProductSidebarOpen(false);
          setSelectedProductId(null);
        }}
        onUpdate={() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery, activeFilter);
          }
        }}
      />

      <OrderDetailSidebar
        orderId={selectedOrderId}
        isOpen={isOrderSidebarOpen}
        onClose={() => {
          setIsOrderSidebarOpen(false);
          setSelectedOrderId(null);
        }}
        onUpdate={() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery, activeFilter);
          }
        }}
      />
    </div>
  );
}
