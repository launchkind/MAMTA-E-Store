import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function AnalyticsPage() {
  return (
    <PremiumFeaturePlaceholder
      title="Shopping Analytics"
      description="Track your shopping patterns, favorite categories, and monthly spending habits. Detailed analytics tracking is exclusively available in the premium source code."
      features={[
        "Monthly spending trend charts",
        "Order status distribution",
        "Favorite categories analysis",
        "Most purchased products list",
      ]}
    />
  );
}
