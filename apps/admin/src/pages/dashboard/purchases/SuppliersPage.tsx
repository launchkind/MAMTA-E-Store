import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  fetchSuppliers,
  deleteSupplier,
  Supplier,
} from "@/lib/purchaseApi";
import CreateSupplierSheet from "@/components/purchases/CreateSupplierSheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSuppliers(await fetchSuppliers());
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (s: Supplier) => {
    try {
      await deleteSupplier(s.id);
      setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
      toast.success(`Deleted supplier "${s.name}"`);
    } catch {
      toast.error(
        "Failed to delete supplier (it may be linked to existing purchases)"
      );
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Suppliers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Companies you buy stock from, used when creating purchase orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No suppliers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {suppliers.length === 0
                  ? 'Click "Add Supplier" to create your first supplier.'
                  : "Try a different search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium">{s.name}</p>
                        {s.contact && (
                          <p className="text-xs text-muted-foreground">
                            {s.contact}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-sm">
                          {s.email && (
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {s.email}
                            </p>
                          )}
                          {s.phone && (
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {s.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                        {s.address || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(s.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit"
                            onClick={() => {
                              setEditing(s);
                              setSheetOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete"
                            onClick={() => handleDelete(s)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSupplierSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={load}
        supplier={
          editing
            ? {
                _id: editing.id,
                name: editing.name,
                email: editing.email || "",
                contact: editing.contact || "",
                phone: editing.phone || "",
                address: editing.address || "",
                notes: editing.notes || "",
              }
            : null
        }
      />
    </motion.div>
  );
}
