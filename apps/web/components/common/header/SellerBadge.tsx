"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../lib/store";
import { createClient } from "@/lib/supabase/client";

const SellerBadge = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const [isSeller, setIsSeller] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      checkSellerStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  const checkSellerStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data: seller } = await supabase
        .from("sellers")
        .select("id, status")
        .eq("user_id", session.user.id)
        .single();

      if (seller) {
        setIsSeller(true);
        setSellerStatus(seller.status);
      }
    } catch (error) {
      console.error("Failed to check seller status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href="/seller" className="relative group" title="Seller Dashboard">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground transition-all">
        <Store className="h-5 w-5 text-primary" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
        </span>
      </div>
    </Link>
  );
};

export default SellerBadge;
