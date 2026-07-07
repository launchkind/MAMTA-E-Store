"use client";

import { motion } from "framer-motion";
import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellerProductsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 min-h-[60vh] flex flex-col justify-center"
    >
      <PremiumFeaturePlaceholder 
        title="Vendor Product Management"
        description="Empowering third-party sellers to independently create, update, and manage their own product catalogs is a powerful multi-vendor capability exclusive to the premium source codebase."
        features={[
          "Vendor-specific product creation and variant management",
          "Independent stock synchronization and alerts",
          "Automated product approval workflows by site admins",
          "SEO optimization tools for individual vendor listings"
        ]}
      />
    </motion.div>
  );
}
