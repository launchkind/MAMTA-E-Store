import { useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Printer, FileText, X } from "lucide-react";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface InvoiceOrder {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  id: string;
  total: number;
  status: string;
  created_at: string;
  userName: string;
  userEmail: string;
}

const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

export default function InvoicePage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [generating, setGenerating] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [notes, setNotes] = useState("Thank you for your order!");
  const [terms, setTerms] = useState(
    "Payment is due within 7 days. Late payments may be subject to fees as per our policy."
  );

  const invoiceData = useMemo(() => {
    if (!order) return null;
    return {
      invoiceNumber,
      invoiceDate,
      dueDate,
      notes,
      terms,
      order,
    };
  }, [order, invoiceNumber, invoiceDate, dueDate, notes, terms]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      // The `id` column is a uuid, which doesn't support ilike, so we fetch a
      // recent batch and filter client-side across id/customer name/email.
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, total, status, created_at, user:users!user_id(id, name, email)"
        )
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const term = searchTerm.trim().toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = ((data || []) as any[]).filter(
        (r) =>
          r.id?.toLowerCase().includes(term) ||
          r.user?.name?.toLowerCase().includes(term) ||
          r.user?.email?.toLowerCase().includes(term)
      );

      setResults(
        rows.map((r) => ({
          id: r.id,
          total: r.total || 0,
          status: r.status,
          created_at: r.created_at,
          userName: r.user?.name || "Unknown",
          userEmail: r.user?.email || "",
        }))
      );
    } catch (error) {
      console.error("Failed to search orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search orders",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectOrder = async (orderId: string) => {
    setLoadingOrder(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `id, total, status, payment_status, created_at, updated_at,
          shipping_street, shipping_city, shipping_state, shipping_postal_code, shipping_country,
          user:users!user_id(id, name, email),
          order_items(id, product_id, name, price, quantity, image)`
        )
        .eq("id", orderId)
        .single();
      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = data as any;

      const mapped: InvoiceOrder = {
        _id: row.id,
        orderId: row.id,
        user: {
          _id: row.user?.id || "",
          name: row.user?.name || "Unknown Customer",
          email: row.user?.email || "",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: (row.order_items || []).map((item: any) => ({
          product: {
            _id: item.product_id || "",
            name: item.name || "Unknown Product",
            price: item.price || 0,
            image: item.image,
          },
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
        shippingAddress: {
          street: row.shipping_street || "",
          city: row.shipping_city || "",
          state: row.shipping_state || "",
          zipCode: row.shipping_postal_code || "",
          country: row.shipping_country || "",
        },
        totalAmount: row.total || 0,
        status: row.status,
        paymentStatus: row.payment_status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      setOrder(mapped);
      setInvoiceNumber(`INV-${row.id.slice(0, 8).toUpperCase()}`);
      setInvoiceDate(new Date().toISOString().slice(0, 10));
      setDueDate(defaultDueDate());
      setResults([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Failed to load order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details",
      });
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleClear = () => {
    setOrder(null);
    setResults([]);
    setSearchTerm("");
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !order) return;
    setGenerating(true);
    try {
      const [{ default: jsPDF }] = await Promise.all([import("jspdf")]);

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();

      await pdf.html(printRef.current, {
        callback: (doc) => {
          doc.save(`${invoiceNumber || "invoice"}.pdf`);
        },
        x: 0,
        y: 0,
        width: pageWidth,
        windowWidth: printRef.current.scrollWidth,
        autoPaging: "text",
      });

      toast({ title: "Success", description: "Invoice PDF downloaded" });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate invoice PDF",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate and download invoices for your orders
          </p>
        </div>
        {order && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" /> New Invoice
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button onClick={handleDownloadPdf} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {generating ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        )}
      </div>

      {!order && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" /> Find an Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {results.length > 0 && (
              <div className="border rounded-lg divide-y">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectOrder(r.id)}
                    disabled={loadingOrder}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {r.userName}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({r.userEmail})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Order #{r.id.slice(0, 8)} &middot;{" "}
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{r.status}</Badge>
                      <span className="font-medium text-sm">
                        ${r.total.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searching === false &&
              results.length === 0 &&
              searchTerm.trim() !== "" && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Press Enter or click search to find orders.
                </p>
              )}
          </CardContent>
        </Card>
      )}

      {order && invoiceData && (
        <>
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div />
              <div className="space-y-1.5">
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Terms &amp; Conditions</Label>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div ref={printRef} id="invoice-print-area">
            <InvoiceTemplate invoiceData={invoiceData} />
          </div>
        </>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
