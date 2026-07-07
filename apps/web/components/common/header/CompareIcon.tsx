"use client";

import { Shuffle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const CompareIcon = () => {
  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    toast("Premium Feature", {
      description: "Product comparison is available in the premium source code.",
      action: {
        label: "Get Premium",
        onClick: () => {
          const buyLink = process.env.NEXT_PUBLIC_PURCHASE_LINK || "https://reactbd.com/products/entry";
          window.open(buyLink, "_blank");
        },
      },
      icon: <Shuffle className="w-4 h-4 text-accent" />,
      duration: 5000,
    });
  };

  return (
    <Link
      href="/compare"
      onClick={handleCompareClick}
      className="relative group hover:text-accent hoverEffect"
    >
      <Shuffle size={24} />
      <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
        0
      </span>
    </Link>
  );
};

export default CompareIcon;
