import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellerConfigPage() {
  return (
    <PremiumFeaturePlaceholder
      title="Vendor Settings & Commission"
      description="Configure platform-wide vendor rules, set commission rates, and manage payment methods. The vendor configuration module is exclusively available in the premium source code."
      features={[
        "Global & category specific commission rules",
        "Stripe Vendor Connect integration",
        "Automated payout scheduling",
        "Seller requirement rules",
      ]}
    />
  );
}
