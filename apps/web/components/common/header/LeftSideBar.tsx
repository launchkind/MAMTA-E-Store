"use client";

import { motion } from "framer-motion";
import React from "react";
import {
  User,
  X,
  Package,
  Heart,
  ShoppingBag,
  UserCircle,
  Home,
  Store,
  HelpCircle,
  Tag,
  Baby,
  Truck,
  Phone,
  Star,
} from "lucide-react";
import { useOutsideClick } from "../../../hooks";
import Link from "next/link";
import Image from "next/image";
import { smallLogo } from "../../../assets/image";
import { Button } from "../../../components/ui/button";
import { useUserStore } from "../../../lib/store";
import Logo from "../Logo";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const LeftSideBar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  const { isAuthenticated, authUser, logoutUser } = useUserStore();

  const handleLogout = () => {
    logoutUser();
    onClose();
  };
  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-50 w-full bg-foreground/50 shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform ease-in-out duration-300`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-background text-foreground z-50 h-screen border-r border-r-tech_orange flex flex-col gap-6 relative"
      >
        <div className="flex items-center justify-between border-b pb-4 p-5 bg-primary">
          <Logo />
        </div>
        <div className="flex flex-col justify-between flex-1 px-5 overflow-hidden">
          <div className="overflow-y-auto flex-1 pr-2">
            {/* Quick Links Section */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/shop"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Store size={18} />
                  <span>Shop All</span>
                </Link>
                <Link
                  href="/shop?sortOrder=desc"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Star size={18} />
                  <span>New Arrivals</span>
                </Link>
                <Link
                  href="/shop?priceRange=0-50"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Tag size={18} />
                  <span>Under $50</span>
                </Link>
              </div>
            </div>

            {/* Shop by Age Section */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Shop by Age
              </h3>
              <div className="space-y-2">
                <Link
                  href="/shop?search=newborn"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Baby size={18} />
                  <span>Newborn (0-6 Months)</span>
                </Link>
                <Link
                  href="/shop?search=infant"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Baby size={18} />
                  <span>Infant (6-12 Months)</span>
                </Link>
                <Link
                  href="/shop?search=toddler"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Baby size={18} />
                  <span>Toddler (1-2 Years)</span>
                </Link>
                <Link
                  href="/shop?search=kids"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Baby size={18} />
                  <span>Kids (2+ Years)</span>
                </Link>
              </div>
            </div>

            {isAuthenticated && authUser ? (
              <div className="space-y-4 mb-6">
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-lg">{authUser.name}</p>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  My Account
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/user/profile"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/user/orders"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <Package size={18} />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/user/wishlist"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <Heart size={18} />
                    <span>My Wishlist</span>
                  </Link>
                  <Link
                    href="/user/cart"
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={onClose}
                  >
                    <ShoppingBag size={18} />
                    <span>My Cart</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Access your account to view orders and wishlist
                </p>
              </div>
            )}

            {/* Help & Support Section */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Help & Support
              </h3>
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <HelpCircle size={18} />
                  <span>Help Center</span>
                </Link>
                <Link
                  href="/help/shipping"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Truck size={18} />
                  <span>Shipping Info</span>
                </Link>
                <Link
                  href="/help/contact"
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  <Phone size={18} />
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
          {/* Fixed Footer Section */}
          <div className="py-4 border-t bg-white">
            <div className="space-y-3">
              {isAuthenticated && authUser ? (
                <Button
                  className="w-full py-5.5 text-base font-semibold"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <p className="flex items-center gap-1 font-medium">
                    <User /> My Account
                  </p>
                  <Link href="/auth/signin" onClick={onClose}>
                    <Button className="w-full py-5.5 text-base font-semibold mb-2">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={onClose}>
                    <Button
                      className="w-full py-5.5 text-base font-semibold"
                      variant="outline"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-background hover:text-accent hoverEffect absolute top-3 -right-7"
        >
          <X />
        </button>
      </motion.div>
    </div>
  );
};

export default LeftSideBar;
