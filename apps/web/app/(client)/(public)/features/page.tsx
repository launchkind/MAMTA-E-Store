import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

const FeaturesPage = () => {
  return (
    <PremiumFeaturePlaceholder
      title="Featured Products"
      description="Explore our hand-picked selection of premium featured products. This curated showcase is exclusively available in the premium source code."
      features={[
        "Interactive featured product displays",
        "Advanced filtering by featured categories",
        "Customizable featured sections",
        "Priority access to new features",
      ]}
    />
  );
};

export default FeaturesPage;
