"use client";

import { motion } from "framer-motion";
import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellerDashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 min-h-[60vh] flex flex-col justify-center"
    >
      <PremiumFeaturePlaceholder 
        title="Multi-Vendor Seller Dashboard"
        description="Providing an intuitive, dedicated dashboard for third-party sellers to manage their own products, orders, and sales analytics is a powerful multi-vendor capability exclusive to the premium source codebase."
        features={[
          "Dedicated seller portal with independent authentication",
          "Comprehensive sales and revenue analytics per vendor",
          "Decentralized product and inventory management",
          "Direct payout and store settings configuration"
        ]}
      />
    </motion.div>
  );
}
