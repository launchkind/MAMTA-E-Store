import { createClient } from "./supabase/client";

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface AddressInput {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

function mapRow(row: Record<string, unknown>): Address {
  return {
    _id: row.id as string,
    street: row.street as string,
    city: row.city as string,
    state: row.state as string,
    country: row.country as string,
    postalCode: row.postal_code as string,
    isDefault: row.is_default as boolean,
  };
}

export const addAddress = async (
  userId: string,
  addressData: AddressInput,
  _token?: string
): Promise<{ success: boolean; addresses: Address[]; message: string }> => {
  const supabase = createClient();

  if (addressData.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: userId,
    street: addressData.street,
    city: addressData.city,
    state: addressData.state || "",
    country: addressData.country,
    postal_code: addressData.postalCode,
    is_default: addressData.isDefault || false,
  });

  if (error) throw new Error(error.message);

  const { data, error: fetchError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (fetchError) throw new Error(fetchError.message);

  return {
    success: true,
    addresses: (data || []).map(mapRow),
    message: "Address added successfully",
  };
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  addressData: Partial<AddressInput>,
  _token?: string
): Promise<{ success: boolean; addresses: Address[]; message: string }> => {
  const supabase = createClient();

  if (addressData.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const updatePayload: Record<string, unknown> = {};
  if (addressData.street !== undefined) updatePayload.street = addressData.street;
  if (addressData.city !== undefined) updatePayload.city = addressData.city;
  if (addressData.state !== undefined) updatePayload.state = addressData.state;
  if (addressData.country !== undefined) updatePayload.country = addressData.country;
  if (addressData.postalCode !== undefined) updatePayload.postal_code = addressData.postalCode;
  if (addressData.isDefault !== undefined) updatePayload.is_default = addressData.isDefault;

  const { error } = await supabase
    .from("addresses")
    .update(updatePayload)
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const { data, error: fetchError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (fetchError) throw new Error(fetchError.message);

  return {
    success: true,
    addresses: (data || []).map(mapRow),
    message: "Address updated successfully",
  };
};

export const deleteAddress = async (
  userId: string,
  addressId: string,
  _token?: string
): Promise<{ success: boolean; addresses: Address[]; message: string }> => {
  const supabase = createClient();

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const { data, error: fetchError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (fetchError) throw new Error(fetchError.message);

  return {
    success: true,
    addresses: (data || []).map(mapRow),
    message: "Address deleted successfully",
  };
};
