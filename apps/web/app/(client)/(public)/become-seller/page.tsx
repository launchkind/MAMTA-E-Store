import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function BecomeSellerPage() {
  return (
    <div className="py-10">
      <PremiumFeaturePlaceholder
        title="Apply as a Premium Vendor"
        description="Launch your storefront and start selling to millions of customers. The complete vendor registration, custom onboarding flows, and multi-step application management system is exclusively available in the premium source code."
        features={[
          "Customizable vendor storefronts",
          "Automated seller onboarding",
          "KYC document verification system",
          "Custom commission structures",
        ]}
      />
    </div>
  );
}
