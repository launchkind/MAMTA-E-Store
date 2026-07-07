import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Inbox, Search, RefreshCw, Mail, Reply } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ContactMessage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages((data || []) as ContactMessage[]);
    } catch {
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
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
            <Inbox className="w-6 h-6 text-primary" />
            Contact Messages
            {!loading && (
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Messages sent by visitors through the store's contact form
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
          <div className="p-4 border-b flex justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
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
              <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No messages found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {messages.length === 0
                  ? "Messages from the store's contact form will appear here."
                  : "Try a different search."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="w-full p-4 text-left hover:bg-accent/50 transition-colors flex gap-4"
                    onClick={() => setDetail(m)}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{m.name}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDateTime(m.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 truncate">
                        {m.subject || "(No subject)"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {m.message}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Message detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.subject || "(No subject)"}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {detail.name} &lt;{detail.email}&gt; ·{" "}
                  {formatDateTime(detail.created_at)}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm whitespace-pre-wrap bg-muted rounded-lg p-4">
                {detail.message}
              </p>
              <div className="flex justify-end">
                <Button asChild className="gap-2">
                  <a
                    href={`mailto:${detail.email}?subject=${encodeURIComponent(
                      `Re: ${detail.subject || "Your message to our store"}`
                    )}`}
                  >
                    <Reply className="w-4 h-4" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
