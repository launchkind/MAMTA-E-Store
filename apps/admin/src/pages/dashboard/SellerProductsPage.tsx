import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function SellerProductsPage() {
  return (
    <PremiumFeaturePlaceholder
      title="Vendor Product Moderation"
      description="Review and approve products uploaded by vendors before they go live. The vendor product moderation queue is exclusively available in the premium source code."
      features={[
        "Approve or reject vendor products",
        "Enforce global pricing constraints",
        "Ensure content quality guidelines",
        "Bulk moderation capabilities",
      ]}
    />
  );
}
