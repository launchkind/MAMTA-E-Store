"use client";

import { motion } from "framer-motion";
import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellerSettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 min-h-[60vh] flex flex-col justify-center"
    >
      <PremiumFeaturePlaceholder 
        title="Store Settings & Payouts"
        description="Advanced vendor configuration, including automated banking payout routing and customizable storefront branding, is exclusive to the premium source codebase."
        features={[
          "Automated Stripe Connect routing for vendor payouts",
          "Customizable public vendor storefronts and branding",
          "Tiered commission rate visibility and fee structures",
          "Advanced shipping zone and rate configuration per vendor"
        ]}
      />
    </motion.div>
  );
}
