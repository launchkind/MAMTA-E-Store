"use client";
import React from "react";
import { ProductVariant } from "@entry/types";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: ProductVariant | null;
  onChange: (variant: ProductVariant) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selected,
  onChange,
}) => {
  const colors = Array.from(
    new Set(variants.map((v) => v.color).filter((c): c is string => !!c)),
  );
  const storagesForColor = (color: string | undefined) =>
    Array.from(
      new Set(
        variants
          .filter((v) => (color ? v.color === color : true))
          .map((v) => v.storage)
          .filter((s): s is string => !!s),
      ),
    );

  const findVariant = (color: string | undefined, storage: string | undefined) =>
    variants.find(
      (v) => (v.color ?? undefined) === color && (v.storage ?? undefined) === storage,
    );

  const handleColorSelect = (color: string) => {
    const storages = storagesForColor(color);
    const nextStorage = storages.includes(selected?.storage ?? "")
      ? selected?.storage
      : storages[0];
    const next = findVariant(color, nextStorage) ?? variants.find((v) => v.color === color);
    if (next) onChange(next);
  };

  const handleStorageSelect = (storage: string) => {
    const next = findVariant(selected?.color, storage) ?? variants.find((v) => v.storage === storage);
    if (next) onChange(next);
  };

  const storages = storagesForColor(selected?.color);

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Color{selected?.color ? `: ${selected.color}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  selected?.color === color
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {storages.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            RAM / Storage{selected?.storage ? `: ${selected.storage}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage) => (
              <button
                key={storage}
                type="button"
                onClick={() => handleStorageSelect(storage)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  selected?.storage === storage
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
