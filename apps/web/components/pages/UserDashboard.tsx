"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Heart,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
} from "lucide-react";
import {
  useUserStore,
  useCartStore,
  useWishlistStore,
  useOrderStore,
} from "@/lib/store";
import { useRouter } from "next/navigation";
import PriceFormatter from "@/components/common/PriceFormatter";

export default function UserDashboard() {
  const { authUser, auth_token } = useUserStore();
  const { cartItems } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const { orders, loadOrders } = useOrderStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth_token) {
        router.push("/auth/signin");
        return;
      }

      try {
        await loadOrders(auth_token);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth_token, router, loadOrders]);

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "shipped"
  ).length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <Package className="w-6 h-6" />,
      color: "bg-blue-500",
      link: "/user/orders",
    },
    {
      title: "Cart Items",
      value: cartItems.length,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-green-500",
      link: "/user/cart",
    },
    {
      title: "Wishlist",
      value: wishlistIds.length,
      icon: <Heart className="w-6 h-6" />,
      color: "bg-red-500",
      link: "/user/wishlist",
    },
    {
      title: "Total Spent",
      value: <PriceFormatter amount={totalSpent} />,
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-purple-500",
      link: "/user/analytics",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const quickActions = [
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: <Clock className="w-5 h-5" />,
      color: "text-yellow-600 bg-yellow-50",
      link: "/user/orders",
    },
    {
      title: "Completed Orders",
      value: completedOrders,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600 bg-green-50",
      link: "/user/orders",
    },
    {
      title: "Track Shipments",
      value: "View",
      icon: <Truck className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50",
      link: "/user/orders",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {authUser?.name}! 👋
        </h2>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`${stat.color} text-white p-3 rounded-lg shadow-sm`}
              >
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.link}
              className={`${action.color} border rounded-lg p-4 hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center gap-3">
                <div>{action.icon}</div>
                <div>
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-2xl font-bold">{action.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/user/orders"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/user/orders/${order._id}`}
                className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "delivered" ||
                          order.status === "shipped"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() +
                          order.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceFormatter
                      amount={order.total || 0}
                      className="text-lg font-bold text-gray-900"
                    />
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start shopping to see your orders here
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
