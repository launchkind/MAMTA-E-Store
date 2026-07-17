import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import {
  getRoleDashboardMessage,
  canAccessMenuItem,
} from "@/lib/rolePermissions";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShoppingBag,
  Tag,
  Bookmark,
  Package,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import { motion } from "framer-motion";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";

interface StatsData {
  counts: {
    users: number;
    products: number;
    categories: number;
    brands: number;
    orders: number;
    totalRevenue: number;
  };
  roles: { name: string; value: number }[];
  categories: { name: string; value: number }[];
  brands: { name: string; value: number }[];
}

const COLORS = [
  "#1a1a2c", // Primary Navy
  "#d52245", // Accent Red
  "#1f2329", // Secondary Dark
  "#999999", // Muted Gray
  "#fbe9ec", // Light red/pink
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  const dashboardMessage = getRoleDashboardMessage(
    user?.role || "",
    user?.employee_role || null,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, categoriesRes, brandsRes, ordersRes] =
          await Promise.all([
            supabase.from("users").select("id, role"),
            supabase.from("products").select("id", { count: "exact", head: true }),
            supabase.from("categories").select("id, name"),
            supabase.from("brands").select("id, name"),
            supabase.from("orders").select("id, total, payment_status"),
          ]);

        const users = usersRes.data || [];
        const categories = categoriesRes.data || [];
        const brands = brandsRes.data || [];
        const orders = ordersRes.data || [];

        const totalRevenue = orders
          .filter((o) =>
            ["paid", "completed", "delivered"].includes(o.payment_status),
          )
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const roleCounts: Record<string, number> = {};
        users.forEach((u) => {
          roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
        });

        const { data: catProducts } = await supabase
          .from("products")
          .select("category_id");
        const catCount: Record<string, number> = {};
        (catProducts || []).forEach((p) => {
          if (p.category_id)
            catCount[p.category_id] = (catCount[p.category_id] || 0) + 1;
        });

        const { data: brandProducts } = await supabase
          .from("products")
          .select("brand_id");
        const brandCount: Record<string, number> = {};
        (brandProducts || []).forEach((p) => {
          if (p.brand_id)
            brandCount[p.brand_id] = (brandCount[p.brand_id] || 0) + 1;
        });

        setStats({
          counts: {
            users: users.length,
            products: productsRes.count || 0,
            categories: categories.length,
            brands: brands.length,
            orders: orders.length,
            totalRevenue,
          },
          roles: Object.entries(roleCounts).map(([name, value]) => ({
            name,
            value,
          })),
          categories: categories
            .map((c) => ({ name: c.name, value: catCount[c.id] || 0 }))
            .filter((c) => c.value > 0)
            .slice(0, 8),
          brands: brands
            .map((b) => ({ name: b.name, value: brandCount[b.id] || 0 }))
            .filter((b) => b.value > 0)
            .slice(0, 8),
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard statistics",
        });
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <motion.div
      className="min-h-screen bg-transparent p-4 md:p-6"
      variants={containerVariants}
      animate="visible"
    >
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto">
          <motion.div variants={cardVariants}>
            <h1 className="text-4xl font-bold text-gray-800">
              {dashboardMessage.title}
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              {dashboardMessage.description}
            </p>
          </motion.div>

          {stats && stats.counts && (
            <>
              <motion.div
                className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={containerVariants}
              >
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Users"
                    value={stats.counts.users}
                    icon={<Users className="h-6 w-6 text-[#1a1a2c]" />}
                    href="/dashboard/users"
                    className="bg-white shadow-sm border border-gray-100 rounded-3xl hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Products"
                    value={stats.counts.products}
                    icon={<ShoppingBag className="h-6 w-6 text-[#1a1a2c]" />}
                    href="/dashboard/products"
                    className="bg-white shadow-sm border border-gray-100 rounded-3xl hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Categories"
                    value={stats.counts.categories}
                    icon={<Tag className="h-6 w-6 text-[#1a1a2c]" />}
                    href="/dashboard/categories"
                    className="bg-white shadow-sm border border-gray-100 rounded-3xl hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Brands"
                    value={stats.counts.brands}
                    icon={<Bookmark className="h-6 w-6 text-[#1a1a2c]" />}
                    href="/dashboard/brands"
                    className="bg-white shadow-sm border border-gray-100 rounded-3xl hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  />
                </motion.div>
                <motion.div variants={cardVariants}>
                  <StatsCard
                    title="Total Orders"
                    value={stats.counts.orders}
                    icon={<Package className="h-6 w-6 text-[#1a1a2c]" />}
                    href="/dashboard/orders"
                    className="bg-white shadow-sm border border-gray-100 rounded-3xl hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  />
                </motion.div>
                {canAccessMenuItem(
                  "/dashboard/account",
                  user?.role || "",
                  user?.employee_role,
                ) && (
                  <motion.div variants={cardVariants}>
                    <StatsCard
                      title="Total Revenue"
                      value={formatCurrency(stats.counts.totalRevenue)}
                      icon={<DollarSign className="h-6 w-6 text-[#d52245]" />}
                      href="/dashboard/account"
                      className="bg-[#1a1a2c] text-white shadow-sm border-none rounded-3xl hover:shadow-md transition-all duration-300"
                    />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="grid gap-6 grid-cols-1 lg:grid-cols-2"
                variants={containerVariants}
              >
                {stats.categories && stats.categories.length > 0 && (
                  <motion.div variants={cardVariants}>
                    <Card className="bg-white shadow-sm border border-gray-100 rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          Categories Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center py-6">
                        <BarChart
                          width={500}
                          height={350}
                          data={stats.categories}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            vertical={false}
                          />
                          <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
                          <YAxis tick={{ fill: "#4b5563" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Products"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                          >
                            {stats.categories.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}{" "}
                {stats.roles && stats.roles.length > 0 && (
                  <motion.div variants={cardVariants}>
                    <Card className="bg-white shadow-sm border border-gray-100 rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          User Roles Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center py-6">
                        <PieChart width={500} height={350}>
                          <Pie
                            data={stats.roles}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={(entry) => {
                              const percent = entry.percent || 0;
                              return `${entry.name}: ${(percent * 100).toFixed(0)}%`;
                            }}
                            outerRadius={100}
                            animationDuration={1000}
                            dataKey="value"
                          >
                            {stats.roles.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}{" "}
                {stats.brands && stats.brands.length > 0 && (
                  <motion.div variants={cardVariants} className="lg:col-span-2">
                    <Card className="bg-white shadow-sm border border-gray-100 rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          Brand Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center py-6">
                        <BarChart
                          width={1000}
                          height={350}
                          data={stats.brands}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            vertical={false}
                          />
                          <XAxis dataKey="name" tick={{ fill: "#4b5563" }} />
                          <YAxis tick={{ fill: "#4b5563" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Products"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1000}
                          >
                            {stats.brands.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
