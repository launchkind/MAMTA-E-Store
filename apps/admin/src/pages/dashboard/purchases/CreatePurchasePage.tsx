import PurchaseList from "@/components/purchases/PurchaseList";

export default function CreatePurchasePage() {
  return (
    <PurchaseList
      title="Purchase Requisitions"
      description="Create new requisitions and approve pending ones"
      status="requisition"
      showCreateButton
    />
  );
}
