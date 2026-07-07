import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Search,
  RefreshCw,
  CheckCircle,
  Trash2,
  MessageSquare,
} from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  product: { name: string; image: string | null } | null;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i <= rating
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*, product:products(name, image)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReviews((data || []) as Review[]);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (review: Review) => {
    setUpdating(review.id);
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({ is_approved: true })
        .eq("id", review.id);
      if (error) throw error;
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, is_approved: true } : r))
      );
      toast.success("Review approved — now visible on the store");
    } catch {
      toast.error("Failed to approve review");
    } finally {
      setUpdating(null);
    }
  };

  const remove = async (review: Review) => {
    setUpdating(review.id);
    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", review.id);
      if (error) throw error;
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  const filtered = reviews.filter(
    (r) =>
      (tab === "all" ||
        (tab === "pending" ? !r.is_approved : r.is_approved)) &&
      (r.user_name.toLowerCase().includes(search.toLowerCase()) ||
        (r.product?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()))
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
            <MessageSquare className="w-6 h-6 text-primary" />
            Product Reviews
            {pendingCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-0">
                {pendingCount} pending
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve customer reviews before they appear on the store
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="pending" className="text-xs">
                  Pending {pendingCount > 0 && `(${pendingCount})`}
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
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
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No reviews found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {reviews.length === 0
                  ? "When customers review products, they'll appear here for approval."
                  : "Try a different tab or search."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((r) => (
                <li key={r.id} className="p-4 flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {r.product?.image ? (
                      <img
                        src={r.product.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-semibold">
                        {(r.product?.name || "?").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {r.product?.name || "Deleted product"}
                      </p>
                      <Stars rating={r.rating} />
                      <Badge
                        variant="secondary"
                        className={`border-0 text-[10px] ${
                          r.is_approved
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {r.comment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      by <span className="font-medium">{r.user_name}</span> ·{" "}
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!r.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8"
                        disabled={updating === r.id}
                        onClick={() => approve(r)}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete review"
                      disabled={updating === r.id}
                      onClick={() => remove(r)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
