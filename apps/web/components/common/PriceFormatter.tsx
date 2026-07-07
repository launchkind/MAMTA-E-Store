"use client";
import { twMerge } from "tailwind-merge";
import { useCurrencyStore } from "../../lib/store";

interface Props {
  amount: number | undefined;
  className?: string;
}

const PriceFormatter = ({ amount, className }: Props) => {
  const { getCurrentCurrency, convertPrice } = useCurrencyStore();

  if (amount === undefined || amount === null) return null;

  const currency = getCurrentCurrency();
  const convertedAmount = convertPrice(amount);

  const formattedPrice = new Number(convertedAmount).toLocaleString("en-US", {
    currency: currency.code,
    style: "currency",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span
      className={twMerge(
        "text-sm font-semibold text-tech_dark_color",
        className
      )}
    >
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
