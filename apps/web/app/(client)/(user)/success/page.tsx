import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/orderApi";
import SuccessPageClient from "@/components/pages/SuccessPageClient";
import { SuccessPageSkeleton } from "@/components/skeleton";

async function fetchOrderServer(orderId: string): Promise<Order | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, user_id, status, payment_status, payment_method, total,
        shipping_street, shipping_city, shipping_state, shipping_country, shipping_postal_code,
        created_at, updated_at,
        order_items(product_id, name, price, quantity, image, variant_label)
      `)
      .eq("id", orderId)
      .single();

    if (error || !data) return null;

    return {
      _id: data.id,
      userId: data.user_id,
      status: data.status,
      paymentStatus: data.payment_status,
      paymentMethod: data.payment_method,
      total: data.total,
      shippingAddress: {
        street: data.shipping_street,
        city: data.shipping_city,
        state: data.shipping_state,
        country: data.shipping_country,
        postalCode: data.shipping_postal_code,
      },
      items: ((data as { order_items?: Array<{ product_id: string; name: string; price: number; quantity: number; image?: string; variant_label?: string }> }).order_items || []).map((item) => ({
        productId: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variantLabel: item.variant_label,
      })),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPaid: data.payment_status === "paid",
    };
  } catch {
    return null;
  }
}

interface Props {
  searchParams: Promise<{
    orderId?: string;
    session_id?: string;
    payment?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId;

  let initialOrder: Order | null = null;

  if (orderId) {
    initialOrder = await fetchOrderServer(orderId);
  }

  return (
    <Suspense fallback={<SuccessPageSkeleton />}>
      <SuccessPageClient initialOrder={initialOrder} />
    </Suspense>
  );
}
