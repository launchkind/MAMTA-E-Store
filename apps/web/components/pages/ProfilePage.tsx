"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUserStore, useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  ShoppingCart,
  Package,
  Save,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { OAuthUserSection } from "./auth/OAuthUserSection";
import Container from "../common/Container";
import { AddressSheet, type AddressFormData } from "../shared/AddressSheet";
import { getUserOrders, Order } from "@/lib/orderApi";
import type { Address as AddressType } from "@entry/types";

const unifiedProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword && data.newPassword.trim() !== "") {
      if (!data.currentPassword || data.currentPassword.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current password is required to set a new password",
          path: ["currentPassword"],
        });
      }
      if (data.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New password must be at least 8 characters",
          path: ["newPassword"],
        });
      }
      if (data.newPassword === data.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "New password cannot be the same as current password",
          path: ["newPassword"],
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }
  });

type ProfileFormData = z.infer<typeof unifiedProfileSchema>;
type Address = AddressType;
type AddressWithOptionalId = Omit<Address, "_id"> & { _id?: string };

const ProfilePageSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Hero skeleton */}
    <div className="rounded-xl bg-primary/10 p-6 flex flex-col md:flex-row items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-full shrink-0" />
      <div className="flex-1 space-y-3 w-full">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
    {/* Stats row skeleton */}
    <div className="grid grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border border-border rounded-xl p-4 space-y-2">
          <Skeleton className="h-7 w-10" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
    {/* Form skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 border border-border rounded-xl p-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>
      <div className="border border-border rounded-xl p-6 space-y-4">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    address_confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    processing: "bg-purple-100 text-purple-800 border-purple-300",
    packed: "bg-indigo-100 text-indigo-800 border-indigo-300",
    shipped: "bg-cyan-100 text-cyan-800 border-cyan-300",
    delivering: "bg-orange-100 text-orange-800 border-orange-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300";
};

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressSidebarOpen, setIsAddressSidebarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inline Errors
  const [oldPasswordError, setOldPasswordError] = useState("");

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  // Remove separate password sidebar

  const router = useRouter();
  const { authUser, updateUser, logoutUser } = useUserStore();
  const { cartItems, syncCartFromServer } = useCartStore();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(unifiedProfileSchema),
    defaultValues: {
      name: authUser?.name || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Update form defaults when authUser changes
  useEffect(() => {
    if (authUser) {
      form.reset({
        name: authUser.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [authUser, form]);

  // Fetch recent orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!authUser) return;

      setIsLoadingOrders(true);
      try {
        const auth_token = localStorage.getItem("auth_token");
        if (auth_token) {
          const orders = await getUserOrders(auth_token);
          // Get first 10 orders
          setRecentOrders(orders.slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [authUser]);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      if (!authUser) return;

      try {
        await syncCartFromServer();
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };

    fetchCart();
  }, [authUser, syncCartFromServer]);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 5000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 5MB.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 5000,
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Avatar preview error:", error);
      toast.error("Preview failed", {
        description: "Failed to preview image.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 5000,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      logoutUser();
      toast.success("Logged out", {
        description: "You have been logged out successfully.",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: error instanceof Error ? error.message : "Failed to log out.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
    setIsLogoutDialogOpen(false);
  };

  if (!authUser) {
    return <ProfilePageSkeleton />;
  }

  const onUnifiedSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setOldPasswordError("");

    // 1. Update Profile (Name/Avatar)
    let profileUpdated = false;
    if (data.name !== authUser?.name || avatarPreview) {
      const updateData: { name: string; avatar?: string } = {
        name: data.name,
      };
      if (avatarPreview) {
        updateData.avatar = avatarPreview;
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("users")
          .update({ name: updateData.name, ...(updateData.avatar ? { avatar: updateData.avatar } : {}) })
          .eq("id", session.user.id);

        if (error) throw error;
        updateUser({ ...authUser!, name: updateData.name, ...(updateData.avatar ? { avatar: updateData.avatar } : {}) });
        profileUpdated = true;
        setAvatarPreview(null);
      } catch (error) {
        toast.error("Failed to update profile details");
      }
    }

    // 2. Update Password (if provided)
    let passwordUpdated = false;
    if (data.newPassword && data.currentPassword) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: data.newPassword! });
        if (error) throw error;
        passwordUpdated = true;
      } catch (error: any) {
        const msg = error?.message || "Failed to change password";
        toast.error(msg);
      }
    }

    // Success Messages & Sidebar Close
    if (profileUpdated && passwordUpdated) {
      setIsProfileSidebarOpen(false);
      form.reset({
        name: data.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Auto-logout for password change
      toast.info("Password changed successfully. Logging out...", {
        duration: 3000,
      });

      setTimeout(() => {
        logoutUser();
        router.push("/auth/signin");
      }, 1500);
    } else if (profileUpdated) {
      toast.success("Profile details updated successfully");
      setIsProfileSidebarOpen(false);
      form.reset({
        name: data.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else if (passwordUpdated) {
      setIsProfileSidebarOpen(false);
      form.reset({
        name: data.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Auto-logout for password change
      toast.info("Password changed successfully. Logging out...", {
        duration: 3000,
      });

      setTimeout(() => {
        logoutUser();
        router.push("/auth/signin");
      }, 1500);
    } else if (
      !data.newPassword &&
      data.name === authUser?.name &&
      !avatarPreview
    ) {
      // No changes made
      setIsProfileSidebarOpen(false);
    }

    setIsLoading(false);
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    if (!authUser) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    const newAddresses: AddressWithOptionalId[] = [
      ...(authUser.addresses || []),
    ];

    if (editingAddress && selectedAddressId !== null) {
      // Update existing address
      const index = parseInt(selectedAddressId);
      const existingId = authUser.addresses?.[index]?._id;
      newAddresses[index] = {
        ...data,
        ...(existingId && { _id: existingId }), // Only include _id if it exists
      } as AddressWithOptionalId;
    } else {
      // Add new address - don't include _id field at all
      newAddresses.push(data as AddressWithOptionalId);
    }

    // If the new/edited address is default, reset others
    if (data.isDefault) {
      newAddresses.forEach((addr: AddressWithOptionalId, i: number) => {
        addr.isDefault =
          i ===
          (editingAddress
            ? parseInt(selectedAddressId!)
            : newAddresses.length - 1);
      });
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({ addresses: newAddresses })
        .eq("id", session.user.id);

      if (error) throw error;
      updateUser({ ...authUser!, addresses: newAddresses as Address[] });
      toast.success("Address saved", {
        description: editingAddress ? "Address updated successfully." : "Address added successfully.",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });
      setIsAddressSidebarOpen(false);
      setEditingAddress(null);
      setSelectedAddressId(null);
    } catch (error) {
      console.error("Address save error:", error);
      toast.error("Address save failed", {
        description: error instanceof Error ? error.message : "Failed to save address.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const handleEditAddress = (address: Address, index: number) => {
    setEditingAddress(address);
    setSelectedAddressId(index.toString());
    setIsAddressSidebarOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (selectedAddressId === null || !authUser) return;
    setIsLoading(true);
    const newAddresses = (authUser.addresses ?? []).filter(
      (_: Address, i: number) => i !== parseInt(selectedAddressId),
    );

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({ addresses: newAddresses })
        .eq("id", session.user.id);

      if (error) throw error;
      updateUser({ ...authUser!, addresses: newAddresses as Address[] });
      toast.success("Address deleted", {
        description: "Address removed successfully.",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });
      setIsDeleteDialogOpen(false);
      setSelectedAddressId(null);
    } catch (error) {
      console.error("Address delete error:", error);
      toast.error("Address deletion failed", {
        description: error instanceof Error ? error.message : "Failed to delete address.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setSelectedAddressId(null);
    setIsAddressSidebarOpen(true);
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error("Not authenticated");

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: session.user.email,
      });
      if (error) throw error;

      toast.success("Verification email sent", {
        description: "Please check your email inbox (and spam folder) for the verification link.",
        className: "bg-green-50 text-gray-800 border-green-200",
        duration: 5000,
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to send email", {
        description: error instanceof Error ? error.message : "Could not send verification email.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <Card className="shadow-lg border-0 bg-linear-to-r from-primary to-primary text-background overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {authUser.avatar ? (
                <div className="relative h-24 w-24 ring-4 ring-white/50 rounded-full overflow-hidden">
                  <Image
                    src={authUser.avatar}
                    alt={authUser.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/50 flex items-center justify-center text-4xl font-bold">
                  {authUser?.name && authUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{authUser.name}</h1>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-white/90">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{authUser.email}</span>
                  {authUser.emailVerified ? (
                    <div className="flex items-center gap-1 text-green-200 bg-green-500/20 px-2 py-0.5 rounded-full text-xs border border-green-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="h-6 px-2 text-xs bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-full"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Verify Email
                    </Button>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {authUser.role}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setIsProfileSidebarOpen(true)}
                variant="secondary"
                disabled={isLoading}
                className="bg-background/20 hover:bg-background/30 backdrop-blur-sm text-background border-background/30 transition-all"
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              {!authUser.isOAuthUser || authUser.hasSetPassword ? (
                <Button
                  onClick={() => setIsProfileSidebarOpen(true)}
                  variant="secondary"
                  disabled={isLoading}
                  className="bg-background/20 hover:bg-background/30 backdrop-blur-sm text-background border-background/30 transition-all"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              ) : null}
              <Button
                onClick={handleLogout}
                variant="secondary"
                disabled={isLoading}
                className="bg-background/20 hover:bg-background/30 backdrop-blur-sm text-background border-background/30 transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{recentOrders.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {authUser.addresses?.length ?? 0}
              </p>
              <p className="text-xs text-white/70 mt-0.5">Addresses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">2+</p>
              <p className="text-xs text-white/70 mt-0.5">Yrs Member</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OAuth User Section */}
      {authUser.isOAuthUser && <OAuthUserSection user={authUser} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow border border-muted-foreground/20">
            <CardHeader className="border-b bg-linear-to-r from-primary/5 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Save className="h-5 w-5 text-primary" />
                Update Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onUnifiedSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            className="border-muted-foreground/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary h-11"
                            placeholder="Enter your name"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Avatar Upload - Main Card */}
                  <div className="space-y-2">
                    <FormLabel className="text-gray-700 font-medium">
                      Profile Picture
                    </FormLabel>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {avatarPreview || authUser?.avatar ? (
                          <div className="relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-primary">
                            <Image
                              src={avatarPreview || authUser?.avatar || ""}
                              alt="Avatar preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-linear-to-r from-primary to-primary flex items-center justify-center text-2xl font-bold text-background ring-2 ring-primary">
                            {authUser?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={isLoading || isUploadingAvatar}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label htmlFor="avatar-upload">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading || isUploadingAvatar}
                            className="border-primary text-primary hover:bg-primary/10 cursor-pointer transition-all"
                            onClick={() =>
                              document.getElementById("avatar-upload")?.click()
                            }
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {avatarPreview ? "Change Photo" : "Upload Photo"}
                          </Button>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG or GIF. Max size 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-background font-semibold rounded-lg shadow-md h-11 transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Addresses Card */}

          <Card className="shadow-md hover:shadow-lg transition-shadow border border-muted-foreground/20">
            <CardHeader className="border-b bg-linear-to-r from-primary/5 to-primary/5">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Addresses
                </div>
                <Button
                  onClick={handleAddNewAddress}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-background transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!(authUser.addresses && authUser.addresses.length > 0) ? (
                <div className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No addresses added yet.</p>
                  <Button
                    onClick={handleAddNewAddress}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {authUser.addresses.map((address: Address, index: number) => (
                    <div
                      key={index}
                      className="relative p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                    >
                      {address.isDefault && (
                        <Badge className="absolute top-2 right-2 bg-green-100 text-green-800 border-green-300">
                          Default
                        </Badge>
                      )}
                      <div className="space-y-1 pr-20">
                        <p className="font-medium text-gray-900">
                          {address.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.country}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.postalCode}
                        </p>
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAddress(address, index)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAddressId(index.toString());
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-accent hover:text-accent/80 hover:bg-accent/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Cart Summary */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border border-muted-foreground/20">
            <CardHeader className="border-b bg-linear-to-r from-primary/5 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Cart Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-800"
                    >
                      {cartItems.length}
                    </Badge>
                  </div>
                  <Separator />
                  <Link href="/user/cart">
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 transition-all"
                    >
                      View Cart
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-md hover:shadow-lg transition-shadow border border-muted-foreground/20">
            <CardHeader className="border-b bg-linear-to-r from-primary/5 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Package className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingOrders ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Loading orders...
                  </p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      href={`/user/orders/${order._id}`}
                      className="block"
                    >
                      <div className="p-3 border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all bg-background">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs shrink-0 ${getStatusColor(order.status)}`}
                          >
                            {order.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </span>
                          <span className="font-semibold text-gray-900">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/user/orders">
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 mt-2 transition-all"
                    >
                      View All Orders
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Sidebar */}
      <AddressSheet
        open={isAddressSidebarOpen}
        onOpenChange={setIsAddressSidebarOpen}
        onSubmit={onAddressSubmit}
        editingAddress={
          editingAddress
            ? {
                street: editingAddress.street,
                city: editingAddress.city,
                state: editingAddress.state,
                country: editingAddress.country,
                postalCode: editingAddress.postalCode,
                isDefault: editingAddress.isDefault ?? false,
              }
            : null
        }
        title={editingAddress ? "Edit Address" : "Add New Address"}
      />

      {/* Delete Address Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again
              to access your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Logging out...
                </span>
              ) : (
                "Log Out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unified Edit Profile Sidebar */}
      <Sheet open={isProfileSidebarOpen} onOpenChange={setIsProfileSidebarOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg p-0">
          <div className="p-6 h-full flex flex-col">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold text-gray-900">
                Edit Profile
              </SheetTitle>
              <SheetDescription className="text-gray-500">
                Update your personal details and manage your password.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-1 -mx-1">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onUnifiedSubmit)}
                  className="space-y-8 pb-8"
                >
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                      {avatarPreview || authUser?.avatar ? (
                        <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-md">
                          <Image
                            src={avatarPreview || authUser?.avatar || ""}
                            alt="Avatar preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-linear-to-r from-primary to-primary flex items-center justify-center text-3xl font-bold text-background ring-4 ring-primary/20 shadow-md">
                          {authUser?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                        </div>
                      )}
                      <label
                        htmlFor="avatar-upload-sidebar"
                        className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 shadow-lg transition-all"
                      >
                        <Upload className="h-4 w-4" />
                      </label>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isLoading || isUploadingAvatar}
                      className="hidden"
                      id="avatar-upload-sidebar"
                    />
                    <p className="text-xs text-gray-500">
                      Click the upload icon to change photo
                    </p>
                  </div>

                  <Separator />

                  {/* Personal Info Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Personal Information
                    </h4>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="Enter your name"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Security Section */}
                  {(!authUser.isOAuthUser || authUser.hasSetPassword) && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Security
                      </h4>

                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Current Password
                              <span className="text-xs text-gray-500 ml-2 font-normal">
                                (Required to change password)
                              </span>
                            </FormLabel>

                            {/* Warning Badge */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3 flex gap-2 items-start">
                              <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-yellow-700">
                                Changing your password will{" "}
                                <strong>log you out</strong> on all devices. You
                                will need to sign in again with your new
                                password.
                              </p>
                            </div>

                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={
                                    showCurrentPassword ? "text" : "password"
                                  }
                                  disabled={isLoading}
                                  placeholder="Enter current password"
                                  className="pr-10 h-10"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                  }
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            {/* Inbox Error for Incorrect Password */}
                            {oldPasswordError && (
                              <p className="text-[0.8rem] font-medium text-red-500 mt-1 animate-pulse">
                                {oldPasswordError}
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Smart Visibility: Only show new password fields if current password has content */}
                      {form.watch("currentPassword") &&
                        form.watch("currentPassword")!.length > 0 && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pl-4 border-l-2 border-gray-100">
                            <FormField
                              control={form.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={
                                          showNewPassword ? "text" : "password"
                                        }
                                        disabled={isLoading}
                                        placeholder="Min 8 characters"
                                        className="pr-10 h-10"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowNewPassword(!showNewPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                      >
                                        {showNewPassword ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={
                                          showConfirmPassword
                                            ? "text"
                                            : "password"
                                        }
                                        disabled={isLoading}
                                        placeholder="Re-enter new password"
                                        className="pr-10 h-10"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowConfirmPassword(
                                            !showConfirmPassword,
                                          )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                      >
                                        {showConfirmPassword ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  {field.value &&
                                    field.value !==
                                      form.watch("newPassword") && (
                                      <p className="text-[0.8rem] font-medium text-red-500 mt-1">
                                        Passwords do not match
                                      </p>
                                    )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        isUploadingAvatar ||
                        !form.formState.isValid ||
                        (!form.formState.isDirty && !avatarPreview)
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-background transition-all h-11 text-base font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Saving Changes...
                        </span>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProfilePage;
