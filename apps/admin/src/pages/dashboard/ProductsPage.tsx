/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { MultiSelect } from "@/components/ui/multi-select";
import { NestedCategorySelector } from "@/components/products/NestedCategorySelector";
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Upload,
  CheckCircle,
  XCircle,
  Filter,
  Copy,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import ProductSkeleton, {
  ProductSkeletonRow,
} from "@/components/skeleton/ProductSkeleton";
import { BulkUploadModal } from "@/components/products/BulkUploadModal";
import { AboutItemsField } from "@/components/products/AboutItemsField";

type Product = {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  averageRating: number;
  images: string[];
  image: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  vendor?: {
    _id: string;
    storeName: string;
  };
  productType?: {
    _id: string;
    name: string;
    type: string;
    color?: string;
  }[];
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt: string;
  aboutItems?: string[];
};

type Category = {
  _id: string;
  name: string;
  level?: number;
  childrenCount?: number;
  parent?: {
    _id: string;
    name: string;
  } | null;
};

type Brand = {
  _id: string;
  name: string;
};

type Vendor = {
  _id: string;
  storeName: string;
};

type ProductType = {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  displayOrder: number;
  color?: string;
};

type FormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1
  const [perPage, setPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default to ascending
  const [productTypeFilter, setProductTypeFilter] = useState<string>("all"); // Default to all
  const [approvalStatusFilter, setApprovalStatusFilter] =
    useState<string>("all"); // Default to all
  const [vendorFilter, setVendorFilter] = useState<string>("all"); // Default to all
  const [specificVendorFilter, setSpecificVendorFilter] =
    useState<string>("all"); // For specific vendor selection
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deletingProductIds, setDeletingProductIds] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapProduct = (row: any): Product => ({
    _id: row.id,
    name: row.name,
    slug: row.slug ?? "",
    description: row.description ?? "",
    price: row.price ?? 0,
    discountPercentage: row.discount_percentage ?? 0,
    stock: row.stock ?? 0,
    averageRating: row.average_rating ?? 0,
    images: row.images ?? [],
    image: row.image ?? "",
    category: row.category
      ? { _id: row.category.id, name: row.category.name }
      : { _id: "", name: "" },
    brand: row.brand
      ? { _id: row.brand.id, name: row.brand.name }
      : { _id: "", name: "" },
    vendor: row.seller
      ? { _id: row.seller.id, storeName: row.seller.store_name }
      : undefined,
    productType: (row.product_product_types ?? []).map((ppt: any) => ({
      _id: ppt.product_type_id,
      name: ppt.product_type?.name ?? "",
      type: ppt.product_type?.type ?? "",
      color: ppt.product_type?.color,
    })),
    approvalStatus: row.approval_status,
    createdAt: row.created_at,
    aboutItems: row.about_items ?? [],
  });

  // No-op: image deletion from storage requires a backend integration
  const deleteImagesFromStorage = async (imageUrls: string[]) => {
    console.warn("Image deletion from storage not implemented:", imageUrls);
  };

  const formAdd = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eveniet, labore cum illo iusto, explicabo tenetur obcaecati nostrum similique autem impedit, quae aliquid nam quisquam quaerat sit atque aspernatur sint voluptas culpa. Nobis dignissimos laborum quo voluptatibus rem esse impedit.",
      price: 0,
      discountPercentage: 10,
      stock: 10,
      category: "",
      brand: "",
      images: [],
      image: "",
      productType: [],
      aboutItems: [],
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      stock: 0,
      category: "",
      brand: "",
      images: [],
      image: "",
      productType: [],
      aboutItems: [],
    },
  });

  const fetchProducts = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;

      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories!category_id(id, name, slug),
          brand:brands!brand_id(id, name, image),
          seller:sellers!seller_id(id, store_name),
          product_product_types(product_type_id, product_type:product_types!product_type_id(id, name, type, color))
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: sortOrder === "asc" })
        .range(
          (currentPage - 1) * perPage,
          currentPage * perPage - 1,
        );

      if (approvalStatusFilter && approvalStatusFilter !== "all") {
        query = query.eq("approval_status", approvalStatusFilter);
      }

      if (vendorFilter === "no-vendor") {
        query = query.is("seller_id", null);
      } else if (vendorFilter === "vendor-products") {
        if (specificVendorFilter !== "all") {
          query = query.eq("seller_id", specificVendorFilter);
        } else {
          query = query.not("seller_id", "is", null);
        }
      }

      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm.trim()}%`);
      }

      // productType filter: resolve IDs via junction table
      if (productTypeFilter && productTypeFilter !== "all") {
        const { data: ptData } = await supabase
          .from("product_types")
          .select("id")
          .eq("type", productTypeFilter)
          .single();

        if (ptData) {
          const { data: links } = await supabase
            .from("product_product_types")
            .select("product_id")
            .eq("product_type_id", ptData.id);

          const ids = (links ?? []).map((l: any) => l.product_id);
          if (ids.length) {
            query = query.in("id", ids);
          } else {
            setProducts([]);
            setTotal(0);
            setTotalPages(1);
            if (resetPage) setPage(1);
            setLoading(false);
            return;
          }
        }
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setProducts((data ?? []).map(mapProduct));
      setTotal(count ?? 0);
      setTotalPages(Math.ceil((count ?? 0) / perPage) || 1);

      if (resetPage) {
        setPage(1);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
      toast({
        title: "Success",
        description: "Products refreshed successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh products",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, level")
        .order("name");
      if (error) throw error;
      setCategories(
        (data ?? []).map((row: any) => ({
          _id: row.id,
          name: row.name,
          level: row.level ?? 0,
          parent: row.parent_id ? { _id: row.parent_id, name: "" } : null,
        })),
      );
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .order("name");
      if (error) throw error;
      setBrands(
        (data ?? []).map((row: any) => ({ _id: row.id, name: row.name })),
      );
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load brands",
      });
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from("sellers")
        .select("id, store_name, status")
        .eq("status", "approved")
        .order("store_name");
      if (error) throw error;
      setVendors(
        (data ?? []).map((row: any) => ({
          _id: row.id,
          storeName: row.store_name,
        })),
      );
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vendors",
      });
    }
  };

  const fetchProductTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("product_types")
        .select("id, name, type, color")
        .order("name");
      if (error) throw error;
      const types: ProductType[] = (data ?? []).map((row: any) => ({
        _id: row.id,
        name: row.name,
        type: row.type,
        isActive: true,
        displayOrder: 0,
        color: row.color,
      }));
      setProductTypes(types);
      if (types.length > 0) {
        formAdd.setValue("productType", [types[0]._id]);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product types",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    sortOrder,
    perPage,
    productTypeFilter,
    approvalStatusFilter,
    vendorFilter,
    specificVendorFilter,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchVendors();
    fetchProductTypes();
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    formEdit.reset({
      name: product.name,
      slug: product.slug || "",
      description: product.description,
      aboutItems: product.aboutItems || [],
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      category: product.category._id,
      brand: product.brand._id,
      images: product.images || (product.image ? [product.image] : []),
      image: product.image,
      productType: Array.isArray(product.productType)
        ? product.productType.map((pt: any) => pt?._id || pt)
        : product.productType
          ? [
              typeof product.productType === "object"
                ? (product.productType as any)._id
                : product.productType,
            ]
          : [],
    });
    setIsEditModalOpen(true);
  };

  const urlToBase64 = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to convert image to base64", e);
      return url; // fallback to url if failed
    }
  };

  const handleDuplicate = async (product: Product) => {
    toast({
      title: "Preparing Duplicate...",
      description: "Fetching product images to create new instances.",
    });

    let newImages: string[] = [];
    const sourceImages =
      product.images?.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    if (sourceImages.length > 0) {
      const base64Promises = sourceImages.map((imgUrl) => urlToBase64(imgUrl));
      newImages = await Promise.all(base64Promises);
    }

    formAdd.reset({
      name: `${product.name} - copy`,
      slug: "",
      description: product.description,
      aboutItems: product.aboutItems || [],
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      category: product.category._id,
      brand: product.brand._id,
      images: newImages,
      image: newImages[0] || "",
      productType: Array.isArray(product.productType)
        ? product.productType.map((pt: any) => pt?._id || pt)
        : product.productType
          ? [
              typeof product.productType === "object"
                ? (product.productType as any)._id
                : product.productType,
            ]
          : [],
    });
    setIsAddModalOpen(true);
    toast({
      title: "Product Duplicated",
      description:
        "You may now configure the new duplicated product before saving.",
    });
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddProduct = async (data: FormData) => {
    setFormLoading(true);
    try {
      // Image upload to CDN requires a backend; base64 images are stored as-is for now.
      const uploadedImageUrls = data.images;

      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: data.name,
          slug: data.slug || undefined,
          description: data.description,
          about_items: data.aboutItems ?? [],
          price: Number(data.price),
          discount_percentage: Number(data.discountPercentage),
          stock: Number(data.stock),
          image: uploadedImageUrls[0] ?? "",
          images: uploadedImageUrls,
          category_id: data.category,
          brand_id: data.brand,
          approval_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Insert product type associations
      if (
        Array.isArray(data.productType) &&
        data.productType.length > 0 &&
        newProduct
      ) {
        await supabase.from("product_product_types").insert(
          (data.productType as string[]).map((ptId) => ({
            product_id: newProduct.id,
            product_type_id: ptId,
          })),
        );
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchProducts(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create product";
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

  const handleUpdateProduct = async (data: FormData) => {
    if (!selectedProduct) return;

    setFormLoading(true);
    try {
      // Image upload to CDN requires a backend; base64 images are stored as-is for now.
      const updatedImageUrls = data.images;

      // Note removed images (no-op deletion since we have no CDN backend)
      const removedImages = selectedProduct.images.filter(
        (oldUrl) => !updatedImageUrls.includes(oldUrl),
      );
      if (removedImages.length > 0) {
        await deleteImagesFromStorage(removedImages);
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          slug: data.slug || undefined,
          description: data.description,
          about_items: data.aboutItems ?? [],
          price: Number(data.price),
          discount_percentage: Number(data.discountPercentage),
          stock: Number(data.stock),
          image: updatedImageUrls[0] ?? "",
          images: updatedImageUrls,
          category_id: data.category,
          brand_id: data.brand,
        })
        .eq("id", selectedProduct._id);

      if (error) throw error;

      // Sync product type associations
      await supabase
        .from("product_product_types")
        .delete()
        .eq("product_id", selectedProduct._id);
      if (Array.isArray(data.productType) && data.productType.length > 0) {
        await supabase.from("product_product_types").insert(
          (data.productType as string[]).map((ptId) => ({
            product_id: selectedProduct._id,
            product_type_id: ptId,
          })),
        );
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update product";
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
      setSelectedProducts(products.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setDeletingProductIds((prev) => [...prev, ...selectedProducts]);
      // Remove product type associations first
      await supabase
        .from("product_product_types")
        .delete()
        .in("product_id", selectedProducts);

      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedProducts);
      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully deleted ${selectedProducts.length} products`,
      });
      setSelectedProducts([]);
      setIsDeleteModalOpen(false);
      fetchProducts(true);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete products",
      });
    } finally {
      setDeletingProductIds((prev) =>
        prev.filter((id) => !selectedProducts.includes(id)),
      );
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setDeletingProductIds((prev) => [...prev, selectedProduct._id]);

      // Remove product type associations first
      await supabase
        .from("product_product_types")
        .delete()
        .eq("product_id", selectedProduct._id);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct._id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchProducts(true);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product",
      });
    } finally {
      setDeletingProductIds((prev) =>
        prev.filter((id) => id !== selectedProduct._id),
      );
    }
  };

  const handleApproveProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ approval_status: "approved" })
        .eq("id", product._id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
      fetchProducts();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve product",
      });
    }
  };

  const handleRejectProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ approval_status: "rejected" })
        .eq("id", product._id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Product rejected",
      });
      fetchProducts();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject product",
      });
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages && page * perPage < total) {
      setPage(page + 1);
    }
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setPage(1); // Reset to page 1 when sort order changes
  };

  const handlePerPageChange = (value: string) => {
    if (value === "all") {
      setPerPage(total); // Set to total count to show all
    } else {
      setPerPage(parseInt(value));
    }
    setPage(1); // Reset to page 1 when per page changes
  };

  const handleProductTypeFilterChange = (value: string) => {
    setProductTypeFilter(value);
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleApprovalStatusFilterChange = (value: string) => {
    setApprovalStatusFilter(value);
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleVendorFilterChange = (value: string) => {
    setVendorFilter(value);
    setSpecificVendorFilter("all"); // Reset specific vendor when main filter changes
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleSpecificVendorFilterChange = (value: string) => {
    setSpecificVendorFilter(value);
    setPage(1); // Reset to page 1 when filter changes
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Products
          </h1>
          <span className="text-xs sm:text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
            Total: <span className="font-bold">{total}</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 h-9 bg-background hidden sm:flex shadow-sm hover:bg-muted/10 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {selectedProducts.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Selected ({selectedProducts.length})
              </Button>
            )}
          </div>
        </div>

        {/* Controls - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-3 rounded-lg bg-muted/50 p-2 sm:p-3 shadow-sm">
          {/* Top Row: Refresh and Sort */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-auto min-w-25"
            >
              <RefreshCw
                className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>

            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger
                className="bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-36"
                aria-label="Sort order"
              >
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc" className="flex items-center">
                  <span className="flex items-center">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Ascending
                  </span>
                </SelectItem>
                <SelectItem value="desc" className="flex items-center">
                  <span className="flex items-center">
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Descending
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={perPage >= total && total > 0 ? "all" : perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger
                className="col-span-2 sm:col-span-1 bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-28"
                aria-label="Items per page"
              >
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="30">30 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Second Row: Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full lg:flex-1">
            <Select
              value={productTypeFilter}
              onValueChange={handleProductTypeFilterChange}
            >
              <SelectTrigger
                className="bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-40"
                aria-label="Product type filter"
              >
                <SelectValue placeholder="Product Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type._id} value={type.type}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={approvalStatusFilter}
              onValueChange={handleApprovalStatusFilterChange}
            >
              <SelectTrigger
                className="bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-40"
                aria-label="Approval status filter"
              >
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={vendorFilter}
              onValueChange={handleVendorFilterChange}
            >
              <SelectTrigger
                className="bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-44"
                aria-label="Vendor filter"
              >
                <SelectValue placeholder="Filter by Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    All Products
                  </span>
                </SelectItem>
                <SelectItem value="no-vendor">
                  <span className="flex items-center">Admin Products</span>
                </SelectItem>
                <SelectItem value="vendor-products">
                  <span className="flex items-center">Vendor Products</span>
                </SelectItem>
              </SelectContent>
            </Select>

            {vendorFilter === "vendor-products" && vendors.length > 0 && (
              <Select
                value={specificVendorFilter}
                onValueChange={handleSpecificVendorFilterChange}
              >
                <SelectTrigger
                  className="bg-background text-xs sm:text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring w-full sm:w-44"
                  aria-label="Specific vendor filter"
                >
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center">All Vendors</span>
                  </SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor._id} value={vendor._id}>
                      {vendor.storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isAdmin && canPerformCRUD && (
              <div className="col-span-2 sm:col-span-1 flex gap-2 w-full sm:w-auto ml-auto">
                <Button
                  onClick={() => setIsBulkUploadModalOpen(true)}
                  variant="outline"
                  className="flex-1 sm:flex-none bg-background shadow-sm hover:bg-muted/10 text-xs sm:text-sm"
                >
                  <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                  Upload
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 sm:flex-none bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 text-xs sm:text-sm"
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0" />{" "}
                  Add
                </Button>
              </div>
            )}
          </div>

          {isAdmin && isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-xs sm:text-sm mt-3">
              <span className="text-amber-700 dark:text-amber-400">
                👁️ Read-only mode: You can view all data but cannot make changes
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <ProductSkeleton isAdmin={isAdmin} />
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block rounded-lg border border-border/50 shadow-sm bg-card overflow-hidden">
              <div className="overflow-x-auto max-w-full">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-border/50 bg-muted/30">
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            products.length > 0 &&
                            selectedProducts.length === products.length
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAll(checked as boolean)
                          }
                        />
                      </TableHead>
                      <TableHead className="w-20 font-semibold whitespace-nowrap">
                        Image
                      </TableHead>
                      <TableHead className="font-semibold min-w-50 whitespace-nowrap">
                        Name
                      </TableHead>

                      <TableHead className="font-semibold whitespace-nowrap">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Discount
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Stock
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Rating
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Brand
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Vendor
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Product Type
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Status
                      </TableHead>
                      {isAdmin && (
                        <TableHead className="text-right font-semibold min-w-25 whitespace-nowrap">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => {
                      if (deletingProductIds.includes(product._id)) {
                        return (
                          <ProductSkeletonRow
                            key={product._id}
                            isAdmin={isAdmin}
                          />
                        );
                      }
                      return (
                        <TableRow
                          key={product._id}
                          className={`border-b border-border/30 transition-colors hover:bg-muted/50 ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/20"
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.includes(product._id)}
                              onCheckedChange={(checked) =>
                                handleSelectProduct(
                                  product._id,
                                  checked as boolean,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shadow-sm border shrink-0">
                              <img
                                src={product?.images?.[0] || product?.image}
                                alt={product?.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-image.jpg";
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            <div
                              className="max-w-50 truncate"
                              title={product?.name}
                            >
                              {product?.name}
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-green-600 whitespace-nowrap">
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 whitespace-nowrap">
                              {product.discountPercentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                                product.stock > 10
                                  ? "bg-green-100 text-green-800"
                                  : product.stock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              <span className="text-yellow-500">★</span>
                              <span className="font-medium">
                                {product.averageRating.toFixed(1)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 whitespace-nowrap max-w-50 truncate">
                              {product?.category?.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 whitespace-nowrap max-w-50 truncate">
                              {product?.brand?.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            {product?.vendor ? (
                              <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800 whitespace-nowrap max-w-50 truncate">
                                {product.vendor.storeName}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap">
                                Admin
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {product?.productType &&
                              product.productType.length > 0 ? (
                                product.productType.map((pt) => (
                                  <span
                                    key={pt._id}
                                    className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap capitalize"
                                    style={{
                                      backgroundColor: pt.color || "#F3F4F6",
                                      color: "#FFFFFF",
                                    }}
                                  >
                                    {pt.name}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 whitespace-nowrap capitalize">
                                  Base
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap capitalize ${
                                product?.approvalStatus === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : product?.approvalStatus === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {product?.approvalStatus || "approved"}
                            </span>
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(product)}
                                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 shrink-0"
                                  title="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicate(product)}
                                  className="h-8 w-8 hover:bg-green-50 hover:text-green-600 shrink-0"
                                  title="Duplicate product"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(product)}
                                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600 shrink-0"
                                  title="Delete product"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                                {canPerformCRUD &&
                                  product.approvalStatus === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleApproveProduct(product)
                                        }
                                        className="h-8 w-8 hover:bg-green-50 hover:text-green-600 shrink-0"
                                        title="Approve product"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleRejectProduct(product)
                                        }
                                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 shrink-0"
                                        title="Reject product"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={isAdmin ? 11 : 10}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">No products found</p>
                              <p className="text-sm">
                                Start by adding your first product
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card View - Visible only on mobile/tablet */}
            <div className="lg:hidden space-y-4">
              {products.length === 0 ? (
                <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">No products found</p>
                      <p className="text-sm text-muted-foreground">
                        Start by adding your first product
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product._id}
                    className="rounded-lg border border-border/50 bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-muted shadow-sm border shrink-0">
                        <img
                          src={product?.images?.[0] || product?.image}
                          alt={product?.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                              {product.name}
                            </h3>
                            {isAdmin && (
                              <div className="flex gap-0.5 shrink-0 -mt-1 -mr-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(product)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit product"
                                >
                                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicate(product)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-green-50 hover:text-green-600"
                                  title="Duplicate product"
                                >
                                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(product)}
                                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-red-50 hover:text-red-600"
                                  title="Delete product"
                                >
                                  <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                {canPerformCRUD &&
                                  product.approvalStatus === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleApproveProduct(product)
                                        }
                                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-green-50 hover:text-green-600"
                                        title="Approve product"
                                      >
                                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleRejectProduct(product)
                                        }
                                        className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-red-50 hover:text-red-600"
                                        title="Reject product"
                                      >
                                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                      </Button>
                                    </>
                                  )}
                              </div>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-bold text-base sm:text-lg text-primary">
                              ${product.price?.toFixed(2) || "0.00"}
                            </span>
                            {product.discountPercentage > 0 && (
                              <span className="text-[10px] sm:text-xs font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                                {product.discountPercentage}% off
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges Container - Scrollable on mobile if needed */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {product?.slug ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold"
                            >
                              Set
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold"
                            >
                              Not Set
                            </Badge>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold max-w-[80px] sm:max-w-none truncate ${
                              product.stock > 10
                                ? "bg-green-50 text-green-700 border-green-200"
                                : product.stock > 0
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <span className="truncate">
                              Stock: {product.stock}
                            </span>
                          </span>

                          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold max-w-[80px] sm:max-w-none truncate">
                            {product.category?.name || "No Category"}
                          </span>

                          <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold max-w-[80px] sm:max-w-none truncate">
                            {product.brand?.name || "No Brand"}
                          </span>

                          {product?.vendor ? (
                            <span className="inline-flex items-center rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold max-w-[80px] sm:max-w-none truncate">
                              {product.vendor.storeName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold max-w-[80px] sm:max-w-none truncate">
                              Admin
                            </span>
                          )}

                          {product?.productType &&
                          product.productType.length > 0 ? (
                            product.productType.map((pt) => (
                              <span
                                key={pt._id}
                                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-medium capitalize max-w-[80px] sm:max-w-none truncate"
                                style={{
                                  backgroundColor: pt.color || "#F3F4F6",
                                  color: "#FFFFFF",
                                }}
                              >
                                {pt.name}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 capitalize">
                              Base
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                              product?.approvalStatus === "approved"
                                ? "bg-green-100 text-green-800"
                                : product?.approvalStatus === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {product?.approvalStatus || "approved"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {total > perPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-card rounded-lg border border-border/50 px-3 sm:px-4 py-3 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * perPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * perPage, total)}
                    </span>{" "}
                    of <span className="font-medium">{total}</span> products
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= totalPages || page * perPage >= total}
                    className="disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Simple pagination for single page */}
            {total > 0 && total <= perPage && (
              <div className="text-center text-xs sm:text-sm text-muted-foreground bg-card rounded-lg border border-border/50 px-4 py-3">
                Showing all <span className="font-medium">{total}</span>{" "}
                products
              </div>
            )}
          </>
        )}

        {/* Add Product Sidebar */}
        <Sheet
          open={isAddModalOpen}
          onOpenChange={(open) => {
            if (!open && formLoading) {
              toast({
                title: "Upload in Progress",
                description:
                  "Please wait while the product is being created...",
                variant: "destructive",
              });
              return;
            }
            setIsAddModalOpen(open);
          }}
        >
          <SheetContent className="w-full sm:max-w-150 overflow-y-auto p-4 sm:p-6">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl sm:text-2xl">
                Add Product
              </SheetTitle>
              <SheetDescription className="text-sm">
                Create a new product
              </SheetDescription>
            </SheetHeader>
            <Form {...formAdd}>
              <form
                onSubmit={formAdd.handleSubmit(handleAddProduct)}
                className="space-y-3 sm:space-y-4 mt-4 sm:mt-6"
              >
                <FormField<FormData>
                  control={formAdd.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={formLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Slug (URL-friendly version)
                        <span className="text-xs text-muted-foreground ml-2">
                          Optional - Auto-generated if left empty
                        </span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            disabled={formLoading}
                            placeholder="e.g., baby-bear-outfit-clothing"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const name = formAdd.getValues("name");
                            if (name) {
                              const slug = name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              formAdd.setValue("slug", slug);
                            }
                          }}
                          disabled={formLoading || !formAdd.watch("name")}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={formLoading}
                          className="min-h-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AboutItemsField
                  control={formAdd.control}
                  name="aboutItems"
                  disabled={formLoading}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField<FormData>
                    control={formAdd.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<FormData>
                    control={formAdd.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField<FormData>
                    control={formAdd.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<FormData>
                    control={formAdd.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <NestedCategorySelector
                            categories={categories}
                            value={field.value as string}
                            onValueChange={field.onChange}
                            disabled={formLoading}
                            placeholder="Select a category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField<FormData>
                  control={formAdd.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={productTypes.map((type) => ({
                            label: type.name,
                            value: type._id,
                            color: type.color,
                          }))}
                          onValueChange={field.onChange}
                          value={field.value as string[]}
                          placeholder="Select product types"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <MultiImageUpload
                          value={(field.value as string[]) || []}
                          onChange={field.onChange}
                          maxImages={
                            parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) ||
                            5
                          }
                          disabled={formLoading}
                          deferUpload={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="gap-2 flex-col sm:flex-row mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={formLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full sm:w-auto"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>

        {/* Edit Product Sidebar */}
        <Sheet
          open={isEditModalOpen}
          onOpenChange={(open) => {
            if (!open && formLoading) {
              toast({
                title: "Update in Progress",
                description:
                  "Please wait while the product is being updated...",
                variant: "destructive",
              });
              return;
            }
            setIsEditModalOpen(open);
          }}
        >
          <SheetContent className="w-full sm:max-w-150 overflow-y-auto p-4 sm:p-6">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl sm:text-2xl">
                Edit Product
              </SheetTitle>
              <SheetDescription className="text-sm">
                Update product information
              </SheetDescription>
            </SheetHeader>
            <Form {...formEdit}>
              <form
                onSubmit={formEdit.handleSubmit(handleUpdateProduct)}
                className="space-y-3 sm:space-y-4 mt-4 sm:mt-6"
              >
                <FormField<FormData>
                  control={formEdit.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={formLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Slug (URL-friendly version)
                        <span className="text-xs text-muted-foreground ml-2">
                          Optional - Auto-generated if left empty
                        </span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            disabled={formLoading}
                            placeholder="e.g., baby-bear-outfit-clothing"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const name = formEdit.getValues("name");
                            if (name) {
                              const slug = name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              formEdit.setValue("slug", slug);
                            }
                          }}
                          disabled={formLoading || !formEdit.watch("name")}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={formLoading}
                          className="min-h-25"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AboutItemsField
                  control={formEdit.control}
                  name="aboutItems"
                  disabled={formLoading}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField<FormData>
                    control={formEdit.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<FormData>
                    control={formEdit.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField<FormData>
                    control={formEdit.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            disabled={formLoading}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField<FormData>
                    control={formEdit.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <NestedCategorySelector
                            categories={categories}
                            value={field.value as string}
                            onValueChange={field.onChange}
                            disabled={formLoading}
                            placeholder="Select a category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField<FormData>
                  control={formEdit.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value as string}
                        disabled={formLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={productTypes.map((type) => ({
                            label: type.name,
                            value: type._id,
                            color: type.color,
                          }))}
                          onValueChange={field.onChange}
                          value={(field.value as string[]) || []}
                          placeholder="Select product types"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <MultiImageUpload
                          value={(field.value as string[]) || []}
                          onChange={field.onChange}
                          maxImages={
                            parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) ||
                            5
                          }
                          disabled={formLoading}
                          deferUpload={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="gap-2 flex-col sm:flex-row mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full sm:w-auto"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Product"
                    )}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>

        {/* Delete Product Confirmation */}
        <AlertDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
        >
          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {selectedProducts.length > 0 && !selectedProduct
                  ? `This action cannot be undone. This will permanently delete ${selectedProducts.length} selected products.`
                  : "This action cannot be undone. This will permanently delete the product."}
                {!selectedProducts.length && (
                  <span className="font-semibold">
                    {" "}
                    {selectedProduct?.name}
                  </span>
                )}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto mt-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={
                  selectedProducts.length > 0 && !selectedProduct
                    ? confirmBulkDelete
                    : handleDeleteProduct
                }
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          open={isBulkUploadModalOpen}
          onOpenChange={setIsBulkUploadModalOpen}
          categories={categories}
          brands={brands}
          onSuccess={() => {
            fetchProducts(true); // Refresh products after bulk upload
          }}
        />
      </div>
    </div>
  );
}
