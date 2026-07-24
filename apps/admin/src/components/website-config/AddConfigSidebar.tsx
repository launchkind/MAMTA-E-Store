import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { uploadToR2 } from "@/lib/r2-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WebsiteConfig } from "@/pages/dashboard/WebsiteConfigPage";

interface AddConfigSidebarProps {
  open: boolean;
  onClose: () => void;
  editingConfig?: WebsiteConfig | null;
  defaultPageType?: string;
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page" },
  { value: "product", label: "Product Page" },
  { value: "blog", label: "Blog Page" },
  { value: "category", label: "Category Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
];

interface ComponentTypeOption {
  id: string;
  name: string;
  label: string;
  description?: string;
  is_active: boolean;
}

interface FormData {
  page_type: string;
  component_type: string;
  title: string;
  description: string;
  weight: number;
  is_active: boolean;
  settings: { images?: string[]; [key: string]: unknown };
}

export default function AddConfigSidebar({
  open,
  onClose,
  editingConfig,
  defaultPageType = "home",
}: AddConfigSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentTypeOption[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    page_type: defaultPageType,
    component_type: "",
    title: "",
    description: "",
    weight: 0,
    is_active: true,
    settings: { images: [] },
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const fetchComponentTypes = async () => {
      setLoadingTypes(true);
      try {
        const { data, error } = await supabase
          .from("component_types")
          .select("id, name, label, description, is_active")
          .eq("is_active", true);
        if (error) throw error;
        setComponentTypes(data || []);
      } catch (error) {
        console.error(error);
        setComponentTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchComponentTypes();
  }, [open]);

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        page_type: editingConfig.page_type,
        component_type: editingConfig.component_type,
        title: editingConfig.title,
        description: editingConfig.description || "",
        weight: editingConfig.weight,
        is_active: editingConfig.is_active,
        settings: { images: [], ...editingConfig.settings },
      });
    } else {
      setFormData({
        page_type: defaultPageType,
        component_type: "",
        title: "",
        description: "",
        weight: 0,
        is_active: true,
        settings: { images: [] },
      });
    }
  }, [editingConfig, defaultPageType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        page_type: formData.page_type,
        component_type: formData.component_type,
        title: formData.title,
        description: formData.description || null,
        weight: formData.weight,
        is_active: formData.is_active,
        settings: formData.settings,
      };

      if (editingConfig?.id) {
        const { error } = await supabase.from("page_components").update(payload).eq("id", editingConfig.id);
        if (error) throw error;
        toast({ title: "Success", description: "Configuration updated successfully" });
      } else {
        const { error } = await supabase.from("page_components").insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "Configuration created successfully" });
      }
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save configuration";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToR2(files[i], "banners");
        uploadedUrls.push(url);
      }
      const currentImages = (formData.settings.images || []) as string[];
      setFormData((prev) => ({
        ...prev,
        settings: { ...prev.settings, images: [...currentImages, ...uploadedUrls] },
      }));
      toast({ title: "Success", description: `${uploadedUrls.length} image(s) uploaded successfully` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to upload images";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = (formData.settings.images || []) as string[];
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, images: currentImages.filter((_, i) => i !== index) },
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-purple-600 flex items-center justify-between">
            {editingConfig ? "Edit Configuration" : "Add New Component"}
            <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="page_type">Page Type *</Label>
              <Select value={formData.page_type} onValueChange={(value) => setFormData((p) => ({ ...p, page_type: value }))}>
                <SelectTrigger><SelectValue placeholder="Select page type" /></SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="component_type">Component Type *</Label>
              <Select value={formData.component_type} onValueChange={(value) => setFormData((p) => ({ ...p, component_type: value }))} disabled={loadingTypes}>
                <SelectTrigger><SelectValue placeholder={loadingTypes ? "Loading..." : "Select component type"} /></SelectTrigger>
                <SelectContent>
                  {componentTypes.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-gray-500">No component types available. Create one first.</div>
                  ) : (
                    componentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          {type.description && <div className="text-xs text-gray-500">{type.description}</div>}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Hero Banner, Featured Products" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description for internal reference" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Display Order (Weight) * <span className="text-xs text-gray-500 ml-2">Lower = first</span></Label>
              <Input id="weight" type="number" value={formData.weight} onChange={(e) => setFormData((p) => ({ ...p, weight: parseInt(e.target.value) }))} min={0} required />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="is_active" className="text-base font-medium">Active Status</Label>
                <p className="text-sm text-gray-500">{formData.is_active ? "Component is visible on the website" : "Component is hidden"}</p>
              </div>
              <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Images (Optional) <span className="text-xs text-gray-500 ml-2">Upload images for this component</span></Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input id="images" type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="flex-1" />
                  {uploading && <Loader2 className="h-5 w-5 animate-spin text-purple-600" />}
                </div>
                {formData.settings.images && (formData.settings.images as string[]).length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {(formData.settings.images as string[]).map((url, index) => (
                      <div key={index} className="relative group border rounded-lg overflow-hidden">
                        <img src={url} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(index)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Note:</strong> Advanced component settings can be configured after creating this component via the edit action.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {loading ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : <>{editingConfig ? "Update" : "Create"} Component</>}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
