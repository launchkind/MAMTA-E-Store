import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit, GripVertical, Eye, Settings,
  LayoutDashboard, ShoppingBag, FileText, Grid3x3, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { deleteManyFromR2 } from "@/lib/r2-upload";
import AddConfigSidebar from "@/components/website-config/AddConfigSidebar";
import ViewConfigSidebar from "@/components/website-config/ViewConfigSidebar";
import ConfigSkeleton from "@/components/website-config/ConfigSkeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface WebsiteConfig {
  id: string;
  page_type: string;
  component_type: string;
  title: string;
  description?: string;
  weight: number;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page", icon: LayoutDashboard },
  { value: "product", label: "Product Page", icon: ShoppingBag },
  { value: "blog", label: "Blog Page", icon: FileText },
  { value: "category", label: "Category Page", icon: Grid3x3 },
  { value: "about", label: "About Page", icon: Info },
];

const COMPONENT_TYPE_COLORS: Record<string, string> = {
  banner: "bg-purple-500/10 text-purple-700 border-purple-200",
  products: "bg-blue-500/10 text-blue-700 border-blue-200",
  ads: "bg-orange-500/10 text-orange-700 border-orange-200",
  carousel: "bg-pink-500/10 text-pink-700 border-pink-200",
  "featured-categories": "bg-green-500/10 text-green-700 border-green-200",
  brands: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  testimonials: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  newsletter: "bg-teal-500/10 text-teal-700 border-teal-200",
  "custom-html": "bg-gray-500/10 text-gray-700 border-gray-200",
};

interface SortableItemProps {
  config: WebsiteConfig;
  onView: (config: WebsiteConfig) => void;
  onEdit: (config: WebsiteConfig) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ config, onView, onEdit, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: config.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative bg-white dark:bg-slate-800 border rounded-lg p-4 hover:shadow-md transition-all ${!config.is_active ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={20} />
        </div>
        <div className="shrink-0">
          <Badge variant="outline" className="font-mono">#{config.weight}</Badge>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{config.title}</h4>
            <Badge className={`text-xs ${COMPONENT_TYPE_COLORS[config.component_type] || "bg-gray-100 text-gray-700"}`}>
              {config.component_type}
            </Badge>
          </div>
          {config.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{config.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onView(config)} className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" title="View">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(config)} className="h-8 w-8 text-purple-600 hover:bg-purple-50" title="Edit">
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(config.id)} className="h-8 w-8 text-red-600 hover:bg-red-50" title="Delete">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WebsiteConfigPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [configs, setConfigs] = useState<WebsiteConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WebsiteConfig | null>(null);
  const [viewingConfig, setViewingConfig] = useState<WebsiteConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchConfigs = async (pageType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_components")
        .select("*")
        .eq("page_type", pageType)
        .order("weight", { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch configurations" });
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDeleteConfig = (id: string) => {
    setConfigToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!configToDelete) return;
    try {
      const images = (configs.find((c) => c.id === configToDelete)?.settings.images ?? []) as string[];

      const { error } = await supabase.from("page_components").delete().eq("id", configToDelete);
      if (error) throw error;

      deleteManyFromR2(images);

      toast({ title: "Success", description: "Configuration deleted successfully" });
      fetchConfigs(activeTab);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete configuration" });
    } finally {
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = configs.findIndex((c) => c.id === active.id);
    const newIndex = configs.findIndex((c) => c.id === over.id);
    const newConfigs = arrayMove(configs, oldIndex, newIndex);
    setConfigs(newConfigs);

    try {
      await Promise.all(
        newConfigs.map((c, index) =>
          supabase.from("page_components").update({ weight: index }).eq("id", c.id)
        )
      );
      toast({ title: "Success", description: "Configuration order updated" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to reorder configurations" });
      fetchConfigs(activeTab);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setEditingConfig(null);
    fetchConfigs(activeTab);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="text-purple-600" size={32} />
            Website Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage website components and their display order</p>
        </div>
        <Button onClick={() => { setEditingConfig(null); setSidebarOpen(true); }} className="bg-purple-600 hover:bg-purple-700">
          <Plus size={20} className="mr-2" />
          Add Component
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          {PAGE_TYPES.map((page) => {
            const Icon = page.icon;
            return (
              <TabsTrigger key={page.value} value={page.value} className="gap-2">
                <Icon size={16} />
                {page.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PAGE_TYPES.map((page) => (
          <TabsContent key={page.value} value={page.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <page.icon size={20} />
                    {page.label} Components
                  </span>
                  <Badge variant="outline">{configs.length} components</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ConfigSkeleton />
                ) : configs.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No components configured for this page yet</p>
                    <Button onClick={() => { setEditingConfig(null); setSidebarOpen(true); }} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                      <Plus size={16} className="mr-2" />Add First Component
                    </Button>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={configs.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {configs.map((config) => (
                            <SortableItem
                              key={config.id}
                              config={config}
                              onView={setViewingConfig}
                              onEdit={(c) => { setEditingConfig(c); setSidebarOpen(true); }}
                              onDelete={handleDeleteConfig}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AddConfigSidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        editingConfig={editingConfig}
        defaultPageType={activeTab}
      />

      <ViewConfigSidebar
        open={!!viewingConfig}
        onClose={() => setViewingConfig(null)}
        config={viewingConfig}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="overflow-hidden">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the component configuration.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfigToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
