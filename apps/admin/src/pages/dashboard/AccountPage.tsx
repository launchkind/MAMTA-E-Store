import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

interface OrderRow {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
}

interface ProductRow {
  id: string;
  name: string;
  stock: number;
  sold: number;
  price: number;
}

const COLORS = ["#1a1a2c", "#d52245", "#1f2329", "#999999", "#fbe9ec", "#6366f1", "#22c55e"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export default function AccountPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, status, payment_status, total, created_at")
            .order("created_at", { ascending: false })
            .limit(1000),
          supabase
            .from("products")
            .select("id, name, stock, sold, price")
            .order("sold", { ascending: false })
            .limit(500),
        ]);
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);

  // Revenue by day, last 14 days
  const days: { date: string; label: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: 0,
      orders: 0,
    });
  }
  orders.forEach((o) => {
    const key = o.created_at?.slice(0, 10);
    const day = days.find((d) => d.date === key);
    if (day) {
      day.orders += 1;
      if (o.payment_status === "paid") day.revenue += o.total || 0;
    }
  });

  // Order status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Stock alerts
  const outOfStock = products.filter((p) => (p.stock ?? 0) <= 0);
  const lowStock = products.filter((p) => (p.stock ?? 0) > 0 && p.stock <= 5);
  const bestSellers = [...products]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Account Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue, order volume, stock alerts and best-selling products
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description={`From ${paidOrders.length} paid orders`}
          icon={<DollarSign className="w-4 h-4" />}
          href="/dashboard/orders"
        />
        <StatsCard
          title="Total Orders"
          value={orders.length}
          description={`${statusCounts["pending"] || 0} pending`}
          icon={<ShoppingBag className="w-4 h-4" />}
          href="/dashboard/orders"
        />
        <StatsCard
          title="Low Stock"
          value={lowStock.length}
          description="Products with 5 or fewer left"
          icon={<AlertTriangle className="w-4 h-4" />}
          href="/dashboard/products"
        />
        <StatsCard
          title="Out of Stock"
          value={outOfStock.length}
          description="Products needing restock"
          icon={<Package className="w-4 h-4" />}
          href="/dashboard/products"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "revenue" ? formatCurrency(value) : value
                  }
                />
                <Bar dataKey="revenue" fill="#d52245" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">
                No orders yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Best sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best-Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No products yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {bestSellers.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <span className="w-6 text-sm font-semibold text-muted-foreground">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.price)} · {p.stock} in stock
                      </p>
                    </div>
                    <Badge variant="secondary">{p.sold || 0} sold</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outOfStock.length === 0 && lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                All products are sufficiently stocked. 🎉
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {[...outOfStock, ...lowStock].slice(0, 8).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        (p.stock ?? 0) <= 0
                          ? "bg-red-100 text-red-700 border-0"
                          : "bg-amber-100 text-amber-700 border-0"
                      }
                    >
                      {(p.stock ?? 0) <= 0 ? "Out of stock" : `${p.stock} left`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
