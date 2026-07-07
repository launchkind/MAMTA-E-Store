import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveSupplier } from "@/lib/purchaseApi";

interface SupplierForm {
  _id?: string;
  name: string;
  email: string;
  contact?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface CreateSupplierSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: SupplierForm | null;
}

const EMPTY: SupplierForm = {
  name: "",
  email: "",
  contact: "",
  phone: "",
  address: "",
  notes: "",
};

export default function CreateSupplierSheet({
  open,
  onClose,
  onSuccess,
  supplier,
}: CreateSupplierSheetProps) {
  const [formData, setFormData] = useState<SupplierForm>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email || "",
        contact: supplier.contact || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
      });
    } else {
      setFormData(EMPTY);
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setLoading(true);
      await saveSupplier(
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.contact?.trim() || null,
          phone: formData.phone?.trim() || null,
          address: formData.address?.trim() || null,
          notes: formData.notes?.trim() || "",
        },
        supplier?._id
      );
      toast.success(
        supplier?._id
          ? "Supplier updated successfully"
          : "Supplier created successfully"
      );
      setFormData(EMPTY);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save supplier"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData(EMPTY);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {supplier ? "Edit Supplier" : "Create New Supplier"}
          </SheetTitle>
          <SheetDescription>
            {supplier
              ? "Update supplier information"
              : "Add a new supplier to your database"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Required Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">
                Supplier Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="supplier@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">
              Contact Information (Optional)
            </h3>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                placeholder="Contact person name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Payment terms, tax ID, website, or any other details"
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Saving..."
                : supplier
                  ? "Update Supplier"
                  : "Create Supplier"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
