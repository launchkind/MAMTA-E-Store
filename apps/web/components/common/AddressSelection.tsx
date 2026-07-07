"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { MapPinIcon, PlusIcon, Edit2Icon, Trash2Icon } from "@/lib/icons";
import { toast } from "sonner";
import { AddressSheet, type AddressFormData } from "../shared/AddressSheet";
import { useUserStore } from "../../lib/store";
import {
  deleteAddress,
  updateAddress,
  addAddress,
  type Address,
} from "@/lib/addressApi";

interface AddressSelectionProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  addresses: Address[];
  onAddressesUpdate: (addresses: Address[]) => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  selectedAddress,
  onAddressSelect,
  addresses,
  onAddressesUpdate,
}) => {
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<
    (AddressFormData & { _id?: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const { authUser, auth_token, updateUser } = useUserStore();

  const handleAddressSubmit = async (data: AddressFormData) => {
    if (!authUser || !auth_token) return;

    setIsLoading(true);

    try {
      if (editingAddress && editingAddress._id) {
        // Update existing address using the proper API
        const response = await updateAddress(
          authUser._id,
          editingAddress._id,
          data,
          auth_token
        );

        if (response.success && response.addresses) {
          onAddressesUpdate(response.addresses as Address[]);
          updateUser({
            ...authUser,
            // @ts-expect-error - Address type mismatch between packages
            addresses: response.addresses,
          });
          toast.success("Address updated successfully");
          setIsAddressSheetOpen(false);
          setEditingAddress(null);
        }
      } else {
        // Add new address using the proper API
        const response = await addAddress(authUser._id, data, auth_token);

        if (response.success && response.addresses) {
          onAddressesUpdate(response.addresses as Address[]);
          updateUser({
            ...authUser,
            // @ts-expect-error - Address type mismatch between packages
            addresses: response.addresses,
          });
          toast.success("Address added successfully");
          setIsAddressSheetOpen(false);
        }
      }
    } catch (error) {
      console.error("Address save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress({
      _id: address._id,
      country: address.country,
      state: address.state || "",
      city: address.city,
      street: address.street,
      postalCode: address.postalCode,
      isDefault: address.isDefault || false,
    });
    setIsAddressSheetOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!authUser || !auth_token) return;
    if (!addressId) {
      console.error("Delete address called without addressId");
      toast.error("Invalid address ID");
      return;
    }

    setIsLoading(true);

    try {
      // Use the proper delete API endpoint
      const response = await deleteAddress(authUser._id, addressId, auth_token);

      if (response.success && response.addresses) {
        onAddressesUpdate(response.addresses as Address[]);
        updateUser({
          ...authUser,
          // @ts-expect-error - Address type mismatch between packages
          addresses: response.addresses,
        });

        // If deleted address was selected, clear selection
        if (selectedAddress?._id === addressId) {
          if (response.addresses.length > 0) {
            onAddressSelect(response.addresses[0] as Address);
          }
        }

        toast.success("Address deleted successfully");
      }
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPinIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No shipping address found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add your shipping address to proceed with your order. This will
                be used for delivery.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressSheetOpen(true);
                }}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <>
              {addresses.length === 1 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Your address has been automatically selected for shipping
                  </p>
                </div>
              )}

              <RadioGroup
                value={selectedAddress?._id || ""}
                onValueChange={(value) => {
                  const address = addresses.find((addr) => addr._id === value);
                  if (address) {
                    onAddressSelect(address);
                  }
                }}
              >
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`relative p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                        selectedAddress?._id === address._id
                          ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Radio Button */}
                        <RadioGroupItem
                          value={address._id || ""}
                          id={address._id || ""}
                          className="mt-1 shrink-0"
                        />

                        {/* Address Content */}
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={address._id}
                            className="cursor-pointer block"
                          >
                            {/* Address Header */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-semibold text-gray-900">
                                  Shipping Address
                                </span>
                              </div>
                              {address.isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Default
                                </span>
                              )}
                            </div>

                            {/* Address Details */}
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {address.street}
                              </div>
                              <div className="text-sm text-gray-600 flex flex-wrap gap-1">
                                {address.state && <span>{address.state},</span>}
                                <span>{address.city},</span>
                                <span>{address.country}</span>
                                <span>{address.postalCode}</span>
                              </div>
                            </div>
                          </Label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                            className="p-2 h-8 w-8 hover:bg-gray-100"
                            title="Edit Address"
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address._id!)}
                            disabled={isLoading}
                            className="p-2 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            title="Delete Address"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {selectedAddress?._id === address._id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button
                variant="outline"
                className="w-full mt-4 h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressSheetOpen(true);
                }}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add New Address
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Address Sheet for Add/Edit */}
      <AddressSheet
        open={isAddressSheetOpen}
        onOpenChange={setIsAddressSheetOpen}
        onSubmit={handleAddressSubmit}
        editingAddress={editingAddress}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      />
    </>
  );
};
