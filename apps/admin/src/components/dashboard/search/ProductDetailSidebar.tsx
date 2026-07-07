import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Package } from "lucide-react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  averageRating: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  sku?: string;
  createdAt: string;
};

interface ProductDetailSidebarProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ProductDetailSidebar({
  productId,
  isOpen,
  onClose,
  onUpdate,
}: ProductDetailSidebarProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  const isAdmin = currentUser?.role === "admin";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discountPercentage: 0,
    stock: 0,
  });

  useEffect(() => {
    if (productId && isOpen) {
      fetchProductDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
      });
    }
  }, [product]);

  const fetchProductDetails = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product details",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission if in edit mode
    if (!isEditMode) return;
    if (!isAdmin || !productId) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("products").update(formData).eq("id", productId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setIsEditMode(false);
      await fetchProductDetails();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update product",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isEditMode) {
      toast({
        title: "Unsaved Changes",
        description: "Please save or cancel your changes before closing.",
        variant: "destructive",
      });
      return;
    }
    if (!open) {
      handleClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        onInteractOutside={(e) => {
          if (isEditMode) {
            e.preventDefault();
            toast({
              title: "Unsaved Changes",
              description: "Please save or cancel your changes before closing.",
              variant: "destructive",
            });
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
            {isEditMode && (
              <Badge variant="secondary" className="ml-auto">
                Editing
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Edit product information"
              : "View product details and information"}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <div className="h-64 w-full bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : product ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image || "/placeholder-product.png"}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg border"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant="secondary">Stock: {product.stock}</Badge>
                {product.discountPercentage > 0 && (
                  <Badge variant="destructive">
                    -{product.discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditMode}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={!isEditMode}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    disabled={!isEditMode}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercentage: parseFloat(e.target.value),
                      })
                    }
                    disabled={!isEditMode}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditMode}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={product.category?.name || "N/A"}
                  disabled
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Brand</Label>
                <Input
                  value={product.brand?.name || "N/A"}
                  disabled
                  className="mt-2"
                />
              </div>

              {product.sku && (
                <div>
                  <Label>SKU</Label>
                  <Input value={product.sku} disabled className="mt-2" />
                </div>
              )}

              <div>
                <Label>Average Rating</Label>
                <Input
                  value={`${product.averageRating.toFixed(1)} / 5.0`}
                  disabled
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Created Date</Label>
                <Input
                  value={new Date(product.createdAt).toLocaleDateString()}
                  disabled
                  className="mt-2"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <SheetFooter className="flex-row gap-2 pt-6 border-t sticky bottom-0 bg-background pb-4">
              {isAdmin ? (
                isEditMode ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditMode(false);
                        // Reset form data to original product values
                        if (product) {
                          setFormData({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            discountPercentage: product.discountPercentage,
                            stock: product.stock,
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClose();
                      }}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditMode(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Product
                    </Button>
                  </>
                )
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
