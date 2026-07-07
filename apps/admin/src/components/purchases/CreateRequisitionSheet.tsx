import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Search,
  Loader2,
  AlertTriangle,
  AlertCircle,
  X,
  UserPlus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { createRequisition, saveSupplier } from "@/lib/purchaseApi";
import useAuthStore from "@/store/useAuthStore";
import CreateSupplierSheet from "./CreateSupplierSheet";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

interface Supplier {
  _id: string;
  name: string;
  email: string;
  contact?: string;
  address?: string;
}

interface RequisitionItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  profitMargin: number;
  sellingPrice: number;
  totalCost: number;
  currentPrice: number;
}

interface CreateRequisitionSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRequisitionSheet({
  open,
  onClose,
  onSuccess,
}: CreateRequisitionSheetProps) {
  const user = useAuthStore((s) => s.user);
  // Dropdown products (all products)
  const [dropdownProducts, setDropdownProducts] = useState<Product[]>([]);
  const [dropdownPage, setDropdownPage] = useState(1);
  const [dropdownHasMore, setDropdownHasMore] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownLoadingMore, setDropdownLoadingMore] = useState(false);

  // Search products (filtered)
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [items, setItems] = useState<RequisitionItem[]>([]);

  // Supplier selection
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [useExistingSupplier, setUseExistingSupplier] = useState(true);
  const [showCreateSupplierSheet, setShowCreateSupplierSheet] = useState(false);
  const [showCreateSupplierOption, setShowCreateSupplierOption] =
    useState(false);

  // Manual supplier fields (when not using existing)
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchObserverRef = useRef<IntersectionObserver | null>(null);
  const searchLoadMoreRef = useRef<HTMLDivElement>(null);
  const productsPerPage = 10;

  useEffect(() => {
    if (open) {
      // Reset dropdown products
      setDropdownProducts([]);
      setDropdownPage(1);
      setDropdownHasMore(true);
      fetchDropdownProducts(1, true);

      // Reset search
      setSearchQuery("");
      setSearchProducts([]);
      setSearchPage(1);
      setSearchHasMore(true);

      // Fetch suppliers
      fetchSuppliers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && searchQuery.trim()) {
      setSearchProducts([]);
      setSearchPage(1);
      setSearchHasMore(true);
      fetchSearchProducts(1, true);
    } else if (open && !searchQuery.trim()) {
      // Clear search results when search is empty
      setSearchProducts([]);
      setSearchPage(1);
      setSearchHasMore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchDropdownProducts = async (
    page: number = dropdownPage,
    reset: boolean = false
  ) => {
    if (!dropdownHasMore && !reset) return;

    try {
      const isInitialLoad = page === 1 && reset;
      if (isInitialLoad) {
        setDropdownLoading(true);
      } else {
        setDropdownLoadingMore(true);
      }

      const from = (page - 1) * productsPerPage;
      const { data, count, error } = await supabase
        .from("products")
        .select("id, name, price, stock, images", { count: "exact" })
        .order("name")
        .range(from, from + productsPerPage - 1);
      if (error) throw error;

      {
        const total = count || 0;
        const newProducts: Product[] = (data || []).map((p) => ({
          _id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          images: p.images || [],
        }));

        if (reset) {
          setDropdownProducts(newProducts);
          setDropdownHasMore(newProducts.length < total);
        } else {
          setDropdownProducts((prev) => {
            const updated = [...prev, ...newProducts];
            setDropdownHasMore(updated.length < total);
            return updated;
          });
        }
        setDropdownPage(page);
      }
    } catch (error) {
      console.error("Error fetching dropdown products:", error);
      if (reset) {
        toast.error("Failed to load products");
        setDropdownProducts([]);
      }
    } finally {
      setDropdownLoading(false);
      setDropdownLoadingMore(false);
    }
  };

  const fetchSearchProducts = async (
    page: number = searchPage,
    reset: boolean = false
  ) => {
    if (!searchHasMore && !reset) return;
    if (!searchQuery.trim()) return;

    try {
      const isInitialLoad = page === 1 && reset;
      if (isInitialLoad) {
        setSearchLoading(true);
      } else {
        setSearchLoadingMore(true);
      }

      const from = (page - 1) * productsPerPage;
      const { data, count, error } = await supabase
        .from("products")
        .select("id, name, price, stock, images", { count: "exact" })
        .ilike("name", `%${searchQuery.trim()}%`)
        .order("name")
        .range(from, from + productsPerPage - 1);
      if (error) throw error;

      {
        const total = count || 0;
        const newProducts: Product[] = (data || []).map((p) => ({
          _id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
          images: p.images || [],
        }));

        if (reset) {
          setSearchProducts(newProducts);
          setSearchHasMore(newProducts.length < total);
        } else {
          setSearchProducts((prev) => {
            const updated = [...prev, ...newProducts];
            setSearchHasMore(updated.length < total);
            return updated;
          });
        }
        setSearchPage(page);
      }
    } catch (error) {
      console.error("Error fetching search products:", error);
      if (reset) {
        toast.error("Failed to search products");
        setSearchProducts([]);
      }
    } finally {
      setSearchLoading(false);
      setSearchLoadingMore(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name, email, contact, address")
        .order("name");
      if (error) throw error;
      setSuppliers(
        (data || []).map((s) => ({
          _id: s.id,
          name: s.name,
          email: s.email || "",
          contact: s.contact || "",
          address: s.address || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    }
  };

  const handleSupplierChange = (value: string) => {
    if (value === "create-new") {
      setShowCreateSupplierSheet(true);
    } else if (value === "manual") {
      setUseExistingSupplier(false);
      setSelectedSupplier("");
    } else {
      setUseExistingSupplier(true);
      setSelectedSupplier(value);
      // Auto-fill supplier details
      const supplier = suppliers.find((s) => s._id === value);
      if (supplier) {
        setSupplierName(supplier.name);
        setSupplierEmail(supplier.email);
        setSupplierContact(supplier.contact || "");
        setSupplierAddress(supplier.address || "");
      }
    }
  };

  const handleSupplierCreated = async () => {
    await fetchSuppliers();
    setShowCreateSupplierSheet(false);
  };

  // Set up IntersectionObserver for infinite scroll in Select dropdown
  useEffect(() => {
    if (!loadMoreRef.current || !isSelectOpen) return;

    const loadMore = () => {
      if (dropdownHasMore && !dropdownLoadingMore && !dropdownLoading) {
        fetchDropdownProducts(dropdownPage + 1, false);
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dropdownHasMore,
    dropdownLoadingMore,
    dropdownLoading,
    dropdownPage,
    isSelectOpen,
    dropdownProducts.length,
  ]);

  // Add scroll listener for Select dropdown as backup
  useEffect(() => {
    if (!isSelectOpen) return;

    // Wait for SelectContent to render in portal
    const timer = setTimeout(() => {
      const selectContent = document.querySelector('[role="listbox"]');
      if (!selectContent) return;

      const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;

        // Load more when scrolled to 80% of content
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
          if (dropdownHasMore && !dropdownLoadingMore && !dropdownLoading) {
            fetchDropdownProducts(dropdownPage + 1, false);
          }
        }
      };

      selectContent.addEventListener("scroll", handleScroll);

      return () => {
        selectContent.removeEventListener("scroll", handleScroll);
      };
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSelectOpen,
    dropdownHasMore,
    dropdownLoadingMore,
    dropdownLoading,
    dropdownPage,
  ]);

  // Set up IntersectionObserver for infinite scroll in search results
  useEffect(() => {
    if (!searchLoadMoreRef.current || !searchQuery.trim()) return;

    const loadMore = () => {
      if (searchHasMore && !searchLoadingMore && !searchLoading) {
        fetchSearchProducts(searchPage + 1, false);
      }
    };

    searchObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (searchLoadMoreRef.current) {
      searchObserverRef.current.observe(searchLoadMoreRef.current);
    }

    return () => {
      if (searchObserverRef.current) {
        searchObserverRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchHasMore,
    searchLoadingMore,
    searchLoading,
    searchPage,
    searchQuery,
  ]);

  const handleAddItem = (productId?: string) => {
    const productToAdd = productId || selectedProduct;

    if (!productToAdd) {
      toast.error("Please select a product");
      return;
    }

    // Check both dropdown and search products
    const product =
      dropdownProducts.find((p) => p._id === productToAdd) ||
      searchProducts.find((p) => p._id === productToAdd);
    if (!product) return;

    // Check if product already exists in items
    const existingItem = items.find((item) => item.productId === productToAdd);
    if (existingItem) {
      toast.error("Product already added to requisition");
      return;
    }

    const newItem: RequisitionItem = {
      productId: product._id,
      productName: product.name,
      quantity: 1,
      purchasePrice: 0,
      profitMargin: 0,
      sellingPrice: product.price,
      totalCost: 0,
      currentPrice: product.price,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleItemChange = (
    productId: string,
    field: keyof RequisitionItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.productId !== productId) return item;

        // Convert string to number, allow 0 for valid input
        const numValue =
          typeof value === "string"
            ? value === ""
              ? 0
              : parseFloat(value)
            : value;
        const updatedItem = { ...item, [field]: numValue };

        // Auto-calculate fields based on changes
        if (field === "quantity" || field === "purchasePrice") {
          updatedItem.totalCost =
            updatedItem.quantity * updatedItem.purchasePrice;
        }

        if (field === "purchasePrice" || field === "profitMargin") {
          updatedItem.sellingPrice =
            updatedItem.purchasePrice * (1 + updatedItem.profitMargin / 100);
        }

        return updatedItem;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (!supplierName.trim()) {
      toast.error("Please enter supplier name");
      return;
    }

    if (!supplierEmail.trim()) {
      toast.error("Please enter supplier email");
      return;
    }

    // Validate all items have required fields
    const invalidItems = items.filter(
      (item) =>
        item.quantity <= 0 ||
        item.purchasePrice <= 0 ||
        item.profitMargin === undefined ||
        item.profitMargin === null ||
        isNaN(item.profitMargin)
    );

    if (invalidItems.length > 0) {
      toast.error(
        "Please fill all item details correctly (quantity, purchase price, and profit margin are required)"
      );
      return;
    }

    if (!user) {
      toast.error("Not signed in");
      return;
    }

    try {
      setSubmitting(true);

      await createRequisition(
        { id: user.id, name: user.name },
        {
          supplierId:
            useExistingSupplier && selectedSupplier ? selectedSupplier : undefined,
          name: supplierName.trim(),
          email: supplierEmail.trim(),
          contact: supplierContact.trim() || undefined,
          address: supplierAddress.trim() || undefined,
        },
        items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          purchase_price: item.purchasePrice,
          profit_margin: item.profitMargin,
          selling_price: item.sellingPrice,
          total_cost: item.totalCost,
        })),
        notes.trim() || undefined
      );

      toast.success("Purchase requisition created successfully");

      // Check if manual supplier info was used and show option to save as supplier
      if (!useExistingSupplier && !selectedSupplier) {
        setShowCreateSupplierOption(true);
      } else {
        handleReset();
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating requisition:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create requisition"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSupplierFromInfo = async () => {
    try {
      await saveSupplier({
        name: supplierName.trim(),
        email: supplierEmail.trim(),
        contact: supplierContact.trim() || null,
        address: supplierAddress.trim() || null,
      });
      toast.success("Supplier created successfully!");
      await fetchSuppliers();
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to create supplier, but requisition was saved");
    } finally {
      setShowCreateSupplierOption(false);
      handleReset();
      onSuccess();
      onClose();
    }
  };

  const handleSkipSupplierCreation = () => {
    setShowCreateSupplierOption(false);
    handleReset();
    onSuccess();
    onClose();
  };

  const handleReset = () => {
    setItems([]);
    setSelectedProduct("");
    setSelectedSupplier("");
    setUseExistingSupplier(true);
    setSupplierName("");
    setSupplierEmail("");
    setSupplierContact("");
    setSupplierAddress("");
    setNotes("");
    setSearchQuery("");
    setSearchProducts([]);
    setSearchPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-0"
      >
        <div className="p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle>Create Purchase Requisition</SheetTitle>
            <SheetDescription>
              Add items and supplier details for the purchase requisition
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
            {/* Supplier Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">
                Supplier Information
              </h3>
              <div className="grid gap-3 sm:gap-4">
                {/* Supplier Selection */}
                <div className="space-y-2">
                  <Label htmlFor="supplierSelect">Select Supplier *</Label>
                  <Select
                    value={selectedSupplier || "manual"}
                    onValueChange={handleSupplierChange}
                  >
                    <SelectTrigger id="supplierSelect">
                      <SelectValue placeholder="Choose from existing or enter manually" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Enter Manually</SelectItem>
                      <SelectItem value="create-new">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create New Supplier
                        </div>
                      </SelectItem>
                      {suppliers.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Existing Suppliers
                          </div>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier._id} value={supplier._id}>
                              {supplier.name} ({supplier.email})
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supplier Details */}
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    placeholder="Enter supplier name"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    disabled={useExistingSupplier && !!selectedSupplier}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierEmail">Supplier Email *</Label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    placeholder="supplier@example.com"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    disabled={useExistingSupplier && !!selectedSupplier}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierContact">Supplier Contact</Label>
                  <Input
                    id="supplierContact"
                    placeholder="Enter phone number"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    disabled={useExistingSupplier && !!selectedSupplier}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierAddress">Address (Optional)</Label>
                  <Textarea
                    id="supplierAddress"
                    placeholder="Supplier address"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    disabled={useExistingSupplier && !!selectedSupplier}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this purchase"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Add Product Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base">
                Add Products
              </h3>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 pr-9 text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => handleSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Select Product Dropdown */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  open={isSelectOpen}
                  onOpenChange={setIsSelectOpen}
                >
                  <SelectTrigger className="flex-1 w-full sm:w-auto">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] w-[calc(100vw-2rem)] sm:w-auto">
                    {dropdownLoading ? (
                      <div className="p-6 sm:p-8 text-center">
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Loading products...
                        </p>
                      </div>
                    ) : dropdownProducts.length === 0 ? (
                      <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                        No products found
                      </div>
                    ) : (
                      <>
                        {dropdownProducts.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            <div className="flex items-start sm:items-center gap-2 w-full flex-col sm:flex-row">
                              <span className="flex-1 text-sm wrap-break-word">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {product.stock <= 5 ? (
                                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                ) : product.stock <= 10 ? (
                                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                ) : null}
                                <span
                                  className={`text-xs sm:text-sm ${
                                    product.stock <= 5
                                      ? "text-red-500 font-semibold"
                                      : product.stock <= 10
                                        ? "text-yellow-600 font-semibold"
                                        : ""
                                  }`}
                                >
                                  Stock: {product.stock}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        {/* Loading More Indicator */}
                        {dropdownLoadingMore && (
                          <div className="p-4 text-center border-t">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                          </div>
                        )}
                        {/* Observer trigger for infinite scroll - must be at the end */}
                        {dropdownHasMore && !dropdownLoadingMore && (
                          <div ref={loadMoreRef} className="h-4 w-full" />
                        )}
                        {!dropdownHasMore && dropdownProducts.length > 0 && (
                          <div className="p-2 text-center text-xs text-muted-foreground border-t">
                            No more products
                          </div>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handleAddItem()}
                  type="button"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Search Results List - Only show when searching */}
              {searchQuery.trim() && (
                <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-6 sm:p-8 text-center">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Searching...
                      </p>
                    </div>
                  ) : searchProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                      No products found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="divide-y">
                      {searchProducts.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleAddItem(product._id)}
                          className="w-full p-3 text-left hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-2 w-full flex-col sm:flex-row">
                            <span className="flex-1 text-sm wrap-break-word font-medium">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {product.stock <= 5 ? (
                                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                              ) : product.stock <= 10 ? (
                                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                              ) : null}
                              <span
                                className={`text-xs sm:text-sm ${
                                  product.stock <= 5
                                    ? "text-red-500 font-semibold"
                                    : product.stock <= 10
                                      ? "text-yellow-600 font-semibold"
                                      : ""
                                }`}
                              >
                                Stock: {product.stock}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                      {/* Observer trigger for infinite scroll in search */}
                      {searchHasMore && !searchLoadingMore && (
                        <div ref={searchLoadMoreRef} className="h-2" />
                      )}
                      {/* Loading More Indicator */}
                      {searchLoadingMore && (
                        <div className="p-4 text-center border-t">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-sm sm:text-base">
                  Requisition Items
                </h3>

                {/* Desktop Table View */}
                <div className="hidden lg:block border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Product</TableHead>
                        <TableHead className="w-20">Qty</TableHead>
                        <TableHead className="w-28">Current Price</TableHead>
                        <TableHead className="w-28">Purchase Price</TableHead>
                        <TableHead className="w-24">Profit %</TableHead>
                        <TableHead className="w-28">New Price</TableHead>
                        <TableHead className="w-28">Total Cost</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium text-sm">
                            {item.productName}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.quantity || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  item.productId,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-16 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.currentPrice}
                              disabled
                              className="w-24 text-sm bg-muted"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              value={item.purchasePrice || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  item.productId,
                                  "purchasePrice",
                                  e.target.value
                                )
                              }
                              className="w-24 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="1000"
                              step="0.1"
                              placeholder="%"
                              value={
                                item.profitMargin === 0
                                  ? "0"
                                  : item.profitMargin || ""
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  item.productId,
                                  "profitMargin",
                                  e.target.value
                                )
                              }
                              className="w-20 text-sm"
                              required
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {formatCurrency(item.sellingPrice)}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-right font-semibold text-sm"
                        >
                          Total Amount:
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          {formatCurrency(calculateTotal())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm flex-1 pr-2">
                          {item.productName}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mt-1 -mr-1"
                          onClick={() => handleRemoveItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleItemChange(
                                item.productId,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Current Price
                          </Label>
                          <Input
                            type="number"
                            value={item.currentPrice}
                            disabled
                            className="text-sm bg-muted"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Purchase Price *
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={item.purchasePrice || ""}
                            onChange={(e) =>
                              handleItemChange(
                                item.productId,
                                "purchasePrice",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Profit Margin % *
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="1000"
                            step="0.1"
                            placeholder="%"
                            value={
                              item.profitMargin === 0
                                ? "0"
                                : item.profitMargin || ""
                            }
                            onChange={(e) =>
                              handleItemChange(
                                item.productId,
                                "profitMargin",
                                e.target.value
                              )
                            }
                            className="text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            New Price:
                          </span>
                          <p className="font-medium">
                            {formatCurrency(item.sellingPrice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Cost:
                          </span>
                          <p className="font-semibold">
                            {formatCurrency(item.totalCost)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || items.length === 0}
                className="w-full sm:w-auto"
              >
                {submitting ? "Creating..." : "Create Requisition"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Create Supplier Sheet */}
      <CreateSupplierSheet
        open={showCreateSupplierSheet}
        onClose={() => setShowCreateSupplierSheet(false)}
        onSuccess={handleSupplierCreated}
      />

      {/* Dialog to ask if user wants to save supplier */}
      {showCreateSupplierOption && (
        <Dialog
          open={showCreateSupplierOption}
          onOpenChange={setShowCreateSupplierOption}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Supplier Information?</DialogTitle>
              <DialogDescription>
                Would you like to save this supplier ({supplierName}) to your
                supplier database for future use?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleSkipSupplierCreation}
                className="flex-1"
              >
                Skip
              </Button>
              <Button onClick={handleCreateSupplierFromInfo} className="flex-1">
                Save Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Sheet>
  );
}
