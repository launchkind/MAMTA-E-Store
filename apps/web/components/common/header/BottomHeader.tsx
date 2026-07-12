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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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
                  // On the home page the category sidebar is already permanently
                  // visible (in the banner) at lg+ screens, so don't show a
                  // duplicate hover popup there — only show it when that
                  // persistent sidebar is hidden (i.e. below lg, or on other pages).
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

            {/* Premium Pages dropdown — hidden per request
            <div className="relative z-50 py-2">
              ...
            </div>
            */}
          </div>
        )}
      </Container>
    </div>
  );
};

export default BottomHeader;
