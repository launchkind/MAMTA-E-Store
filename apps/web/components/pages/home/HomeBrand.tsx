import SectionView from "@/components/common/SectionView";
import { Brand } from "@entry/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  brands: Brand[];
}

const HomeBrand = ({ brands }: Props) => {
  if (brands?.length === 0) {
    return null;
  }
  return (
    <div className="mt-5 border bg-background p-5 rounded-md">
      <SectionView
        title="Brand we love"
        href="/shop"
        hrefTitle="view all brands"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {brands?.map((brand) => (
          <Link
            key={brand?._id}
            href={{
              pathname: "/shop",
              query: { brand: brand._id },
            }}
            className="flex flex-col items-center justify-center"
          >
            <Image
              src={brand?.image as string}
              alt="brandImage"
              width={250}
              height={250}
              className="w-32"
            />
            <p className="text-sm font-medium text-center line-clamp-1 mt-1">
              {brand?.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeBrand;
