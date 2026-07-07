"use client";

import { Product } from "@entry/types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

const ProductList = ({ products }: Props) => {
  return (
    <div className="w-full p-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
      {products?.map((product) => (
        <ProductCard key={product?._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
