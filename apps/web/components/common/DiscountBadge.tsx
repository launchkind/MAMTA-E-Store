import { cn } from "../../lib/utils";

interface Props {
  discountPercentage?: number;
  className?: string;
}

const DiscountBadge = ({ discountPercentage, className }: Props) => {
  if (!discountPercentage) return null;

  return (
    <span
      className={cn(
        "flex bg-accent text-background text-xs px-3 py-1 rounded-full font-semibold items-center justify-center",
        className
      )}
    >
      -{discountPercentage}%
    </span>
  );
};

export default DiscountBadge;
