"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { newsletterPopup } from "@/assets/image";
import { createClient } from "@/lib/supabase/client";

interface SubscriptionModalProps {
  delay?: number; // Delay in milliseconds before showing the modal
  forceShow?: boolean; // Force show the modal for testing
}

export default function SubscriptionModal({
  delay = 3000,
  forceShow = false,
}: SubscriptionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    if (!isMounted) return;

    // Check if user has already seen or dismissed the modal
    const hasSeenModal = localStorage.getItem(
      "newsletter_popup_dismissed_permanently",
    );
    const isSubscribed = localStorage.getItem("user_subscribed");

    // Show if they haven't seen it (or clicked Don't Show Again) and aren't subscribed
    if (forceShow || (!hasSeenModal && !isSubscribed)) {
      if (pathname === "/") {
        setIsOpen(false); // Reset State
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }
  }, [delay, isMounted, forceShow, pathname]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email", {
        className: "bg-red-50 text-gray-800 border-red-200",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", {
        className: "bg-red-50 text-gray-800 border-red-200",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("subscriptions").upsert(
        {
          email,
          source: "homepage_modal",
          is_active: true,
          preferences: { newsletter: true, promotions: true, newProducts: true },
        },
        { onConflict: "email" }
      );

      if (error) throw error;

      localStorage.setItem("user_subscribed", "true");
      localStorage.setItem("subscription_email", email);

      toast.success("Successfully subscribed!", {
        description: "You'll receive notifications about our latest posts.",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });

      setIsOpen(false);
      setEmail("");
    } catch (error) {
      toast.error("Subscription failed", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
        className: "bg-red-50 text-gray-800 border-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="subscription-modal-wrapper">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-[800px] max-w-[95vw] h-[500px] bg-white shadow-2xl overflow-hidden flex"
              >
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Left Side - Image */}
                <div className="w-1/2 relative hidden md:block border-r border-gray-100">
                  <Image
                    src={newsletterPopup}
                    alt="Newsletter Popup"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                {/* Right Side - Content */}
                <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center bg-white text-center">
                  <h2 className="text-2xl font-bold mb-1">
                    Join our newsletter and get
                  </h2>
                  <h2 className="text-2xl font-bold mb-8">
                    <span className="text-red-500">20%</span> Off your first
                    order
                  </h2>

                  <form
                    onSubmit={handleSubscribe}
                    className="space-y-4 w-full px-4"
                  >
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12 border-gray-300 w-full text-center"
                    />

                    <div className="flex gap-2 w-full">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 font-bold bg-black text-white hover:bg-gray-900 rounded-md"
                      >
                        {isLoading ? "Subscribing..." : "Subscribe"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 font-bold border-gray-300 hover:bg-gray-50 rounded-md gap-2"
                        asChild
                      >
                        <a
                          href={
                            process.env.NEXT_PUBLIC_PURCHASE_LINK ||
                            "https://buymeacoffee.com/reactbd/extras"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Code2 className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            Get Source Code
                          </span>
                          <span className="sm:hidden">Source</span>
                        </a>
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                      <input
                        type="checkbox"
                        id="dont-show"
                        className="rounded border-gray-300 text-black focus:ring-black"
                        onChange={(e) => {
                          if (e.target.checked) {
                            localStorage.setItem(
                              "newsletter_popup_dismissed_permanently",
                              "true",
                            );
                          } else {
                            localStorage.removeItem(
                              "newsletter_popup_dismissed_permanently",
                            );
                          }
                        }}
                      />
                      <label htmlFor="dont-show">
                        Don't show this popup again
                      </label>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable subscription hook for use in other components
export const useSubscribe = () => {
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (email: string, source: string = "footer") => {
    if (!email) {
      toast.error("Please enter your email", {
        className: "bg-red-50 text-gray-800 border-red-200",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", {
        className: "bg-red-50 text-gray-800 border-red-200",
      });
      return false;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("subscriptions").upsert(
        {
          email,
          source,
          is_active: true,
          preferences: { newsletter: true, promotions: true, newProducts: true },
        },
        { onConflict: "email" }
      );

      if (error) throw error;

      localStorage.setItem("user_subscribed", "true");
      localStorage.setItem("subscription_email", email);

      toast.success("Successfully subscribed!", {
        description: "You'll receive our latest updates and offers.",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });

      return true;
    } catch (error) {
      toast.error("Subscription failed", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
        className: "bg-red-50 text-gray-800 border-red-200",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { subscribe, isLoading };
};
