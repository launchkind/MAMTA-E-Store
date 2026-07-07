import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, User, Calendar, FileText, DollarSign } from "lucide-react";

interface PurchaseItem {
  productId?: {
    _id: string;
    name: string;
    image?: string;
  };
  productName: string;
  quantity: number;
  purchasePrice: number;
  profitMargin: number;
  sellingPrice: number;
  totalCost: number;
  currentPrice?: number;
}

interface Purchase {
  _id: string;
  purchaseNumber: string;
  items: PurchaseItem[];
  totalAmount: number;
  supplier: {
    name: string;
    contact: string;
    email?: string;
    address?: string;
  };
  status: string;
  notes?: string;
  createdBy: {
    id?: string;
    name: string;
  };
  approvedBy?: {
    id?: string;
    name: string;
    at: string;
    notes?: string;
  };
  purchasedBy?: {
    id?: string;
    name: string;
    at: string;
    notes?: string;
  };
  receivedBy?: {
    id?: string;
    name: string;
    at: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

interface PurchaseDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

export default function PurchaseDetailsSheet({
  open,
  onClose,
  purchase,
}: PurchaseDetailsSheetProps) {
  if (!purchase) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      requisition: "secondary",
      approved: "default",
      purchased: "outline",
      received: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Details
          </SheetTitle>
          <SheetDescription>
            {purchase.purchaseNumber} - {getStatusBadge(purchase.status)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Supplier Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Supplier Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{purchase.supplier.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Contact:</span>
                <p className="font-medium">{purchase.supplier.contact}</p>
              </div>
              {purchase.supplier.email && (
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium">{purchase.supplier.email}</p>
                </div>
              )}
              {purchase.supplier.address && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Address:
                  </span>
                  <p className="font-medium">{purchase.supplier.address}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items ({purchase.items.length})
            </h3>
            <div className="space-y-3">
              {purchase.items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2 bg-card"
                >
                  <div className="font-medium">
                    {item.productName || item.productId?.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium ml-2">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Purchase Price:
                      </span>
                      <span className="font-medium ml-2">
                        {formatCurrency(item.purchasePrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Profit Margin:
                      </span>
                      <span className="font-medium ml-2">
                        {item.profitMargin}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Selling Price:
                      </span>
                      <span className="font-medium ml-2">
                        {formatCurrency(item.sellingPrice)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-semibold ml-2">
                        {formatCurrency(item.totalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total Amount */}
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Amount:
              </span>
              <span className="text-2xl font-bold">
                {formatCurrency(purchase.totalAmount)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Workflow History */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Workflow History
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  By: {purchase.createdBy.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(purchase.createdAt)}
                </div>
              </div>

              {purchase.approvedBy && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium">Approved</div>
                  <div className="text-sm text-muted-foreground">
                    By: {purchase.approvedBy.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(purchase.approvedBy.at)}
                  </div>
                  {purchase.approvedBy.notes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Note: {purchase.approvedBy.notes}
                    </div>
                  )}
                </div>
              )}

              {purchase.purchasedBy && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium">Purchased</div>
                  <div className="text-sm text-muted-foreground">
                    By: {purchase.purchasedBy.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(purchase.purchasedBy.at)}
                  </div>
                  {purchase.purchasedBy.notes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Note: {purchase.purchasedBy.notes}
                    </div>
                  )}
                </div>
              )}

              {purchase.receivedBy && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm font-medium">Received</div>
                  <div className="text-sm text-muted-foreground">
                    By: {purchase.receivedBy.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(purchase.receivedBy.at)}
                  </div>
                  {purchase.receivedBy.notes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Note: {purchase.receivedBy.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{purchase.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
