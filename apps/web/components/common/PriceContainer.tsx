import React from "react";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number;
  discountPercentage?: number;
}

const PriceContainer = ({ price, discountPercentage }: Props) => {
  if (!discountPercentage) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <PriceFormatter amount={price} className="text-accent" />
      </div>
    );
  }

  const discountedPrice = price * (1 - discountPercentage / 100);
  return (
    <div className="flex items-center gap-2 text-sm">
      <PriceFormatter
        amount={price}
        className="text-muted-foreground line-through font-medium"
      />
      <PriceFormatter amount={discountedPrice} className="text-accent" />
    </div>
  );
};

export default PriceContainer;
