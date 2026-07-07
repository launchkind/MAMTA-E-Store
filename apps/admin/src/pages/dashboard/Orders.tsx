import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { getOrderStatusForRole, getStatusLabel } from "@/lib/rolePermissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Edit,
  Trash2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  DollarSign,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  productId?: string; // Server field
  name?: string; // Server field
  price: number; // Server field
  quantity: number;
  image?: string; // Server field
  product?: {
    // Frontend compatibility field
    _id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface StatusHistoryEntry {
  status: string;
  changed_at: string;
  changed_by: {
    id: string;
    name: string;
  };
  notes?: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  total?: number;
  status:
    | "pending"
    | "address_confirmed"
    | "confirmed"
    | "packed"
    | "delivering"
    | "delivered"
    | "completed"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "cod_collected";
  paymentMethod?: "stripe" | "cod";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  assignedDeliveryman?:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string
    | null;
  status_history?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CashCollection {
  _id: string;
  orderId: {
    _id: string;
    orderNumber?: string;
    total: number;
    userId?: {
      _id: string;
      name: string;
      phone?: string;
    };
    shippingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    status?: string;
  };
  amount: number;
  collectedBy: {
    _id: string;
    name: string;
    email?: string;
  };
  collectedAt: string;
  submittedToAccounts?: {
    _id: string;
    name: string;
    email?: string;
  };
  submittedAt?: string;
  confirmedByAccounts?: {
    _id: string;
    name: string;
    email?: string;
  };
  confirmedAt?: string;
  status: "collected" | "submitted" | "confirmed";
  notes?: string;
}

interface AccountsEmployee {
  _id: string;
  name: string;
  email: string;
}

interface DeliveryEmployee {
  _id: string;
  name: string;
  email: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [isConfirmingAddress, setIsConfirmingAddress] = useState(false);
  const [originalOrderStatus, setOriginalOrderStatus] =
    useState<Order["status"]>("pending");
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);

  // Packer states - track which items are packed
  const [packedItems, setPackedItems] = useState<boolean[]>([]);
  const [packerTab, setPackerTab] = useState<"pending" | "packed">("pending");

  // Call center tab state
  const [callCenterTab, setCallCenterTab] = useState<"pending" | "confirmed">(
    "pending"
  );

  // Deliveryman tab state
  const [deliverymanTab, setDeliverymanTab] = useState<
    "pending" | "delivering" | "delivered" | "collections"
  >("pending");

  // Cash collections state
  const [collections, setCollections] = useState<CashCollection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [accountsEmployees, setAccountsEmployees] = useState<
    AccountsEmployee[]
  >([]);
  const [deliveryEmployees, setDeliveryEmployees] = useState<
    DeliveryEmployee[]
  >([]);
  const [selectedDeliveryman, setSelectedDeliveryman] = useState("");
  const [isAssigningDeliveryman, setIsAssigningDeliveryman] = useState(false);
  const [selectedAccountsUser, setSelectedAccountsUser] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState<
    CashCollection[]
  >([]);
  const [receivedSubmissions, setReceivedSubmissions] = useState<
    CashCollection[]
  >([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [accountsTab, setAccountsTab] = useState<
    "pending" | "received" | "orders"
  >("pending");

  // Accounts stats state
  const [accountsStats, setAccountsStats] = useState<{
    totalReceived: number;
    totalReceivedCount: number;
    totalPending: number;
    totalPendingCount: number;
    myConfirmedTotal: number;
    myConfirmedCount: number;
  } | null>(null);

  // Product search states
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  // Get role-specific order statuses
  const roleStatuses = getOrderStatusForRole(
    user?.role || "",
    user?.employee_role || null
  );

  // Helper function to check if call center can edit order items and amount
  // This checks the ORIGINAL saved status, not the dropdown selection
  const canCallCenterEdit = (orderStatus: Order["status"]) => {
    const isCallCenter =
      user?.role === "employee" && user?.employee_role === "call_center";
    if (!isCallCenter) return false;

    // Call center can edit until order is confirmed (based on saved status, not dropdown)
    return (
      orderStatus !== "confirmed" &&
      orderStatus !== "packed" &&
      orderStatus !== "delivering" &&
      orderStatus !== "delivered" &&
      orderStatus !== "completed" &&
      orderStatus !== "cancelled"
    );
  };

  // Helper function to check if order has been modified
  const hasOrderChanged = () => {
    if (!selectedOrder || !originalOrder) return false;

    // Compare key fields
    const statusChanged = selectedOrder.status !== originalOrder.status;
    const paymentStatusChanged =
      selectedOrder.paymentStatus !== originalOrder.paymentStatus;
    const totalChanged =
      Number(selectedOrder.totalAmount).toFixed(2) !==
      Number(originalOrder.totalAmount).toFixed(2);

    // Compare shipping address
    const addressChanged =
      selectedOrder.shippingAddress.street !==
        originalOrder.shippingAddress.street ||
      selectedOrder.shippingAddress.city !==
        originalOrder.shippingAddress.city ||
      selectedOrder.shippingAddress.state !==
        originalOrder.shippingAddress.state ||
      selectedOrder.shippingAddress.zipCode !==
        originalOrder.shippingAddress.zipCode ||
      selectedOrder.shippingAddress.country !==
        originalOrder.shippingAddress.country;

    // Compare items (length and content)
    const itemsChanged =
      selectedOrder.items.length !== originalOrder.items.length ||
      selectedOrder.items.some((item, index) => {
        const origItem = originalOrder.items[index];
        if (!origItem) return true;
        return (
          item.quantity !== origItem.quantity ||
          Number(item.price).toFixed(2) !== Number(origItem.price).toFixed(2)
        );
      });

    return (
      statusChanged ||
      paymentStatusChanged ||
      totalChanged ||
      addressChanged ||
      itemsChanged
    );
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const isCallCenter =
        user?.role === "employee" && user?.employee_role === "call_center";
      const isPacker =
        user?.role === "employee" && user?.employee_role === "packer";
      const isDeliveryman =
        user?.role === "employee" && user?.employee_role === "deliveryman";
      const isAccounts =
        user?.role === "employee" && user?.employee_role === "accounts";

      let effectiveStatusFilter = statusFilter;

      if (isCallCenter) {
        effectiveStatusFilter =
          callCenterTab === "pending" ? "call_center_pending" : "confirmed";
      } else if (isPacker) {
        effectiveStatusFilter =
          packerTab === "pending" ? "confirmed" : "packed";
      } else if (isDeliveryman) {
        effectiveStatusFilter =
          deliverymanTab === "pending"
            ? "packed"
            : deliverymanTab === "delivering"
              ? "delivering"
              : "delivered";
      } else if (isAccounts && accountsTab === "orders") {
        effectiveStatusFilter = "all";
      }

      let query = supabase
        .from("orders")
        .select(
          `*,
          user:users!user_id(id, name, email, avatar),
          order_items(id, product_id, name, price, quantity, image),
          packer:users!assigned_packer(id, name),
          deliveryman:users!assigned_deliveryman(id, name)`,
          { count: "exact" }
        )
        .order("created_at", { ascending: sortOrder === "asc" })
        .range((page - 1) * perPage, page * perPage - 1);

      if (effectiveStatusFilter === "call_center_pending") {
        query = query.in("status", ["pending", "address_confirmed"]);
      } else if (effectiveStatusFilter && effectiveStatusFilter !== "all") {
        query = query.eq("status", effectiveStatusFilter);
      }

      if (paymentFilter && paymentFilter !== "all") {
        query = query.eq("payment_status", paymentFilter);
      }

      if (searchTerm.trim()) {
        query = query.ilike("id", `%${searchTerm}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedOrders: Order[] = (data || []).map((row: any) => ({
        _id: row.id,
        orderId: row.id,
        user: {
          _id: row.user?.id || "",
          name: row.user?.name || "Unknown User",
          email: row.user?.email || "",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: (row.order_items || []).map((item: any) => ({
          productId: item.product_id,
          name: item.name,
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image,
          product: {
            _id: item.product_id || "",
            name: item.name || "Unknown Product",
            price: item.price || 0,
            image: item.image || "",
          },
        })),
        totalAmount: row.total || 0,
        total: row.total || 0,
        status: row.status,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        shippingAddress: {
          street: row.shipping_street || "",
          city: row.shipping_city || "",
          state: row.shipping_state || "",
          zipCode: row.shipping_postal_code || "",
          country: row.shipping_country || "",
        },
        assignedDeliveryman: row.deliveryman
          ? { _id: row.deliveryman.id, name: row.deliveryman.name, email: "" }
          : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      // For accounts on orders tab, filter to show only relevant statuses
      let filteredOrders = mappedOrders;
      if (isAccounts && accountsTab === "orders") {
        filteredOrders = mappedOrders.filter((order) =>
          ["delivering", "delivered", "completed", "cancelled"].includes(
            order.status
          )
        );
      }

      const validOrders = filteredOrders.filter(
        (order) => order && order._id && order.user && order.user._id
      );

      setOrders(validOrders);
      setTotal(count || 0);
      setTotalPages(Math.ceil((count || 0) / perPage) || 1);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    perPage,
    sortOrder,
    statusFilter,
    paymentFilter,
    searchTerm,
    callCenterTab,
    packerTab,
    deliverymanTab,
    accountsTab,
    user,
    toast,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch cash collections for deliveryman
  const fetchCollections = useCallback(async () => {
    if (user?.role !== "employee" || user?.employee_role !== "deliveryman") {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cash_collections")
        .select(`*, order:orders!order_id(id, total, status, shipping_city, shipping_street, shipping_state, shipping_postal_code, shipping_country, user:users!user_id(id, name))`)
        .eq("collected_by", user.id)
        .order("collected_at", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCollections((data || []).map((c: any) => ({
        _id: c.id,
        orderId: {
          _id: c.order?.id || c.order_id,
          total: c.order?.total || 0,
          status: c.order?.status || "",
          userId: c.order?.user ? { _id: c.order.user.id, name: c.order.user.name } : undefined,
          shippingAddress: {
            street: c.order?.shipping_street || "",
            city: c.order?.shipping_city || "",
            state: c.order?.shipping_state || "",
            postalCode: c.order?.shipping_postal_code || "",
            country: c.order?.shipping_country || "",
          },
        },
        amount: c.amount || 0,
        collectedBy: { _id: user.id, name: user.name || "" },
        collectedAt: c.collected_at || c.created_at,
        submittedAt: c.submitted_at,
        confirmedAt: c.confirmed_at,
        status: c.status,
        notes: c.notes,
      })));
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch accounts employees for submission
  const fetchAccountsEmployees = useCallback(async () => {
    if (user?.role !== "employee" || user?.employee_role !== "deliveryman") {
      return;
    }

    try {
      const { data } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "employee")
        .eq("employee_role", "accounts");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAccountsEmployees((data || []).map((u: any) => ({ _id: u.id, name: u.name, email: u.email })));
    } catch (error) {
      console.error("Error fetching accounts employees:", error);
    }
  }, [user]);

  // Fetch delivery employees for assignment (admin and incharge only)
  const fetchDeliveryEmployees = useCallback(async () => {
    if (
      !(
        user?.role === "admin" ||
        (user?.role === "employee" && user?.employee_role === "incharge")
      )
    ) {
      return;
    }

    try {
      const { data } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "employee")
        .eq("employee_role", "deliveryman");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDeliveryEmployees((data || []).map((u: any) => ({ _id: u.id, name: u.name, email: u.email })));
    } catch (error) {
      console.error("Error fetching delivery employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery staff",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch pending submissions for accounts
  const fetchPendingSubmissions = useCallback(async () => {
    if (
      !(
        user?.role === "admin" ||
        (user?.role === "employee" && user?.employee_role === "accounts")
      )
    ) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cash_collections")
        .select(`*, deliveryman:users!collected_by(id, name, email), order:orders!order_id(id, total)`)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPendingSubmissions((data || []).map((c: any) => ({
        _id: c.id,
        orderId: { _id: c.order?.id || c.order_id, total: c.order?.total || 0, status: "" },
        amount: c.amount || 0,
        collectedBy: c.deliveryman ? { _id: c.deliveryman.id, name: c.deliveryman.name, email: c.deliveryman.email } : { _id: "", name: "Unknown" },
        collectedAt: c.collected_at || c.created_at,
        submittedAt: c.submitted_at,
        status: c.status,
      })));
    } catch (error) {
      console.error("❌ Error fetching pending submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending submissions",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch received (confirmed) submissions for accounts
  const fetchReceivedSubmissions = useCallback(async () => {
    if (
      !(
        user?.role === "admin" ||
        (user?.role === "employee" && user?.employee_role === "accounts")
      )
    ) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cash_collections")
        .select(`*, deliveryman:users!collected_by(id, name, email), order:orders!order_id(id, total)`)
        .eq("status", "confirmed")
        .order("confirmed_at", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setReceivedSubmissions((data || []).map((c: any) => ({
        _id: c.id,
        orderId: { _id: c.order?.id || c.order_id, total: c.order?.total || 0, status: "" },
        amount: c.amount || 0,
        collectedBy: c.deliveryman ? { _id: c.deliveryman.id, name: c.deliveryman.name, email: c.deliveryman.email } : { _id: "", name: "Unknown" },
        collectedAt: c.collected_at || c.created_at,
        confirmedAt: c.confirmed_at,
        status: c.status,
      })));
    } catch (error) {
      console.error("❌ Error fetching received submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch received submissions",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch accounts stats (for both admin and accounts)
  const fetchAccountsStats = useCallback(async () => {
    if (
      !(
        user?.role === "admin" ||
        (user?.role === "employee" && user?.employee_role === "accounts")
      )
    ) {
      return;
    }

    try {
      const { data: confirmed } = await supabase
        .from("cash_collections")
        .select("amount")
        .eq("status", "confirmed");
      const { data: pending } = await supabase
        .from("cash_collections")
        .select("amount")
        .eq("status", "submitted");
      const totalReceived = (confirmed || []).reduce((s: number, c: { amount: number }) => s + (c.amount || 0), 0);
      const totalPending = (pending || []).reduce((s: number, c: { amount: number }) => s + (c.amount || 0), 0);
      setAccountsStats({
        totalReceived,
        totalReceivedCount: confirmed?.length || 0,
        totalPending,
        totalPendingCount: pending?.length || 0,
        myConfirmedTotal: totalReceived,
        myConfirmedCount: confirmed?.length || 0,
      });
    } catch (error) {
      console.error("❌ Error fetching accounts stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts statistics",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Load collections when deliveryman tab changes to collections
  useEffect(() => {
    if (deliverymanTab === "collections") {
      fetchCollections();
      fetchAccountsEmployees();
    }
  }, [deliverymanTab, fetchCollections, fetchAccountsEmployees]);

  // Load delivery employees for admin and incharge
  useEffect(() => {
    if (
      user?.role === "admin" ||
      (user?.role === "employee" && user?.employee_role === "incharge")
    ) {
      fetchDeliveryEmployees();
    }
  }, [fetchDeliveryEmployees, user]);

  // Load submissions for accounts based on active tab
  useEffect(() => {
    if (
      user?.role === "admin" ||
      (user?.role === "employee" && user?.employee_role === "accounts")
    ) {
      if (accountsTab === "pending") {
        fetchPendingSubmissions();
      } else if (accountsTab === "received") {
        fetchReceivedSubmissions();
      }
      // Fetch stats whenever accounts user or admin is active
      fetchAccountsStats();
      // For "orders" tab, the main fetchOrders will handle it
    }
  }, [
    user,
    accountsTab,
    fetchPendingSubmissions,
    fetchReceivedSubmissions,
    fetchAccountsStats,
  ]);

  // Reset page when call center tab changes
  useEffect(() => {
    if (user?.role === "employee" && user?.employee_role === "call_center") {
      setPage(1);
    }
  }, [callCenterTab, user?.role, user?.employee_role]);

  // Reset page when packer tab changes
  useEffect(() => {
    if (user?.role === "employee" && user?.employee_role === "packer") {
      setPage(1);
    }
  }, [packerTab, user?.role, user?.employee_role]);

  // Reset page when deliveryman tab changes
  useEffect(() => {
    if (user?.role === "employee" && user?.employee_role === "deliveryman") {
      setPage(1);
    }
  }, [deliverymanTab, user?.role, user?.employee_role]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Handler functions for new features
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setPage(1); // Reset to first page when changing sort order
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select orders to delete",
      });
      return;
    }
    setIsBulkDeleteOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);

      // Delete orders in parallel
      const { error } = await supabase.from("orders").delete().in("id", selectedOrders);
      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedOrders.length} order(s) deleted successfully`,
      });

      setSelectedOrders([]);
      setIsBulkDeleteOpen(false);
      fetchOrders(); // Refetch orders
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected orders",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Remove client-side filtering since we're using server-side filtering
  // Filter out any null/undefined orders and ensure all orders have required properties
  const displayOrders = orders.filter(
    (order) =>
      order &&
      order._id &&
      order.orderId &&
      order.user &&
      order.user._id &&
      order.items &&
      Array.isArray(order.items)
  );

  const getStatusColor = (status: string) => {
    const isHighlighted = roleStatuses.highlightStatuses.includes(status);

    switch (status) {
      case "pending":
        return isHighlighted
          ? "bg-yellow-200 text-yellow-900 ring-2 ring-yellow-500 ring-offset-1"
          : "bg-yellow-100 text-yellow-800";
      case "address_confirmed":
        return isHighlighted
          ? "bg-cyan-200 text-cyan-900 ring-2 ring-cyan-500 ring-offset-1"
          : "bg-cyan-100 text-cyan-800";
      case "confirmed":
        return isHighlighted
          ? "bg-blue-200 text-blue-900 ring-2 ring-blue-500 ring-offset-1"
          : "bg-blue-100 text-blue-800";
      case "packed":
        return isHighlighted
          ? "bg-indigo-200 text-indigo-900 ring-2 ring-indigo-500 ring-offset-1"
          : "bg-indigo-100 text-indigo-800";
      case "delivering":
        return isHighlighted
          ? "bg-orange-200 text-orange-900 ring-2 ring-orange-500 ring-offset-1"
          : "bg-orange-100 text-orange-800";
      case "delivered":
        return isHighlighted
          ? "bg-green-200 text-green-900 ring-2 ring-green-500 ring-offset-1"
          : "bg-green-100 text-green-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    setIsUpdating(true);
    try {
      // Check if call center is changing status to "confirmed"
      const isCallCenter =
        user?.role === "employee" && user?.employee_role === "call_center";
      const isConfirmingOrder =
        isCallCenter &&
        (selectedOrder?.status === "pending" ||
          selectedOrder?.status === "address_confirmed") &&
        updatedOrder.status === "confirmed";

      // Check if packer is changing status to "packed"
      const isPacker =
        user?.role === "employee" && user?.employee_role === "packer";
      const isPackingOrder =
        isPacker &&
        selectedOrder?.status === "confirmed" &&
        updatedOrder.status === "packed";

      if (isConfirmingOrder) {
        const { error } = await supabase
          .from("orders")
          .update({ status: "confirmed" })
          .eq("id", updatedOrder._id);
        if (error) throw error;
      } else if (isPackingOrder) {
        const { error } = await supabase
          .from("orders")
          .update({ status: "packed" })
          .eq("id", updatedOrder._id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("orders")
          .update({
            status: updatedOrder.status,
            payment_status: updatedOrder.paymentStatus,
            total: updatedOrder.totalAmount,
            shipping_street: updatedOrder.shippingAddress.street,
            shipping_city: updatedOrder.shippingAddress.city,
            shipping_state: updatedOrder.shippingAddress.state,
            shipping_postal_code: updatedOrder.shippingAddress.zipCode,
            shipping_country: updatedOrder.shippingAddress.country,
          })
          .eq("id", updatedOrder._id);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      setIsEditOpen(false);
      setSelectedOrder(null);
      setOriginalOrderStatus("pending"); // Reset to default
      setIsAddressConfirmed(false);
      fetchOrders(); // Refresh the orders list
    } catch (error: unknown) {
      console.error("Failed to update order:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to update order";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDeliveryman = async (orderId: string) => {
    if (!selectedDeliveryman) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a deliveryman",
      });
      return;
    }

    setIsAssigningDeliveryman(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ assigned_deliveryman: selectedDeliveryman, status: "delivering" })
        .eq("id", orderId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Deliveryman assigned successfully",
      });

      setSelectedDeliveryman("");
      fetchOrders(); // Refresh the orders list
    } catch (error: unknown) {
      console.error("Failed to assign deliveryman:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to assign deliveryman";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsAssigningDeliveryman(false);
    }
  };

  const handleConfirmAddress = async () => {
    if (!selectedOrder) return;

    setIsConfirmingAddress(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "address_confirmed" })
        .eq("id", selectedOrder._id);
      if (error) throw error;

      // Update local state with the confirmed order
      const updatedOrder = {
        ...selectedOrder,
        status: "address_confirmed" as Order["status"],
      };

      setSelectedOrder(updatedOrder);
      setOriginalOrderStatus("address_confirmed"); // Update the original status
      setIsAddressConfirmed(true);

      // Update the order in the orders list without refetching
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: "address_confirmed" as Order["status"] }
            : order
        )
      );

      toast({
        title: "Success",
        description:
          "Address confirmed successfully. You can now update the order status.",
      });
    } catch (error: unknown) {
      console.error("Failed to confirm address:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to confirm address";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsConfirmingAddress(false);
    }
  };

  // Search products for adding to orders
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image, category:categories!category_id(name)")
        .ilike("name", `%${query}%`)
        .limit(10);

      const transformedProducts = (data || []).map((p) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _id: p.id, name: p.name, price: p.price, image: p.image, category: (p.category as any)?.name || "Uncategorized",
      }));

      setSearchResults(transformedProducts);
    } catch (error) {
      console.error("Failed to search products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search products",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Add product to order
  const addProductToOrder = (product: Product) => {
    if (!selectedOrder) return;

    const newItem = {
      productId: String(product._id),
      name: String(product.name),
      price: Number(product.price) || 0,
      quantity: 1,
      image: String(product.image || ""),
      // Keep product object for frontend display compatibility
      product: {
        _id: String(product._id),
        name: String(product.name),
        price: Number(product.price) || 0,
        image: String(product.image || ""),
      },
    };

    const updatedOrder = {
      ...selectedOrder,
      items: [...selectedOrder.items, newItem],
    };

    // Recalculate total
    updatedOrder.totalAmount = calculateOrderTotal(updatedOrder.items);

    setSelectedOrder(updatedOrder);
    setShowProductSearch(false);
    setProductSearchTerm("");
    setSearchResults([]);
  };

  // Calculate order total from items
  const calculateOrderTotal = (items: Order["items"]) => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || Number(item.product?.price) || 0;
      return total + quantity * price;
    }, 0);
  };

  // Update item quantity and recalculate totals
  const updateItemQuantity = (itemIndex: number, quantity: number) => {
    if (!selectedOrder) return;

    const newItems = [...selectedOrder.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      quantity: quantity,
    };

    const updatedOrder = {
      ...selectedOrder,
      items: newItems,
      totalAmount: calculateOrderTotal(newItems),
    };

    setSelectedOrder(updatedOrder);
  };

  // Remove item from order
  const removeItemFromOrder = (itemIndex: number) => {
    if (!selectedOrder) return;

    const newItems = selectedOrder.items.filter((_, i) => i !== itemIndex);
    const updatedOrder = {
      ...selectedOrder,
      items: newItems,
      totalAmount: calculateOrderTotal(newItems),
    };

    setSelectedOrder(updatedOrder);
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", orderId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      setIsDeleteOpen(false);
      setSelectedOrder(null);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete order",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === "employee" && user?.employee_role === "call_center"
              ? callCenterTab === "pending"
                ? "Address confirmed orders ready to confirm"
                : "Orders you have confirmed"
              : user?.role === "employee" && user?.employee_role === "packer"
                ? packerTab === "pending"
                  ? "Confirmed orders ready for packing"
                  : "Orders you have packed"
                : user?.role === "employee" &&
                    user?.employee_role === "deliveryman"
                  ? deliverymanTab === "pending"
                    ? "Packed orders ready for delivery"
                    : deliverymanTab === "delivering"
                      ? "Orders currently being delivered"
                      : "Orders you have delivered"
                  : "View and manage all customer orders"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={perPage.toString()}
            onValueChange={(value) => {
              setPerPage(parseInt(value));
              setPage(1); // Reset to first page when changing items per page
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="30">30 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              {total > 50 && (
                <SelectItem value={total.toString()}>All ({total})</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{total}</span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg shadow-sm border space-y-4"
      >
        {/* Call Center Tabs - Switch between pending and confirmed orders */}
        {user?.role === "employee" && user?.employee_role === "call_center" && (
          <Tabs
            value={callCenterTab}
            onValueChange={(value) =>
              setCallCenterTab(value as "pending" | "confirmed")
            }
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending Orders
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                My Confirmed Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Address Confirmed - Ready to Confirm
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    These orders have verified addresses and are ready to be
                    confirmed
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="confirmed" className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    My Confirmed Orders
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Orders that you have confirmed and sent to packing
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Packer Tabs - Switch between pending and packed orders */}
        {user?.role === "employee" && user?.employee_role === "packer" && (
          <Tabs
            value={packerTab}
            onValueChange={(value) =>
              setPackerTab(value as "pending" | "packed")
            }
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pending Orders
              </TabsTrigger>
              <TabsTrigger value="packed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                My Packed Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Confirmed Orders - Ready to Pack
                  </p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    These orders are confirmed and waiting to be packed
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="packed" className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    My Packed Orders
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Orders that you have successfully packed
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Deliveryman Tabs - Switch between pending, delivering, delivered, and collections */}
        {user?.role === "employee" && user?.employee_role === "deliveryman" && (
          <Tabs
            value={deliverymanTab}
            onValueChange={(value) =>
              setDeliverymanTab(
                value as "pending" | "delivering" | "delivered" | "collections"
              )
            }
            className="w-full"
          >
            <TabsList className="grid w-full max-w-3xl grid-cols-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pending Orders
              </TabsTrigger>
              <TabsTrigger
                value="delivering"
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Delivering
              </TabsTrigger>
              <TabsTrigger
                value="delivered"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Delivered
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Collections
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-3">
                <Package className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">
                    Packed Orders - Ready for Delivery
                  </p>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    These orders are packed and ready to be delivered
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="delivering" className="mt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Out for Delivery
                  </p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    Orders currently being delivered
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="delivered" className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Delivered Orders
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Orders that you have successfully delivered
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="collections" className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Cash Collections - Submit to Accounts
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Review your collected cash and submit to accounts department
                  </p>
                </div>
              </div>

              {collections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No cash collections yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-yellow-900">
                        Collected (Pending)
                      </h3>
                      <p className="text-2xl font-bold text-yellow-700 mt-1">
                        $
                        {collections
                          .filter((c) => c.status === "collected")
                          .reduce((sum, c) => sum + c.amount, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {
                          collections.filter((c) => c.status === "collected")
                            .length
                        }{" "}
                        order(s)
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-900">
                        Submitted
                      </h3>
                      <p className="text-2xl font-bold text-blue-700 mt-1">
                        $
                        {collections
                          .filter((c) => c.status === "submitted")
                          .reduce((sum, c) => sum + c.amount, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {
                          collections.filter((c) => c.status === "submitted")
                            .length
                        }{" "}
                        order(s)
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-green-900">
                        Confirmed
                      </h3>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        $
                        {collections
                          .filter((c) => c.status === "confirmed")
                          .reduce((sum, c) => sum + c.amount, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {
                          collections.filter((c) => c.status === "confirmed")
                            .length
                        }{" "}
                        order(s)
                      </p>
                    </div>
                  </div>

                  {/* Submit to Accounts Section */}
                  {collections.filter((c) => c.status === "collected").length >
                    0 && (
                    <div className="bg-white border rounded-lg p-4 mb-4">
                      <h3 className="font-medium mb-3">
                        Submit Collections to Accounts
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Select Accounts Employee
                          </label>
                          <Select
                            value={selectedAccountsUser}
                            onValueChange={setSelectedAccountsUser}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose accounts employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {accountsEmployees.map((emp) => (
                                <SelectItem key={emp._id} value={emp._id}>
                                  {emp.name} ({emp.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={async () => {
                            if (!selectedAccountsUser) {
                              toast({
                                title: "Error",
                                description:
                                  "Please select an accounts employee",
                                variant: "destructive",
                              });
                              return;
                            }

                            const collectedIds = collections
                              .filter(
                                (c) =>
                                  c.status === "collected" &&
                                  selectedCollections.includes(c._id)
                              )
                              .map((c) => c._id);

                            if (collectedIds.length === 0) {
                              toast({
                                title: "Error",
                                description:
                                  "Please select at least one collection to submit",
                                variant: "destructive",
                              });
                              return;
                            }

                            try {
                              const { error } = await supabase
                                .from("cash_collections")
                                .update({ status: "submitted", submitted_at: new Date().toISOString() })
                                .in("id", collectedIds);
                              if (error) throw error;

                              toast({
                                title: "Success",
                                description:
                                  "Collections submitted successfully",
                              });

                              fetchCollections();
                              setSelectedCollections([]);
                              setSelectedAccountsUser("");
                            } catch {
                              toast({
                                title: "Error",
                                description: "Failed to submit collections",
                                variant: "destructive",
                              });
                            }
                          }}
                          disabled={
                            !selectedAccountsUser ||
                            selectedCollections.length === 0
                          }
                          className="w-full"
                        >
                          Submit Selected Collections (
                          {selectedCollections.length})
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Collections List */}
                  <div className="space-y-3">
                    {collections.map((collection) => (
                      <div
                        key={collection._id}
                        className={`border rounded-lg p-4 ${
                          collection.status === "collected"
                            ? "bg-yellow-50 border-yellow-200"
                            : collection.status === "submitted"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {collection.status === "collected" && (
                                <Checkbox
                                  checked={selectedCollections.includes(
                                    collection._id
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCollections([
                                        ...selectedCollections,
                                        collection._id,
                                      ]);
                                    } else {
                                      setSelectedCollections(
                                        selectedCollections.filter(
                                          (id) => id !== collection._id
                                        )
                                      );
                                    }
                                  }}
                                />
                              )}
                              <h4 className="font-medium">
                                Order #
                                {collection.orderId?.orderNumber || "N/A"}
                              </h4>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  collection.status === "collected"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : collection.status === "submitted"
                                      ? "bg-blue-200 text-blue-800"
                                      : "bg-green-200 text-green-800"
                                }`}
                              >
                                {collection.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Collected:{" "}
                              {new Date(
                                collection.collectedAt
                              ).toLocaleDateString()}
                            </p>
                            {collection.submittedToAccounts && (
                              <p className="text-sm text-gray-600">
                                Submitted to:{" "}
                                {collection.submittedToAccounts.name} on{" "}
                                {collection.submittedAt &&
                                  new Date(
                                    collection.submittedAt
                                  ).toLocaleDateString()}
                              </p>
                            )}
                            {collection.confirmedByAccounts && (
                              <p className="text-sm text-gray-600">
                                Confirmed by:{" "}
                                {collection.confirmedByAccounts.name} on{" "}
                                {collection.confirmedAt &&
                                  new Date(
                                    collection.confirmedAt
                                  ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              ${collection.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Accounts - Tabs for Pending, Received, and Orders */}
        {(user?.role === "admin" ||
          (user?.role === "employee" &&
            user?.employee_role === "accounts")) && (
          <Tabs
            value={accountsTab}
            onValueChange={(value) =>
              setAccountsTab(value as "pending" | "received" | "orders")
            }
            className="w-full mb-6"
          >
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="received" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Cash Received
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Accounts Dashboard - Account Details */}
            <div className="mt-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Details Card */}
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Account Details</h3>
                      <p className="text-sm text-gray-600">
                        Accounts Department
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="font-medium">{user?.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium text-sm">
                        {user?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Role:</span>
                      <span className="font-medium capitalize">
                        {user?.role === "admin"
                          ? "Admin"
                          : user?.employee_role || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Received Amount Card */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-green-900">
                        Total Received
                      </h3>
                      <p className="text-sm text-green-700">
                        All confirmed cash collections
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-green-700">
                      ${accountsStats?.totalReceived.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      From {accountsStats?.totalReceivedCount || 0} confirmed
                      submission(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Pending to Receive
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        ${accountsStats?.totalPending.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {accountsStats?.totalPendingCount || 0} order(s) with
                        pending payment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Pending Submissions
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        $
                        {pendingSubmissions
                          .reduce((sum, s) => sum + s.amount, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pendingSubmissions.length} submission(s) to confirm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${accountsStats?.totalReceived.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {accountsStats?.totalReceivedCount || 0} confirmed
                        submission(s)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="pending" className="mt-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">
                      Pending Cash Submissions
                    </h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Review and confirm cash submissions from deliverymen
                    </p>
                  </div>
                </div>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white border rounded-lg">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No pending submissions to confirm</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Total Pending</h4>
                        <p className="text-2xl font-bold text-purple-700 mt-1">
                          $
                          {pendingSubmissions
                            .reduce((sum, s) => sum + s.amount, 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {pendingSubmissions.length} submission(s) from{" "}
                          {
                            new Set(
                              pendingSubmissions.map((s) => s.collectedBy._id)
                            ).size
                          }{" "}
                          deliveryman/men
                        </p>
                      </div>
                      <Button
                        onClick={async () => {
                          if (selectedSubmissions.length === 0) {
                            toast({
                              title: "Error",
                              description:
                                "Please select submissions to confirm",
                              variant: "destructive",
                            });
                            return;
                          }

                          try {
                            const { error } = await supabase
                              .from("cash_collections")
                              .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
                              .in("id", selectedSubmissions);
                            if (error) throw error;

                            toast({
                              title: "Success",
                              description:
                                "Cash submissions confirmed successfully",
                            });

                            fetchPendingSubmissions();
                            setSelectedSubmissions([]);
                          } catch {
                            toast({
                              title: "Error",
                              description: "Failed to confirm submissions",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={selectedSubmissions.length === 0}
                      >
                        Confirm Selected ({selectedSubmissions.length})
                      </Button>
                    </div>
                  </div>

                  {/* Submissions List */}
                  <div className="space-y-3">
                    {pendingSubmissions.map((submission) => (
                      <div
                        key={submission._id}
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedSubmissions.includes(
                              submission._id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSubmissions([
                                  ...selectedSubmissions,
                                  submission._id,
                                ]);
                              } else {
                                setSelectedSubmissions(
                                  selectedSubmissions.filter(
                                    (id) => id !== submission._id
                                  )
                                );
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium">
                                  Order #
                                  {submission.orderId?.orderNumber || "N/A"}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  From: {submission.collectedBy?.name} on{" "}
                                  {new Date(
                                    submission.collectedAt
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Submitted:{" "}
                                  {submission.submittedAt &&
                                    new Date(
                                      submission.submittedAt
                                    ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-purple-700">
                                  ${submission.amount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            {submission.notes && (
                              <p className="text-sm text-gray-500 mt-2">
                                Note: {submission.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="received" className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Cash Received
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Successfully confirmed cash collections
                  </p>
                </div>
              </div>
              {receivedSubmissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white border rounded-lg">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No received submissions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedSubmissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            Order #{submission.orderId?.orderNumber || "N/A"}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Collected by: {submission.collectedBy?.name} on{" "}
                            {new Date(
                              submission.collectedAt
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Confirmed:{" "}
                            {submission.confirmedAt &&
                              new Date(
                                submission.confirmedAt
                              ).toLocaleDateString()}
                          </p>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                            Confirmed
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-700">
                            ${submission.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Delivered Orders
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    All delivered orders for review
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Only show orders list when not on accounts pending/received tabs */}
        {!(
          (user?.role === "admin" ||
            (user?.role === "employee" &&
              user?.employee_role === "accounts")) &&
          (accountsTab === "pending" || accountsTab === "received")
        ) && (
          <>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-64"
                />
              </div>

              {/* Hide status filter for call center, packers, and deliverymen - they use tabs */}
              {!(
                user?.role === "employee" &&
                (user?.employee_role === "call_center" ||
                  user?.employee_role === "packer" ||
                  user?.employee_role === "deliveryman")
              ) && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="address_confirmed">
                      Address Confirmed
                    </SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="delivering">Delivering</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedOrders.length} order(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrders([])}
                    className="flex items-center gap-2"
                  >
                    Unselect All
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2"
                    disabled={user?.role !== "admin"}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {/* Orders Table - Desktop View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold w-12">
                      <Checkbox
                        checked={
                          displayOrders.length > 0 &&
                          selectedOrders.length === displayOrders.length
                        }
                        onCheckedChange={handleSelectAllOrders}
                        aria-label="Select all orders"
                        disabled={user?.role !== "admin"}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Items</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton
                    [...Array(perPage)].map((_, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : displayOrders.length > 0 ? (
                    displayOrders.map((order) => {
                      // Additional safety check
                      if (!order || !order._id) {
                        console.warn("Skipping invalid order:", order);
                        return null;
                      }

                      return (
                        <TableRow key={order._id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order._id)}
                              onCheckedChange={(checked) =>
                                handleSelectOrder(order._id, checked as boolean)
                              }
                              aria-label={`Select order ${order.orderId || "N/A"}`}
                              disabled={user?.role !== "admin"}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.orderId || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.user?.name || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email || "No email"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.items?.length || 0} items
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(order.totalAmount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  "capitalize",
                                  getStatusColor(order.status)
                                )}
                              >
                                {getStatusLabel(order.status)}
                              </Badge>
                              {roleStatuses.highlightStatuses.includes(
                                order.status
                              ) && (
                                <div title="Action required">
                                  <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "capitalize",
                                getPaymentStatusColor(order.paymentStatus)
                              )}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsViewOpen(true);
                                }}
                                title="View order details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOriginalOrder(
                                    JSON.parse(JSON.stringify(order))
                                  ); // Deep clone original order
                                  setOriginalOrderStatus(order.status); // Store original status
                                  setPackedItems(
                                    new Array(order.items?.length || 0).fill(
                                      false
                                    )
                                  ); // Initialize packed items
                                  setIsAddressConfirmed(
                                    order.status === "address_confirmed" ||
                                      order.status === "confirmed" ||
                                      order.status === "packed" ||
                                      order.status === "delivering" ||
                                      order.status === "delivered" ||
                                      order.status === "completed"
                                  );
                                  // Set assigned deliveryman if exists
                                  if (order.assignedDeliveryman) {
                                    const deliverymanId =
                                      typeof order.assignedDeliveryman ===
                                      "string"
                                        ? order.assignedDeliveryman
                                        : order.assignedDeliveryman._id;
                                    setSelectedDeliveryman(deliverymanId);
                                  } else {
                                    setSelectedDeliveryman("");
                                  }
                                  setIsEditOpen(true);
                                }}
                                title="Edit order"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsHistoryOpen(true);
                                }}
                                title="View order history"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDeleteOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Delete order"
                                disabled={user?.role !== "admin"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <Package className="h-12 w-12 text-gray-400" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              No orders found
                            </p>
                            <p className="text-sm text-gray-500">
                              {searchTerm ||
                              statusFilter !== "all" ||
                              paymentFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Orders will appear here when customers place them"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>

            {/* Orders Cards - Mobile/Tablet View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden space-y-4"
            >
              {loading ? (
                // Loading skeleton for mobile
                [...Array(perPage)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 mt-1" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))
              ) : displayOrders.length > 0 ? (
                displayOrders.map((order) => {
                  if (!order || !order._id) {
                    console.warn("Skipping invalid order:", order);
                    return null;
                  }

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow-sm border p-4 space-y-3"
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedOrders.includes(order._id)}
                            onCheckedChange={(checked) =>
                              handleSelectOrder(order._id, checked as boolean)
                            }
                            aria-label={`Select order ${order.orderId || "N/A"}`}
                            className="mt-1"
                            disabled={user?.role !== "admin"}
                          />
                          <div>
                            <p className="font-semibold text-lg">
                              {order.orderId || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsViewOpen(true);
                            }}
                            title="View order details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOriginalOrder(
                                JSON.parse(JSON.stringify(order))
                              ); // Deep clone original order
                              setOriginalOrderStatus(order.status); // Store original status
                              setPackedItems(
                                new Array(order.items?.length || 0).fill(false)
                              ); // Initialize packed items
                              setIsAddressConfirmed(
                                order.status === "address_confirmed" ||
                                  order.status === "confirmed" ||
                                  order.status === "packed" ||
                                  order.status === "delivering" ||
                                  order.status === "delivered" ||
                                  order.status === "completed"
                              );
                              setIsEditOpen(true);
                            }}
                            title="Edit order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsHistoryOpen(true);
                            }}
                            title="View order history"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDeleteOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete order"
                            disabled={user?.role !== "admin"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="border-t pt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Customer
                        </p>
                        <p className="font-medium">
                          {order.user?.name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.user?.email || "No email"}
                        </p>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Items
                          </p>
                          <p className="font-medium">
                            {order.items?.length || 0} items
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            Total
                          </p>
                          <p className="font-bold text-lg">
                            ${(order.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "capitalize",
                              getStatusColor(order.status)
                            )}
                          >
                            {getStatusLabel(order.status)}
                          </Badge>
                          {roleStatuses.highlightStatuses.includes(
                            order.status
                          ) && (
                            <div title="Action required">
                              <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
                            </div>
                          )}
                        </div>
                        <Badge
                          className={cn(
                            "capitalize",
                            getPaymentStatusColor(order.paymentStatus)
                          )}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-12">
                  <div className="flex flex-col items-center gap-4">
                    <Package className="h-12 w-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-900">
                        No orders found
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchTerm ||
                        statusFilter !== "all" ||
                        paymentFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Orders will appear here when customers place them"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Pagination Controls */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </motion.div>
            ) : total > perPage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * perPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * perPage, total)}
                    </span>{" "}
                    of <span className="font-medium">{total}</span> orders
                  </div>
                  <div className="text-sm text-gray-600">
                    Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className="disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {/* Simple message for single page */}
            {!loading && total > 0 && total <= perPage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-gray-600 bg-white rounded-lg border border-gray-200 px-4 py-3"
              >
                Showing all <span className="font-medium">{total}</span> orders
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedOrders.length} selected
              order(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      {/* View Order Sheet - Opens from Right */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>View complete order information</SheetDescription>
          </SheetHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Order ID
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedOrder.orderId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Order Date
                  </Label>
                  <p>
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Customer Information
                </Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedOrder.user.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.user.email}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Shipping Address
                </Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Order Status
                </Label>
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "capitalize",
                      getStatusColor(selectedOrder.status)
                    )}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Payment Status
                </Label>
                <div className="mt-2">
                  <Badge
                    className={cn(
                      "capitalize",
                      getPaymentStatusColor(selectedOrder.paymentStatus)
                    )}
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Order Items
                </Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.product?.image ||
                              item.image ||
                              "/placeholder-image.jpg"
                            }
                            alt={item.product?.name || item.name || "Product"}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                          <div>
                            <p className="font-medium">
                              {item.product?.name ||
                                item.name ||
                                "Unknown Product"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(item.product?.price || item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items in this order</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Order Sheet - Opens from Right with Role-Based Permissions */}
      <Sheet
        open={isEditOpen}
        onOpenChange={(open) => {
          // Prevent closing if operations are in progress
          if (!open && (isUpdating || isConfirmingAddress)) {
            return;
          }
          setIsEditOpen(open);
        }}
      >
        <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Order #{selectedOrder?.orderId}</SheetTitle>
            <SheetDescription>
              {user?.role === "employee" &&
              user?.employee_role === "call_center"
                ? "Confirm address and update order status to confirmed"
                : "Update order details, status, payment, and items information"}
            </SheetDescription>
          </SheetHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-6">
              {/* Call Center Lock Warning */}
              {user?.role === "employee" &&
                user?.employee_role === "call_center" &&
                !canCallCenterEdit(originalOrderStatus) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Order Locked
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This order has been confirmed and is now locked. Call
                        center cannot make further changes. Contact admin if
                        modifications are needed.
                      </p>
                    </div>
                  </div>
                )}

              {/* Packer Instructions */}
              {user?.role === "employee" &&
                user?.employee_role === "packer" && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                    <Package className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-900">
                        Packer Instructions
                      </h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Mark each item as packed below. Once all items are
                        packed, update the order status to "Packed". Address,
                        products, payment status, and total amount cannot be
                        modified.
                      </p>
                    </div>
                  </div>
                )}

              {/* Deliveryman Instructions */}
              {user?.role === "employee" &&
                user?.employee_role === "deliveryman" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Package className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Deliveryman Instructions
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedOrder.paymentStatus === "pending"
                          ? 'Update status to "Delivering" when you start delivery. When status is "Delivering", use the "Receive Cash" button to collect payment from customer. You can only mark as "Delivered" after payment is collected. Order items, amount, and payment status are read-only.'
                          : 'Update status to "Delivering" when you start, then mark as "Delivered" when complete. Order items, amount, and payment status are read-only.'}
                      </p>
                    </div>
                  </div>
                )}

              {/* Order Status and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assign Deliveryman - Only for admin/incharge and packed orders */}
                {(user?.role === "admin" ||
                  (user?.role === "employee" &&
                    user?.employee_role === "incharge")) &&
                  selectedOrder.status === "packed" && (
                    <div className="md:col-span-2">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <Label
                          htmlFor="deliveryman"
                          className="text-amber-900 font-semibold mb-2 block"
                        >
                          Assign to Deliveryman
                        </Label>

                        {/* Show currently assigned deliveryman */}
                        {selectedOrder.assignedDeliveryman && (
                          <div className="mb-3 bg-white border border-amber-300 rounded-md p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Currently Assigned:
                              </p>
                              <p className="text-sm text-gray-600">
                                {typeof selectedOrder.assignedDeliveryman ===
                                "string"
                                  ? deliveryEmployees.find(
                                      (e) =>
                                        e._id ===
                                        selectedOrder.assignedDeliveryman
                                    )?.name || "Unknown"
                                  : selectedOrder.assignedDeliveryman.name}{" "}
                                (
                                {typeof selectedOrder.assignedDeliveryman ===
                                "string"
                                  ? deliveryEmployees.find(
                                      (e) =>
                                        e._id ===
                                        selectedOrder.assignedDeliveryman
                                    )?.email || "Unknown"
                                  : selectedOrder.assignedDeliveryman.email}
                                )
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDeliveryman("");
                                handleAssignDeliveryman(selectedOrder._id);
                              }}
                              disabled={isAssigningDeliveryman}
                              title="Clear assignment"
                              className="hover:bg-red-100 hover:text-red-600"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Select
                            value={selectedDeliveryman}
                            onValueChange={setSelectedDeliveryman}
                            disabled={isAssigningDeliveryman}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a deliveryman" />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryEmployees.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No deliverymen available
                                </SelectItem>
                              ) : (
                                deliveryEmployees.map((employee) => (
                                  <SelectItem
                                    key={employee._id}
                                    value={employee._id}
                                  >
                                    {employee.name} ({employee.email})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() =>
                              handleAssignDeliveryman(selectedOrder._id)
                            }
                            disabled={
                              !selectedDeliveryman || isAssigningDeliveryman
                            }
                            size="default"
                          >
                            {isAssigningDeliveryman
                              ? "Assigning..."
                              : selectedOrder.assignedDeliveryman
                                ? "Reassign"
                                : "Assign"}
                          </Button>
                        </div>
                        <p className="text-xs text-amber-700 mt-2">
                          {selectedOrder.assignedDeliveryman
                            ? "Select a different deliveryman to reassign, or click the X button to clear the assignment"
                            : "Once assigned, the deliveryman can view and deliver this order"}
                        </p>
                      </div>
                    </div>
                  )}

                <div>
                  <Label htmlFor="status">Order Status</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        status: value as Order["status"],
                      })
                    }
                    disabled={
                      (user?.role === "employee" &&
                        user?.employee_role === "call_center" &&
                        !isAddressConfirmed) ||
                      (user?.role === "employee" &&
                        user?.employee_role === "call_center" &&
                        !canCallCenterEdit(originalOrderStatus)) ||
                      (user?.role === "employee" &&
                        user?.employee_role === "deliveryman" &&
                        selectedOrder.paymentMethod === "cod" &&
                        selectedOrder.status === "delivering" &&
                        selectedOrder.paymentStatus !== "cod_collected")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {user?.role === "employee" &&
                      user?.employee_role === "call_center" ? (
                        <>
                          {selectedOrder.status === "pending" && (
                            <SelectItem value="pending">Pending</SelectItem>
                          )}
                          {(selectedOrder.status === "address_confirmed" ||
                            isAddressConfirmed) && (
                            <SelectItem value="address_confirmed">
                              Address Confirmed
                            </SelectItem>
                          )}
                          {isAddressConfirmed && (
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                          )}
                        </>
                      ) : user?.role === "employee" &&
                        user?.employee_role === "packer" ? (
                        <>
                          {/* Packer can only see and select "Packed" status */}
                          {selectedOrder.status === "confirmed" && (
                            <SelectItem value="confirmed" disabled>
                              Confirmed
                            </SelectItem>
                          )}
                          <SelectItem value="packed">Packed</SelectItem>
                        </>
                      ) : user?.role === "employee" &&
                        user?.employee_role === "deliveryman" ? (
                        <>
                          {/* Deliveryman can update from packed -> delivering -> delivered */}
                          {selectedOrder.status === "packed" && (
                            <SelectItem value="packed" disabled>
                              Packed
                            </SelectItem>
                          )}
                          <SelectItem value="delivering">Delivering</SelectItem>
                          <SelectItem
                            value="delivered"
                            disabled={selectedOrder.paymentStatus === "pending"}
                          >
                            Delivered
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="address_confirmed">
                            Address Confirmed
                          </SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="packed">Packed</SelectItem>
                          <SelectItem value="delivering">Delivering</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {user?.role === "employee" &&
                    user?.employee_role === "call_center" && (
                      <p className="text-xs text-gray-500 mt-1">
                        {!canCallCenterEdit(originalOrderStatus)
                          ? "Order is locked after confirmation - no changes allowed"
                          : !isAddressConfirmed
                            ? "Please confirm the address first to update status"
                            : "Can only set status to 'Confirmed' after address confirmation"}
                      </p>
                    )}
                  {user?.role === "employee" &&
                    user?.employee_role === "packer" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mark all products as packed below, then update status to
                        "Packed"
                      </p>
                    )}
                  {user?.role === "employee" &&
                    user?.employee_role === "deliveryman" && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedOrder.status === "delivering" &&
                        selectedOrder.paymentStatus === "pending"
                          ? "Use 'Receive Cash' button below to collect payment before marking as delivered"
                          : selectedOrder.status === "packed"
                            ? 'Update status to "Delivering" when you start delivery'
                            : selectedOrder.paymentStatus === "pending"
                              ? 'Update to "Delivering" first, then collect payment'
                              : 'Update status to "Delivered" when order is complete'}
                      </p>
                    )}
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={selectedOrder.paymentStatus}
                    onValueChange={(value) =>
                      setSelectedOrder({
                        ...selectedOrder,
                        paymentStatus: value as Order["paymentStatus"],
                      })
                    }
                    disabled={
                      (user?.role === "employee" &&
                        user?.employee_role === "call_center") ||
                      (user?.role === "employee" &&
                        user?.employee_role === "packer") ||
                      (user?.role === "employee" &&
                        user?.employee_role === "deliveryman")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  {user?.role === "employee" &&
                    user?.employee_role === "call_center" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Call center cannot modify payment status
                      </p>
                    )}
                  {user?.role === "employee" &&
                    user?.employee_role === "packer" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Packer cannot modify payment status
                      </p>
                    )}
                  {user?.role === "employee" &&
                    user?.employee_role === "deliveryman" && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">
                          Deliveryman cannot modify payment status directly
                        </p>
                        {originalOrderStatus === "delivering" &&
                          selectedOrder.paymentStatus === "pending" && (
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const { error: codError } = await supabase
                                    .from("orders")
                                    .update({ payment_status: "cod_collected" })
                                    .eq("id", selectedOrder._id);
                                  if (codError) throw codError;

                                  const { error: collectionError } = await supabase
                                    .from("cash_collections")
                                    .insert({
                                      order_id: selectedOrder._id,
                                      amount: selectedOrder.total || selectedOrder.totalAmount,
                                      collected_by: user?.id,
                                      status: "collected",
                                    });
                                  if (collectionError) throw collectionError;
                                  toast({
                                    title: "Success",
                                    description:
                                      "Cash payment collected successfully",
                                  });
                                  // Refresh order data
                                  fetchOrders();
                                  setSelectedOrder({
                                    ...selectedOrder,
                                    paymentStatus: "paid",
                                  });
                                } catch (error) {
                                  const errorMessage =
                                    error instanceof Error
                                      ? error.message
                                      : (
                                          error as {
                                            response?: {
                                              data?: { message?: string };
                                            };
                                          }
                                        )?.response?.data?.message ||
                                        "Failed to collect cash payment";
                                  toast({
                                    title: "Error",
                                    description: errorMessage,
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Receive Cash ($
                              {selectedOrder.total || selectedOrder.totalAmount}
                              )
                            </Button>
                          )}
                      </div>
                    )}
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <Label htmlFor="totalAmount">
                  Total Amount ($)
                  {canCallCenterEdit(originalOrderStatus) && (
                    <span className="ml-2 text-sm font-normal text-green-600">
                      (Editable until Confirmed)
                    </span>
                  )}
                  {user?.role === "employee" &&
                    user?.employee_role === "packer" && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Read Only)
                      </span>
                    )}
                  {user?.role === "employee" &&
                    user?.employee_role === "deliveryman" && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Read Only)
                      </span>
                    )}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={Number(selectedOrder.totalAmount).toFixed(2)}
                  onChange={(e) =>
                    setSelectedOrder({
                      ...selectedOrder,
                      totalAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                  disabled={
                    (user?.role === "employee" &&
                      user?.employee_role === "call_center" &&
                      !canCallCenterEdit(originalOrderStatus)) ||
                    (user?.role === "employee" &&
                      user?.employee_role === "packer") ||
                    (user?.role === "employee" &&
                      user?.employee_role === "deliveryman")
                  }
                />
                {user?.role === "employee" &&
                  user?.employee_role === "call_center" &&
                  !canCallCenterEdit(originalOrderStatus) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Total amount is read-only after order is confirmed
                    </p>
                  )}
                {user?.role === "employee" &&
                  user?.employee_role === "packer" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Packer cannot modify total amount
                    </p>
                  )}
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-lg font-semibold">
                    Shipping Address
                    {!isAddressConfirmed &&
                      user?.role === "employee" &&
                      user?.employee_role === "call_center" && (
                        <span className="ml-2 text-sm font-normal text-green-600">
                          (Editable)
                        </span>
                      )}
                    {isAddressConfirmed && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        Confirmed
                      </span>
                    )}
                  </Label>
                  {user?.role === "employee" &&
                    user?.employee_role === "call_center" &&
                    (selectedOrder?.status === "pending" ||
                      selectedOrder?.status === "address_confirmed") &&
                    !isAddressConfirmed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConfirmAddress}
                        disabled={isConfirmingAddress}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isConfirmingAddress
                          ? "Confirming..."
                          : "Confirm Address"}
                      </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="street">Street</Label>
                    <Input
                      value={selectedOrder.shippingAddress.street}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          shippingAddress: {
                            ...selectedOrder.shippingAddress,
                            street: e.target.value,
                          },
                        })
                      }
                      className="mt-1"
                      disabled={
                        isConfirmingAddress ||
                        (isAddressConfirmed && user?.role !== "admin")
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      value={selectedOrder.shippingAddress.city}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          shippingAddress: {
                            ...selectedOrder.shippingAddress,
                            city: e.target.value,
                          },
                        })
                      }
                      className="mt-1"
                      disabled={
                        isConfirmingAddress ||
                        (isAddressConfirmed && user?.role !== "admin")
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      value={selectedOrder.shippingAddress.state}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          shippingAddress: {
                            ...selectedOrder.shippingAddress,
                            state: e.target.value,
                          },
                        })
                      }
                      className="mt-1"
                      disabled={
                        isConfirmingAddress ||
                        (isAddressConfirmed && user?.role !== "admin")
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      value={selectedOrder.shippingAddress.zipCode}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          shippingAddress: {
                            ...selectedOrder.shippingAddress,
                            zipCode: e.target.value,
                          },
                        })
                      }
                      className="mt-1"
                      disabled={
                        isConfirmingAddress ||
                        (isAddressConfirmed && user?.role !== "admin")
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      value={selectedOrder.shippingAddress.country}
                      onChange={(e) =>
                        setSelectedOrder({
                          ...selectedOrder,
                          shippingAddress: {
                            ...selectedOrder.shippingAddress,
                            country: e.target.value,
                          },
                        })
                      }
                      className="mt-1"
                      disabled={
                        isConfirmingAddress ||
                        (isAddressConfirmed && user?.role !== "admin")
                      }
                    />
                  </div>
                </div>
                {isAddressConfirmed && user?.role !== "admin" && (
                  <p className="text-xs text-gray-500 mt-2">
                    Address has been confirmed and is locked. Only admin can
                    edit confirmed addresses.
                  </p>
                )}
              </div>

              {/* Order Items - Editable for Call Center until Confirmed */}
              {(user?.role === "admin" ||
                (user?.employee_role !== "call_center" &&
                  user?.employee_role !== "deliveryman" &&
                  user?.employee_role !== "accounts") ||
                canCallCenterEdit(originalOrderStatus)) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg font-semibold">
                      Order Items
                      {canCallCenterEdit(originalOrderStatus) && (
                        <span className="ml-2 text-sm font-normal text-green-600">
                          (Editable until Confirmed)
                        </span>
                      )}
                      {user?.role === "employee" &&
                        user?.employee_role === "packer" && (
                          <span className="ml-2 text-sm font-normal text-orange-600">
                            (Mark items as packed)
                          </span>
                        )}
                    </Label>
                    {user?.role !== "employee" ||
                    user?.employee_role !== "packer" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProductSearch(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    ) : null}
                  </div>

                  {/* Packer Progress Indicator */}
                  {user?.role === "employee" &&
                    user?.employee_role === "packer" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">
                              Packing Progress
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-orange-700">
                            {packedItems.filter((p) => p).length} /{" "}
                            {packedItems.length} items packed
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-orange-100 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(packedItems.filter((p) => p).length / packedItems.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                  {/* Product Search Modal */}
                  {showProductSearch && (
                    <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          placeholder="Search products to add..."
                          value={String(productSearchTerm || "")}
                          onChange={(e) => {
                            const value = String(e.target.value || "");
                            setProductSearchTerm(value);
                            searchProducts(value);
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowProductSearch(false);
                            setProductSearchTerm("");
                            setSearchResults([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>

                      {isSearching && (
                        <p className="text-sm text-gray-500">Searching...</p>
                      )}

                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              className="flex items-center justify-between p-2 border rounded bg-white cursor-pointer hover:bg-gray-50"
                              onClick={() => addProductToOrder(product)}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={String(
                                    product.image || "/placeholder-image.jpg"
                                  )}
                                  alt={String(product.name || "")}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium">
                                    {String(product.name || "")}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {String(product.category || "")}
                                  </p>
                                </div>
                              </div>
                              <p className="font-medium">
                                ${(Number(product.price) || 0).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "border rounded-lg p-4 space-y-3",
                          user?.role === "employee" &&
                            user?.employee_role === "packer" &&
                            packedItems[index] &&
                            "bg-green-50 border-green-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">Item #{index + 1}</h4>
                            {/* Packer Checkbox */}
                            {user?.role === "employee" &&
                              user?.employee_role === "packer" && (
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`packed-${index}`}
                                    checked={packedItems[index] || false}
                                    onCheckedChange={(checked) => {
                                      const newPackedItems = [...packedItems];
                                      newPackedItems[index] =
                                        checked as boolean;
                                      setPackedItems(newPackedItems);
                                    }}
                                    disabled={originalOrderStatus === "packed"}
                                  />
                                  <Label
                                    htmlFor={`packed-${index}`}
                                    className={cn(
                                      "text-sm cursor-pointer",
                                      packedItems[index]
                                        ? "text-green-600 font-semibold"
                                        : "text-gray-600",
                                      originalOrderStatus === "packed" &&
                                        "cursor-not-allowed opacity-60"
                                    )}
                                  >
                                    {packedItems[index]
                                      ? "✓ Packed"
                                      : "Mark as Packed"}
                                  </Label>
                                </div>
                              )}
                          </div>
                          {user?.role !== "employee" ||
                          user?.employee_role !== "packer" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItemFromOrder(index)}
                            >
                              <Minus className="h-4 w-4" />
                              Remove
                            </Button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Product Name</Label>
                            <Input
                              value={item.product?.name || item.name || ""}
                              readOnly
                              className="mt-1 bg-gray-50"
                              title="Product name cannot be edited from orders"
                            />
                          </div>
                          <div>
                            <Label>Unit Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={
                                Number(item.product?.price || item.price) || 0
                              }
                              readOnly
                              className="mt-1 bg-gray-50"
                              title="Product price can only be edited from Products page"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={Number(item.quantity) || 1}
                              onChange={(e) =>
                                updateItemQuantity(
                                  index,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="mt-1"
                              readOnly={
                                user?.role === "employee" &&
                                user?.employee_role === "packer"
                              }
                              disabled={
                                user?.role === "employee" &&
                                user?.employee_role === "packer"
                              }
                            />
                          </div>
                          <div>
                            <Label>Total Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={(
                                (Number(item.quantity) || 1) *
                                (Number(item.product?.price || item.price) || 0)
                              ).toFixed(2)}
                              readOnly
                              className="mt-1 bg-gray-50"
                              title="Total price is automatically calculated"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read-only Order Items View for Call Center (After Confirmed), Deliveryman, and Accounts */}
              {((user?.role === "employee" &&
                user?.employee_role === "call_center" &&
                !canCallCenterEdit(originalOrderStatus)) ||
                (user?.role === "employee" &&
                  user?.employee_role === "deliveryman") ||
                (user?.role === "employee" &&
                  user?.employee_role === "accounts")) && (
                <div>
                  <Label className="text-lg font-semibold">
                    Order Items{" "}
                    <span className="text-sm font-normal text-blue-600">
                      {user?.employee_role === "deliveryman" ||
                      user?.employee_role === "accounts"
                        ? "(Read Only)"
                        : "(Read Only - Order Confirmed)"}
                    </span>
                  </Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.product?.image ||
                                item.image ||
                                "/placeholder-image.jpg"
                              }
                              alt={item.product?.name || item.name || "Product"}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                            <div>
                              <p className="font-medium">
                                {item.product?.name ||
                                  item.name ||
                                  "Unknown Product"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">
                            $
                            {(item.product?.price || item.price || 0).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No items in this order</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isUpdating || isConfirmingAddress}
                  className="min-w-25"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateOrder(selectedOrder)}
                  disabled={
                    !hasOrderChanged() ||
                    isUpdating ||
                    isConfirmingAddress ||
                    (user?.role === "employee" &&
                      user?.employee_role === "call_center" &&
                      (originalOrderStatus === "confirmed" ||
                        (!canCallCenterEdit(originalOrderStatus) &&
                          selectedOrder?.status !== "confirmed"))) || // Disable if order is already confirmed, or if changing TO confirmed
                    (user?.role === "employee" &&
                      user?.employee_role === "packer" &&
                      (!packedItems.every((packed) => packed) ||
                        selectedOrder?.status !== "packed"))
                  }
                  className="min-w-52"
                >
                  {isUpdating ? "Updating..." : "Update Order"}
                </Button>
              </div>
              {user?.role === "employee" &&
                user?.employee_role === "call_center" &&
                originalOrderStatus === "confirmed" && (
                  <p className="text-xs text-gray-500 text-right mt-2">
                    This order is confirmed and is read-only
                  </p>
                )}
              {user?.role === "employee" &&
                user?.employee_role === "packer" &&
                originalOrderStatus === "packed" && (
                  <p className="text-xs text-gray-500 text-right mt-2">
                    This order is already packed and is read-only
                  </p>
                )}
              {user?.role === "employee" &&
                user?.employee_role === "packer" &&
                originalOrderStatus !== "packed" &&
                !packedItems.every((packed) => packed) && (
                  <p className="text-xs text-orange-600 text-right mt-2">
                    Please mark all items as packed before updating
                  </p>
                )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Order History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Status History</SheetTitle>
            <SheetDescription>
              View the complete timeline of status changes for order{" "}
              {selectedOrder?.orderId}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {selectedOrder?.status_history &&
            selectedOrder.status_history.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Timeline items */}
                <div className="space-y-6">
                  {selectedOrder.status_history
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div key={index} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />

                        {/* Content */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-medium",
                                  entry.status === "completed" &&
                                    "bg-green-50 text-green-700 border-green-200",
                                  entry.status === "cancelled" &&
                                    "bg-red-50 text-red-700 border-red-200",
                                  entry.status === "delivered" &&
                                    "bg-blue-50 text-blue-700 border-blue-200",
                                  entry.status === "delivering" &&
                                    "bg-purple-50 text-purple-700 border-purple-200",
                                  entry.status === "packed" &&
                                    "bg-indigo-50 text-indigo-700 border-indigo-200",
                                  entry.status === "confirmed" &&
                                    "bg-cyan-50 text-cyan-700 border-cyan-200",
                                  entry.status === "address_confirmed" &&
                                    "bg-teal-50 text-teal-700 border-teal-200",
                                  entry.status === "pending" &&
                                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                                )}
                              >
                                {entry.status
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 ml-2">
                              {new Date(entry.changed_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Changed by:</span>
                              <span className="font-medium text-gray-900">
                                {entry.changed_by.name}
                              </span>
                            </div>

                            {entry.notes && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {entry.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No status history available for this order
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Order Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order{" "}
              <span className="font-semibold">{selectedOrder?.orderId}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedOrder && handleDeleteOrder(selectedOrder._id)
              }
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
