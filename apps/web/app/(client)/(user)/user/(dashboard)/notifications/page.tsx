"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  priority: string;
  action_url: string | null;
  created_at: string;
}

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  urgent: "bg-red-100 text-red-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-muted text-muted-foreground",
};

const NotificationsPage = () => {
  const { authUser, auth_token, isAuthenticated, verifyAuth } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) await verifyAuth();
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setNotifications([]);
        return;
      }
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, message, is_read, priority, action_url, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchNotifications();
  }, [fetchNotifications, authLoading]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) {
      toast.error("Failed to mark as read");
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);
    if (error) {
      toast.error("Failed to mark all as read");
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete notification");
      return;
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const visible = notifications.filter((n) =>
    activeTab === "all" ? true : activeTab === "unread" ? !n.is_read : n.is_read
  );

  if (!authLoading && (!authUser || !isAuthenticated)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
        <p className="text-sm text-muted-foreground mb-6">
          You need to sign in to view your notifications.
        </p>
        <Link href="/auth/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
            {!loading && unreadCount > 0 && (
              <span className="text-sm font-normal text-primary-foreground bg-primary px-2 py-0.5 rounded-full ml-1">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Updates about your orders and account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchNotifications}
            variant="outline"
            size="sm"
            disabled={loading}
            className="gap-2 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="gap-2 h-9">
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="w-[80px] text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="w-[80px] text-xs">
                Unread
              </TabsTrigger>
              <TabsTrigger value="read" className="w-[80px] text-xs">
                Read
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading || authLoading ? (
          <div className="p-8 flex justify-center items-center h-48">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <BellOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Order updates and account alerts will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 p-4 transition-colors ${
                  n.is_read ? "" : "bg-primary/5"
                }`}
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                    n.is_read ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{n.title}</p>
                    {n.priority !== "normal" && (
                      <Badge
                        variant="secondary"
                        className={`border-0 text-[10px] ${
                          PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.normal
                        }`}
                      >
                        {n.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(n.created_at)}
                    </span>
                    {n.action_url && (
                      <Link
                        href={n.action_url}
                        className="text-xs text-primary hover:underline font-medium"
                        onClick={() => !n.is_read && markAsRead(n.id)}
                      >
                        View details
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Mark as read"
                      onClick={() => markAsRead(n.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Delete"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
