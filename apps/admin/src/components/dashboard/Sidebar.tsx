import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { canAccessMenuItem } from "@/lib/rolePermissions";
import useAuthStore from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Bookmark,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Package,
  Key,
  User,
  FileText,
  Star,
  Share2,
  Menu,
  Bell,
  ChevronDown,
  ShoppingCart,
  Settings,
  Plus,
  CheckCircle,
  PackageCheck,
  Globe,
  Grid3x3,
  MapPin,
  UserCheck,
  DollarSign,
  Store,
  Sliders,
  Mail,
  ImageIcon,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { logo } from "@/images/image";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      catalog: false,
      sales: false,
      marketing: false,
      system: false,
      purchase: false,

      users: false,
      employees: false,
      sellers: false,
    },
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const collapseAllExceptActive = () => {
    const path = location.pathname;

    // Determine which group contains the active page
    const activeGroup = {
      catalog:
        path.includes("/products") ||
        path.includes("/categories") ||
        path.includes("/brands"),
      sales: path.includes("/orders") || path.includes("/invoices"),
      marketing:
        path.includes("/banners") ||
        path.includes("/ads-banners") ||
        path.includes("/notifications") ||
        path.includes("/reviews"),
      system:
        path.includes("/social-media") ||
        path.includes("/website-config") ||
        path.includes("/base-config") ||
        path.includes("/component-types"),
      purchase: path.includes("/purchases"),
      users:
        path.includes("/users") ||
        path.includes("/addresses") ||
        path.includes("/subscriptions") ||
        path.includes("/customers") ||
        path.includes("/roles") ||
        path.includes("/permissions"),
      employees: path.includes("/employees") || path.includes("/salaries"),
      sellers: path.includes("/sellers") || path.includes("/seller-config"),
    };

    // Set all groups to false except the active one
    setExpandedGroups(activeGroup);
  };

  // Count how many groups are expanded
  const expandedCount = Object.values(expandedGroups).filter(Boolean).length;

  // Auto-expand the group that contains the current page
  useEffect(() => {
    const path = location.pathname;

    // Determine which group should be expanded based on current path
    const newExpandedGroups = {
      catalog:
        path.includes("/products") ||
        path.includes("/categories") ||
        path.includes("/product-types") ||
        path.includes("/brands"),
      sales: path.includes("/orders") || path.includes("/invoices"),
      marketing:
        path.includes("/banners") ||
        path.includes("/ads-banners") ||
        path.includes("/notifications") ||
        path.includes("/reviews") ||
        path.includes("/contact"),
      system:
        path.includes("/social-media") ||
        path.includes("/website-config") ||
        path.includes("/base-config") ||
        path.includes("/component-types"),
      purchase: path.includes("/purchases"),
      users:
        path.includes("/users") ||
        path.includes("/addresses") ||
        path.includes("/subscriptions") ||
        path.includes("/customers") ||
        path.includes("/roles") ||
        path.includes("/permissions"),
      employees: path.includes("/employees") || path.includes("/salaries"),
      sellers: path.includes("/sellers") || path.includes("/seller-config"),
    };

    setExpandedGroups(newExpandedGroups);
  }, [location.pathname]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 bg-[#1a1a2c] lg:bg-transparent border-b border-white/5 lg:border-none shadow-sm lg:shadow-none shrink-0 relative mt-2">
        <AnimatePresence mode="wait">
          {open && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="font-bold text-xl text-white drop-shadow-lg tracking-tight whitespace-nowrap pl-2"
            >
              <img src={logo} alt="logo" className="w-32 object-contain" />
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 p-0"
          >
            {open ? (
              <ChevronLeft size={14} strokeWidth={2} />
            ) : (
              <ChevronRight size={14} strokeWidth={2} />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-[#1a1a2c] text-white">
        {/* Collapse All Button */}
        {expandedCount > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAllExceptActive}
              className={cn(
                "w-full border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-medium",
                !open && "px-2 justify-center",
              )}
              title={open ? "Collapse all menus except active" : "Collapse all"}
            >
              <ChevronDown
                size={14}
                className={cn(open && "mr-1.5", "rotate-180")}
              />
              {open && "Collapse All"}
            </Button>
          </motion.div>
        )}

        <div className="space-y-1">
          {renderNavItems(user, open, expandedGroups, toggleGroup)}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-[#1a1a2c] shrink-0">
        <motion.div
          className={cn(
            "flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-white/5 border border-white/10",
            open ? "justify-start" : "justify-center",
          )}
        >
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#d52245] to-[#fbe9ec] flex items-center justify-center text-white font-semibold overflow-hidden shadow-md ring-2 ring-white/50 dark:ring-white/20 shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                className="flex flex-col min-w-0 flex-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="text-sm font-semibold text-white truncate">
                  {user?.name}
                </span>
                <span
                  className={cn(
                    "text-xs capitalize font-medium px-2 py-0.5 rounded-md w-fit mt-1",
                    user?.role === "employee" && user?.employee_role
                      ? (() => {
                          switch (user.employee_role) {
                            case "packer":
                              return "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-600/20";
                            case "deliveryman":
                              return "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-600/20";
                            case "accounts":
                              return "text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-600/20";
                            case "incharge":
                              return "text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-600/20";
                            case "call_center":
                              return "text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-600/20";
                            default:
                              return "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50";
                          }
                        })()
                      : "text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-600/20",
                  )}
                >
                  {user?.role === "employee" && user?.employee_role
                    ? user.employee_role.replace("_", " ")
                    : user?.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size={open ? "default" : "icon"}
            onClick={logout}
            className={cn(
              "w-full border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all backdrop-blur-sm font-medium",
              !open && "justify-center",
            )}
          >
            <LogOut
              size={16}
              strokeWidth={1.5}
              className={cn(open && "mr-2")}
            />
            {open && "Logout"}
          </Button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="default"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl bg-linear-to-br from-[#1a1a2c] to-[#1f2329] hover:from-[#d52245] hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all"
      >
        <Menu size={22} />
      </Button>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-20 flex-col bg-[#1a1a2c] shadow-xl"
        initial={false}
        animate={{
          width: open ? 288 : 80,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
          type: "tween",
        }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar - Using shadcn Sheet */}
      <Sheet open={open && isMobile} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0 bg-[#1a1a2c]">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Helper function to render navigation items
function renderNavItems(
  user: {
    role?: string;
    employee_role?: string | null;
  } | null,
  open: boolean,
  expandedGroups: Record<string, boolean>,
  toggleGroup: (group: string) => void,
) {
  return (
    <>
      {/* Dashboard - Always visible */}
      <NavItem
        to="/dashboard"
        icon={<LayoutDashboard size={20} />}
        label="Dashboard"
        open={open}
        end={true}
      />

      {/* Account - Based on permissions */}
      {canAccessMenuItem(
        "/dashboard/account",
        user?.role || "",
        user?.employee_role,
      ) && (
        <NavItem
          to="/dashboard/account"
          icon={<User size={20} />}
          label="Account"
          open={open}
        />
      )}

      {/* Users Group */}
      {canAccessMenuItem(
        "/dashboard/users",
        user?.role || "",
        user?.employee_role,
      ) && (
        <>
          <NavGroup
            label="Users"
            icon={<Users size={20} />}
            open={open}
            expanded={expandedGroups.users}
            onToggle={() => toggleGroup("users")}
          />
          {expandedGroups.users && (
            <>
              <NavItem
                to="/dashboard/users"
                icon={<Users size={20} />}
                label="Users"
                open={open}
                isSubItem
              />
              <NavItem
                to="/dashboard/roles"
                icon={<Shield size={20} />}
                label="Roles"
                open={open}
                isSubItem
              />
              <NavItem
                to="/dashboard/permissions"
                icon={<Key size={20} />}
                label="Permissions"
                open={open}
                isSubItem
              />
              <NavItem
                to="/dashboard/subscriptions"
                icon={<Mail size={20} />}
                label="Subscriptions"
                open={open}
                isSubItem
              />
              <NavItem
                to="/dashboard/addresses"
                icon={<MapPin size={20} />}
                label="Addresses"
                open={open}
                isSubItem
              />
            </>
          )}
        </>
      )}

      {/* Employees Group */}
      {canAccessMenuItem(
        "/dashboard/users",
        user?.role || "",
        user?.employee_role,
      ) && (
        <>
          <NavGroup
            label="Employees"
            icon={<UserCheck size={20} />}
            open={open}
            expanded={expandedGroups.employees}
            onToggle={() => toggleGroup("employees")}
          />
          {expandedGroups.employees && (
            <>
              <NavItem
                to="/dashboard/employees"
                icon={<UserCheck size={20} />}
                label="Employees"
                open={open}
                isSubItem
              />
              <NavItem
                to="/dashboard/salaries"
                icon={<DollarSign size={20} />}
                label="Salaries"
                open={open}
                isSubItem
              />
            </>
          )}
        </>
      )}

      {/* Sales & Orders Group */}
      {(canAccessMenuItem(
        "/dashboard/orders",
        user?.role || "",
        user?.employee_role,
      ) ||
        canAccessMenuItem(
          "/dashboard/invoices",
          user?.role || "",
          user?.employee_role,
        )) && (
        <>
          <NavGroup
            label="Sales & Orders"
            icon={<ShoppingCart size={20} />}
            open={open}
            expanded={expandedGroups.sales}
            onToggle={() => toggleGroup("sales")}
          />
          {expandedGroups.sales && (
            <>
              <NavItem
                to="/dashboard/orders"
                icon={<Package size={20} />}
                label="Orders"
                open={open}
                isSubItem
              />
              {canAccessMenuItem(
                "/dashboard/invoices",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/invoices"
                  icon={<FileText size={20} />}
                  label="Invoices"
                  open={open}
                  isSubItem
                />
              )}
            </>
          )}
        </>
      )}

      {/* Catalog Management Group */}
      {(canAccessMenuItem(
        "/dashboard/products",
        user?.role || "",
        user?.employee_role,
      ) ||
        canAccessMenuItem(
          "/dashboard/categories",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/brands",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/product-types",
          user?.role || "",
          user?.employee_role,
        )) && (
        <>
          <NavGroup
            label="Product Catalog"
            icon={<ShoppingBag size={20} />}
            open={open}
            expanded={expandedGroups.catalog}
            onToggle={() => toggleGroup("catalog")}
          />
          {expandedGroups.catalog && (
            <>
              {canAccessMenuItem(
                "/dashboard/products",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/products"
                  icon={<ShoppingBag size={20} />}
                  label="Products"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/product-types",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/product-types"
                  icon={<Tag size={20} />}
                  label="Product Types"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/product-banners",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/product-banners"
                  icon={<Layers size={20} />}
                  label="Products Banner"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/categories",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/categories"
                  icon={<Tag size={20} />}
                  label="Categories"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/brands",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/brands"
                  icon={<Bookmark size={20} />}
                  label="Brands"
                  open={open}
                  isSubItem
                />
              )}
            </>
          )}
        </>
      )}

      {/* Seller Management Group */}
      {canAccessMenuItem(
        "/dashboard/sellers",
        user?.role || "",
        user?.employee_role,
      ) && (
        <>
          <NavGroup
            label="Seller Management"
            icon={<Store size={20} />}
            open={open}
            expanded={expandedGroups.sellers}
            onToggle={() => toggleGroup("sellers")}
          />
          {expandedGroups.sellers && (
            <>
              <NavItem
                to="/dashboard/sellers"
                icon={<Store size={20} />}
                label="Seller Requests"
                open={open}
                isSubItem
              />
              {canAccessMenuItem(
                "/dashboard/seller-products",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/seller-products"
                  icon={<Package size={20} />}
                  label="Seller Products"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/seller-config",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/seller-config"
                  icon={<Sliders size={20} />}
                  label="Seller Config"
                  open={open}
                  isSubItem
                />
              )}
            </>
          )}
        </>
      )}

      {/* Purchase Management Group */}
      {(canAccessMenuItem(
        "/dashboard/purchases/create",
        user?.role || "",
        user?.employee_role,
      ) ||
        canAccessMenuItem(
          "/dashboard/purchases/approved",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/purchases/purchased",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/purchases/suppliers",
          user?.role || "",
          user?.employee_role,
        )) && (
        <>
          <NavGroup
            label="Purchase"
            icon={<Package size={20} />}
            open={open}
            expanded={expandedGroups.purchase}
            onToggle={() => toggleGroup("purchase")}
          />
          {expandedGroups.purchase && (
            <>
              {canAccessMenuItem(
                "/dashboard/purchases/create",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/purchases/create"
                  icon={<Plus size={20} />}
                  label="Create Purchase"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/purchases/approved",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/purchases/approved"
                  icon={<CheckCircle size={20} />}
                  label="Approved"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/purchases/purchased",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/purchases/purchased"
                  icon={<PackageCheck size={20} />}
                  label="Purchased"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/purchases/suppliers",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/purchases/suppliers"
                  icon={<Users size={20} />}
                  label="Suppliers"
                  open={open}
                  isSubItem
                />
              )}
            </>
          )}
        </>
      )}

      {/* Marketing & Content Group */}
      {(canAccessMenuItem(
        "/dashboard/banners",
        user?.role || "",
        user?.employee_role,
      ) ||
        canAccessMenuItem(
          "/dashboard/ads-banners",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/notifications",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/reviews",
          user?.role || "",
          user?.employee_role,
        ) ||
        canAccessMenuItem(
          "/dashboard/contact",
          user?.role || "",
          user?.employee_role,
        )) && (
        <>
          <NavGroup
            label="Marketing"
            icon={<Layers size={20} />}
            open={open}
            expanded={expandedGroups.marketing}
            onToggle={() => toggleGroup("marketing")}
          />
          {expandedGroups.marketing && (
            <>
              {canAccessMenuItem(
                "/dashboard/banners",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/banners"
                  icon={<Layers size={20} />}
                  label="Banners"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/ads-banners",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/ads-banners"
                  icon={<Grid3x3 size={20} />}
                  label="Ads Banners"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/notifications",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/notifications"
                  icon={<Bell size={20} />}
                  label="Notifications"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/reviews",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/reviews"
                  icon={<Star size={20} />}
                  label="Reviews"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/contact",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/contact"
                  icon={<Mail size={20} />}
                  label="Contact Msgs."
                  open={open}
                  isSubItem
                />
              )}
            </>
          )}
        </>
      )}

      {/* System Settings Group */}
      {canAccessMenuItem(
        "/dashboard/social-media",
        user?.role || "",
        user?.employee_role,
      ) && (
        <>
          <NavGroup
            label="Settings"
            icon={<Settings size={20} />}
            open={open}
            expanded={expandedGroups.system}
            onToggle={() => toggleGroup("system")}
          />
          {expandedGroups.system && (
            <>
              <NavItem
                to="/dashboard/social-media"
                icon={<Share2 size={20} />}
                label="Social Media"
                open={open}
                isSubItem
              />
              {canAccessMenuItem(
                "/dashboard/base-config",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/base-config"
                  icon={<Settings size={20} />}
                  label="Base Config"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/website-config",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/website-config"
                  icon={<Globe size={20} />}
                  label="Website Config"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/website-icons",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/website-icons"
                  icon={<ImageIcon size={20} />}
                  label="Website Icons"
                  open={open}
                  isSubItem
                />
              )}
              {canAccessMenuItem(
                "/dashboard/component-types",
                user?.role || "",
                user?.employee_role,
              ) && (
                <NavItem
                  to="/dashboard/component-types"
                  icon={<Grid3x3 size={20} />}
                  label="Component Types"
                  open={open}
                  isSubItem
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  end?: boolean;
  isSubItem?: boolean;
};

function NavItem({
  to,
  icon,
  label,
  open,
  end = false,
  isSubItem = false,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center py-2.5 rounded-r-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden my-0.5",
          "hover:bg-white/5",
          isActive
            ? "bg-[#d52245]/10 border-l-4 border-[#d52245] text-white"
            : "text-white/60 hover:text-white border-l-4 border-transparent",
          open
            ? isSubItem
              ? "px-3 pl-8"
              : "px-3"
            : "justify-center px-0 w-14 mx-auto",
        )
      }
    >
      {({ isActive }) => (
        <>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 transition-colors duration-200",
              open && "mr-3",
              isActive
                ? "text-[#d52245]"
                : "text-white/60 group-hover:text-white",
            )}
          >
            {icon}
          </motion.div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  "relative z-10 font-medium truncate whitespace-nowrap overflow-hidden transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/60 group-hover:text-white",
                )}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
}

type NavGroupProps = {
  label: string;
  icon: React.ReactNode;
  open: boolean;
  expanded: boolean;
  onToggle: () => void;
};

function NavGroup({ label, icon, open, expanded, onToggle }: NavGroupProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center py-2.5 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden mt-4 mb-1",
        "hover:bg-white/5",
        "text-white/40 hover:text-white",
        open ? "px-3 justify-between" : "justify-center px-0 w-14 mx-auto",
      )}
    >
      <div className="flex items-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "relative z-10 transition-colors duration-200",
            open && "mr-3",
            "text-white/40 group-hover:text-white",
          )}
        >
          {icon}
        </motion.div>

        <AnimatePresence mode="wait">
          {open && (
            <motion.span
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 text-[11px] font-bold uppercase tracking-wider truncate whitespace-nowrap overflow-hidden text-white/50 group-hover:text-white/80"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {open && (
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-white/40"
        >
          <ChevronDown size={14} />
        </motion.div>
      )}
    </button>
  );
}
