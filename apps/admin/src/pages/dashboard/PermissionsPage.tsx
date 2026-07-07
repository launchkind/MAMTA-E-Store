
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Key, Plus, Trash2, RefreshCw, Edit, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Permission = {
  _id: string;
  id: string;
  title: string;
  value: string;
  resource: string;
  action: string;
  description?: string;
  createdAt?: string;
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    resource: "",
    action: "",
    description: "",
  });

  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("resource", { ascending: true });

      if (error) throw error;

      setPermissions(
        (data ?? []).map((p: any) => ({
          _id: p.id,
          id: p.id,
          title: p.name,
          value: p.name,
          resource: p.resource,
          action: p.action,
          description: p.description ?? "",
          createdAt: p.created_at ?? "",
        })),
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load permissions",
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchPermissions();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPermissions();
    setRefreshing(false);
  };

  const handleOpenAdd = () => {
    setSelectedPermission(null);
    setFormData({
      title: "",
      value: "",
      resource: "",
      action: "",
      description: "",
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      title: permission.title,
      value: permission.value,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || "",
    });
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.value) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Permission title and value are required",
      });
      return;
    }

    setFormLoading(true);
    try {
      if (selectedPermission) {
        // Update
        const { error } = await supabase
          .from("permissions")
          .update({
            name: formData.value,
            description: formData.description,
          })
          .eq("id", selectedPermission._id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Permission updated successfully",
        });
      } else {
        // Create
        const { error } = await supabase
          .from("permissions")
          .insert({
            name: formData.value,
            resource: formData.resource || "general",
            action: formData.action || "read",
            description: formData.description,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Permission created successfully",
        });
      }

      setIsSheetOpen(false);
      fetchPermissions();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save permission",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPermission) return;
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("permissions")
        .delete()
        .eq("id", selectedPermission._id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Permission deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchPermissions();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete permission",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (perm.description && perm.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Permissions
          </h1>
          <p className="text-gray-600 mt-2">
            Manage available system permissions.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                placeholder="Search permissions..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
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
            Add Permission
          </Button>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Value (Slug)</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-48 bg-gray-200 rounded-sm animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse inline-block" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery ? "No matching permissions found." : "No permissions found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((perm) => (
                <TableRow key={perm._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-blue-600" />
                        {perm.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                        {perm.value}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {perm.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {perm.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {perm.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(perm)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(perm)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Permission Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedPermission ? "Edit Permission" : "Add Permission"}</SheetTitle>
            <SheetDescription>
              {selectedPermission
                ? "Update permission details."
                : "Create a new permission. You can auto-generate the value from the title."}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Permission Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g. Admin Access"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (Slug)</Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder="e.g. admin_access"
                    pattern="[a-z0-9_]+"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        const generated = formData.title
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/[\s_-]+/g, "_")
                        .replace(/^-+|-+$/g, "");
                        setFormData({ ...formData, value: generated });
                    }}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                    Must be lowercase, no spaces (use underscores).
                </p>
              </div>
              {!selectedPermission && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resource">Resource</Label>
                    <Input
                      id="resource"
                      value={formData.resource}
                      onChange={(e) =>
                        setFormData({ ...formData, resource: e.target.value })
                      }
                      placeholder="e.g. products"
                    />
                    <p className="text-xs text-gray-500">Defaults to "general"</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Input
                      id="action"
                      value={formData.action}
                      onChange={(e) =>
                        setFormData({ ...formData, action: e.target.value })
                      }
                      placeholder="e.g. read"
                    />
                    <p className="text-xs text-gray-500">Defaults to "read"</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this permission allows..."
                />
              </div>
            </div>
            <SheetFooter>
               <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                  Cancel
               </Button>
              <Button type="submit" disabled={formLoading || !formData.value} className="bg-blue-600 hover:bg-blue-700">
                {formLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                   selectedPermission ? "Save Changes" : "Create Permission"
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
              This action cannot be undone. This will permanently delete the permission
              "{selectedPermission?.title}". Existing roles with this permission might be affected.
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
