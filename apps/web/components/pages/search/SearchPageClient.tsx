"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Search, Filter, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SearchPageClient = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const topSearches = [
    "baby stroller",
    "organic baby food",
    "baby clothes 0-3 months",
    "high chair",
    "baby monitor",
    "diaper bag",
    "baby toys",
    "car seat",
    "baby bottles",
    "crib mattress",
  ];

  const searchCategories = [
    { title: "Feeding", count: 156, href: "/shop?category=feeding" },
    { title: "Clothing", count: 234, href: "/shop?category=clothing" },
    { title: "Toys", count: 189, href: "/shop?category=toys" },
    { title: "Safety", count: 98, href: "/shop?category=safety" },
    { title: "Furniture", count: 67, href: "/shop?category=furniture" },
    { title: "Strollers", count: 45, href: "/shop?category=strollers" },
  ];

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sellzy_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Add to recent searches (keep max 10, no duplicates)
    const term = searchQuery.trim();
    const newRecent = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      10,
    );

    setRecentSearches(newRecent);
    localStorage.setItem("sellzy_recent_searches", JSON.stringify(newRecent));

    // Redirect to Shop with query
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newRecent = recentSearches.filter((s) => s !== termToRemove);
    setRecentSearches(newRecent);
    localStorage.setItem("sellzy_recent_searches", JSON.stringify(newRecent));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("sellzy_recent_searches");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Search" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Title className="text-4xl font-bold mb-4">Search Products</Title>
            <p className="text-gray-600">
              Find exactly what you&apos;re looking for from our extensive
              collection
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <form onSubmit={handleSearch} className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for baby products..."
                className="w-full pl-12 pr-32 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                disabled={!searchQuery.trim()}
              >
                Search
              </button>
            </form>

            {/* Filters Navigation (visual links only) */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/shop"
                className="flex items-center gap-2 px-4 py-2 border border-primary/20 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Filter size={16} />
                <span>All Categories</span>
              </Link>
              <Link
                href="/shop?priceMax=50"
                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors text-sm"
              >
                Under $50
              </Link>
              <Link
                href="/shop?sortBy=newest"
                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors text-sm"
              >
                Newest Arrivals
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Searches */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <TrendingUp size={20} />
                  <h2 className="text-xl font-semibold text-foreground">
                    Top Searches
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topSearches.map((search, index) => (
                    <Link
                      key={index}
                      href={`/shop?search=${encodeURIComponent(search)}`}
                      className="px-3 py-2 bg-gray-100/80 rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors border border-transparent hover:border-primary/20"
                    >
                      {search}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search Categories */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Browse by Category
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {searchCategories.map((category, index) => (
                    <Link
                      key={index}
                      href={category.href}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="font-medium group-hover:text-primary transition-colors">
                        {category.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {category.count} products
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Searches (Dynamic block) */}
              {mounted && recentSearches.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearAllRecent}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <Link
                        key={index}
                        href={`/shop?search=${encodeURIComponent(search)}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors group"
                      >
                        <span className="text-sm text-gray-600 group-hover:text-primary transition-colors flex-1 truncate">
                          {search}
                        </span>
                        <button
                          onClick={(e) => removeRecentSearch(search, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                          aria-label={`Remove ${search} from recent`}
                        >
                          <X size={14} />
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Tips */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4 text-foreground">
                  Search Tips
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span> Use specific
                    keywords for better results
                  </p>
                  <p className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span> Try different
                    variations of product names
                  </p>
                  <p className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span> Filter by age
                    group to find age-appropriate items
                  </p>
                  <p className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span> Use brand
                    names for specific products
                  </p>
                  <p className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">•</span> Check
                    spelling for accurate results
                  </p>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-primary">
                  Need Help Finding Something?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our customer service team is here to help you find exactly
                  what you need.
                </p>
                <Link
                  href="/help/contact"
                  className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SearchPageClient;
