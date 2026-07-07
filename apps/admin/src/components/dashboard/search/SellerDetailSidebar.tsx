import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Seller = {
  _id: string;
  storeName: string;
  description?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  status: "pending" | "approved" | "rejected";
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  createdAt: string;
};

interface SellerDetailSidebarProps {
  sellerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function SellerDetailSidebar({
  sellerId,
  isOpen,
  onClose,
  onUpdate,
}: SellerDetailSidebarProps) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sellerId && isOpen) {
      fetchSellerDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, isOpen]);

  const fetchSellerDetails = async () => {
    if (!sellerId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from("sellers").select("*").eq("id", sellerId).single();
      if (error) throw error;
      setSeller(data);
    } catch (error) {
      console.error("Error fetching seller:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load seller details",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: "approved" | "rejected") => {
    if (!sellerId) return;

    try {
      const { error } = await supabase.from("sellers").update({ status }).eq("id", sellerId);
      if (error) throw error;

      toast({
        title: "Success",
        description: `Seller ${status} successfully`,
      });

      fetchSellerDetails();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating seller status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    }
  };

  const FormatAddress = ({ address }: { address?: Seller["address"] }) => {
    if (!address)
      return <span className="text-muted-foreground">No address provided</span>;
    return (
      <div className="text-sm">
        <p>{address.street}</p>
        <p>
          {address.city}
          {address.city && address.state && ", "}
          {address.state}
          {address.postalCode && ` ${address.postalCode}`}
        </p>
        <p>{address.country}</p>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg h-full flex flex-col p-0">
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Seller Details
            </SheetTitle>
            <SheetDescription>
              View and manage seller information and status.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {loading ? (
            <div className="space-y-4 mt-6">
              <div className="h-32 w-32 mx-auto bg-muted animate-pulse rounded-full" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            </div>
          ) : seller ? (
            <div className="mt-4 space-y-6 pb-20">
              {/* Header Info */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  {seller.logo ? (
                    <img
                      src={seller.logo}
                      alt={seller.storeName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold">{seller.storeName}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge
                      variant={
                        seller.status === "approved"
                          ? "default"
                          : seller.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {seller.status.charAt(0).toUpperCase() +
                        seller.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Since {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              {seller.description && (
                <div>
                  <h4 className="font-semibold mb-2">About the Store</h4>
                  <p className="text-sm text-gray-600">{seller.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold">Contact Information</h4>

                <div className="grid gap-3 flex-col text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{seller.contactEmail}</span>
                  </div>
                  {seller.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{seller.contactPhone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <FormatAddress address={seller.address} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Owner Info */}
              <div>
                <h4 className="font-semibold mb-3">
                  Store Owner (User Account)
                </h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {seller.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 pr-2">
                    <div className="font-medium truncate">
                      {seller.userId.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {seller.userId.email}
                    </div>
                  </div>
                  <div className="ml-auto shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] sm:text-xs px-2"
                    >
                      {seller.userId.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              {seller.status === "pending" && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Application Action</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => updateStatus("rejected")}
                    >
                      <X className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => updateStatus("approved")}
                    >
                      <Check className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Actions */}
              {seller.status === "approved" && (
                <div className="pt-4 border-t flex flex-col gap-2">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" /> View Products
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t bg-gray-50/50 shrink-0 w-full mt-auto">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close Dialog
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
