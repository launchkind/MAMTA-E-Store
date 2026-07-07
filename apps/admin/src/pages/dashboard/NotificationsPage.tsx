import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Send, Users, Loader2 } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

type Audience = "all" | "user" | "deliveryman" | "employee" | "single";

export default function NotificationsPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"general" | "promotion">("general");
  const [priority, setPriority] = useState("normal");
  const [actionUrl, setActionUrl] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [singleUserId, setSingleUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, role")
          .order("name");
        if (error) throw error;
        setUsers((data || []) as UserRow[]);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const recipients =
    audience === "all"
      ? users
      : audience === "single"
        ? users.filter((u) => u.id === singleUserId)
        : users.filter((u) => u.role === audience);

  const matchingUsers = userSearch.trim()
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.name.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (recipients.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    setSending(true);
    try {
      const rows = recipients.map((u) => ({
        user_id: u.id,
        type,
        title: title.trim(),
        message: message.trim(),
        priority,
        action_url: actionUrl.trim() || null,
      }));

      // Insert in batches of 200 to stay well under request limits
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await supabase
          .from("notifications")
          .insert(rows.slice(i, i + 200));
        if (error) throw error;
      }

      toast.success(
        `Notification sent to ${recipients.length} user${recipients.length === 1 ? "" : "s"}`
      );
      setTitle("");
      setMessage("");
      setActionUrl("");
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6 max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Send Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Broadcast announcements and promotions to your users — they'll see
          them in the store's notification center
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Audience
            {!loadingUsers && (
              <span className="text-sm font-normal text-muted-foreground">
                — {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Send to</Label>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as Audience)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users ({users.length})</SelectItem>
                <SelectItem value="user">
                  Customers ({users.filter((u) => u.role === "user").length})
                </SelectItem>
                <SelectItem value="employee">
                  Employees ({users.filter((u) => u.role === "employee").length})
                </SelectItem>
                <SelectItem value="deliveryman">
                  Delivery staff (
                  {users.filter((u) => u.role === "deliveryman").length})
                </SelectItem>
                <SelectItem value="single">A specific user</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {audience === "single" && (
            <div className="space-y-2">
              <Label>Find user</Label>
              <Input
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setSingleUserId("");
                }}
              />
              {userSearch.trim() && !singleUserId && (
                <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                  {matchingUsers.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      No users match "{userSearch}"
                    </p>
                  ) : (
                    matchingUsers.slice(0, 10).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="w-full p-3 text-left hover:bg-accent transition-colors"
                        onClick={() => {
                          setSingleUserId(u.id);
                          setUserSearch(`${u.name} (${u.email})`);
                        }}
                      >
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email} · {u.role}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Weekend Sale — 20% off everything!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Write the notification message..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "general" | "promotion")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General announcement</SelectItem>
                  <SelectItem value="promotion">Promotion / offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionUrl">Link (optional)</Label>
            <Input
              id="actionUrl"
              placeholder="/shop or /product/some-product — where 'View details' takes the user"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSend}
              disabled={sending || loadingUsers || recipients.length === 0}
              className="gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending
                ? "Sending..."
                : `Send to ${recipients.length} user${recipients.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
