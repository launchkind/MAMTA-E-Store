/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { brandSchema } from "@/lib/validation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash, Plus, Loader2, RefreshCw, Search, Filter, X, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type Brand = {
  id: string;
  name: string;
  image?: string;
  created_at: string;
};

type FormData = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [deletingBrandIds, setDeletingBrandIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "", image: "" },
  });

  const fetchBrands = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      let query = supabase
        .from("brands")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: sortOrder === "asc" })
        .range(from, to);

      if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);

      const { data, count, error } = await query;
      if (error) throw error;

      setBrands(data || []);
      setTotal(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage));
      setCurrentPage(page);

      if (isRefresh) {
        toast({ title: "Success", description: "Brands refreshed" });
        setSelectedBrands([]);
      }
    } catch (error) {
      console.error("Failed to load brands", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load brands" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => { setCurrentPage(1); fetchBrands(1); }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, sortOrder, perPage]);

  useEffect(() => { fetchBrands(1); }, []);
  useEffect(() => { return debouncedSearchTerm; }, [debouncedSearchTerm]);

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsEditMode(true);
    form.reset({ name: brand.name, image: brand.image || "" });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedBrand(null);
    setIsEditMode(false);
    form.reset({ name: "", image: "" });
    setIsSidebarOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedBrand) {
        const { error } = await supabase.from("brands").update({ name: data.name, image: data.image || null }).eq("id", selectedBrand.id);
        if (error) throw error;
        toast({ title: "Success", description: "Brand updated" });
        fetchBrands(currentPage);
      } else {
        const { error } = await supabase.from("brands").insert({ name: data.name, image: data.image || null });
        if (error) throw error;
        toast({ title: "Success", description: "Brand created" });
        fetchBrands(1);
      }
      form.reset();
      setIsSidebarOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to ${isEditMode ? "update" : "create"} brand` });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => setSelectedBrands(checked ? brands.map((b) => b.id) : []);
  const handleSelectBrand = (id: string, checked: boolean) =>
    setSelectedBrands((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));

  const handleDeleteBrand = async () => {
    if (!selectedBrand && selectedBrands.length > 0) {
      try {
        setDeletingBrandIds((p) => [...p, ...selectedBrands]);
        const { error } = await supabase.from("brands").delete().in("id", selectedBrands);
        if (error) throw error;
        toast({ title: "Success", description: `Deleted ${selectedBrands.length} brands` });
        setSelectedBrands([]);
        setIsDeleteModalOpen(false);
        fetchBrands(currentPage);
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete brands" });
      } finally {
        setDeletingBrandIds([]);
      }
      return;
    }
    if (!selectedBrand) return;
    try {
      setDeletingBrandIds((p) => [...p, selectedBrand.id]);
      const { error } = await supabase.from("brands").delete().eq("id", selectedBrand.id);
      if (error) throw error;
      toast({ title: "Success", description: "Brand deleted" });
      setIsDeleteModalOpen(false);
      const pages = Math.ceil((total - 1) / perPage);
      fetchBrands(currentPage > pages ? Math.max(1, pages) : currentPage);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete brand" });
    } finally {
      setDeletingBrandIds((p) => p.filter((x) => x !== selectedBrand!.id));
    }
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Checkbox disabled /></TableCell>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
    </TableRow>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">Manage your brand catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchBrands(currentPage, true)} disabled={refreshing} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && canPerformCRUD && <Button onClick={handleAdd} size="sm"><Plus className="mr-2 h-4 w-4" /> Add Brand</Button>}
          {isAdmin && isReadOnly && <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md"><span className="text-xs text-amber-700">Read-only mode</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Brands</CardTitle><ImageIcon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Current Page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : `${currentPage} of ${totalPages}`}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Per Page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : perPage}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="mr-2 h-4 w-4" />{showFilters ? "Hide" : "Show"} Filters</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search brands..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSortOrder("desc"); setPerPage(10); }} disabled={!searchTerm && sortOrder === "desc"} size="sm"><X className="mr-2 h-4 w-4" />Clear</Button>
          </div>
          {showFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div><label className="text-sm font-medium mb-2 block">Sort Order</label><Select value={sortOrder} onValueChange={(v: "asc" | "desc") => setSortOrder(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="desc">Newest First</SelectItem><SelectItem value="asc">Oldest First</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium mb-2 block">Per Page</label><Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select></div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {!loading && <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Showing {brands.length} of {total} brands{searchTerm && ` for "${searchTerm}"`}</span>{(searchTerm || sortOrder !== "desc") && <Badge variant="secondary">Filtered</Badge>}</div>}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox checked={brands.length > 0 && selectedBrands.length === brands.length} onCheckedChange={(c) => handleSelectAll(c as boolean)} /></TableHead>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>{selectedBrands.length > 0 ? <Button variant="destructive" size="sm" onClick={() => { setSelectedBrand(null); setIsDeleteModalOpen(true); }} className="h-8 text-xs">Delete Selected ({selectedBrands.length})</Button> : "Name"}</TableHead>
              <TableHead>Created</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? Array.from({ length: perPage }).map((_, i) => <SkeletonRow key={i} />) :
             brands.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8"><div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageIcon className="h-8 w-8" /><span>No brands found</span>{searchTerm && <Button variant="link" onClick={() => setSearchTerm("")} size="sm">Clear search</Button>}</div></TableCell></TableRow>
             ) : brands.map((brand, index) => {
              if (deletingBrandIds.includes(brand.id)) return <SkeletonRow key={brand.id} />;
              return (
                <motion.tr key={brand.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="group hover:bg-muted/50">
                  <TableCell><Checkbox checked={selectedBrands.includes(brand.id)} onCheckedChange={(c) => handleSelectBrand(brand.id, c as boolean)} /></TableCell>
                  <TableCell className="font-medium">{(currentPage - 1) * perPage + index + 1}</TableCell>
                  <TableCell><div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">{brand.image ? <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}</div></TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                  {isAdmin && <TableCell><div className="flex items-center gap-2">{canPerformCRUD && <><Button variant="outline" size="sm" onClick={() => handleEdit(brand)}><Edit className="h-4 w-4" /></Button><Button variant="outline" size="sm" onClick={() => { setSelectedBrand(brand); setIsDeleteModalOpen(true); }} className="hover:text-red-500"><Trash className="h-4 w-4" /></Button></>}{isReadOnly && <span className="text-xs text-muted-foreground">View only</span>}</div></TableCell>}
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} ({total} total)</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchBrands(1)} disabled={currentPage === 1}>First</Button>
            <Button variant="outline" size="sm" onClick={() => fetchBrands(currentPage - 1)} disabled={currentPage === 1}>Prev</Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i; if (p > totalPages) return null; return <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => fetchBrands(p)} className="w-10">{p}</Button>; })}
            <Button variant="outline" size="sm" onClick={() => fetchBrands(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
            <Button variant="outline" size="sm" onClick={() => fetchBrands(totalPages)} disabled={currentPage === totalPages}>Last</Button>
          </div>
        </div>
      )}

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{isEditMode ? "Edit Brand" : "Add Brand"}</SheetTitle><SheetDescription>{isEditMode ? "Update brand information" : "Create a new product brand"}</SheetDescription></SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-6">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} disabled={formLoading} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Brand Image (Optional)</FormLabel><FormControl><ImageUpload value={field.value ?? ""} onChange={field.onChange} disabled={formLoading} /></FormControl><FormMessage /></FormItem>)} />
              <SheetFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsSidebarOpen(false)} disabled={formLoading}>Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEditMode ? "Updating..." : "Creating..."}</> : isEditMode ? "Update Brand" : "Create Brand"}</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>{selectedBrands.length > 0 && !selectedBrand ? `Permanently delete ${selectedBrands.length} brands?` : <>Delete <span className="font-semibold">{selectedBrand?.name}</span>? This cannot be undone.</>}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBrand} className="bg-red-600 hover:bg-red-700 text-white">Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
