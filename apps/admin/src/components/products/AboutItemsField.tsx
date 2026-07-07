import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash, GripVertical } from "lucide-react";

interface AboutItemsFieldProps {
  control: Control<any>;
  name: string;
  disabled?: boolean;
}

export function AboutItemsField({ control, name, disabled }: AboutItemsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>About This Item (Features)</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append("")}
          disabled={disabled}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Feature
        </Button>
      </div>
      
      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No features added yet. Click "Add Feature" to list key product details.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex items-center justify-center p-2 text-muted-foreground cursor-grab active:cursor-grabbing">
               <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">
                {/* We register purely with index for arrays of primitives if using smart form components, 
                    but here we are using manual input rendering. 
                    Since we used append(""), our field value is the string itself technically, 
                    but react-hook-form manages objects in fields usually. 
                    Actually for z.array(z.string()), Controller is safer or strict syntax. 
                    Let's use Controller-like pattern or simple register if possible.
                    WITH useFieldArray and strings, it's tricky. 
                    Better to use objects { text: string } in schema?
                    OR just standard indexed access: name={`${name}.${index}`}
                */}
                <ControllerInput 
                    control={control} 
                    name={`${name}.${index}`} 
                    disabled={disabled} 
                    placeholder="e.g. 100% Cotton, Machine Washable"
                />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={disabled}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <FormMessage />
    </div>
  );
}

// Helper component to handle simple string array inputs cleanly
import { FormControl, FormField, FormItem } from "@/components/ui/form";

function ControllerInput({ control, name, disabled, placeholder }: any) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <Input {...field} disabled={disabled} placeholder={placeholder} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
