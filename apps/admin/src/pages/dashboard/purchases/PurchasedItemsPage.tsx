import PurchaseList from "@/components/purchases/PurchaseList";

export default function PurchasedItemsPage() {
  return (
    <PurchaseList
      title="Purchased Items"
      description="Purchased orders in transit — mark received to add items to stock"
      status="purchased"
    />
  );
}
