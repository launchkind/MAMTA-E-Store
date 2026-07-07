import PurchaseList from "@/components/purchases/PurchaseList";

export default function ApprovedPurchasePage() {
  return (
    <PurchaseList
      title="Approved Purchases"
      description="Approved requisitions waiting to be purchased from the supplier"
      status="approved"
    />
  );
}
