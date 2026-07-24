import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Pencil, Trash2, ImageIcon, Search, Loader2 } from "lucide-react";

type WebsiteIcon = {
  _id: string;
  name: string;
  url: string;
  type: string | null;
  created_at: string;
  updated_at: string;
};

const iconTypes = [
  { value: "logo", label: "Logo" },
  { value: "favicon", label: "Favicon" },
  { value: "social", label: "Social Media" },
  { value: "footer", label: "Footer" },
  { value: "header", label: "Header" },
  { value: "other", label: "Other" },
];

const iconSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().default("other"),
  url: z.string().min(1, "Image is required"),
});

type FormData = z.infer<typeof iconSchema>;

export default function WebsiteIconsPage() {
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const [icons, setIcons] = useState<WebsiteIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<WebsiteIcon | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const formAdd = useForm<FormData>({
    resolver: zodResolver(iconSchema),
    defaultValues: { name: "", type: "other", url: "" },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(iconSchema),
    defaultValues: { name: "", type: "other", url: "" },
  });

  const fetchIcons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_icons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setIcons(
        (data || []).map((row) => ({
          _id: row.id,
          name: row.name,
          url: row.url,
          type: row.type,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch website icons:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load website icons",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons();
  }, []);

  const filteredIcons = useMemo(() => {
    return icons.filter((icon) => {
      const matchesSearch = icon.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || icon.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [icons, searchQuery, typeFilter]);

  const handleAdd = async (data: FormData) => {
    setFormLoading(true);
    try {
      const { error } = await supabase.from("website_icons").insert({
        name: data.name,
        type: data.type,
        url: data.url,
      });
      if (error) throw error;

      toast({ title: "Success", description: "Icon created successfully" });
      formAdd.reset({ name: "", type: "other", url: "" });
      setIsAddOpen(false);
      fetchIcons();
    } catch (error) {
      console.error("Failed to create icon:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create icon",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditOpen = (icon: WebsiteIcon) => {
    setSelectedIcon(icon);
    formEdit.reset({
      name: icon.name,
      type: icon.type || "other",
      url: icon.url,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (data: FormData) => {
    if (!selectedIcon) return;
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("website_icons")
        .update({
          name: data.name,
          type: data.type,
          url: data.url,
        })
        .eq("id", selectedIcon._id);
      if (error) throw error;

      toast({ title: "Success", description: "Icon updated successfully" });
      setIsEditOpen(false);
      setSelectedIcon(null);
      fetchIcons();
    } catch (error) {
      console.error("Failed to update icon:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update icon",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOpen = (icon: WebsiteIcon) => {
    setSelectedIcon(icon);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedIcon) return;
    try {
      const { error } = await supabase
        .from("website_icons")
        .delete()
        .eq("id", selectedIcon._id);
      if (error) throw error;

      toast({ title: "Success", description: "Icon deleted successfully" });
      setIsDeleteOpen(false);
      setSelectedIcon(null);
      fetchIcons();
    } catch (error) {
      console.error("Failed to delete icon:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete icon",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Website Icons
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage logos, favicons, and other website assets
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Icon
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {iconTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredIcons.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No icons found</h3>
          <p className="text-muted-foreground">
            {searchQuery || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by adding your first icon"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIcons.map((icon) => (
            <Card key={icon._id} className="overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center p-6">
                {icon.url ? (
                  <img
                    src={icon.url}
                    alt={icon.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold truncate">{icon.name}</h3>
                {icon.type && (
                  <p className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md w-fit capitalize">
                    {icon.type}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOpen(icon)}
                    className="flex-1"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOpen(icon)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Icon</DialogTitle>
            <DialogDescription>
              Upload a new icon or logo for your website
            </DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAdd)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Main Logo"
                        {...field}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        folder="website_icons"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Icon
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Icon</DialogTitle>
            <DialogDescription>Update the icon details</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdate)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        folder="website_icons"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Icon
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Icon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedIcon?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
