import PremiumFeaturePlaceholder from "@/components/common/PremiumFeaturePlaceholder";

export default function InvoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage invoices for your orders
          </p>
        </div>
      </div>
      
      <PremiumFeaturePlaceholder
        title="Invoice Generation"
        description="Generating, downloading, and sharing professional PDF invoices for orders is strictly reserved for the premium version of the codebase."
        features={[
          "Auto-generated PDF invoices",
          "Customizable invoice templates",
          "Direct invoice sharing via email/social",
          "Printable invoice formats",
        ]}
      />
    </div>
  );
}
