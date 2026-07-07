import { Search, Menu, X, Bell, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

export default function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /** Hide the header search bar when on the dedicated search page */
  const isSearchPage = location.pathname === "/dashboard/search";

  // Auto-search with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!searchQuery.trim()) return;

    debounceTimerRef.current = setTimeout(() => {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, navigate]);

  // Fetch notifications for the admin
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false);
        if (notifs) setNotifications(notifs);
        if (count !== null) setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleClearSearch = () => setSearchQuery("");

  // Generate avatar initials from user name
  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Capitalise role for display
  const displayRole = user?.employee_role
    ? user.employee_role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : user?.role
      ? user.role.replace(/\b\w/g, (c) => c.toUpperCase())
      : "Admin";

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b border-gray-100 px-4 md:px-6 w-full gap-3">
      {/* ── Left: Sidebar toggle ── */}

      {/* Mobile hamburger (small screens only) */}

      {/* ── Centre: Pill search bar (hidden on search page but keeps its space) ── */}
      <div className="flex-1 max-w-xs lg:max-w-sm">
        {!isSearchPage ? (
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 ${searchQuery ? "pr-9" : "pr-4"} h-9 rounded-full bg-gray-50 border-gray-200 text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#1a1a2c]/20 transition-all duration-200 ${
                  searchFocused ? "border-gray-300 bg-white shadow-sm" : ""
                }`}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-gray-200"
                  onClick={handleClearSearch}
                >
                  <X size={13} />
                </Button>
              )}
            </div>
          </form>
        ) : (
          /* Invisible spacer — keeps right-side anchored to the far right */
          <div aria-hidden="true" />
        )}
      </div>

      {/* ── Spacer pushes right section to far right ── */}
      <div className="flex-1" />

      {/* ── Right: Actions cluster ── */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Notifications bell */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full w-9 h-9 text-gray-500 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {/* Red badge */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d52245] text-[10px] font-semibold text-white leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] flex flex-col pt-6 px-6 pb-6">
            <SheetHeader className="pb-4 border-b border-gray-100">
              <SheetTitle className="text-lg font-bold text-gray-800">
                Notifications
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <div
                    key={notif._id}
                    className={`p-3 transition-colors rounded-xl border cursor-pointer ${
                      notif.isRead
                        ? "bg-gray-50 hover:bg-gray-100 border-gray-100"
                        : "bg-blue-50/50 hover:bg-blue-50 border-blue-100"
                    }`}
                  >
                    <p
                      className={`text-sm ${notif.isRead ? "text-gray-800" : "font-semibold text-gray-900"}`}
                    >
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-gray-500 py-6">
                  No new notifications
                </div>
              )}
            </div>
            <div className="pt-4 mt-auto border-t border-gray-100">
              <Button
                className="w-full bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 rounded-xl"
                onClick={() => navigate("/dashboard/notifications")}
              >
                View all notifications
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-gray-200 mx-1" />

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a2c]/20"
              aria-label="User menu"
            >
              {/* Avatar */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                />
              ) : (
                <span className="h-8 w-8 rounded-full bg-[#1a1a2c] text-white text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-gray-100">
                  {getInitials(user?.name)}
                </span>
              )}

              {/* Name + role */}
              <div className="hidden md:flex flex-col items-start leading-tight text-left">
                <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                  {user?.name ?? "Admin User"}
                </span>
                <span className="text-xs text-gray-400">{displayRole}</span>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={14}
                className="hidden md:block text-gray-400 shrink-0"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/account")}
              className="cursor-pointer"
            >
              Account Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
