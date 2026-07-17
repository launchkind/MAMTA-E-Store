import { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Check, X, Store, Edit, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  seller: {
    _id: string;
    storeName: string;
    contactEmail: string;
  };
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface Seller {
  _id: string;
  storeName: string;
  contactEmail: string;
}

export default function SellerProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, sellerFilter]);

  const fetchSellers = async () => {
    try {
      const response = { data: { sellers: [], products: [], data: [] } };
      setSellers(response.data.sellers || response.data);
    } catch (error: any) {
      console.error("Failed to fetch sellers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products/seller?status=${statusFilter}`;
      if (sellerFilter !== "all") {
        url += `&seller=${sellerFilter}`;
      }
      const response = { data: { sellers: [], products: [], data: [] } };
      setProducts(response.data.products || response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (
    productId: string,
    fromTable: boolean = false
  ) => {
    try {
      setActionLoading(true);
      // TODO: supabase update
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
      fetchProducts();
      if (fromTable) {
        // Don't close sidebar when clicking from table
      } else {
        setSidebarOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to approve product",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (
    productId: string,
    fromTable: boolean = false
  ) => {
    try {
      setActionLoading(true);
      // TODO: supabase update
      toast({
        title: "Success",
        description: "Product rejected",
      });
      fetchProducts();
      if (fromTable) {
        // Don't close sidebar when clicking from table
      } else {
        setSidebarOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reject product",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      // TODO: supabase delete
      toast({
        title: "Success",
        description: `${productToDelete.name} has been deleted successfully.`,
      });
      fetchProducts();
      setDeleteModalOpen(false);
      setProductToDelete(null);
      setSidebarOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = () => {
    if (selectedProduct) {
      setEditForm({
        name: selectedProduct.name,
        description: selectedProduct.description || "",
        price: selectedProduct.price,
        stock: selectedProduct.stock,
      });
      setIsEditMode(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(true);
      // TODO: supabase update
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      fetchProducts();
      setIsEditMode(false);
      setSidebarOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "warning",
      approved: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All Products</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger className="w-62.5">
              <SelectValue placeholder="All Sellers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sellers</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    {seller.storeName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-600">
            {products.length} product(s) found
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Store className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.brand?.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {product.seller?.storeName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {getStatusBadge(product.approvalStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setSidebarOpen(true);
                          }}
                          disabled={actionLoading}
                          className="p-1.5 h-auto rounded-lg hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Button>
                        {product.approvalStatus === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(product.id, true)}
                              disabled={actionLoading}
                              className="p-1.5 h-auto rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve Product"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(product.id, true)}
                              disabled={actionLoading}
                              className="p-1.5 h-auto rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject Product"
                            >
                              <X className="h-4.5 w-4.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Product Details Sidebar */}
      <Sheet
        open={sidebarOpen}
        onOpenChange={(open) => {
          if (!open && actionLoading) {
            toast({
              title: "Please wait",
              description:
                "An action is currently in progress. Please wait for it to complete.",
              variant: "destructive",
            });
            return;
          }
          setSidebarOpen(open);
        }}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedProduct && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {isEditMode ? "Edit Product" : "Product Details"}
                </SheetTitle>
                <SheetDescription>
                  {isEditMode
                    ? "Edit product details before approval"
                    : "Review seller product submission"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Product Images */}
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Product Name
                    </label>
                    {isEditMode ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="mt-1"
                        disabled={actionLoading}
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {selectedProduct.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Description
                    </label>
                    {isEditMode ? (
                      <Textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="mt-1"
                        rows={4}
                        disabled={actionLoading}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedProduct.description || "No description"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Seller
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Store className="h-5 w-5 text-babyshopPrimaryColor" />
                      <div>
                        <p className="font-semibold">
                          {selectedProduct.seller?.storeName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedProduct.seller?.contactEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Category
                      </label>
                      <p className="font-medium">
                        {selectedProduct.category?.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Brand
                      </label>
                      <p className="font-medium">
                        {selectedProduct.brand?.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Price
                      </label>
                      {isEditMode ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1"
                          disabled={actionLoading}
                        />
                      ) : (
                        <p className="text-lg font-semibold text-green-600">
                          ₹{selectedProduct.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Stock
                      </label>
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              stock: parseInt(e.target.value),
                            })
                          }
                          className="mt-1"
                          disabled={actionLoading}
                        />
                      ) : (
                        <p className="text-lg font-semibold">
                          {selectedProduct.stock}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedProduct.approvalStatus)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditMode ? (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="flex-1"
                      onClick={handleSaveEdit}
                      disabled={actionLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {actionLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditMode(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleEditClick}
                      disabled={actionLoading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Product
                    </Button>

                    {/* Status Change Buttons */}
                    <div className="flex gap-3">
                      {selectedProduct.approvalStatus !== "approved" && (
                        <Button
                          className="flex-1"
                          onClick={() => handleApprove(selectedProduct.id)}
                          disabled={actionLoading}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {actionLoading ? "Approving..." : "Approve"}
                        </Button>
                      )}
                      {selectedProduct.approvalStatus !== "rejected" && (
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReject(selectedProduct.id)}
                          disabled={actionLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {actionLoading ? "Rejecting..." : "Reject"}
                        </Button>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteClick(selectedProduct)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Product
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete && (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    {productToDelete.name}
                  </span>
                  ? This action cannot be undone and will permanently remove the
                  product from your store and all listings.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Product
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
