"use client";

import { motion } from "framer-motion";
import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellerAnalyticsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 min-h-[60vh] flex flex-col justify-center"
    >
      <PremiumFeaturePlaceholder 
        title="Vendor Sales Analytics"
        description="Providing independent sellers with deep insights into their sales performance, customer demographics, and revenue metrics is a premium capability."
        features={[
          "Real-time revenue, order volume, and conversion dashboards",
          "Product performance and category breakdown reports",
          "Historical sales comparison and forecasting tools",
          "Exportable financial statements for tax and accounting"
        ]}
      />
    </motion.div>
  );
}
