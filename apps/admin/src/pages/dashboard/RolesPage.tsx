
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Edit, Trash2, RefreshCw, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Role = {
  _id: string;
  id: string;
  name: string;
  value: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    description: "",
    permissions: [] as string[],
  });

  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const { data: rolesData, error } = await supabase
        .from("user_roles")
        .select(
          "*, role_permissions(permission_id, permissions(id, name, resource, action))",
        )
        .order("name");

      if (error) throw error;

      setRoles(
        (rolesData ?? []).map((r: any) => ({
          _id: r.id,
          id: r.id,
          name: r.name,
          value: r.name.toLowerCase().replace(/\s+/g, "_"),
          description: r.description ?? "",
          isSystem: false,
          permissions:
            r.role_permissions?.map(
              (rp: any) => rp.permissions?.name ?? "",
            ) ?? [],
          createdAt: r.created_at ?? "",
        })),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load roles",
      });
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("id, name, resource, action")
        .order("resource");

      if (error) throw error;

      setAvailablePermissions((data ?? []).map((p: any) => p.name));
    } catch (error) {
      console.error("Failed to load permissions", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchRoles(), fetchAvailablePermissions()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoles();
    setRefreshing(false);
  };

  const handleOpenAdd = () => {
    setSelectedRole(null);

    // Find default permission (e.g., 'general') to auto-select
    const defaultPermission = availablePermissions.find((p) =>
      p.toLowerCase().includes("general")
    );

    setFormData({
      name: "",
      value: "",
      description: "",
      permissions: defaultPermission ? [defaultPermission] : [],
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      value: role.value,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    if (role.isSystem) {
      toast({
        variant: "destructive",
        title: "Action Denied",
        description: "System roles cannot be deleted",
      });
      return;
    }
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => {
      if (prev.permissions.includes(permission)) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== permission),
        };
      } else {
        return { ...prev, permissions: [...prev.permissions, permission] };
      }
    });
  };

  const generateValueFromName = () => {
    if (formData.name) {
      const value = formData.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      setFormData({ ...formData, value });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate value if creating new role
    if (!selectedRole) {
      const value = name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      setFormData({ ...formData, name, value });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.value) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Role name and value are required",
      });
      return;
    }

    setFormLoading(true);
    try {
      if (selectedRole) {
        // Update role name/description
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({ name: formData.name, description: formData.description })
          .eq("id", selectedRole._id);

        if (updateError) throw updateError;

        // Delete old role_permissions
        const { error: deletePermsError } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", selectedRole._id);

        if (deletePermsError) throw deletePermsError;

        // Re-insert selected permissions
        if (formData.permissions.length > 0) {
          const { data: perms, error: permsLookupError } = await supabase
            .from("permissions")
            .select("id, name")
            .in("name", formData.permissions);

          if (permsLookupError) throw permsLookupError;

          if (perms && perms.length > 0) {
            const { error: insertPermsError } = await supabase
              .from("role_permissions")
              .insert(
                perms.map((p: any) => ({
                  role_id: selectedRole._id,
                  permission_id: p.id,
                })),
              );

            if (insertPermsError) throw insertPermsError;
          }
        }

        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create new role
        const { data: newRole, error: insertError } = await supabase
          .from("user_roles")
          .insert({ name: formData.name, description: formData.description })
          .select()
          .single();

        if (insertError) throw insertError;

        // Insert permissions for new role
        if (formData.permissions.length > 0 && newRole) {
          const { data: perms, error: permsLookupError } = await supabase
            .from("permissions")
            .select("id, name")
            .in("name", formData.permissions);

          if (permsLookupError) throw permsLookupError;

          if (perms && perms.length > 0) {
            const { error: insertPermsError } = await supabase
              .from("role_permissions")
              .insert(
                perms.map((p: any) => ({
                  role_id: newRole.id,
                  permission_id: p.id,
                })),
              );

            if (insertPermsError) throw insertPermsError;
          }
        }

        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }
      setIsSheetOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save role",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", selectedRole._id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete role",
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Roles & Permissions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage system roles and their permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={handleOpenAdd} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[100px]">System</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-24 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-48 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse inline-block" />
                  </TableCell>
                </TableRow>
              ))
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {role.value || role.name.toLowerCase().replace(/\s+/g, '_')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 max-w-[200px] truncate">
                    {role.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {perm.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                         <Badge variant="outline" className="text-xs font-normal">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                      {role.permissions.length === 0 && (
                          <span className="text-xs text-gray-400">No permissions</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                        System
                      </Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(role)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(role)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedRole ? "Edit Role" : "Add Role"}</SheetTitle>
            <SheetDescription>
              {selectedRole
                ? "Update role details and permissions."
                : "Create a new role with specific permissions."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g. Sales Manager"
                  disabled={selectedRole?.isSystem}
                />
                {selectedRole?.isSystem && (
                     <p className="text-xs text-amber-600">System role names cannot be changed</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Role Value (System Key)</Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder="e.g. sales_manager"
                    className="font-mono bg-gray-50"
                    disabled={selectedRole?.isSystem}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateValueFromName}
                    disabled={selectedRole?.isSystem || !formData.name}
                    title="Generate from Name"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Unique identifier used by the system (snake_case recommended)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the role's purpose..."
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission}
                          checked={formData.permissions.includes(permission)}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission)
                          }
                        />
                        <label
                          htmlFor={permission}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                        >
                          {permission.replace(/_/g, " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <SheetFooter>
               <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                  Cancel
               </Button>
              <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700">
                {formLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                   selectedRole ? "Save Changes" : "Create Role"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              "{selectedRole?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={formLoading}
            >
              {formLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
