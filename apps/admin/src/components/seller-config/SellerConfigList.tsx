import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check, X, Store, Mail, Phone, MapPin, Eye, Building2, User, Plus, Pencil,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/lib/supabase";

interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Seller {
  id: string;
  user: SupabaseUser;
  store_name: string;
  description: string;
  logo?: string;
  status: "pending" | "approved" | "rejected";
  contact_email: string;
  contact_phone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

const EMPTY_FORM = {
  user_id: "",
  store_name: "",
  description: "",
  logo: "",
  contact_email: "",
  contact_phone: "",
  street: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  status: "approved",
  role: "seller",
};

const SellerConfigList = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addSellerOpen, setAddSellerOpen] = useState(false);
  const [editSellerOpen, setEditSellerOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sellerForm, setSellerForm] = useState(EMPTY_FORM);
  const { can } = usePermissions();
  const { toast } = useToast();

  useEffect(() => {
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (addSellerOpen) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSellerOpen]);

  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from("sellers")
        .select(`
          id, store_name, description, logo, status,
          contact_email, contact_phone,
          street, city, state, country, postal_code,
          created_at, updated_at,
          user:users!sellers_user_id_fkey(id, name, email, role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSellers((data || []) as unknown as Seller[]);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load sellers" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (search = "") => {
    try {
      let query = supabase.from("users").select("id, name, email, role").limit(50);
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleUserSearch = (value: string) => {
    setUserSearch(value);
    fetchUsers(value);
  };

  const isUserAlreadySeller = (userId: string) =>
    sellers.some((s) => s.user?.id === userId);

  const handleUserSelect = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      setSellerForm((p) => ({
        ...p,
        user_id: userId,
        store_name: selected.name + "'s Store",
        contact_email: selected.email,
      }));
    }
  };

  const openEditSeller = (seller: Seller) => {
    setEditingSeller(seller);
    setSellerForm({
      user_id: seller.user?.id || "",
      store_name: seller.store_name,
      description: seller.description,
      logo: seller.logo || "",
      contact_email: seller.contact_email,
      contact_phone: seller.contact_phone || "",
      street: seller.street || "",
      city: seller.city || "",
      state: seller.state || "",
      country: seller.country || "",
      postal_code: seller.postal_code || "",
      status: seller.status,
      role: seller.user?.role || "seller",
    });
    setEditSellerOpen(true);
  };

  const handleCreateSeller = async () => {
    if (!sellerForm.user_id || !sellerForm.store_name || !sellerForm.description || !sellerForm.contact_email) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields" });
      return;
    }
    try {
      setCreating(true);
      const { error } = await supabase.from("sellers").insert({
        user_id: sellerForm.user_id,
        store_name: sellerForm.store_name,
        description: sellerForm.description,
        logo: sellerForm.logo || null,
        contact_email: sellerForm.contact_email,
        contact_phone: sellerForm.contact_phone || null,
        street: sellerForm.street || null,
        city: sellerForm.city || null,
        state: sellerForm.state || null,
        country: sellerForm.country || null,
        postal_code: sellerForm.postal_code || null,
        status: sellerForm.status,
      });
      if (error) throw error;
      // Update user role to seller
      await supabase.from("users").update({ role: "seller" }).eq("id", sellerForm.user_id);
      toast({ title: "Success", description: "Seller created successfully" });
      setAddSellerOpen(false);
      setSellerForm(EMPTY_FORM);
      fetchSellers();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create seller";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSeller = async () => {
    if (!sellerForm.store_name || !sellerForm.description || !sellerForm.contact_email) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields" });
      return;
    }
    if (!editingSeller) return;
    try {
      setUpdating(true);
      const { error } = await supabase.from("sellers").update({
        store_name: sellerForm.store_name,
        description: sellerForm.description,
        logo: sellerForm.logo || null,
        contact_email: sellerForm.contact_email,
        contact_phone: sellerForm.contact_phone || null,
        street: sellerForm.street || null,
        city: sellerForm.city || null,
        state: sellerForm.state || null,
        country: sellerForm.country || null,
        postal_code: sellerForm.postal_code || null,
        status: sellerForm.status,
      }).eq("id", editingSeller.id);
      if (error) throw error;
      if (sellerForm.role !== editingSeller.user?.role) {
        await supabase.from("users").update({ role: sellerForm.role }).eq("id", editingSeller.user.id);
      }
      toast({ title: "Success", description: "Seller updated successfully" });
      setEditSellerOpen(false);
      setEditingSeller(null);
      setSellerForm(EMPTY_FORM);
      fetchSellers();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update seller";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    if (!can("manage_sellers")) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You don't have permission to update seller status" });
      return;
    }
    try {
      const { error } = await supabase.from("sellers").update({ status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: `Seller ${status} successfully` });
      setDetailsOpen(false);
      fetchSellers();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    }
  };

  const viewDetails = (seller: Seller) => {
    setSelectedSeller(seller);
    setDetailsOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === "approved") return "default" as const;
    if (status === "pending") return "secondary" as const;
    return "destructive" as const;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setAddSellerOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />Add Seller
        </Button>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-50">Store Name</TableHead>
                <TableHead className="min-w-37.5">Owner</TableHead>
                <TableHead className="min-w-50 hidden md:table-cell">Email</TableHead>
                <TableHead className="min-w-37.5 hidden lg:table-cell">Phone</TableHead>
                <TableHead className="min-w-30">Status</TableHead>
                <TableHead className="min-w-30 hidden sm:table-cell">Created Date</TableHead>
                <TableHead className="text-right min-w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Store size={48} className="opacity-20" />
                      <p>No sellers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sellers.map((seller) => (
                  <TableRow key={seller.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewDetails(seller)}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {seller.logo ? (
                          <img src={seller.logo} alt={seller.store_name} className="h-10 w-10 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                            <Store size={20} className="text-slate-400" />
                          </div>
                        )}
                        <span className="truncate">{seller.store_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="truncate">{seller.user?.name || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{seller.contact_email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {seller.contact_phone ? (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{seller.contact_phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(seller.status)}>{seller.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(seller.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewDetails(seller)} title="View Details">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditSeller(seller)} title="Edit Seller" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Seller Sidebar */}
      <Sheet open={addSellerOpen} onOpenChange={setAddSellerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Seller</SheetTitle>
            <SheetDescription>Select a user and fill in seller details to create a new seller account</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Select User *</Label>
              <div className="mb-2">
                <Input placeholder="Search users by name or email..." value={userSearch} onChange={(e) => handleUserSearch(e.target.value)} className="h-8 text-sm" />
              </div>
              <Select value={sellerForm.user_id} onValueChange={handleUserSelect} disabled={creating}>
                <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
                <SelectContent>
                  {users.map((user) => {
                    const isSeller = isUserAlreadySeller(user.id);
                    return (
                      <SelectItem key={user.id} value={user.id} disabled={isSeller}>
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span className={isSeller ? "text-muted-foreground" : ""}>{user.name}</span>
                          <span className="text-xs text-muted-foreground">({user.email})</span>
                          {isSeller && <span className="text-xs font-medium text-orange-600">• Already Seller</span>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Store Name *</Label>
              <Input value={sellerForm.store_name} onChange={(e) => setSellerForm((p) => ({ ...p, store_name: e.target.value }))} placeholder="Enter store name" disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label>Contact Email *</Label>
              <Input type="email" value={sellerForm.contact_email} onChange={(e) => setSellerForm((p) => ({ ...p, contact_email: e.target.value }))} placeholder="store@example.com" disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={sellerForm.description} onChange={(e) => setSellerForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the seller's business" rows={4} disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input type="tel" value={sellerForm.contact_phone} onChange={(e) => setSellerForm((p) => ({ ...p, contact_phone: e.target.value }))} placeholder="+1 (555) 000-0000" disabled={creating} />
            </div>
            <div className="space-y-2">
              <Label>Store Logo/Image</Label>
              <ImageUpload value={sellerForm.logo} onChange={(url) => setSellerForm((p) => ({ ...p, logo: url }))} disabled={creating} folder="sellers" />
            </div>
            <Separator />
            <h4 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2"><MapPin size={16} />Address (Optional)</h4>
            <div className="space-y-2">
              <Label>Street</Label>
              <Input value={sellerForm.street} onChange={(e) => setSellerForm((p) => ({ ...p, street: e.target.value }))} placeholder="123 Main St" disabled={creating} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={sellerForm.city} onChange={(e) => setSellerForm((p) => ({ ...p, city: e.target.value }))} placeholder="New York" disabled={creating} /></div>
              <div className="space-y-2"><Label>State/Province</Label><Input value={sellerForm.state} onChange={(e) => setSellerForm((p) => ({ ...p, state: e.target.value }))} placeholder="NY" disabled={creating} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Country</Label><Input value={sellerForm.country} onChange={(e) => setSellerForm((p) => ({ ...p, country: e.target.value }))} placeholder="USA" disabled={creating} /></div>
              <div className="space-y-2"><Label>Postal Code</Label><Input value={sellerForm.postal_code} onChange={(e) => setSellerForm((p) => ({ ...p, postal_code: e.target.value }))} placeholder="10001" disabled={creating} /></div>
            </div>
            <div className="space-y-2">
              <Label>Initial Status</Label>
              <Select value={sellerForm.status} onValueChange={(value) => setSellerForm((p) => ({ ...p, status: value }))} disabled={creating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setAddSellerOpen(false)} disabled={creating}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreateSeller} disabled={creating}>{creating ? "Creating..." : "Create Seller"}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Seller Sidebar */}
      <Sheet open={editSellerOpen} onOpenChange={setEditSellerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Seller</SheetTitle>
            <SheetDescription>Update seller details and save changes</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Seller Owner</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                <User size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{editingSeller?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{editingSeller?.user?.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Seller owner cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={sellerForm.role} onValueChange={(value) => setSellerForm((p) => ({ ...p, role: value }))} disabled={updating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Store Name *</Label>
              <Input value={sellerForm.store_name} onChange={(e) => setSellerForm((p) => ({ ...p, store_name: e.target.value }))} placeholder="Enter store name" disabled={updating} />
            </div>
            <div className="space-y-2">
              <Label>Contact Email *</Label>
              <Input type="email" value={sellerForm.contact_email} onChange={(e) => setSellerForm((p) => ({ ...p, contact_email: e.target.value }))} disabled={updating} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={sellerForm.description} onChange={(e) => setSellerForm((p) => ({ ...p, description: e.target.value }))} rows={4} disabled={updating} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input type="tel" value={sellerForm.contact_phone} onChange={(e) => setSellerForm((p) => ({ ...p, contact_phone: e.target.value }))} disabled={updating} />
            </div>
            <div className="space-y-2">
              <Label>Store Logo/Image</Label>
              <ImageUpload value={sellerForm.logo} onChange={(url) => setSellerForm((p) => ({ ...p, logo: url }))} disabled={updating} folder="sellers" />
            </div>
            <Separator />
            <h4 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2"><MapPin size={16} />Address (Optional)</h4>
            <div className="space-y-2"><Label>Street</Label><Input value={sellerForm.street} onChange={(e) => setSellerForm((p) => ({ ...p, street: e.target.value }))} disabled={updating} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={sellerForm.city} onChange={(e) => setSellerForm((p) => ({ ...p, city: e.target.value }))} disabled={updating} /></div>
              <div className="space-y-2"><Label>State</Label><Input value={sellerForm.state} onChange={(e) => setSellerForm((p) => ({ ...p, state: e.target.value }))} disabled={updating} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Country</Label><Input value={sellerForm.country} onChange={(e) => setSellerForm((p) => ({ ...p, country: e.target.value }))} disabled={updating} /></div>
              <div className="space-y-2"><Label>Postal Code</Label><Input value={sellerForm.postal_code} onChange={(e) => setSellerForm((p) => ({ ...p, postal_code: e.target.value }))} disabled={updating} /></div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={sellerForm.status} onValueChange={(value) => setSellerForm((p) => ({ ...p, status: value }))} disabled={updating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setEditSellerOpen(false); setEditingSeller(null); }} disabled={updating}>Cancel</Button>
              <Button className="flex-1" onClick={handleUpdateSeller} disabled={updating}>{updating ? "Updating..." : "Update Seller"}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Seller Details Sidebar */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Seller Details</SheetTitle>
            <SheetDescription>Complete information and actions for this seller</SheetDescription>
          </SheetHeader>
          {selectedSeller && (
            <div className="space-y-6 mt-6">
              <div className="flex items-start gap-4">
                {selectedSeller.logo ? (
                  <img src={selectedSeller.logo} alt={selectedSeller.store_name} className="h-20 w-20 rounded-lg object-cover border shadow-sm shrink-0" />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center border shrink-0">
                    <Store size={32} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate">{selectedSeller.store_name}</h3>
                  <Badge variant={getStatusBadgeVariant(selectedSeller.status)} className="mt-2">{selectedSeller.status}</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Actions</h4>
                <div className="flex flex-col gap-2">
                  {selectedSeller.status === "pending" && (
                    <>
                      <Button onClick={() => updateStatus(selectedSeller.id, "approved")} className="w-full bg-green-600 hover:bg-green-700 text-white"><Check size={16} className="mr-2" />Approve Seller</Button>
                      <Button onClick={() => updateStatus(selectedSeller.id, "rejected")} variant="destructive" className="w-full"><X size={16} className="mr-2" />Reject Seller</Button>
                    </>
                  )}
                  {selectedSeller.status === "approved" && (
                    <Button onClick={() => updateStatus(selectedSeller.id, "rejected")} variant="destructive" className="w-full"><X size={16} className="mr-2" />Revoke Approval</Button>
                  )}
                  {selectedSeller.status === "rejected" && (
                    <Button onClick={() => updateStatus(selectedSeller.id, "approved")} className="w-full bg-green-600 hover:bg-green-700 text-white"><Check size={16} className="mr-2" />Approve Seller</Button>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2"><Building2 size={16} />Store Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm">{selectedSeller.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Mail size={12} />Contact Email</label>
                      <p className="mt-1 text-sm break-all">{selectedSeller.contact_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Phone size={12} />Contact Phone</label>
                      <p className="mt-1 text-sm">{selectedSeller.contact_phone || "Not provided"}</p>
                    </div>
                  </div>
                  {(selectedSeller.street || selectedSeller.city) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1"><MapPin size={12} />Address</label>
                      <div className="mt-1 text-sm space-y-0.5">
                        {selectedSeller.street && <p>{selectedSeller.street}</p>}
                        <p>{[selectedSeller.city, selectedSeller.state, selectedSeller.postal_code].filter(Boolean).join(", ")}</p>
                        {selectedSeller.country && <p>{selectedSeller.country}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase flex items-center gap-2"><User size={16} />Owner Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
                    <p className="mt-1 text-sm">{selectedSeller.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Owner Email</label>
                    <p className="mt-1 text-sm break-all">{selectedSeller.user?.email || "N/A"}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Metadata</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <p className="mt-1 text-sm">{new Date(selectedSeller.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="mt-1 text-sm">{new Date(selectedSeller.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SellerConfigList;
