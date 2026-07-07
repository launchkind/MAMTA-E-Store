import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, Eye, EyeOff, Grid3x3, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import ComponentTypeSkeleton from "@/components/component-types/ComponentTypeSkeleton";
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
import AddComponentTypeSidebar from "@/components/component-types/AddComponentTypeSidebar";

export interface ComponentType {
  id: string;
  name: string;
  label: string;
  description?: string;
  icon: string;
  structure: Record<string, unknown>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ComponentTypesPage() {
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingType, setEditingType] = useState<ComponentType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComponentTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("component_types")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComponentTypes(data || []);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch component types" });
      setComponentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddType = () => {
    setEditingType(null);
    setSidebarOpen(true);
  };

  const handleEditType = (type: ComponentType) => {
    setEditingType(type);
    setSidebarOpen(true);
  };

  const handleDeleteType = (id: string) => {
    setTypeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;
    try {
      const { error } = await supabase
        .from("component_types")
        .delete()
        .eq("id", typeToDelete);
      if (error) throw error;
      toast({ title: "Success", description: "Component type deleted successfully" });
      fetchComponentTypes();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete component type" });
    } finally {
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  const handleToggleStatus = async (type: ComponentType) => {
    try {
      const { error } = await supabase
        .from("component_types")
        .update({ is_active: !type.is_active })
        .eq("id", type.id);
      if (error) throw error;
      toast({ title: "Success", description: "Component type status updated" });
      fetchComponentTypes();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setEditingType(null);
    fetchComponentTypes();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Grid3x3 className="text-purple-600" size={32} />
            Component Types
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage available component types for website configuration
          </p>
        </div>
        <Button onClick={handleAddType} className="bg-purple-600 hover:bg-purple-700">
          <Plus size={20} className="mr-2" />
          Add Component Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Component Types</span>
            <Badge variant="outline">{componentTypes.length} types</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ComponentTypeSkeleton />
          ) : componentTypes.length === 0 ? (
            <div className="text-center py-12">
              <Grid3x3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No component types created yet</p>
              <Button onClick={handleAddType} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Plus size={16} className="mr-2" />
                Add First Component Type
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {componentTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`group relative bg-white dark:bg-slate-800 border rounded-lg p-4 hover:shadow-md transition-all ${!type.is_active ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 flex items-center justify-center">
                        <Code2 size={24} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base">{type.label || type.name}</h4>
                          <Badge variant="outline" className="text-xs font-mono">{type.name}</Badge>
                          <Badge className={`text-xs ${type.is_active ? "bg-green-500/10 text-green-700 border-green-200" : "bg-gray-500/10 text-gray-700 border-gray-200"}`}>
                            {type.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {type.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{type.description}</p>
                        )}
                        {type.structure && Object.keys(type.structure).length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Structure fields: {Object.keys(type.structure).length}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(type)}
                          className="h-8 w-8"
                          title={type.is_active ? "Deactivate" : "Activate"}
                        >
                          {type.is_active ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditType(type)}
                          className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteType(type.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AddComponentTypeSidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        editingType={editingType}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the component type.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTypeToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
