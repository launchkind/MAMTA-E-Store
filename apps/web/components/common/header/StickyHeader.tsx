"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../Container";
import Logo from "../Logo";
import SearchInput from "./SearchInput";
import CartIcon from "./CartIcon";
import SellerBadge from "./SellerBadge";
import UserButton from "./UserButton";
import MobileUserIcon from "./MobileUserIcon";
import CompareIcon from "./CompareIcon";

interface StickyHeaderProps {
  logoUrl?: string | null;
  baseConfig?: any;
}

const StickyHeader = ({ logoUrl, baseConfig }: StickyHeaderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md border-b shadow-sm"
        >
          <Container className="flex items-center justify-between gap-10 py-3">
            <div className="flex flex-1 items-center gap-5">
              {/* Logo */}
              <div className="shrink-0 w-auto">
                <Logo logoUrl={logoUrl} />
              </div>

              {/* Search */}
              <div className="flex flex-1 items-center justify-center max-w-2xl mx-auto">
                <SearchInput config={baseConfig?.search} className="w-full" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 shrink-0 justify-end">
                <div className="hidden lg:flex items-center gap-4">
                  <CompareIcon />
                  <CartIcon />
                  <SellerBadge />
                  <UserButton />
                </div>

                {/* Mobile Actions subset if needed, or keeping it clean for mobile */}
                <div className="lg:hidden flex items-center gap-3">
                  <CompareIcon />
                  <CartIcon />
                  <MobileUserIcon />
                </div>
              </div>
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyHeader;
