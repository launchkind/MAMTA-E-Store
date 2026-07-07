import React from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import {
  User,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Bell,
  Shield,
} from "lucide-react";
import Link from "next/link";

const AccountPage = () => {
  const accountSections = [
    {
      title: "Profile Information",
      icon: <User size={24} />,
      description: "Manage your personal information and preferences",
      href: "/user/profile",
      items: ["Name & Email", "Phone Number", "Date of Birth", "Preferences"],
    },
    {
      title: "Order History",
      icon: <Package size={24} />,
      description: "View and track all your past and current orders",
      href: "/user/orders",
      items: [
        "Recent Orders",
        "Order Tracking",
        "Download Invoices",
        "Reorder Items",
      ],
    },
    {
      title: "Wishlist",
      icon: <Heart size={24} />,
      description: "Keep track of items you want to purchase later",
      href: "/user/wishlist",
      items: ["Saved Items", "Share Wishlist", "Move to Cart", "Price Alerts"],
    },
    {
      title: "Shopping Cart",
      icon: <Package size={24} />,
      description: "Review items in your cart and proceed to checkout",
      href: "/user/cart",
      items: ["Cart Items", "Apply Coupons", "Shipping Options", "Checkout"],
    },
    {
      title: "Payment Methods",
      icon: <CreditCard size={24} />,
      description: "Manage your saved payment methods and billing information",
      href: "/user/profile",
      items: [
        "Saved Cards",
        "Billing Address",
        "Payment History",
        "Auto-Pay Settings",
      ],
    },
    {
      title: "Addresses",
      icon: <MapPin size={24} />,
      description: "Manage your shipping and billing addresses",
      href: "/user/profile",
      items: [
        "Default Address",
        "Shipping Addresses",
        "Billing Addresses",
        "Address Book",
      ],
    },
    {
      title: "Notifications",
      icon: <Bell size={24} />,
      description: "Control your email and SMS notification preferences",
      href: "/user/profile",
      items: [
        "Email Alerts",
        "SMS Notifications",
        "Push Notifications",
        "Marketing Emails",
      ],
    },
    {
      title: "Security",
      icon: <Shield size={24} />,
      description: "Manage your account security and privacy settings",
      href: "/user/profile",
      items: [
        "Change Password",
        "Two-Factor Auth",
        "Login History",
        "Privacy Settings",
      ],
    },
  ];

  const recentActivity = [
    {
      action: "Order placed",
      details: "Order #BS-123456 for $89.99",
      time: "2 hours ago",
    },
    {
      action: "Item added to wishlist",
      details: "Baby Monitor with Video",
      time: "1 day ago",
    },
    {
      action: "Address updated",
      details: "Shipping address changed",
      time: "3 days ago",
    },
    {
      action: "Order delivered",
      details: "Order #BS-123455 delivered successfully",
      time: "5 days ago",
    },
  ];

  const quickActions = [
    { title: "Track Order", icon: <Package size={20} />, href: "/track-order" },
    { title: "Start Return", icon: <Package size={20} />, href: "/returns" },
    {
      title: "Contact Support",
      icon: <User size={20} />,
      href: "/help/contact",
    },
    { title: "Browse Shop", icon: <Package size={20} />, href: "/shop" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="pt-6">
        <div className="max-w-6xl mx-auto">
          <PageBreadcrumb currentPage="My Account" items={[]} />
        </div>
      </Container>

      <Container className="py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Title className="text-4xl font-bold mb-4">My Account</Title>
            <p className="text-gray-600 text-lg">
              Manage your account settings, orders, and preferences
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="text-primary mb-2">{action.icon}</div>
                      <span className="text-sm font-medium text-center">
                        {action.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Sections */}
              <div className="grid md:grid-cols-2 gap-6">
                {accountSections.map((section, index) => (
                  <Link
                    key={index}
                    href={section.href}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-primary">{section.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {section.description}
                        </p>
                        <ul className="space-y-1">
                          {section.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="text-xs text-gray-500"
                            >
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Account Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since:</span>
                    <span>Jan 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total orders:</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total spent:</span>
                    <span>$1,234.56</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loyalty points:</span>
                    <span className="text-primary font-semibold">
                      2,500
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-primary pl-4"
                    >
                      <div className="font-medium text-sm">
                        {activity.action}
                      </div>
                      <div className="text-xs text-gray-600">
                        {activity.details}
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Links */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <Link
                    href="/help"
                    className="block text-sm text-primary hover:underline"
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/help/contact"
                    className="block text-sm text-primary hover:underline"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/help/shipping"
                    className="block text-sm text-primary hover:underline"
                  >
                    Shipping Info
                  </Link>
                  <Link
                    href="/returns"
                    className="block text-sm text-primary hover:underline"
                  >
                    Returns & Exchanges
                  </Link>
                </div>
              </div>

              {/* Loyalty Program */}
              <div className="bg-linear-to-br from-primary to-blue-600 rounded-lg p-6 text-white">
                <h3 className="font-semibold text-lg mb-2">Loyalty Rewards</h3>
                <p className="text-sm opacity-90 mb-3">
                  You have 2,500 points! Redeem for discounts on your next
                  purchase.
                </p>
                <button className="bg-white text-primary px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                  View Rewards
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AccountPage;
