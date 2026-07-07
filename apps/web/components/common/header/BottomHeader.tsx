"use client";
import Container from "../Container";
import Image from "next/image";
import { dots } from "@/assets/image";
import { bottomHeaderNavList } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useState, useRef, useEffect } from "react";
import { Category } from "@entry/types";
import CategorySidebar from "../CategorySidebar";
import { ChevronDown } from "lucide-react";

interface BottomHeaderProps {
  config?: {
    enabled?: boolean;
    categoryMenu?: boolean;
    navList?: boolean;
  };
  categories?: Category[];
}

const BottomHeader = ({ config, categories }: BottomHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        premiumRef.current &&
        !premiumRef.current.contains(event.target as Node)
      ) {
        setIsPremiumOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If no config or enabled is false, don't render anything
  if (config?.enabled === false) return null;

  const pathname = usePathname();

  return (
    <div>
      <Container className="flex items-center gap-5 relative">
        {/* Category Menu Toggle */}
        {(config?.categoryMenu ?? true) && (
          <div
            ref={containerRef}
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-primary-foreground p-5 w-72 h-12 flex items-center justify-start gap-4 rounded-tl-lg rounded-tr-lg"
            >
              <Image src={dots} alt="dots" width={20} height={20} />
              <p className="text-black font-semibold text-base">
                All Categories
              </p>
            </button>
            {isOpen && (
              <div
                className={cn(
                  "absolute top-full left-0 z-50 w-full animate-in fade-in zoom-in-95 duration-200",
                  pathname === "/" && "lg:hidden",
                )}
              >
                <CategorySidebar
                  categories={categories || []}
                  className="rounded-tl-none rounded-tr-none shadow-xl border-t-0"
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation List */}
        {(config?.navList ?? true) && (
          <div className="hidden md:inline-flex items-center gap-4 lg:gap-8">
            {bottomHeaderNavList?.map((item) => (
              <Link href={item?.href} key={item?.title}>
                <p
                  className={cn(
                    "text-sm lg:text-base font-semibold text-primary-foreground/90 hover:text-accent hoverEffect",
                    pathname === item?.href && "text-accent",
                  )}
                >
                  {item?.title}
                </p>
              </Link>
            ))}

            {/* Premium Pages Dropdown */}
            <div 
              className="relative z-50 py-2" 
              ref={premiumRef}
              onMouseEnter={() => setIsPremiumOpen(true)}
              onMouseLeave={() => setIsPremiumOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 text-sm lg:text-base font-semibold text-primary-foreground/90 hover:text-accent hoverEffect",
                  isPremiumOpen && "text-accent"
                )}
              >
                Premium Pages
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isPremiumOpen && "rotate-180"
                  )}
                />
              </button>
              
              <div
                className={cn(
                  "absolute top-[calc(100%-8px)] right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-200 origin-top-right",
                  isPremiumOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
              >
                <div className="p-2 space-y-1">
                  <Link
                    href="/seller"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    href="/compare"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Compare Products
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    My Wishlist
                  </Link>
                  <Link
                    href="/features"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Featured Collections
                  </Link>
                  <Link
                    href="/new-arrivals"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href="/returns"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Returns & Exchanges
                  </Link>
                  <Link
                    href="/user/orders/demo-order-123"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Order Tracking Details
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Product Reviews
                  </Link>
                  <Link
                    href="/user/analytics"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    User Analytics
                  </Link>
                  <Link
                    href="/user/notifications"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    User Notifications
                  </Link>
                  <Link
                    href="/become-seller"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors text-foreground"
                  >
                    Become a Seller
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default BottomHeader;
