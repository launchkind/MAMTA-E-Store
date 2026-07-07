import PurchaseList from "@/components/purchases/PurchaseList";

export default function PurchasesPage() {
  return (
    <PurchaseList
      title="Purchases"
      description="All purchase orders — requisition, approved, purchased, received"
      showCreateButton
    />
  );
}
