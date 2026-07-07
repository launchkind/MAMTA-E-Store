import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Globe,
  Hash,
  Calendar,
  User,
} from "lucide-react";

interface Supplier {
  _id: string;
  name: string;
  email: string;
  contact?: string;
  address?: string;
  paymentSystem: string;
  paymentDetails?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SupplierDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export default function SupplierDetailsSheet({
  open,
  onClose,
  supplier,
}: SupplierDetailsSheetProps) {
  if (!supplier) return null;

  const getPaymentSystemLabel = (system: string) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      "bank-transfer": "Bank Transfer",
      check: "Check",
      credit: "Credit",
      online: "Online Payment",
      other: "Other",
    };
    return labels[system] || system;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Supplier Details
          </SheetTitle>
          <SheetDescription>
            {supplier.name} -{" "}
            <Badge variant={supplier.isActive ? "default" : "secondary"}>
              {supplier.isActive ? "Active" : "Inactive"}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{supplier.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email:
                </span>
                <p className="font-medium">{supplier.email}</p>
              </div>
              {supplier.contact && (
                <div>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Contact:
                  </span>
                  <p className="font-medium">{supplier.contact}</p>
                </div>
              )}
              {supplier.address && (
                <div>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address:
                  </span>
                  <p className="font-medium">{supplier.address}</p>
                </div>
              )}
              {supplier.website && (
                <div>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website:
                  </span>
                  <p className="font-medium">
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">
                  Payment System:
                </span>
                <p className="font-medium">
                  {getPaymentSystemLabel(supplier.paymentSystem)}
                </p>
              </div>
              {supplier.paymentDetails && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Payment Details:
                  </span>
                  <p className="font-medium whitespace-pre-wrap">
                    {supplier.paymentDetails}
                  </p>
                </div>
              )}
              {supplier.taxId && (
                <div>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Tax ID:
                  </span>
                  <p className="font-medium">{supplier.taxId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {supplier.notes}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Record Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Created By:
                </span>
                <p className="font-medium">{supplier.createdBy.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Created At:
                </span>
                <p className="font-medium">{formatDate(supplier.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Last Updated:
                </span>
                <p className="font-medium">{formatDate(supplier.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
