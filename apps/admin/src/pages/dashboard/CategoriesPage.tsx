/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { categorySchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Package,
  ChevronRight as ChevronRightIcon,
  Folders,
  Upload,
  ChevronDown,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CategoryBulkUploadModal } from "@/components/categories/CategoryBulkUploadModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  iconImage?: string;
  categoryType: ("Featured" | "Hot Categories" | "Top Categories")[];
  parent?: {
    _id: string;
    name: string;
    slug: string;
    level: number;
  } | null;
  level: number;
  path: string;
  order: number;
  description?: string;
  isActive: boolean;
  childrenCount?: number;
  productCount?: number;
  createdAt: string;
};

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategorySkeletonRow = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-4" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-12 w-12 rounded" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-24 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </TableCell>
  </TableRow>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allParentCategories, setAllParentCategories] = useState<Category[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [viewType, setViewType] = useState<"parent" | "subcategory">("parent");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formLoading, setFormLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deletingCategoryIds, setDeletingCategoryIds] = useState<string[]>([]);

  const { toast } = useToast();
  const { canPerformCRUD } = usePermissions();

  const formAdd = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      iconImage: "",
      categoryType: [],
      parent: null,
      order: undefined,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, ea? Dolore, quas porro! Fugiat, pariatur iste expedita eaque harum facere voluptatem incidunt perspiciatis eligendi inventore qui hic ea placeat quos voluptatum animi minima deserunt reiciendis porro ex sunt aliquid omnis.",
      isActive: true,
    },
  });

  const formEdit = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      iconImage: "",
      categoryType: [],
      parent: null,
      order: undefined,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, ea? Dolore, quas porro! Fugiat, pariatur iste expedita eaque harum facere voluptatem incidunt perspiciatis eligendi inventore qui hic ea placeat quos voluptatum animi minima deserunt reiciendis porro ex sunt aliquid omnis.",
      isActive: true,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapCategory = (row: any): Category => ({
    _id: row.id,
    name: row.name,
    slug: row.slug ?? "",
    image: row.image,
    iconImage: row.icon_image,
    categoryType: row.category_type ?? [],
    parent: row.parent
      ? {
          _id: row.parent.id,
          name: row.parent.name,
          slug: row.parent.slug ?? "",
          level: row.parent.level ?? 0,
        }
      : null,
    level: row.level ?? 0,
    path: "",
    order: row.sort_order ?? 0,
    description: row.description,
    isActive: row.is_active ?? true,
    childrenCount: 0,
    productCount: 0,
    createdAt: row.created_at,
  });

  // Fetch all root categories for parent selection in forms
  const fetchAllParentCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, level, parent_id")
        .is("parent_id", null)
        .order("name");
      if (error) throw error;
      setAllParentCategories(
        (data ?? []).map((row: any) => ({
          _id: row.id,
          name: row.name,
          slug: row.slug ?? "",
          image: undefined,
          iconImage: undefined,
          categoryType: [],
          parent: null,
          level: row.level ?? 0,
          path: "",
          order: 0,
          isActive: true,
          createdAt: "",
        })),
      );
    } catch {
      // Non-critical; fail silently
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("categories")
        .select(
          "*, parent:categories!parent_id(id, name, slug, level)",
          { count: "exact" },
        )
        .order("sort_order")
        .range((page - 1) * perPage, page * perPage - 1);

      if (levelFilter !== undefined && levelFilter !== "all") {
        query = query.eq("level", parseInt(levelFilter));
      }
      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm.trim()}%`);
      }
      if (viewType === "parent") {
        query = query.is("parent_id", null);
      } else if (viewType === "subcategory") {
        query = query.not("parent_id", "is", null);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setCategories((data ?? []).map(mapCategory));
      setTotal(count ?? 0);
      setTotalPages(Math.ceil((count ?? 0) / perPage) || 1);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      toast({
        title: "Success",
        description: "Categories refreshed successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh categories",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, perPage, sortOrder, searchTerm, levelFilter, viewType]);

  useEffect(() => {
    fetchAllParentCategories();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as "asc" | "desc");
    setPage(1);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Prevent closing sidebar when form is submitting
  const handleAddModalChange = (open: boolean) => {
    if (!open && formLoading) {
      toast({
        title: "Action in Progress",
        description: "Please wait while the category is being created...",
        variant: "default",
      });
      return;
    }
    setIsAddModalOpen(open);
  };

  const handleEditModalChange = (open: boolean) => {
    if (!open && formLoading) {
      toast({
        title: "Action in Progress",
        description: "Please wait while the category is being updated...",
        variant: "default",
      });
      return;
    }
    setIsEditModalOpen(open);
  };

  const handleAddCategory = async (data: CategoryFormValues) => {
    setFormLoading(true);
    try {
      const parentId = data.parent ?? null;
      const parentRecord = parentId
        ? allParentCategories.find((c) => c._id === parentId)
        : null;
      const level = parentRecord ? (parentRecord.level ?? 0) + 1 : 0;

      const { error } = await supabase
        .from("categories")
        .insert({
          name: data.name,
          slug:
            data.slug ||
            data.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          description: data.description ?? "",
          parent_id: parentId,
          level,
          is_active: data.isActive ?? true,
          category_type: data.categoryType ?? [],
          sort_order: data.order ?? 0,
          image: data.image ?? "",
          icon_image: data.iconImage ?? "",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description:
          "Category created successfully! You can add another or close the form.",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      setPage(1);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create category";
      if (errorMessage.includes("already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCategory = async (data: CategoryFormValues) => {
    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      const parentId = data.parent ?? null;
      const parentRecord = parentId
        ? allParentCategories.find((c) => c._id === parentId)
        : null;
      const level = parentRecord ? (parentRecord.level ?? 0) + 1 : 0;

      const { error } = await supabase
        .from("categories")
        .update({
          name: data.name,
          slug:
            data.slug ||
            data.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          description: data.description ?? "",
          parent_id: parentId,
          level,
          is_active: data.isActive ?? true,
          category_type: data.categoryType ?? [],
          sort_order: data.order ?? 0,
          image: data.image ?? "",
          icon_image: data.iconImage ?? "",
        })
        .eq("id", selectedCategory._id);

      if (error) throw error;

      toast({
        title: "Success",
        description:
          "Category updated successfully! You can continue editing or close the form.",
      });
      setIsEditModalOpen(false);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update category";
      if (errorMessage.includes("already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = categories.map((c) => c._id);
      setSelectedCategories(allIds);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  const confirmBulkDelete = async () => {
    try {
      setDeletingCategoryIds((prev) => [...prev, ...selectedCategories]);
      const { error } = await supabase
        .from("categories")
        .delete()
        .in("id", selectedCategories);
      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully deleted ${selectedCategories.length} categories`,
      });

      setSelectedCategories([]);
      setIsDeleteModalOpen(false);
      setPage(1);
      fetchCategories();
      fetchAllParentCategories();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete categories",
      });
    } finally {
      setDeletingCategoryIds((prev) =>
        prev.filter((id) => !selectedCategories.includes(id)),
      );
    }
  };

  const handleDeleteCategory = async () => {
    // Bulk Delete Logic (Triggered when selectedCategory is null)
    if (!selectedCategory && selectedCategories.length > 0) {
      await confirmBulkDelete();
      return;
    }

    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      setDeletingCategoryIds((prev) => [...prev, selectedCategory._id]);
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", selectedCategory._id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setPage(1);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete category";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setFormLoading(false);
      setDeletingCategoryIds((prev) =>
        prev.filter((id) => id !== selectedCategory._id),
      );
    }
  };

  // Get available parent categories (exclude self and descendants)
  const getAvailableParents = (currentCategoryId?: string) => {
    if (!currentCategoryId) {
      return allParentCategories.filter((cat) => cat.level < 3); // Max 4 levels (0-3)
    }

    const currentCategory = allParentCategories.find(
      (c) => c._id === currentCategoryId,
    );
    if (!currentCategory)
      return allParentCategories.filter((cat) => cat.level < 3);

    // Exclude self and prevent circular references
    return allParentCategories.filter((cat) => {
      if (cat._id === currentCategoryId) return false;
      if (cat.level >= 3) return false;
      // Check if cat is a descendant of current category
      if (cat.path && cat.path.includes(currentCategoryId)) return false;
      return true;
    });
  };

  const getCategoryBreadcrumb = (category: Category) => {
    const parts: string[] = [];
    if (category.parent) {
      parts.push(category.parent.name);
    }
    parts.push(category.name);
    return parts.join(" › ");
  };

  // Helper function to fetch and display child categories
  const getChildCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent?._id === parentId);
  };

  // Render categories table
  const renderCategoriesTable = (categoriesToDisplay: Category[]) => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Level</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="hidden lg:table-cell">Products</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(perPage)].map((_, index) => (
                <CategorySkeletonRow key={index} />
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Render category rows with children
    const renderCategoryRows = (
      categoryList: Category[],
      depth = 0,
    ): React.ReactNode[] => {
      const rows: React.ReactNode[] = [];

      categoryList.forEach((category) => {
        if (deletingCategoryIds.includes(category._id)) {
          rows.push(<CategorySkeletonRow key={category._id} />);
          return;
        }

        rows.push(
          <TableRow key={category._id} className="hover:bg-gray-50">
            <TableCell className="w-[40px] pl-4">
              <Checkbox
                checked={selectedCategories.includes(category._id)}
                onCheckedChange={(checked) =>
                  handleSelectCategory(category._id, checked as boolean)
                }
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 md:w-24">
                {/* Main Image */}
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-12 h-12 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* Icon Image */}
                {category.iconImage && (
                  <img
                    src={category.iconImage}
                    alt={`${category.name} icon`}
                    className="w-12 h-12 object-contain rounded-sm border bg-gray-50 p-1 hidden md:block"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    title="Category Icon"
                  />
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <div
                  className="flex items-center gap-2"
                  style={{ marginLeft: `${depth * 20}px` }}
                >
                  {category.childrenCount! > 0 && (
                    <button
                      onClick={() => toggleCategoryExpansion(category._id)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {expandedCategories.has(category._id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <span className="font-medium truncate max-w-[150px] md:max-w-none">
                    {category.name}
                  </span>
                  {category.childrenCount! > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {category.childrenCount} sub
                    </Badge>
                  )}
                </div>
                {category.parent && (
                  <span
                    className="text-xs text-gray-500"
                    style={{ marginLeft: `${depth * 20}px` }}
                  >
                    {getCategoryBreadcrumb(category)}
                  </span>
                )}
              </div>
            </TableCell>
            {/* Type - Hide on mobile/tablet */}
            <TableCell className="hidden lg:table-cell">
              <div className="flex flex-wrap gap-1">
                {category.categoryType?.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      type === "Featured" && "bg-blue-100 text-blue-800",
                      type === "Hot Categories" && "bg-red-100 text-red-800",
                      type === "Top Categories" &&
                        "bg-green-100 text-green-800",
                    )}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </TableCell>

            {/* Level - Hide on mobile */}
            <TableCell className="hidden md:table-cell">
              <Badge variant="secondary">L{category.level}</Badge>
            </TableCell>

            {/* Order - Visible on all screens */}
            <TableCell>
              <Badge variant="outline">{category.order}</Badge>
            </TableCell>

            {/* Products - Hide on mobile/tablet */}
            <TableCell className="hidden lg:table-cell">
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <span>{category.productCount || 0} products</span>
              </div>
            </TableCell>

            {/* Status - Hide on mobile */}
            <TableCell className="hidden md:table-cell">
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                className={category.isActive ? "bg-green-600" : ""}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {canPerformCRUD ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCategory(category);
                        formEdit.reset({
                          name: category.name,
                          slug: category.slug || "",
                          image: category.image || "",
                          iconImage: category.iconImage || "",
                          categoryType: category.categoryType || [],
                          parent: category.parent?._id || null,
                          order: category.order || 0,
                          description: category.description || "",
                          isActive: category.isActive,
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDeleteModalOpen(true);
                      }}
                      className="hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 italic">
                    View only
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>,
        );

        // Add child rows if expanded
        if (
          expandedCategories.has(category._id) &&
          category.childrenCount! > 0
        ) {
          const children = getChildCategories(category._id);
          rows.push(...renderCategoryRows(children, depth + 1));
        }
      });

      return rows;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    categories.length > 0 &&
                    selectedCategories.length === categories.length
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                />
              </TableHead>
              <TableHead className="font-semibold w-20">Image</TableHead>
              <TableHead className="font-semibold">
                {selectedCategories.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsDeleteModalOpen(true);
                      }}
                      className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete Selected ({selectedCategories.length})
                    </Button>
                  </div>
                ) : (
                  "Name & Hierarchy"
                )}
              </TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Level</TableHead>
              <TableHead className="font-semibold">Stats</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesToDisplay.length > 0 ? (
              renderCategoryRows(categoriesToDisplay)
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Categories Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage product categories with hierarchical organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <div className="flex items-center gap-2">
            <Folders className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{total}</span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg shadow-sm border space-y-4"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-64"
            />
          </div>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="0">Root (Level 0)</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={handleSortOrderChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">By Order (0-9)</SelectItem>
              <SelectItem value="desc">By Order (9-0)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(perPage)} onValueChange={handlePerPageChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          {canPerformCRUD && (
            <Button
              onClick={() => setIsBulkUploadOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
          )}

          {canPerformCRUD && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          )}
        </div>
      </motion.div>

      {/* View Type Tabs */}
      <Tabs
        value={viewType}
        onValueChange={(value) =>
          setViewType(value as "parent" | "subcategory")
        }
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="parent">Parent Categories</TabsTrigger>
          <TabsTrigger value="subcategory">Subcategories</TabsTrigger>
        </TabsList>

        <TabsContent value="parent" className="mt-4">
          {/* Parent Categories Table */}
          {renderCategoriesTable(categories.filter((cat) => cat.level === 0))}
        </TabsContent>

        <TabsContent value="subcategory" className="mt-4">
          {/* Subcategories Table */}
          {renderCategoriesTable(categories.filter((cat) => cat.level > 0))}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {total > perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * perPage, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> categories
            </div>
            <div className="text-sm text-gray-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {total > 0 && total <= perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-600 bg-white rounded-lg border border-gray-200 px-4 py-3"
        >
          Showing all <span className="font-medium">{total}</span> categories
        </motion.div>
      )}

      {/* Add Category Sidebar */}
      <Sheet open={isAddModalOpen} onOpenChange={handleAddModalChange}>
        <SheetContent className="overflow-y-auto sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Add Category</SheetTitle>
            <SheetDescription>Create a new product category</SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddCategory)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={formAdd.control}
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
                control={formAdd.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={formLoading}
                          placeholder="Auto-generated if left empty"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const nameVal = formAdd.getValues("name");
                          if (nameVal) {
                            formAdd.setValue(
                              "slug",
                              nameVal
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                              { shouldValidate: true, shouldDirty: true },
                            );
                          }
                        }}
                        disabled={formLoading}
                      >
                        Generate Slug
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        disabled={formLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {getAvailableParents().map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {"  ".repeat(cat.level)}
                              {cat.level > 0 && "└─ "}
                              {cat.name} (L{cat.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Leave empty for root category. Maximum 4 levels.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        rows={3}
                        placeholder="Category description for SEO..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        disabled={formLoading}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Types</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {(
                          [
                            "Featured",
                            "Hot Categories",
                            "Top Categories",
                          ] as const
                        ).map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={field.value?.includes(type)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, type]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (v: string) => v !== type,
                                    ),
                                  );
                                }
                              }}
                              disabled={formLoading}
                            />
                            <span className="text-sm font-medium leading-none">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={formLoading}
                          folder="categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formAdd.control}
                  name="iconImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Image (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={(url) => field.onChange(url)}
                          disabled={formLoading}
                          folder="categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    formLoading ||
                    !formAdd.formState.isValid ||
                    !formAdd.formState.isDirty
                  }
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sidebar */}
      <Sheet open={isEditModalOpen} onOpenChange={handleEditModalChange}>
        <SheetContent className="overflow-y-auto sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>Update category information</SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateCategory)}
              className="space-y-4 pt-4"
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={formLoading}
                          placeholder="Auto-generated if left empty"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const nameVal = formEdit.getValues("name");
                          if (nameVal) {
                            formEdit.setValue(
                              "slug",
                              nameVal
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                              { shouldValidate: true, shouldDirty: true },
                            );
                          }
                        }}
                        disabled={formLoading}
                      >
                        Generate Slug
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        disabled={formLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {getAvailableParents(selectedCategory?._id).map(
                            (cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {"  ".repeat(cat.level)}
                                {cat.level > 0 && "└─ "}
                                {cat.name} (L{cat.level})
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Cannot set self or descendants as parent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        rows={3}
                        placeholder="Category description for SEO..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        disabled={formLoading}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Types</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {(
                          [
                            "Featured",
                            "Hot Categories",
                            "Top Categories",
                          ] as const
                        ).map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={field.value?.includes(type)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, type]);
                                } else {
                                  field.onChange(
                                    currentValue.filter(
                                      (v: string) => v !== type,
                                    ),
                                  );
                                }
                              }}
                              disabled={formLoading}
                            />
                            <span className="text-sm font-medium leading-none">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Inactive categories won&apos;t be shown to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={formLoading}
                          folder="categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formEdit.control}
                  name="iconImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Image (Optional)</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? ""}
                          onChange={(url) => field.onChange(url)}
                          disabled={formLoading}
                          folder="categories"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading || !formEdit.formState.isDirty}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Category Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategories.length > 0 && !selectedCategory ? (
                `This action cannot be undone. This will permanently delete ${selectedCategories.length} selected categories.`
              ) : (
                <>
                  This action cannot be undone. This will permanently delete the
                  category{" "}
                  <span className="font-semibold">
                    {selectedCategory?.name}
                  </span>
                  .
                  {(selectedCategory?.childrenCount || 0) > 0 && (
                    <span className="block mt-2 text-red-600 font-semibold">
                      Warning: This category has{" "}
                      {selectedCategory?.childrenCount} subcategories. You must
                      delete or reassign them first.
                    </span>
                  )}
                  {(selectedCategory?.productCount || 0) > 0 && (
                    <span className="block mt-2 text-red-600 font-semibold">
                      Warning: This category has{" "}
                      {selectedCategory?.productCount} products. You must
                      reassign or delete them first.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Upload Modal */}
      <CategoryBulkUploadModal
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        parentCategories={allParentCategories}
        onSuccess={() => {
          fetchCategories();
          fetchAllParentCategories();
        }}
      />
    </div>
  );
}
