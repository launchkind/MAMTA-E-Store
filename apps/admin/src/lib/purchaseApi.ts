import { supabase } from "@/lib/supabase";

export type PurchaseStatus =
  | "requisition"
  | "approved"
  | "purchased"
  | "received"
  | "cancelled";

export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface PurchaseItem {
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  purchase_price: number;
  profit_margin: number;
  selling_price: number;
  total_cost: number;
}

export interface Purchase {
  id: string;
  purchase_number: string;
  status: PurchaseStatus;
  total_amount: number;
  supplier_id: string | null;
  supplier_name: string;
  supplier_contact: string | null;
  supplier_email: string | null;
  supplier_address: string | null;
  notes: string | null;
  created_by_name: string;
  approved_by_name: string | null;
  approved_at: string | null;
  purchased_by_name: string | null;
  purchased_at: string | null;
  received_by_name: string | null;
  received_at: string | null;
  created_at: string;
  purchase_items: PurchaseItem[];
}

export interface CurrentUser {
  id: string;
  name: string;
}

const PURCHASE_SELECT = "*, purchase_items(*)";

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []) as Supplier[];
}

export async function saveSupplier(
  supplier: Partial<Supplier> & { name: string },
  id?: string
): Promise<void> {
  if (id) {
    const { error } = await supabase
      .from("suppliers")
      .update(supplier)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("suppliers").insert(supplier);
    if (error) throw error;
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}

// ─── Purchases ────────────────────────────────────────────────────────────────

export async function fetchPurchases(
  status?: PurchaseStatus
): Promise<Purchase[]> {
  let query = supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Purchase[];
}

export async function createRequisition(
  user: CurrentUser,
  supplier: {
    supplierId?: string;
    name: string;
    email?: string;
    contact?: string;
    address?: string;
  },
  items: PurchaseItem[],
  notes?: string
): Promise<void> {
  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({
      purchase_number: "",
      status: "requisition",
      supplier_id: supplier.supplierId || null,
      supplier_name: supplier.name,
      supplier_email: supplier.email || null,
      supplier_contact: supplier.contact || null,
      supplier_address: supplier.address || null,
      notes: notes || "",
      created_by: user.id,
      created_by_name: user.name,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("purchase_items").insert(
    items.map((i) => ({
      purchase_id: purchase.id,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      purchase_price: i.purchase_price,
      profit_margin: i.profit_margin,
      selling_price: i.selling_price,
      total_cost: i.total_cost,
    }))
  );
  if (itemsError) throw itemsError;

  await supabase.from("purchase_status_history").insert({
    purchase_id: purchase.id,
    status: "requisition",
    changed_by: user.id,
    changed_by_name: user.name,
    notes: "Requisition created",
  });
}

export async function updatePurchaseStatus(
  purchase: Purchase,
  newStatus: PurchaseStatus,
  user: CurrentUser,
  notes?: string
): Promise<void> {
  const now = new Date().toISOString();
  const update: Record<string, unknown> = { status: newStatus };

  if (newStatus === "approved") {
    update.approved_by = user.id;
    update.approved_by_name = user.name;
    update.approved_at = now;
    if (notes) update.approved_notes = notes;
  } else if (newStatus === "purchased") {
    update.purchased_by = user.id;
    update.purchased_by_name = user.name;
    update.purchased_at = now;
    if (notes) update.purchased_notes = notes;
  } else if (newStatus === "received") {
    update.received_by = user.id;
    update.received_by_name = user.name;
    update.received_at = now;
    update.actual_delivery_date = now;
    if (notes) update.received_notes = notes;
  }

  const { error } = await supabase
    .from("purchases")
    .update(update)
    .eq("id", purchase.id);
  if (error) throw error;

  await supabase.from("purchase_status_history").insert({
    purchase_id: purchase.id,
    status: newStatus,
    changed_by: user.id,
    changed_by_name: user.name,
    notes: notes || "",
  });

  // When goods are received, add them to product stock and apply new selling price
  if (newStatus === "received") {
    for (const item of purchase.purchase_items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      if (product) {
        await supabase
          .from("products")
          .update({
            stock: (product.stock || 0) + item.quantity,
            price: item.selling_price,
          })
          .eq("id", item.product_id);
      }
    }
  }
}
