import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Search,
  RefreshCw,
  Download,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  pref_newsletter: boolean;
  pref_promotions: boolean;
  pref_new_products: boolean;
  status: "active" | "unsubscribed";
  subscribed_at: string;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error) throw error;
      setSubscribers((data || []) as Subscriber[]);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const toggleStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === "active" ? "unsubscribed" : "active";
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus })
      .eq("id", sub.id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return;
    }
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
    );
    toast({
      title: newStatus === "active" ? "Re-subscribed" : "Unsubscribed",
      description: sub.email,
    });
  };

  const deleteSubscriber = async (sub: Subscriber) => {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", sub.id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
      return;
    }
    setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
    toast({ title: "Deleted", description: sub.email });
  };

  const filtered = useMemo(
    () =>
      subscribers.filter(
        (s) =>
          (tab === "all" || s.status === tab) &&
          s.email.toLowerCase().includes(search.toLowerCase())
      ),
    [subscribers, tab, search]
  );

  const exportCSV = () => {
    const rows = [
      ["Email", "Status", "Source", "Newsletter", "Promotions", "New Products", "Subscribed At"],
      ...filtered.map((s) => [
        s.email,
        s.status,
        s.source ?? "",
        s.pref_newsletter ? "yes" : "no",
        s.pref_promotions ? "yes" : "no",
        s.pref_new_products ? "yes" : "no",
        s.subscribed_at,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} subscribers exported to CSV` });
  };

  const activeCount = subscribers.filter((s) => s.status === "active").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emails collected from the store's subscribe popup and footer form
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscribers}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{subscribers.length}</p>
              <p className="text-xs text-muted-foreground">Total subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <UserX className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">
                {subscribers.length - activeCount}
              </p>
              <p className="text-xs text-muted-foreground">Unsubscribed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Active
                </TabsTrigger>
                <TabsTrigger value="unsubscribed" className="text-xs">
                  Unsubscribed
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search email..."
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
              <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No subscribers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {subscribers.length === 0
                  ? "When visitors subscribe on the store, their emails will appear here."
                  : "Try a different search or filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Preferences</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            s.status === "active"
                              ? "bg-green-100 text-green-700 border-0"
                              : "bg-red-100 text-red-700 border-0"
                          }
                        >
                          {s.status === "active" ? "Active" : "Unsubscribed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {s.source || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {s.pref_newsletter && (
                            <Badge variant="outline" className="text-[10px]">
                              Newsletter
                            </Badge>
                          )}
                          {s.pref_promotions && (
                            <Badge variant="outline" className="text-[10px]">
                              Promotions
                            </Badge>
                          )}
                          {s.pref_new_products && (
                            <Badge variant="outline" className="text-[10px]">
                              New products
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(s.subscribed_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={
                              s.status === "active"
                                ? "Mark unsubscribed"
                                : "Re-activate"
                            }
                            onClick={() => toggleStatus(s)}
                          >
                            {s.status === "active" ? (
                              <UserX className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete"
                            onClick={() => deleteSubscriber(s)}
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
    </motion.div>
  );
}
