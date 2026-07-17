/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  RefreshCw,
  Search,
  Filter,
  X,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";

// Banner type matching the Supabase `banners` table
type Banner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image: string;
  mobile_image?: string;
  link?: string;
  show_button: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

const bannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  mobile_image: z.string().optional(),
  link: z.string().optional(),
  show_button: z.boolean().default(true),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof bannerSchema>;

export default function BannersPage() {
  // Data state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image: "",
      mobile_image: "",
      link: "",
      show_button: true,
      is_active: true,
      sort_order: 0,
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image: "",
      mobile_image: "",
      link: "",
      show_button: true,
      is_active: true,
      sort_order: 0,
    },
  });

  // Fetch banners with pagination and filters from Supabase
  const fetchBanners = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let query = supabase
        .from("banners")
        .select("*", { count: "exact" })
        .order("sort_order", { ascending: sortOrder === "asc" });

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const fetchedBanners: Banner[] = (data || []).map(
        (row: Record<string, unknown>) => ({
          _id: row.id as string,
          title: row.title as string | undefined,
          subtitle: row.subtitle as string | undefined,
          image: row.image as string,
          mobile_image: row.mobile_image as string | undefined,
          link: row.link as string | undefined,
          show_button: (row.show_button as boolean) ?? true,
          is_active: row.is_active as boolean,
          sort_order: row.sort_order as number,
          created_at: row.created_at as string,
        })
      );

      setBanners(fetchedBanners);
      setTotal(count || 0);
      const pages = Math.ceil((count || 0) / perPage);
      setTotalPages(Math.max(1, pages));
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
        description: "Failed to load banners",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounced search
  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== null) {
        setCurrentPage(1);
        fetchBanners(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, sortOrder, perPage]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSortOrder("asc");
    setCurrentPage(1);
    setPerPage(10);
  };

  const handleRefresh = () => {
    fetchBanners(currentPage, true);
  };

  useEffect(() => {
    fetchBanners(1);
  }, []);

  useEffect(() => {
    debouncedSearchTerm();
  }, [debouncedSearchTerm]);

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    formEdit.reset({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image,
      mobile_image: banner.mobile_image || "",
      link: banner.link || "",
      show_button: banner.show_button ?? true,
      is_active: banner.is_active,
      sort_order: banner.sort_order || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleAddBanner = async (data: FormData) => {
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("banners")
        .insert({
          title: data.title || null,
          subtitle: data.subtitle || null,
          image: data.image,
          mobile_image: data.mobile_image || null,
          link: data.link || null,
          show_button: data.show_button,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })
        .select()
        .single();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Banner created successfully",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchBanners(1);
    } catch (error) {
      console.error("Failed to create banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBanner = async (data: FormData) => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("banners")
        .update({
          title: data.title || null,
          subtitle: data.subtitle || null,
          image: data.image,
          mobile_image: data.mobile_image || null,
          link: data.link || null,
          show_button: data.show_button,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })
        .eq("id", selectedBanner._id)
        .select()
        .single();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      setIsEditModalOpen(false);
      fetchBanners(currentPage);
    } catch (error) {
      console.error("Failed to update banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;

    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", selectedBanner._id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      setIsDeleteModalOpen(false);

      // Smart pagination after delete
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / perPage);
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;

      fetchBanners(targetPage);
    } catch (error) {
      console.error("Failed to delete banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete banner",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBanners.length === 0) return;

    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .in("id", selectedBanners);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Selected banners deleted successfully",
      });
      setSelectedBanners([]);
      fetchBanners(currentPage);
    } catch (error) {
      console.error("Failed to delete banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected banners",
      });
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBanners(banners.map((b) => b._id));
    } else {
      setSelectedBanners([]);
    }
  };

  const toggleSelectBanner = (id: string) => {
    setSelectedBanners((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  // Skeleton loading component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-10 w-20 rounded" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-10 rounded-full" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">
            Manage your promotional banners
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedBanners.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedBanners.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!searchTerm && sortOrder === "asc"}
              size="sm"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sort Order
                </label>
                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") =>
                    setSortOrder(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Sort Order Ascending</SelectItem>
                    <SelectItem value="desc">Sort Order Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Items Per Page
                </label>
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => setPerPage(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {banners.length} of {total} banners
            {searchTerm && ` for "${searchTerm}"`}
          </span>
          {searchTerm && (
            <Badge variant="secondary" className="ml-2">
              Filtered
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      banners.length > 0 &&
                      selectedBanners.length === banners.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: perPage }).map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} />
                ))
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 9 : 8}
                    className="text-center py-8"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Tag className="h-8 w-8" />
                      <span>No banners found</span>
                      {searchTerm && (
                        <Button variant="link" onClick={clearFilters} size="sm">
                          Clear filters to see all banners
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner, index) => (
                  <motion.tr
                    key={banner._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedBanners.includes(banner._id)}
                        onCheckedChange={() => toggleSelectBanner(banner._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-medium max-w-32 truncate"
                      title={banner.title}
                    >
                      {banner.title}
                    </TableCell>
                    <TableCell
                      className="max-w-32 truncate text-muted-foreground"
                      title={banner.subtitle}
                    >
                      {banner.subtitle || "—"}
                    </TableCell>
                    <TableCell>{banner.sort_order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={banner.is_active ? "default" : "secondary"}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(banner.created_at).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(banner)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} total banners)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchBanners(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Add Banner Sheet */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Banner</SheetTitle>
            <SheetDescription>
              Create a new promotional banner
            </SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddBanner)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={formAdd.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional title"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional subtitle"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (URL)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional URL to navigate when banner is clicked
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="show_button"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Show &quot;Shop Now&quot; Button</FormLabel>
                      <FormDescription>
                        If turned off, the entire banner becomes clickable
                        and links to the URL above instead.
                      </FormDescription>
                    </div>
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
              <FormField
                control={formAdd.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={formLoading}
                        min={0}
                      />
                    </FormControl>
                    <FormDescription>Lower numbers appear first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Show this banner on the website
                      </FormDescription>
                    </div>
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
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desktop / Tablet Banner Image *</FormLabel>
                    <FormDescription>
                      Recommended size: <strong>1600 × 800px</strong> (2:1
                      ratio). Used on tablet and desktop screens.
                    </FormDescription>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="mobile_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Banner Image</FormLabel>
                    <FormDescription>
                      Recommended size: <strong>1080 × 1350px</strong> (4:5
                      ratio). Shown on mobile screens only — if left empty,
                      the desktop image above is used instead.
                    </FormDescription>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Banner Sheet */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Banner</SheetTitle>
            <SheetDescription>Update banner information</SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateBanner)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={formEdit.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional title"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional subtitle"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (URL)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional URL to navigate when banner is clicked
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="show_button"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Show &quot;Shop Now&quot; Button</FormLabel>
                      <FormDescription>
                        If turned off, the entire banner becomes clickable
                        and links to the URL above instead.
                      </FormDescription>
                    </div>
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
              <FormField
                control={formEdit.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={formLoading}
                        min={0}
                      />
                    </FormControl>
                    <FormDescription>Lower numbers appear first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Show this banner on the website
                      </FormDescription>
                    </div>
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
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desktop / Tablet Banner Image *</FormLabel>
                    <FormDescription>
                      Recommended size: <strong>1600 × 800px</strong> (2:1
                      ratio). Used on tablet and desktop screens.
                    </FormDescription>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="mobile_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Banner Image</FormLabel>
                    <FormDescription>
                      Recommended size: <strong>1080 × 1350px</strong> (4:5
                      ratio). Shown on mobile screens only — if left empty,
                      the desktop image above is used instead.
                    </FormDescription>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Banner Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              banner{" "}
              <span className="font-semibold">{selectedBanner?.title}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
