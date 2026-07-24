/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { productBannerSchema } from "@/lib/validation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  X,
  Layers,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type ProductType = {
  _id: string;
  name: string;
};

type ProductBanner = {
  _id: string;
  image: string;
  title: string;
  description?: string;
  buttonTitle?: string;
  buttonHref?: string;
  isActive: boolean;
  order: number;
  productType?: string | ProductType;
  createdAt: string;
};

type FormData = z.infer<typeof productBannerSchema>;

export default function ProductBannersPage() {
  const [banners, setBanners] = useState<ProductBanner[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Sheet state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<ProductBanner | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(productBannerSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      buttonTitle: "",
      buttonHref: "",
      isActive: true,
      order: 0,
      productType: "",
    },
  });

  const fetchBanners = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      let query = supabase
        .from("product_banners")
        .select("*, product:products!product_id(id, name)", { count: "exact" })
        .order("sort_order")
        .range((page - 1) * perPage, page * perPage - 1);

      if (activeFilter !== "all")
        query = query.eq("is_active", activeFilter === "true");
      if (searchTerm.trim())
        query = query.ilike("title", `%${searchTerm.trim()}%`);

      const { data, count, error } = await query;

      if (error) throw error;

      const mapped: ProductBanner[] = (data ?? []).map((row: any) => ({
        _id: row.id,
        image: row.image ?? "",
        title: row.title ?? "",
        buttonHref: row.link ?? "",
        isActive: row.is_active ?? false,
        order: row.sort_order ?? 0,
        productType: row.product ?? undefined,
        createdAt: row.created_at ?? "",
      }));

      setBanners(mapped);
      setTotal(count ?? 0);
      setTotalPages(Math.ceil((count ?? 0) / perPage));
      setCurrentPage(page);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Banners refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product banners",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== null) {
        setCurrentPage(1);
        fetchBanners(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, perPage, activeFilter]);

  useEffect(() => {
    return debouncedSearchTerm;
  }, [debouncedSearchTerm]);

  const fetchProductTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("product_types")
        .select("id, name, type")
        .order("name");

      if (error) throw error;

      setProductTypes(
        (data ?? []).map((row: any) => ({
          _id: row.id,
          name: row.name,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch product types", error);
    }
  };

  useEffect(() => {
    fetchProductTypes();
    fetchBanners(1);
  }, []);

  const handleEdit = (banner: ProductBanner) => {
    setSelectedBanner(banner);
    setIsEditMode(true);
    form.reset({
      title: banner.title,
      description: banner.description || "",
      image: banner.image,
      buttonTitle: banner.buttonTitle || "",
      buttonHref: banner.buttonHref || "",
      isActive: banner.isActive,
      order: banner.order,
      productType:
        typeof banner.productType === "object"
          ? (banner.productType as any)._id
          : banner.productType || "",
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedBanner(null);
    setIsEditMode(false);
    form.reset({
      title: "",
      description: "",
      image: "",
      buttonTitle: "",
      buttonHref: "",
      isActive: true,
      order: 0,
      productType: "",
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (banner: ProductBanner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      const payload = {
        title: data.title,
        image: data.image,
        link: data.buttonHref ?? null,
        is_active: data.isActive,
        sort_order: data.order,
        product_id: data.productType || null,
      };

      if (isEditMode && selectedBanner) {
        const { error } = await supabase
          .from("product_banners")
          .update(payload)
          .eq("id", selectedBanner._id)
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Success", description: "Banner updated successfully" });
        fetchBanners(currentPage);
      } else {
        const { error } = await supabase
          .from("product_banners")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Success", description: "Banner created successfully" });
        fetchBanners(1);
      }
      form.reset();
      setIsSidebarOpen(false);
    } catch (error: any) {
      console.error("Failed to save banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} banner`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;
    try {
      const { error } = await supabase
        .from("product_banners")
        .delete()
        .eq("id", selectedBanner._id);

      if (error) throw error;
      toast({ title: "Success", description: "Banner deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchBanners(currentPage);
    } catch (error: any) {
      console.error("Failed to delete banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete product banner",
      });
    }
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-12 w-20 rounded" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Banners</h1>
          <p className="text-muted-foreground">
            Manage banners displayed inside the product catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchBanners(currentPage, true)}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && canPerformCRUD && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-16" /> : total}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Summary Placeholder or Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("all");
              }}
              disabled={!searchTerm && activeFilter === "all"}
            >
              <X className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="rounded-md border-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-32">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Button</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 7 : 6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No product banners found
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner, index) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="w-24 h-12 rounded overflow-hidden bg-muted">
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.title}
                    </TableCell>
                    <TableCell>
                      {banner.buttonTitle ? (
                        <Badge variant="outline">{banner.buttonTitle}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={banner.isActive ? "default" : "secondary"}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDelete(banner)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditMode ? "Edit Banner" : "Add Banner"}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image (Required)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        folder="product_banners"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select
                      disabled={formLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Banner Title"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Optional description..."
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buttonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Shop Now"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buttonHref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Link</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. /category/electronics"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={formLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Active Status</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={formLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the banner "
              {selectedBanner?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
