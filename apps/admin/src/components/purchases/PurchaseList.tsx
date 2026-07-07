import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import {
  fetchPurchases,
  updatePurchaseStatus,
  Purchase,
  PurchaseStatus,
} from "@/lib/purchaseApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Eye,
  CheckCircle,
  PackageCheck,
  Truck,
  XCircle,
  Plus,
} from "lucide-react";
import CreateRequisitionSheet from "./CreateRequisitionSheet";

const STATUS_BADGE: Record<PurchaseStatus, string> = {
  requisition: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  purchased: "bg-purple-100 text-purple-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const NEXT_ACTION: Partial<
  Record<PurchaseStatus, { to: PurchaseStatus; label: string; icon: React.ReactNode }>
> = {
  requisition: {
    to: "approved",
    label: "Approve",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  approved: {
    to: "purchased",
    label: "Mark Purchased",
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
  },
  purchased: {
    to: "received",
    label: "Mark Received",
    icon: <PackageCheck className="w-3.5 h-3.5" />,
  },
};

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

interface PurchaseListProps {
  title: string;
  description: string;
  status?: PurchaseStatus;
  showCreateButton?: boolean;
}

export default function PurchaseList({
  title,
  description,
  status,
  showCreateButton = false,
}: PurchaseListProps) {
  const user = useAuthStore((s) => s.user);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Purchase | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPurchases(await fetchPurchases(status));
    } catch {
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (purchase: Purchase, to: PurchaseStatus) => {
    if (!user) {
      toast.error("Not signed in");
      return;
    }
    setUpdating(purchase.id);
    try {
      await updatePurchaseStatus(purchase, to, {
        id: user.id,
        name: user.name,
      });
      toast.success(
        to === "received"
          ? "Purchase received — product stock updated"
          : `Purchase marked as ${to}`
      );
      await load();
    } catch {
      toast.error("Failed to update purchase");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = purchases.filter(
    (p) =>
      p.purchase_number.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier_name.toLowerCase().includes(search.toLowerCase())
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
            <ShoppingCart className="w-6 h-6 text-primary" />
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
          {showCreateButton && (
            <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Requisition
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PO number or supplier..."
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
              <p className="font-medium">No purchases found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {purchases.length === 0
                  ? showCreateButton
                    ? 'Click "New Requisition" to create your first purchase order.'
                    : "Nothing here yet."
                  : "Try a different search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const action = NEXT_ACTION[p.status];
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {p.purchase_number}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{p.supplier_name}</p>
                          {p.supplier_email && (
                            <p className="text-xs text-muted-foreground">
                              {p.supplier_email}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>{p.purchase_items.length}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(p.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`border-0 capitalize ${STATUS_BADGE[p.status]}`}
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(p.created_at)}
                          <p className="text-xs">{p.created_by_name}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View details"
                              onClick={() => setDetail(p)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {action && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-8"
                                disabled={updating === p.id}
                                onClick={() => changeStatus(p, action.to)}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            )}
                            {(p.status === "requisition" ||
                              p.status === "approved") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                title="Cancel purchase"
                                disabled={updating === p.id}
                                onClick={() => changeStatus(p, "cancelled")}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detail.purchase_number}
                  <Badge
                    variant="secondary"
                    className={`border-0 capitalize ${STATUS_BADGE[detail.status]}`}
                  >
                    {detail.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Supplier: {detail.supplier_name}
                  {detail.supplier_email ? ` · ${detail.supplier_email}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>New Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.purchase_items.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm font-medium">
                            {i.product_name}
                          </TableCell>
                          <TableCell>{i.quantity}</TableCell>
                          <TableCell>{formatCurrency(i.purchase_price)}</TableCell>
                          <TableCell>{formatCurrency(i.selling_price)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(i.total_cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          Total:
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(detail.total_amount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Created by</p>
                    <p className="font-medium">
                      {detail.created_by_name} · {formatDate(detail.created_at)}
                    </p>
                  </div>
                  {detail.approved_by_name && (
                    <div>
                      <p className="text-muted-foreground text-xs">Approved by</p>
                      <p className="font-medium">
                        {detail.approved_by_name} · {formatDate(detail.approved_at)}
                      </p>
                    </div>
                  )}
                  {detail.purchased_by_name && (
                    <div>
                      <p className="text-muted-foreground text-xs">Purchased by</p>
                      <p className="font-medium">
                        {detail.purchased_by_name} · {formatDate(detail.purchased_at)}
                      </p>
                    </div>
                  )}
                  {detail.received_by_name && (
                    <div>
                      <p className="text-muted-foreground text-xs">Received by</p>
                      <p className="font-medium">
                        {detail.received_by_name} · {formatDate(detail.received_at)}
                      </p>
                    </div>
                  )}
                </div>

                {detail.notes && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p className="bg-muted rounded-lg p-3">{detail.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showCreateButton && (
        <CreateRequisitionSheet
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={load}
        />
      )}
    </motion.div>
  );
}
