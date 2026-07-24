import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userSchema } from "@/lib/validation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Edit, Eye, EyeOff, Save, X, User as UserIcon } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "employee";
  employee_role?:
    | "packer"
    | "deliveryman"
    | "accounts"
    | "incharge"
    | "call_center"
    | null;
  createdAt: string;
};

type FormData = z.infer<typeof userSchema>;

interface UserDetailSidebarProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function UserDetailSidebar({
  userId,
  isOpen,
  onClose,
  onUpdate,
}: UserDetailSidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  const isAdmin = currentUser?.role === "admin";

  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      avatar: "",
      password: "",
      role: "user",
      employee_role: null,
    },
  });

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOpen]);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        password: "",
        role: user.role,
        employee_role: user.employee_role || null,
      });
    }
  }, [user, form]);

  const fetchUserDetails = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user details",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    // Only allow submission if in edit mode
    if (!isEditMode) return;
    if (!isAdmin || !userId) return;

    setSaving(true);
    try {
      // Only include password if it's provided
      const updateData = { ...data };
      if (!data.password) {
        delete updateData.password;
      }

      const { error } = await supabase.from("users").update(updateData).eq("id", userId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditMode(false);
      await fetchUserDetails();
      onUpdate?.();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to update user",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    form.reset();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isEditMode) {
      toast({
        title: "Unsaved Changes",
        description: "Please save or cancel your changes before closing.",
        variant: "destructive",
      });
      return;
    }
    if (!open) {
      handleClose();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "employee":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEmployeeRoleLabel = (role: string | null) => {
    if (!role) return null;
    const labels: Record<string, string> = {
      packer: "Packer",
      deliveryman: "Deliveryman",
      accounts: "Accounts",
      incharge: "In-charge",
      call_center: "Call Center",
    };
    return labels[role] || role;
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        onInteractOutside={(e) => {
          if (isEditMode) {
            e.preventDefault();
            toast({
              title: "Unsaved Changes",
              description: "Please save or cancel your changes before closing.",
              variant: "destructive",
            });
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Details
            {isEditMode && (
              <Badge variant="secondary" className="ml-auto">
                Editing
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Edit user information"
              : "View user details and information"}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="space-y-4 mt-6">
            <div className="h-32 w-32 mx-auto bg-muted animate-pulse rounded-full" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : user ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-6"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                {isEditMode ? (
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            value={field.value || ""}
                            onChange={field.onChange}
                            folder="avatars"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="relative">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.name}
                      className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                    {user.employee_role && (
                      <Badge variant="outline">
                        {getEmployeeRoleLabel(user.employee_role)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          disabled={!isEditMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          disabled={!isEditMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditMode && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password (leave empty to keep current)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!isEditMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("role") === "employee" && (
                  <FormField
                    control={form.control}
                    name="employee_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={!isEditMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="packer">Packer</SelectItem>
                            <SelectItem value="deliveryman">
                              Deliveryman
                            </SelectItem>
                            <SelectItem value="accounts">Accounts</SelectItem>
                            <SelectItem value="incharge">In-charge</SelectItem>
                            <SelectItem value="call_center">
                              Call Center
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div>
                  <FormLabel>Member Since</FormLabel>
                  <Input
                    value={new Date(user.createdAt).toLocaleDateString()}
                    disabled
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <SheetFooter className="flex-row gap-2 pt-6 border-t sticky bottom-0 bg-background pb-4">
                {isAdmin ? (
                  isEditMode ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditMode(false);
                          form.reset();
                        }}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </Button>
                    </>
                  )
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Close
                  </Button>
                )}
              </SheetFooter>
            </form>
          </Form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
