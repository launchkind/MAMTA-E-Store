import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@entry/types";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  categories: Category[];
  className?: string;
}

const CategorySidebar = ({ categories, className }: CategorySidebarProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 w-72 bg-white min-w-[280px] border border-gray-100 shadow-xs h-[500px] rounded-bl-lg rounded-br-lg",
        className,
      )}
    >
      <div className="flex flex-col gap-1 overflow-y-auto pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories?.map((category) => (
          <button key={category._id} className="group relative py-1.5 px-3">
            <Link
              href={{
                pathname: "/shop",
                query: { category: category._id },
              }}
              className="flex items-center gap-3"
            >
              {category.iconImage && (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src={category?.iconImage}
                    alt={category.name}
                    className="object-contain opacity-70 group-hover:opacity-100 hoverEffect"
                    width={22}
                    height={22}
                  />
                </div>
              )}
              <p className="text-base font-semibold text-primary group-hover:text-accent line-clamp-1 hoverEffect">
                {category.name}
              </p>
            </Link>
            <span className="w-[2px] h-0 bg-primary absolute left-0 bottom-1/2 group-hover:h-[50%] transition-all duration-300" />
            <span className="w-[2px] h-0 bg-primary absolute left-0 top-1/2 group-hover:h-[50%] transition-all duration-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
