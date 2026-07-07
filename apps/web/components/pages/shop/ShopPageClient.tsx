"use client";

import Container from "@/components/common/Container";
import ProductCard from "@/components/common/products/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { Brand, Category, Product, ProductType, Seller } from "@entry/types";
import React, {
  useEffect,
  useState,
  useCallback,
  Suspense,
  useRef,
} from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import EmptyListDesign from "@/components/common/products/EmptyListDesign";
import ShopSkeleton from "@/components/common/skeleton/ShopSkeleton";
import ProductCardSkeleton from "@/components/common/skeleton/ProductCardSkeleton";
import { X, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
  total: number;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  productTypes: ProductType[];
  sellers: Seller[];
}

const ShopPageClient = ({
  categories,
  brands,
  productTypes,
  sellers,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || "",
  );
  const [brand, setBrand] = useState<string>(searchParams.get("brand") || "");
  const [search, setSearch] = useState<string>(
    searchParams.get("search") || "",
  );
  const [productType, setProductType] = useState<string>(
    searchParams.get("productType") || "",
  );
  const [seller, setSeller] = useState<string>(
    searchParams.get("seller") || "",
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newlyLoadedProducts, setNewlyLoadedProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [invalidCategory, setInvalidCategory] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const productsPerPage = 20;

  // Function to update URL with current filter state
  const updateURL = useCallback(
    (filters: {
      category?: string;
      brand?: string;
      search?: string;
      productType?: string;
      seller?: string;
      priceRange?: [number, number] | null;
      sortOrder?: "asc" | "desc";
    }) => {
      const params = new URLSearchParams();

      if (filters.category) params.set("category", filters.category);
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.search) params.set("search", filters.search);
      if (filters.productType) params.set("productType", filters.productType);
      if (filters.seller) params.set("seller", filters.seller);
      if (filters.priceRange) {
        params.set("priceMin", filters.priceRange[0].toString());
        params.set("priceMax", filters.priceRange[1].toString());
      }
      if (filters.sortOrder && filters.sortOrder !== "asc") {
        params.set("sortOrder", filters.sortOrder);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  // Check if the category from URL params exists in the categories list
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const priceMinFromUrl = searchParams.get("priceMin");
    const priceMaxFromUrl = searchParams.get("priceMax");

    if (categoryFromUrl) {
      const categoryExists = categories.some(
        (cat) => cat._id === categoryFromUrl,
      );
      if (!categoryExists) {
        const categoryByName = categories.find(
          (cat) => cat.name.toLowerCase() === categoryFromUrl.toLowerCase(),
        );

        if (categoryByName) {
          setCategory(categoryByName._id);
        } else {
          setInvalidCategory(categoryFromUrl);
          setCategory("");
        }
      }
    }

    // Initialize other filters from URL
    const brandFromUrl = searchParams.get("brand");
    const searchFromUrl = searchParams.get("search");
    const productTypeFromUrl = searchParams.get("productType");
    const sellerFromUrl = searchParams.get("seller");
    const sortOrderFromUrl = searchParams.get("sortOrder") as "asc" | "desc";

    setBrand(brandFromUrl || "");
    setSearch(searchFromUrl || "");
    setProductType(productTypeFromUrl || "");
    setSeller(sellerFromUrl || "");
    if (sortOrderFromUrl) setSortOrder(sortOrderFromUrl);
    else setSortOrder("asc");

    // Initialize price range from URL
    if (priceMinFromUrl && priceMaxFromUrl) {
      setPriceRange([Number(priceMinFromUrl), Number(priceMaxFromUrl)]);
    } else {
      setPriceRange(null);
    }
  }, [searchParams, categories]);

  const fetchProducts = useCallback(
    async (loadMore = false) => {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const supabase = createClient();
        const from = (currentPage - 1) * productsPerPage;
        const to = from + productsPerPage - 1;

        let query = supabase
          .from("products")
          .select("*, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)", { count: "exact" })
          .range(from, to)
          .order("price", { ascending: sortOrder === "asc" });

        if (category) query = query.eq("category_id", category);
        if (brand) query = query.eq("brand_id", brand);
        if (search) query = query.ilike("name", `%${search}%`);
        if (seller) query = query.eq("seller_id", seller);
        if (priceRange) { query = query.gte("price", priceRange[0]).lte("price", priceRange[1]); }

        if (productType) {
          query = (query as ReturnType<typeof supabase.from>).eq("product_product_types.product_types.name", productType);
        }

        const { data, count } = await query;
        const mappedProducts = (data || []).map((p: Record<string, unknown>) => ({ ...p, _id: p.id, discountPercentage: p.discount_percentage, averageRating: p.average_rating } as unknown as Product));

        setTotal(count || 0);

        if (loadMore) {
          setTimeout(() => {
            setNewlyLoadedProducts(mappedProducts);
            setProducts((prev) => [...prev, ...mappedProducts]);
            setLoadingMore(false);
          }, 300);
        } else {
          setNewlyLoadedProducts([]);
          setProducts(mappedProducts);
          setLoading(false);
        }
      } catch (error) {
        setTotal(0);
        if (!loadMore) { setProducts([]); }
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      category,
      brand,
      search,
      productType,
      seller,
      priceRange,
      currentPage,
      sortOrder,
      productsPerPage,
    ],
  );

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]); // Reset products when filters change
  }, [category, brand, search, productType, seller, priceRange, sortOrder]);

  useEffect(() => {
    if (currentPage === 1) {
      fetchProducts(false);
    } else {
      fetchProducts(true);
    }
  }, [currentPage, fetchProducts]);

  useEffect(() => {
    if (newlyLoadedProducts.length > 0) {
      const timer = setTimeout(() => {
        setNewlyLoadedProducts([]);
      }, 800); // Increased delay to match animation duration
      return () => clearTimeout(timer);
    }
  }, [newlyLoadedProducts]);

  const priceRanges: [number, number][] = [
    [0, 20],
    [20, 50],
    [50, 100],
    [100, Infinity],
  ];

  const totalPages = Math.ceil(total / productsPerPage);
  const hasMoreProducts = currentPage < totalPages;

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Don't create observer if already loading or no more products
    if (loadingMore || loading || !hasMoreProducts) {
      return;
    }

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry.isIntersecting &&
          hasMoreProducts &&
          !loadingMore &&
          !loading
        ) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observerRef.current = observer;

    // Observe the load more element
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreProducts, loadingMore, loading]);

  const resetCategory = () => {
    const newCategory = "";
    setCategory(newCategory);
    setCurrentPage(1);
    setInvalidCategory("");
    updateURL({
      category: newCategory,
      brand,
      search,
      productType,
      seller,
      priceRange,
      sortOrder,
    });
  };

  const resetBrand = () => {
    const newBrand = "";
    setBrand(newBrand);
    setCurrentPage(1);
    updateURL({
      category,
      brand: newBrand,
      search,
      productType,
      seller,
      priceRange,
      sortOrder,
    });
  };

  const resetSearch = () => {
    const newSearch = "";
    setSearch(newSearch);
    setCurrentPage(1);
    updateURL({
      category,
      brand,
      search: newSearch,
      productType,
      seller,
      priceRange,
      sortOrder,
    });
  };

  const resetPriceRange = () => {
    const newPriceRange = null;
    setPriceRange(newPriceRange);
    setCurrentPage(1);
    updateURL({
      category,
      brand,
      search,
      productType,
      seller,
      priceRange: newPriceRange,
      sortOrder,
    });
  };

  const resetSortOrder = () => {
    const newSortOrder: "asc" | "desc" = "asc";
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    updateURL({
      category,
      brand,
      search,
      productType,
      seller,
      priceRange,
      sortOrder: newSortOrder,
    });
  };

  const resetProductType = () => {
    const newProductType = "";
    setProductType(newProductType);
    setCurrentPage(1);
    updateURL({
      category,
      brand,
      search,
      productType: newProductType,
      seller,
      priceRange,
      sortOrder,
    });
  };

  const resetSeller = () => {
    const newSeller = "";
    setSeller(newSeller);
    setCurrentPage(1);
    updateURL({
      category,
      brand,
      search,
      productType,
      seller: newSeller,
      priceRange,
      sortOrder,
    });
  };

  const resetAllFilters = () => {
    setCategory("");
    setBrand("");
    setSearch("");
    setProductType("");
    setSeller("");
    setPriceRange(null);
    setSortOrder("asc");
    setCurrentPage(1);
    setInvalidCategory("");
    setProducts([]); // Clear products immediately
    router.push(pathname, { scroll: false });
  };

  return (
    <Container>
      <div className="py-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shop</BreadcrumbPage>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {categories.find((c) => c._id === category)?.name ||
                        "Category"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {brand && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {brands.find((b) => b._id === brand)?.name || "Brand"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Shop Products</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <p>
                {loading
                  ? "Loading..."
                  : `Showing ${products.length} of ${total} products`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1.5"
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: "Shop - " + document.title,
                        url: url,
                      });
                    } catch (err) {
                      // Fallback to clipboard if share gets cancelled or fails softly
                      navigator.clipboard.writeText(url);
                      toast.success("Page link copied to clipboard");
                    }
                  } else {
                    navigator.clipboard.writeText(url);
                    toast.success("Page link copied to clipboard");
                  }
                }}
              >
                <Share2 size={14} />
                Share
              </Button>
            </div>
            {invalidCategory && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Category &quot;{invalidCategory}&quot; not found. Showing all
                  products instead.
                </p>
              </div>
            )}
          </div>
          {(category ||
            brand ||
            search ||
            productType ||
            seller ||
            priceRange ||
            sortOrder !== "asc") && (
            <Button
              variant="outline"
              onClick={resetAllFilters}
              className="text-sm border-primary/20 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <X size={14} className="stroke-3" />
              Reset All Filters
            </Button>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          <div className="bg-transparent w-full md:max-w-64 min-w-60">
            <div className="bg-background w-full p-5 rounded-lg border">
              <div className="md:hidden">
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="w-full mb-4 flex items-center justify-between"
                >
                  <span className="font-medium">Filters</span>
                  {isFiltersOpen ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </Button>
              </div>
              <div className="hidden md:block">
                <h3 className="text-lg font-medium mb-4">Filters</h3>
              </div>
              <div
                className={`${
                  isFiltersOpen ? "block" : "hidden"
                } md:block space-y-4`}
              >
                {search && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Search</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                        `&quot;`{search}`&quot;`
                        <button
                          onClick={resetSearch}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          disabled={loading}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    {category && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetCategory}
                        disabled={loading}
                        className="text-xs text-blue-600 p-0"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Select
                    value={category || "All"}
                    onValueChange={(value) => {
                      const newCategory = value === "All" ? "" : value;
                      setCategory(newCategory);
                      setCurrentPage(1);
                      setInvalidCategory("");
                      updateURL({
                        category: newCategory,
                        brand,
                        search,
                        productType,
                        priceRange,
                        sortOrder,
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full p-2 border rounded">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categories.map((cat: Category) => (
                          <SelectItem key={cat?._id} value={cat?._id}>
                            {cat?.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2">
                      Brand
                    </label>
                    {brand && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetBrand}
                        disabled={loading}
                        className="text-xs text-blue-600 p-0"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Select
                    value={brand || "All"}
                    onValueChange={(value) => {
                      const newBrand = value === "All" ? "" : value;
                      setBrand(newBrand);
                      setCurrentPage(1);
                      updateURL({
                        category,
                        brand: newBrand,
                        search,
                        productType,
                        priceRange,
                        sortOrder,
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full p-2 border rounded">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Brands</SelectLabel>
                        <SelectItem value="All">All Brands</SelectItem>
                        {brands.map((brd: Brand) => (
                          <SelectItem key={brd?._id} value={brd?._id}>
                            {brd?.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2">
                      Price Range
                    </label>
                    {priceRange && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetPriceRange}
                        disabled={loading}
                        className="text-xs text-blue-600 p-0"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Select
                    value={
                      priceRange ? `${priceRange[0]}-${priceRange[1]}` : "all"
                    }
                    onValueChange={(value) => {
                      let newPriceRange: [number, number] | null = null;
                      if (value !== "all") {
                        const [min, max] = value.split("-").map(Number);
                        newPriceRange = [min, max];
                      }
                      setPriceRange(newPriceRange);
                      setCurrentPage(1);
                      updateURL({
                        category,
                        brand,
                        search,
                        productType,
                        priceRange: newPriceRange,
                        sortOrder,
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full p-2 border rounded">
                      <SelectValue placeholder="Select a price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Price Ranges</SelectLabel>
                        <SelectItem value="all">All Prices</SelectItem>
                        {priceRanges.map(([min, max]) => (
                          <SelectItem
                            key={`${min}-${max}`}
                            value={`${min}-${max}`}
                          >
                            ${min} - {max === Infinity ? "Above" : `$${max}`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2">
                      Sort By
                    </label>
                    {sortOrder !== "asc" && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetSortOrder}
                        disabled={loading}
                        className="text-xs text-blue-600 p-0"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "asc" | "desc") => {
                      setSortOrder(value);
                      setCurrentPage(1);
                      updateURL({
                        category,
                        brand,
                        search,
                        productType,
                        priceRange,
                        sortOrder: value,
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full p-2 border rounded">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Newest First</SelectItem>
                      <SelectItem value="desc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2">
                      Product Type
                    </label>
                    {productType && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetProductType}
                        disabled={loading}
                        className="text-xs text-blue-600 p-0"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Select
                    value={productType || "All"}
                    onValueChange={(value) => {
                      const newProductType = value === "All" ? "" : value;
                      setProductType(newProductType);
                      setCurrentPage(1);
                      updateURL({
                        category,
                        brand,
                        search,
                        productType: newProductType,
                        priceRange,
                        sortOrder,
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full p-2 border rounded">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Product Types</SelectLabel>
                        <SelectItem value="All">All Types</SelectItem>
                        {productTypes.map((type: ProductType) => (
                          <SelectItem key={type._id} value={type.type}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium mb-2">
                      Seller
                    </label>
                    {seller && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={resetSeller}
                        disabled={loading}
                        className="text-xs text-blue-600 p-0"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Select
                    value={seller || "All"}
                    onValueChange={(value) => {
                      const newSeller = value === "All" ? "" : value;
                      setSeller(newSeller);
                      setCurrentPage(1);
                      updateURL({
                        category,
                        brand,
                        search,
                        productType,
                        seller: newSeller,
                        priceRange,
                        sortOrder,
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full p-2 border rounded">
                      <SelectValue placeholder="Select a seller" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sellers</SelectLabel>
                        <SelectItem value="All">All Sellers</SelectItem>
                        {sellers.map((vnd: Seller) => (
                          <SelectItem key={vnd?._id} value={vnd?._id}>
                            {vnd?.storeName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-background p-5 rounded-md w-full">
            {loading && products.length === 0 ? (
              <ShopSkeleton />
            ) : products?.length > 0 ? (
              <div className="w-full">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {products?.map((product, index) => {
                    const isNewlyLoaded = newlyLoadedProducts.some(
                      (newProduct) => newProduct._id === product._id,
                    );
                    return (
                      <div
                        key={`${product._id}-${index}`}
                        className={`transition-all duration-700 ease-out ${
                          isNewlyLoaded
                            ? "opacity-0 translate-y-8 scale-95"
                            : "opacity-100 translate-y-0 scale-100"
                        }`}
                        style={{
                          transitionDelay: isNewlyLoaded
                            ? `${(index % productsPerPage) * 80}ms`
                            : "0ms",
                        }}
                      >
                        <ProductCard product={product} />
                      </div>
                    );
                  })}

                  {/* Show skeleton cards while loading more */}
                  {loadingMore &&
                    Array.from({ length: productsPerPage }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="animate-fadeIn"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <ProductCardSkeleton />
                      </div>
                    ))}
                </div>

                {/* Infinite scroll trigger element */}
                {hasMoreProducts && <div ref={loadMoreRef} className="h-10" />}

                {/* Show completion message when all products loaded */}
                {!hasMoreProducts &&
                  products.length > 0 &&
                  total > 0 &&
                  !loadingMore && (
                    <div className="text-center py-6 mt-6">
                      <p className="text-gray-600 text-lg mb-2">
                        🎉 You&apos;ve seen it all! No more products to show.
                      </p>
                      <p className="text-gray-500 text-sm">
                        Showing all {products.length} products
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              !loading && (
                <EmptyListDesign
                  message="No products match your selected filters."
                  resetFilters={resetAllFilters}
                />
              )
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

// New parent component with Suspense
const ShopPage = ({ categories, brands, productTypes, sellers }: Props) => {
  return (
    <Suspense
      fallback={
        <Container>
          <div className="py-10">
            <ShopSkeleton />
          </div>
        </Container>
      }
    >
      <ShopPageClient
        categories={categories}
        brands={brands}
        productTypes={productTypes}
        sellers={sellers}
      />
    </Suspense>
  );
};

export default ShopPage;
