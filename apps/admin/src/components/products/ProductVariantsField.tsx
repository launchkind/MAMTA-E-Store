import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash } from "lucide-react";

interface ProductVariantsFieldProps {
  control: Control<any>;
  name: string;
  disabled?: boolean;
}

export function ProductVariantsField({ control, name, disabled }: ProductVariantsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Variants (Color / RAM-Storage)</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ color: "", storage: "", price: undefined, stock: 0, images: [], sku: "" })
          }
          disabled={disabled}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Variant
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No variants added. If left empty, this product is sold as a single option using the
          base price, stock, and images above.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={control}
                  name={`${name}.${index}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Blue" disabled={disabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${index}.storage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">RAM / Storage</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 256GB" disabled={disabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Price Override</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Same as base price"
                          disabled={disabled}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${index}.stock`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Stock</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={disabled}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`${name}.${index}.sku`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">SKU (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. IP16-BLU-256" disabled={disabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={`${name}.${index}.images.0`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Variant Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={disabled}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove Variant
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <FormMessage />
    </div>
  );
}
