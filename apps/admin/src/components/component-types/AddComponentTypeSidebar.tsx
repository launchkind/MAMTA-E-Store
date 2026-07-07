import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { ComponentType } from "@/pages/dashboard/ComponentTypesPage";

interface AddComponentTypeSidebarProps {
  open: boolean;
  onClose: () => void;
  editingType: ComponentType | null;
}

interface StructureField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "array", label: "Array" },
  { value: "object", label: "Object" },
];

export default function AddComponentTypeSidebar({
  open,
  onClose,
  editingType,
}: AddComponentTypeSidebarProps) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    icon: "component",
    is_active: true,
  });
  const [structureFields, setStructureFields] = useState<StructureField[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingType) {
      setFormData({
        name: editingType.name,
        label: editingType.label || "",
        description: editingType.description || "",
        icon: editingType.icon || "component",
        is_active: editingType.is_active,
      });
      if (editingType.structure && typeof editingType.structure === "object") {
        const fields = Object.entries(editingType.structure).map(([key, value], index) => ({
          id: `field-${index}`,
          name: key,
          label: ((value as Record<string, unknown>).label as string) || key,
          type: ((value as Record<string, unknown>).type as string) || "text",
          required: ((value as Record<string, unknown>).required as boolean) || false,
          defaultValue: ((value as Record<string, unknown>).defaultValue as string) || "",
        }));
        setStructureFields(fields);
      }
    } else {
      setFormData({ name: "", label: "", description: "", icon: "component", is_active: true });
      setStructureFields([]);
    }
  }, [editingType, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addStructureField = () => {
    setStructureFields((prev) => [
      ...prev,
      { id: `field-${Date.now()}`, name: "", label: "", type: "text", required: false, defaultValue: "" },
    ]);
  };

  const removeStructureField = (id: string) => {
    setStructureFields((prev) => prev.filter((f) => f.id !== id));
  };

  const updateStructureField = (id: string, key: keyof StructureField, value: string | boolean) => {
    setStructureFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and label are required" });
      return;
    }

    const structure: Record<string, unknown> = {};
    structureFields.forEach((field) => {
      if (field.name.trim()) {
        structure[field.name] = {
          label: field.label || field.name,
          type: field.type,
          required: field.required,
          ...(field.defaultValue && { defaultValue: field.defaultValue }),
        };
      }
    });

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        label: formData.label,
        description: formData.description || null,
        icon: formData.icon,
        is_active: formData.is_active,
        structure,
        type: formData.name, // keep the unique `type` column in sync with `name`
      };

      if (editingType) {
        const { error } = await supabase
          .from("component_types")
          .update(payload)
          .eq("id", editingType.id);
        if (error) throw error;
        toast({ title: "Success", description: "Component type updated successfully" });
      } else {
        const { error } = await supabase.from("component_types").insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "Component type created successfully" });
      }
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save component type";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-purple-600 flex items-center justify-between">
            {editingType ? "Edit Component Type" : "Add New Component Type"}
            <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input id="name" name="name" placeholder="e.g., banner, products, carousel" value={formData.name} onChange={handleInputChange} required />
                <p className="text-xs text-gray-500">Lowercase, no spaces (use hyphens)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Display Label <span className="text-red-500">*</span></Label>
                <Input id="label" name="label" placeholder="e.g., Banner, Products, Carousel" value={formData.label} onChange={handleInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Describe what this component type is used for..." value={formData.description} onChange={handleInputChange} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon Name</Label>
                <Input id="icon" name="icon" placeholder="e.g., component, grid, image" value={formData.icon} onChange={handleInputChange} />
                <p className="text-xs text-gray-500">Icon name from Lucide icons library</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div>
                  <Label htmlFor="is_active" className="font-medium">Active Status</Label>
                  <p className="text-sm text-gray-500">Enable this component type</p>
                </div>
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Structure Fields</h3>
                <Button type="button" variant="outline" size="sm" onClick={addStructureField} className="text-purple-600 border-purple-600 hover:bg-purple-50">
                  <Plus size={16} className="mr-1" />Add Field
                </Button>
              </div>

              {structureFields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-gray-500">No structure fields defined</p>
                  <p className="text-sm text-gray-400 mt-1">Add fields to define the component structure</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {structureFields.map((field) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Field</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeStructureField(field.id)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Field Name</Label>
                          <Input placeholder="e.g., title, url" value={field.name} onChange={(e) => updateStructureField(field.id, "name", e.target.value)} className="h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Display Label</Label>
                          <Input placeholder="e.g., Title, URL" value={field.label} onChange={(e) => updateStructureField(field.id, "label", e.target.value)} className="h-9" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Field Type</Label>
                          <Select value={field.type} onValueChange={(value) => updateStructureField(field.id, "type", value)}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Default Value</Label>
                          <Input placeholder="Optional" value={field.defaultValue} onChange={(e) => updateStructureField(field.id, "defaultValue", e.target.value)} className="h-9" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={field.required} onCheckedChange={(checked) => updateStructureField(field.id, "required", checked)} />
                        <Label className="text-xs">Required field</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : <>{editingType ? "Update" : "Create"} Component Type</>}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
