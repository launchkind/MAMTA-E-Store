"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/common/Container";
import { Title } from "@/components/common/text";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import {
  Truck,
  Search,
  Clock,
  Package2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store";
import { useAuthSidebarStore } from "@/lib/useAuthSidebarStore";

const TrackOrderClient = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const { openLogin } = useAuthSidebarStore();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Prefill email if authenticated
  useEffect(() => {
    if (isAuthenticated && authUser?.email) {
      setEmail(authUser.email);
    } else {
      setEmail("");
    }
  }, [isAuthenticated, authUser]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (trackingNumber.trim()) {
      setIsSearching(true);
      // Simulate API call for the demo
      setTimeout(() => {
        setIsSearching(false);
        setHasSearched(true);
      }, 1000);
    }
  };

  const trackingSteps = [
    {
      status: "Order Confirmed",
      description: "Your order has been received and confirmed",
      icon: <CheckCircle size={20} />,
      completed: true,
    },
    {
      status: "Processing",
      description: "We're preparing your items for shipment",
      icon: <Package2 size={20} />,
      completed: true,
    },
    {
      status: "Shipped",
      description: "Your order has been picked up by our shipping partner",
      icon: <Truck size={20} />,
      completed: false,
      current: true,
    },
    {
      status: "Out for Delivery",
      description: "Your package is on its way to you",
      icon: <Truck size={20} />,
      completed: false,
    },
    {
      status: "Delivered",
      description: "Your order has been delivered",
      icon: <CheckCircle size={20} />,
      completed: false,
    },
  ];

  const faqItems = [
    {
      question: "How do I track my order?",
      answer:
        "You can track your order using the tracking number sent to your email, or by logging into your account and viewing your order history.",
    },
    {
      question: "When will I receive my tracking number?",
      answer:
        "You'll receive a tracking number via email within 24-48 hours after your order ships.",
    },
    {
      question: "My tracking shows 'Label Created' - what does this mean?",
      answer:
        "This means we've generated a shipping label for your package. It will be picked up by the carrier within 1-2 business days.",
    },
    {
      question: "What if my tracking hasn't updated?",
      answer:
        "Tracking information can sometimes take 24-48 hours to update. If there's still no update after this time, please contact our support team.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Container className="pt-6">
        <PageBreadcrumb currentPage="Track Order" items={[]} />
      </Container>

      <Container className="py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Title className="text-4xl font-bold mb-4">Track Your Order</Title>
            <p className="text-gray-600 text-lg">
              Enter your tracking number to verify the latest shipping and
              delivery status.
            </p>
          </div>

          {/* Order Tracking Form */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Truck className="text-primary w-6 h-6" /> Track Your Package
            </h2>

            <form onSubmit={handleTrackSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number or Tracking Number
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., BS-123456 or 1Z999AA1234567890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                  {!isAuthenticated && (
                    <span className="text-xs font-normal text-destructive ml-2">
                      (Sign In Required)
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={email}
                  disabled={!isAuthenticated}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? "your-email@example.com"
                      : "Sign in to unlock verification"
                  }
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                    !isAuthenticated
                      ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  }`}
                />
              </div>

              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={!trackingNumber.trim() || isSearching}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg hover:bg-primary/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.99]"
                >
                  {isSearching ? "Searching Records..." : "Track Order"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="w-full bg-primary/10 border border-primary text-primary py-3.5 rounded-lg hover:bg-primary/20 transition-all font-medium flex items-center justify-center gap-2"
                >
                  Sign in to continue
                </button>
              )}
            </form>
          </div>

          {/* Sample Tracking Result (Only visible when authenticated and form successfully submitted) */}
          {isAuthenticated && hasSearched && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Order #{trackingNumber.toUpperCase()}
                  </h3>
                  <p className="text-green-600 font-medium mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Estimated delivery: Tomorrow,
                    Dec 25
                  </p>
                </div>
                <div className="md:text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    Carrier Tracking
                  </div>
                  <div className="font-mono text-sm text-gray-800">
                    1Z999AA1234567890
                  </div>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {trackingSteps.map((step, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    {/* Icon Bubble */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xs transition-colors ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : step.current
                            ? "bg-primary text-primary-foreground animate-pulse"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>

                    {/* Content Box */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:border-gray-200 transition-colors">
                      <div
                        className={`font-semibold mb-1 flex items-center justify-between ${
                          step.completed || step.current
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {step.status}
                        {step.current && (
                          <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-sm leading-snug ${
                          step.completed || step.current
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 text-center hover:border-primary/20 transition-colors group">
              <div className="w-12 h-12 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package2 className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">My Orders</h3>
              <p className="text-gray-500 text-sm mb-5 min-h-[40px]">
                See all your recent history and their statuses
              </p>
              <Link
                href="/user/orders"
                className="inline-block w-full bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors font-medium"
              >
                View History
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 text-center hover:border-orange-500/20 transition-colors group">
              <div className="w-12 h-12 mx-auto bg-orange-500/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AlertCircle className="text-orange-500" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Report an Issue</h3>
              <p className="text-gray-500 text-sm mb-5 min-h-[40px]">
                Package missing, delayed, or damaged? Let us know.
              </p>
              <Link
                href="/help/contact"
                className="inline-block w-full border border-orange-200 text-orange-600 bg-orange-50 px-4 py-2.5 rounded-lg text-sm hover:bg-orange-100 transition-colors font-medium"
              >
                Contact Support
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 text-center hover:border-primary/20 transition-colors group">
              <div className="w-12 h-12 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Delivery Texts</h3>
              <p className="text-gray-500 text-sm mb-5 min-h-[40px]">
                Get live SMS notifications for delivery updates.
              </p>
              <button className="w-full border border-primary text-primary px-4 py-2.5 rounded-lg text-sm hover:bg-primary/5 transition-colors font-medium">
                Enable SMS Updates
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-400" /> Carrier Info
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 text-sm tracking-wide uppercase">
                    Delivery Times
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-700">
                        Standard:
                      </span>
                      <span>3-5 business days</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-700">
                        Express:
                      </span>
                      <span>1-2 business days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Overnight:
                      </span>
                      <span>Next business day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" /> FAQs
              </h2>
              <div className="space-y-5">
                {faqItems.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <h3 className="font-medium text-gray-900 text-sm mb-1.5">
                      {item.question}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Need More Help */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-8 mt-10 text-center">
            <h3 className="text-xl font-bold mb-3 text-primary">
              Need More Help?
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Can&apos;t find your order or have questions about courier routes?
              Our support team is here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/help/contact"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
              >
                Contact Support
              </Link>
              <Link
                href="/help"
                className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TrackOrderClient;
