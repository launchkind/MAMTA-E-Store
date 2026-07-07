import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ImageIcon, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type WebsiteIcon = {
  _id: string;
  name: string;
  key: string;
  imageUrl: string;
  description?: string;
  category: "logo" | "favicon" | "social" | "footer" | "header" | "other";
  dimensions?: {
    width: number;
    height: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type IconFormData = {
  name: string;
  key: string;
  description: string;
  category: string;
  dimensions: string;
  isActive: boolean;
};

export default function WebsiteIcons() {
  const { token } = useAuthStore();
  const [icons, setIcons] = useState<WebsiteIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<WebsiteIcon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [iconToDelete, setIconToDelete] = useState<WebsiteIcon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<IconFormData>({
    name: "",
    key: "",
    description: "",
    category: "other",
    dimensions: "",
    isActive: true,
  });

  const categories = [
    { value: "logo", label: "Logo" },
    { value: "favicon", label: "Favicon" },
    { value: "social", label: "Social Media" },
    { value: "footer", label: "Footer" },
    { value: "header", label: "Header" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const response = await fetch(`${API_URL}/api/website-icons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setIcons(data.data);
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
      toast.error("Failed to fetch icons");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !editingIcon) {
      toast.error("Please select an image");
      return;
    }

    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("key", formData.key);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("isActive", String(formData.isActive));

    if (formData.dimensions) {
      formDataToSend.append("dimensions", formData.dimensions);
    }

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const url = editingIcon
        ? `${API_URL}/api/website-icons/${editingIcon._id}`
        : `${API_URL}/api/website-icons`;

      const response = await fetch(url, {
        method: editingIcon ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingIcon
            ? "Icon updated successfully"
            : "Icon created successfully"
        );
        setSidebarOpen(false);
        resetForm();
        fetchIcons();
      } else {
        toast.error(data.message || "Failed to save icon");
      }
    } catch (error) {
      console.error("Error saving icon:", error);
      toast.error("Failed to save icon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (icon: WebsiteIcon) => {
    setEditingIcon(icon);
    setFormData({
      name: icon.name,
      key: icon.key,
      description: icon.description || "",
      category: icon.category,
      dimensions: icon.dimensions ? JSON.stringify(icon.dimensions) : "",
      isActive: icon.isActive,
    });
    setImagePreview(icon.imageUrl);
    setSidebarOpen(true);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      key: generateSlug(name),
    });
  };

  const handleDelete = async () => {
    if (!iconToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/api/website-icons/${iconToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Icon deleted successfully");
        setDeleteDialogOpen(false);
        setIconToDelete(null);
        fetchIcons();
      } else {
        toast.error(data.message || "Failed to delete icon");
      }
    } catch (error) {
      console.error("Error deleting icon:", error);
      toast.error("Failed to delete icon");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      key: "",
      description: "",
      category: "other",
      dimensions: "",
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
    setEditingIcon(null);
  };

  const filteredIcons = icons.filter((icon) => {
    const matchesSearch =
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || icon.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Website Icons
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage logos, favicons, and other website assets
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setSidebarOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Icon
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-md">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-48">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Icons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredIcons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No icons found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by adding your first icon"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIcons.map((icon) => (
            <div
              key={icon._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
                <img
                  src={icon.imageUrl}
                  alt={icon.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {icon.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                      {icon.key}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      icon.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {icon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md w-fit capitalize">
                  {icon.category}
                </p>
                {icon.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {icon.description}
                  </p>
                )}
                {icon.dimensions && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {icon.dimensions.width} × {icon.dimensions.height}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(icon)}
                    className="flex-1"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIconToDelete(icon);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => !submitting && setSidebarOpen(false)}
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingIcon ? "Edit Icon" : "Add New Icon"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {editingIcon
                      ? "Update the icon details below"
                      : "Upload a new icon for your website"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  disabled={submitting}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Main Logo"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key">
                      Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          key: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_"),
                        })
                      }
                      placeholder="e.g., main_logo"
                      required
                      disabled={submitting}
                    />
                    <p className="text-xs text-gray-500">
                      Auto-generated from name (editable)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description..."
                    rows={3}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">
                    Dimensions (JSON format, optional)
                  </Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) =>
                      setFormData({ ...formData, dimensions: e.target.value })
                    }
                    placeholder='{"width": 200, "height": 100}'
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">
                    Image{" "}
                    {!editingIcon && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingIcon}
                    disabled={submitting}
                  />
                  {imagePreview && (
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-48 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                    disabled={submitting}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSidebarOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {editingIcon ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{editingIcon ? "Update" : "Create"}</>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Icon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{iconToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
