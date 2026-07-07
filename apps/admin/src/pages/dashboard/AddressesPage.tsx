import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPinned,
  Home,
} from "lucide-react";

type Address = {
  _id: string;
  userId:
    | {
        _id: string;
        name: string;
        email: string;
        phone?: string;
      }
    | string;
  userName?: string;
  userEmail?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  label?: string;
  createdAt?: string;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { toast } = useToast();

  const totalPages = Math.ceil(total / perPage);

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("addresses")
        .select("*, user:users!user_id(id, name, email)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (searchTerm.trim()) {
        query = query.or(
          `city.ilike.%${searchTerm}%,street.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setAddresses(
        (data ?? []).map((a) => ({
          ...a,
          _id: a.id,
          userId: a.user ?? { _id: a.user_id, name: "Unknown", email: "" },
          postalCode: a.postal_code,
          isDefault: a.is_default,
          createdAt: a.created_at,
        }))
      );
      setTotal(count ?? 0);
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as { message?: string })?.message ||
          "Failed to fetch addresses.",
        variant: "destructive",
      });
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleViewAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsSheetOpen(true);
  };

  // Helper functions to get user data
  const getUserName = (address: Address): string => {
    if (typeof address.userId === "object" && address.userId.name) {
      return address.userId.name;
    }
    if (address.userName) {
      return address.userName;
    }
    return "Unknown";
  };

  const getUserEmail = (address: Address): string => {
    if (typeof address.userId === "object" && address.userId.email) {
      return address.userId.email;
    }
    if (address.userEmail) {
      return address.userEmail;
    }
    return "N/A";
  };

  const getUserPhone = (address: Address): string | undefined => {
    if (typeof address.userId === "object" && address.userId.phone) {
      return address.userId.phone;
    }
    return undefined;
  };

  const getUserInitial = (address: Address): string => {
    const name = getUserName(address);
    return name !== "Unknown" ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Customer Addresses
          </h1>
          <p className="text-gray-600 mt-1">
            View all customer shipping addresses
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 md:h-8 md:w-8 text-indigo-600" />
            {loading || refreshing ? (
              <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 animate-spin" />
            ) : (
              <span className="text-xl md:text-2xl font-bold text-indigo-600">
                {total}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg shadow-sm border"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500 shrink-0" />
          <Input
            placeholder="Search by name, phone, address, city..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </motion.div>

      {/* Addresses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(perPage)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Address</TableHead>
                <TableHead className="font-semibold">City</TableHead>
                <TableHead className="font-semibold">State/Postal</TableHead>
                <TableHead className="font-semibold">Country</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <TableRow key={address._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{getUserName(address)}</p>
                        <p className="text-sm text-gray-500">
                          {getUserEmail(address)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {address.street}
                    </TableCell>
                    <TableCell>{address.city}</TableCell>
                    <TableCell>
                      <div>
                        <p>{address.state}</p>
                        <p className="text-sm text-gray-500">
                          {address.postalCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{address.country}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewAddress(address)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <MapPin className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          No addresses found
                        </p>
                        <p className="text-sm text-gray-500">
                          Customer addresses will appear here
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Pagination */}
      {!loading && total > perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between bg-white rounded-lg border px-4 py-3"
        >
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * perPage, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> addresses
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Address Details Sidebar */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-indigo-600" />
              Address Details
            </SheetTitle>
          </SheetHeader>

          {selectedAddress && (
            <div className="mt-6 space-y-6">
              {/* User Information */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {getUserInitial(selectedAddress)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Customer Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Address belongs to this user
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {getUserName(selectedAddress)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 break-all">
                        {getUserEmail(selectedAddress)}
                      </p>
                    </div>
                  </div>

                  {getUserPhone(selectedAddress) && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {getUserPhone(selectedAddress)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-600" />
                    Shipping Address
                  </h3>
                  {selectedAddress.isDefault && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3 border">
                  {selectedAddress.label && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Label</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedAddress.label}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-600 font-medium">Street</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedAddress.street}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">City</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedAddress.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">State</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedAddress.state}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">
                        Postal Code
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedAddress.postalCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">
                        Country
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedAddress.country}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600 font-medium mb-2">
                      Full Address
                    </p>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {selectedAddress.street}, {selectedAddress.city},{" "}
                      {selectedAddress.state} {selectedAddress.postalCode},{" "}
                      {selectedAddress.country}
                    </p>
                  </div>
                </div>
              </div>

              {selectedAddress.createdAt && (
                <div className="text-xs text-gray-500 text-center pt-2 border-t">
                  Added on{" "}
                  {new Date(selectedAddress.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
