"use client";
import dynamic from "next/dynamic";
import TopBanner from "./TopBanner";
import Container from "../Container";
import SearchInput from "./SearchInput";
import UserButton from "./UserButton";
import CartIcon from "./CartIcon";
import Logo from "../Logo";
import SellerBadge from "./SellerBadge";
import BottomHeader from "./BottomHeader";
import StickyHeader from "./StickyHeader";
import MobileUserIcon from "./MobileUserIcon";
import CompareIcon from "./CompareIcon";
import { Search, X } from "lucide-react";
import { useMobileSearchStore } from "@/lib/useMobileSearchStore";

// Dynamically import Sidebar with no SSR to prevent hydration issues
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
});

// Dynamically import AuthSidebar with no SSR
const AuthSidebar = dynamic(() => import("./AuthSidebar"), {
  ssr: false,
});

// Dynamically import CartSidebar with no SSR
const CartSidebar = dynamic(() => import("./CartSidebar"), {
  ssr: false,
});

// Mobile search toggle button — controls SearchInput's mobile overlay via shared store
const MobileSearchButton = () => {
  const { showSearch, toggle } = useMobileSearchStore();
  return (
    <button
      onClick={toggle}
      className="hover:text-accent hoverEffect"
      aria-label={showSearch ? "Close search" : "Open search"}
    >
      {showSearch ? <X size={24} /> : <Search size={24} />}
    </button>
  );
};

// Unused — SearchInput already provides a mobile search toggle button

// Unused — SearchInput already provides a mobile search toggle button

const Header = ({
  logoUrl,
  baseConfig,
  categories,
}: {
  logoUrl?: string | null;
  baseConfig?: any;
  categories?: any[];
}) => {
  return (
    <header className="border-b top-0 z-50 bg-gradient-to-b from-neutral-800 to-black text-primary-foreground">
      <TopBanner />

      <Container className="flex items-center justify-between py-4 lg:py-5">
        <div className="flex flex-1 items-center gap-3 lg:gap-5">
          {/* Logo Section */}
          <div className="flex items-center gap-2 shrink-0 lg:min-w-72">
            {baseConfig?.sidebar !== false && <Sidebar />}
            <div className="w-auto">
              <Logo logoUrl={logoUrl} />
            </div>
          </div>

          {/* Search & Actions Section */}
          <div className="flex lg:flex-1 items-center justify-end gap-5 order-3 lg:order-0">
            <SearchInput config={baseConfig?.search} className="lg:flex-1" />

            <div className="hidden lg:flex items-center gap-5 shrink-0">
              <CompareIcon />
              <CartIcon />
              <SellerBadge />
              <UserButton />
            </div>
          </div>

          {/* Mobile Actions: Search | Cart | User avatar */}
          <div className="lg:hidden flex items-center gap-3 shrink-0 ml-auto order-2">
            <MobileSearchButton />
            <CompareIcon />
            <CartIcon />
            <MobileUserIcon />
          </div>
        </div>
      </Container>
      {/* bottom header */}
      <BottomHeader
        config={baseConfig?.bottomHeader}
        categories={categories || []}
      />
      <StickyHeader logoUrl={logoUrl} baseConfig={baseConfig} />
      <AuthSidebar />
      <CartSidebar />
    </header>
  );
};

export default Header;
