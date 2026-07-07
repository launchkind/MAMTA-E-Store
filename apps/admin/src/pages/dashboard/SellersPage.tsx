import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellersPage() {
  return (
    <PremiumFeaturePlaceholder
      title="Vendor Management"
      description="Review, approve, and manage vendor accounts and configurations. Access to the full Multi-vendor Admin toolkit is exclusively available in the premium source code."
      features={[
        "Approve & reject vendor applications",
        "Monitor individual seller performance",
        "Manage vendor commission payouts",
        "Enforce platform-wide vendor rules",
      ]}
    />
  );
}
