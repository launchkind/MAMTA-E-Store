"use client";
import { Input } from "../../../components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getProductUrl } from "../../../lib/productHelpers";
import {
  Loader2,
  Search,
  X,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import AddToCartButton from "../products/AddToCartButton";
import { useMobileSearchStore } from "@/lib/useMobileSearchStore";

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Import shared types
import { Product, Category, Brand } from "@entry/types";
import Image from "next/image";

// Extend Product to include matchScore for search results
interface SearchProduct extends Product {
  matchScore?: number;
}

interface ProductsResponse {
  products: SearchProduct[];
  total: number;
}

interface SearchConfig {
  enabled: boolean;
  voice: boolean;
  image: boolean;
}

const SearchInput = ({
  config,
  className,
}: {
  config?: SearchConfig;
  className?: string;
}) => {
  // Default to true if config is missing (backward compatibility)
  const isEnabled = config?.enabled ?? true;
  const isVoiceEnabled = config?.voice ?? true;
  const isImageEnabled = config?.image ?? true;

  if (!isEnabled) return null;
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const {
    showSearch,
    toggle: toggleMobileSearch,
    open: openMobileSearch,
    close: closeMobileSearch,
  } = useMobileSearchStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Voice search states
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Image search states
  const [isImageSearching, setIsImageSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

          setSearch(transcript);
          setShowResults(true);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            setError(
              "Microphone access denied. Please enable microphone access.",
            );
          } else if (event.error === "no-speech") {
            setError("No speech detected. Please try again.");
          } else {
            setError("Voice search error. Please try again.");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Helper: compute current price after discount
  const currentPrice = (product: SearchProduct) => {
    if (!product.discountPercentage) return product.price;
    return +(product.price * (1 - product.discountPercentage / 100)).toFixed(2);
  };

  const mapProduct = (row: Record<string, unknown>): SearchProduct => ({
    _id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    price: row.price as number,
    discountPercentage: (row.discount_percentage as number) || 0,
    stock: row.stock as number,
    averageRating: (row.average_rating as number) || 0,
    image: row.image as string,
    category: (row.category as { _id: string; name: string; image: string; categoryType: string }) || { _id: "", name: "", image: "", categoryType: "" },
    brand: (row.brand as { _id: string; name: string }) || { _id: "", name: "" },
    seller: null,
    ratings: [],
  } as unknown as SearchProduct);

  const fetchFeaturedProducts = useCallback(async () => {
    setFeaturedLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, discount_percentage, stock, average_rating, image, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
        .limit(5);
      setFeaturedProducts((data || []).map(mapProduct));
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, discount_percentage, stock, average_rating, image, category:categories!products_category_id_fkey(id, name, image), brand:brands!products_brand_id_fkey(id, name)")
        .ilike("name", `%${searchTerm}%`)
        .limit(10);
      setProducts((data || []).map(mapProduct));
    } catch {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByImage = useCallback(async (imageFile: File) => {
    setIsImageSearching(true);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = `${apiUrl}${apiUrl.includes("/api") ? "" : "/api"}/products/search-by-image`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Image search error response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(errorData.message || "Image search failed");
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setShowResults(true);

      if (data.products.length === 0) {
        setError("No matching products found for this image");
      }
    } catch (err) {
      setError("Failed to search by image. Please try again.");
      console.error("Image search error:", err);
    } finally {
      setIsImageSearching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, fetchProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showSearch]);

  const handleToggleMobileSearch = () => {
    toggleMobileSearch();
    if (!showSearch) {
      setSearch("");
      setShowResults(true);
    }
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting voice recognition:", error);
        setError("Could not start voice search. Please try again.");
      }
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Perform search
      searchByImage(file);
      // Clear text search when using image search
      setSearch("");
    }

    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const triggerImageUpload = (isMobile = false) => {
    if (isMobile && mobileFileInputRef.current) {
      mobileFileInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearImageSearch = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setSearch("");
    setProducts([]);
  };

  return (
    <div ref={searchRef} className={`relative lg:w-full ${className || ""}`}>
      {/* Desktop search form (hidden on mobile - mobile toggle lives in Header) */}
      <form
        className="relative hidden lg:flex items-center bg-primary-foreground rounded-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        {imagePreview ? (
          <div className="flex-1 rounded-md py-2 px-3 bg-card border-2 border-accent flex items-center gap-2">
            <div className="w-10 h-10 rounded overflow-hidden shrink-0">
              <Image
                src={imagePreview}
                alt="Search image"
                className="object-cover w-full h-full"
                width={40}
                height={40}
              />
            </div>
            <span className="text-sm text-muted-foreground flex-1 truncate">
              Searching by image...
            </span>
          </div>
        ) : (
          <Input
            placeholder="Search Products..."
            className="flex-1 rounded-sm py-6 focus-visible:ring-0 focus-visible:border-accent bg-card text-foreground placeholder:font-semibold placeholder:tracking-wide pr-16"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowResults(true)}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="absolute right-3 top-2.5 flex items-center gap-2 text-primary border-l border-l-primary/50 pl-2">
          {voiceSupported && isVoiceEnabled && (
            <button
              type="button"
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`p-1 rounded-full hoverEffect ${
                isListening ? "bg-accent animate-pulse" : "hover:text-accent"
              }`}
              title={isListening ? "Stop listening" : "Voice search"}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
          {search || imagePreview ? (
            <X
              onClick={imagePreview ? clearImageSearch : () => setSearch("")}
              className="w-5 h-5 hover:text-accent hoverEffect cursor-pointer"
            />
          ) : (
            <Search className="w-5 h-5 hover:text-accent hoverEffect" />
          )}
        </div>
      </form>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed lg:hidden left-0 top-24 z-50 w-full px-1 py-1 md:px-5 md:py-2 bg-card"
          >
            <div className="bg-card p-4 shadow-lg rounded-md">
              <div className="relative flex items-center">
                {imagePreview ? (
                  <div className="w-full rounded-md py-2 px-3 bg-card border-2 border-accent flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden shrink-0">
                      <img
                        src={imagePreview}
                        alt="Search image"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      Searching by image...
                    </span>
                  </div>
                ) : (
                  <Input
                    ref={mobileInputRef}
                    placeholder="Search Products..."
                    className="w-full pr-16 py-5 rounded-md focus-visible:ring-0 focus-visible:border-accent bg-card text-foreground placeholder:font-semibold"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowResults(true)}
                  />
                )}
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="absolute right-4 flex items-center gap-2">
                  {voiceSupported && isVoiceEnabled && (
                    <button
                      type="button"
                      onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                      className={`p-1 rounded-full transition-colors ${
                        isListening
                          ? "bg-accent text-white animate-pulse"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      title={isListening ? "Stop listening" : "Voice search"}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  {search || imagePreview ? (
                    <X
                      onClick={
                        imagePreview ? clearImageSearch : () => setSearch("")
                      }
                      className="w-5 h-5 text-muted-foreground hover:text-accent hoverEffect cursor-pointer"
                    />
                  ) : (
                    <Search className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground flex-1">
                    Searching by image...
                  </span>
                  <button
                    onClick={clearImageSearch}
                    className="text-accent hover:text-accent/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile search results */}
              {showResults && (
                <div className="mt-2 bg-card rounded-xl shadow-xl overflow-y-auto border border-border max-h-[60vh]">
                  {loading || isImageSearching ? (
                    /* ── Skeleton loader ── */
                    <div className="py-2">
                      <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span className="text-sm font-semibold text-foreground">
                          {isImageSearching ? "Analyzing image…" : "Searching…"}
                        </span>
                      </div>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-3 animate-pulse border-b border-border last:border-b-0"
                        >
                          <div className="w-14 h-14 bg-muted rounded-lg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/3" />
                          </div>
                          <div className="w-20 h-8 bg-muted rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : products?.length > 0 ? (
                    /* ── Search results ── */
                    <div>
                      <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {products.length} result
                          {products.length !== 1 ? "s" : ""} found
                        </p>
                      </div>
                      {products.map((product) => {
                        const cp = currentPrice(product);
                        const hasDiscount =
                          !!product.discountPercentage &&
                          product.discountPercentage > 0;
                        const inStock = (product.stock ?? 0) > 0;
                        return (
                          <div
                            key={product._id}
                            className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                            onClick={() => {
                              setShowResults(false);
                              setSearch("");
                              closeMobileSearch();
                            }}
                          >
                            <Link
                              href={getProductUrl(product)}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div className="w-14 h-14 bg-muted/50 rounded-lg shrink-0 overflow-hidden border border-border mt-1">
                                <img
                                  src={product.images?.[0] || product.image}
                                  alt={product.name}
                                  className="object-contain w-full h-full p-0.5"
                                />
                              </div>
                              <div className="flex-1 min-w-0 py-1">
                                <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-sm font-bold text-accent">
                                    ${cp.toFixed(2)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ${product.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                                    inStock
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {inStock ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>
                            </Link>
                            <div className="shrink-0 ml-1 w-[100px] sm:w-[120px]">
                              <AddToCartButton
                                product={product}
                                className="h-9 w-full text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="px-4 py-3 border-t border-border bg-muted/30">
                        <Link
                          href={`/shop?search=${encodeURIComponent(search)}`}
                          onClick={() => {
                            setShowResults(false);
                            closeMobileSearch();
                          }}
                          className="flex items-center justify-center gap-2 w-full py-2 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 hoverEffect"
                        >
                          <Search className="w-4 h-4" />
                          View all results for &quot;{search}&quot;
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* ── Popular / No results ── */
                    <>
                      <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
                        {!search ? (
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Popular Products
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            No results for &quot;
                            <span className="text-accent">{search}</span>&quot;
                          </p>
                        )}
                      </div>
                      <div>
                        {featuredLoading ? (
                          [1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 px-4 py-3 animate-pulse border-b border-border last:border-b-0"
                            >
                              <div className="w-10 h-10 bg-muted rounded-lg shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/4" />
                              </div>
                            </div>
                          ))
                        ) : featuredProducts?.length > 0 ? (
                          featuredProducts.map((item) => {
                            const cp = currentPrice(item);
                            return (
                              <button
                                key={item._id}
                                onClick={() => {
                                  setSearch(item.name);
                                  setShowResults(true);
                                }}
                                className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-muted/30 border-b border-border last:border-b-0 transition-colors"
                              >
                                <div className="w-10 h-10 bg-muted/50 rounded-lg shrink-0 overflow-hidden border border-border">
                                  <img
                                    src={item.images?.[0] || item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-0.5"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground line-clamp-1">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-accent font-semibold">
                                    ${cp.toFixed(2)}
                                  </p>
                                </div>
                                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No popular products available
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop search results dropdown */}
      {showResults && !showSearch && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card rounded-xl shadow-2xl z-50 max-h-[72vh] overflow-y-auto border border-border lg:block hidden">
          {loading || isImageSearching ? (
            /* ── Skeleton loader ── */
            <div>
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm font-semibold text-foreground">
                  {isImageSearching ? "Analyzing image…" : "Searching…"}
                </span>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 animate-pulse"
                >
                  <div className="w-16 h-16 bg-muted rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="w-24 h-9 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : products?.length > 0 ? (
            /* ── Search results ── */
            <div>
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {products.length} result{products.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              {products.map((product) => {
                const cp = currentPrice(product);
                const hasDiscount =
                  !!product.discountPercentage &&
                  product.discountPercentage > 0;
                const inStock = (product.stock ?? 0) > 0;
                const brandName =
                  typeof product.brand === "object"
                    ? product.brand?.name
                    : product.brand;
                return (
                  <div
                    key={product._id}
                    className={`flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${
                      product.matchScore && product.matchScore >= 90
                        ? "border-l-4 border-l-green-500"
                        : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="shrink-0"
                      onClick={() => {
                        setShowResults(false);
                        setSearch("");
                      }}
                    >
                      <Link href={getProductUrl(product)}>
                        <div className="w-16 h-16 bg-muted/50 rounded-xl overflow-hidden border border-border hover:border-accent transition-colors">
                          <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="object-contain w-full h-full p-1"
                          />
                        </div>
                      </Link>
                    </div>

                    {/* Info */}
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        setShowResults(false);
                        setSearch("");
                      }}
                    >
                      <Link href={getProductUrl(product)}>
                        <p className="text-sm font-semibold text-foreground line-clamp-1 hover:text-accent transition-colors">
                          {product.name}
                        </p>
                        {/* Price row */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[15px] font-bold text-accent">
                            ${cp.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-xs text-muted-foreground line-through">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                                -{product.discountPercentage}%
                              </span>
                            </>
                          )}
                        </div>
                        {/* Meta row */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              inStock
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {inStock ? "In Stock" : "Out of Stock"}
                          </span>
                          {product.matchScore && product.matchScore >= 90 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {product.matchScore}% match
                            </span>
                          )}
                          {product.category?.name && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {product.category.name}
                            </span>
                          )}
                          {brandName && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {brandName}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Add to cart */}
                    <div className="shrink-0 w-[120px] ml-2">
                      <AddToCartButton
                        product={product}
                        className="h-10 w-full text-xs font-semibold"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Footer CTA */}
              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <Link
                  href={`/shop?search=${encodeURIComponent(search)}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  View all results for &quot;{search}&quot;
                </Link>
              </div>
            </div>
          ) : (
            /* ── Popular / No results ── */
            <>
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
                {!search ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Popular Products
                  </p>
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    No results for &quot;
                    <span className="text-accent">{search}</span>&quot;
                  </p>
                )}
              </div>
              <div>
                {featuredLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 animate-pulse border-b border-border last:border-b-0"
                    >
                      <div className="w-12 h-12 bg-muted rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  ))
                ) : featuredProducts?.length > 0 ? (
                  featuredProducts.map((item) => {
                    const cp = currentPrice(item);
                    return (
                      <button
                        key={item._id}
                        onClick={() => {
                          setSearch(item.name);
                          setShowResults(true);
                        }}
                        className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-muted/30 border-b border-border last:border-b-0 transition-colors"
                      >
                        <div className="w-12 h-12 bg-muted/50 rounded-xl shrink-0 overflow-hidden border border-border">
                          <img
                            src={item.images?.[0] || item.image}
                            alt={item.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-accent font-semibold">
                            ${cp.toFixed(2)}
                          </p>
                        </div>
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-10 text-center">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No popular products available
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
