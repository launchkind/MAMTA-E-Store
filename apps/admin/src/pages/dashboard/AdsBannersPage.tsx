/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Tag,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";

// AdsBanner type matching the Supabase `ads_banners` table
type AdsBanner = {
  _id: string;
  title: string;
  image: string;
  link?: string;
  position?: string;
  is_active: boolean;
  sort_order: number;
  end_time?: string;
  created_at: string;
};

const adsBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.string().min(1, "Image is required"),
  link: z.string().optional(),
  position: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().min(0).default(0),
  end_time: z.string().optional(),
});

type FormData = z.infer<typeof adsBannerSchema>;

// Converts an ISO timestamp to the `YYYY-MM-DDTHH:mm` shape <input type="datetime-local"> expects.
const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function AdsBannersPage() {
  const [banners, setBanners] = useState<AdsBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdsBanner | null>(null);
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const { toast } = useToast();
  const { canPerformCRUD } = usePermissions();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(adsBannerSchema),
    defaultValues: {
      title: "",
      image: "",
      link: "",
      position: "",
      is_active: true,
      sort_order: 0,
      end_time: "",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(adsBannerSchema),
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ads_banners")
        .select("*")
        .order("sort_order");
      if (error) throw error;

      const fetchedBanners: AdsBanner[] = (data || []).map(
        (row: Record<string, unknown>) => ({
          _id: row.id as string,
          title: row.title as string,
          image: row.image as string,
          link: row.link as string | undefined,
          position: row.position as string | undefined,
          is_active: row.is_active as boolean,
          sort_order: row.sort_order as number,
          end_time: row.end_time as string | undefined,
          created_at: row.created_at as string,
        })
      );
      setBanners(fetchedBanners);
    } catch (error) {
      console.error("Failed to fetch ads banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ads banners",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBanners();
    setRefreshing(false);
    toast({ title: "Success", description: "Ads banners refreshed" });
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = async (data: FormData) => {
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("ads_banners")
        .insert({
          title: data.title,
          image: data.image,
          link: data.link || null,
          position: data.position || null,
          is_active: data.is_active,
          sort_order: data.sort_order,
          end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Ads banner created successfully",
      });
      setIsAddModalOpen(false);
      formAdd.reset();
      fetchBanners();
    } catch (error) {
      console.error("Failed to create ads banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create ads banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBanner = async (data: FormData) => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("ads_banners")
        .update({
          title: data.title,
          image: data.image,
          link: data.link || null,
          position: data.position || null,
          is_active: data.is_active,
          sort_order: data.sort_order,
          end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
        })
        .eq("id", selectedBanner._id)
        .select()
        .single();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Ads banner updated successfully",
      });
      setIsEditModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Failed to update ads banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update ads banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from("ads_banners")
        .delete()
        .eq("id", selectedBanner._id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Ads banner deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (error) {
      console.error("Failed to delete ads banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete ads banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBanners.length === 0) return;

    try {
      const { error } = await supabase
        .from("ads_banners")
        .delete()
        .in("id", selectedBanners);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Selected ads banners deleted successfully",
      });
      setSelectedBanners([]);
      fetchBanners();
    } catch (error) {
      console.error("Failed to delete ads banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected ads banners",
      });
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBanners(banners.map((b) => b._id));
    } else {
      setSelectedBanners([]);
    }
  };

  const toggleSelectBanner = (id: string) => {
    setSelectedBanners((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = async (banner: AdsBanner) => {
    try {
      const { error } = await supabase
        .from("ads_banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner._id);
      if (error) throw error;

      toast({
        title: "Success",
        description: `Banner ${banner.is_active ? "deactivated" : "activated"}`,
      });
      fetchBanners();
    } catch (error) {
      console.error("Failed to toggle banner status", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update banner status",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ads Banners</h1>
          <p className="text-gray-600 mt-2">
            Manage advertisement banners for your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
          {selectedBanners.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedBanners.length})
            </Button>
          )}
          {canPerformCRUD && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ads Banner
            </Button>
          )}
        </div>
      </motion.div>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Ads Banners ({banners.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No ads banners yet</p>
              {canPerformCRUD && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Banner
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        banners.length > 0 &&
                        selectedBanners.length === banners.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBanners.includes(banner._id)}
                        onCheckedChange={() => toggleSelectBanner(banner._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {banner.position === "sidebar"
                          ? "Sidebar Countdown"
                          : "Main Carousel"}
                      </Badge>
                    </TableCell>
                    <TableCell>{banner.sort_order}</TableCell>
                    <TableCell>
                      {canPerformCRUD ? (
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={() => handleToggleStatus(banner)}
                        />
                      ) : (
                        <Badge
                          variant={banner.is_active ? "default" : "secondary"}
                        >
                          {banner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {canPerformCRUD ? (
                        <div className="flex items-center gap-2">
                          {banner.link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(banner.link, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBanner(banner);
                              formEdit.reset({
                                title: banner.title,
                                image: banner.image,
                                link: banner.link || "",
                                position: banner.position || "",
                                is_active: banner.is_active,
                                sort_order: banner.sort_order || 0,
                                end_time: banner.end_time
                                  ? toDatetimeLocal(banner.end_time)
                                  : "",
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBanner(banner);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          View only
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Banner Sheet */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Add Ads Banner</SheetTitle>
            <SheetDescription>
              Create a new advertisement banner
            </SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddBanner)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        folder="ads_banners"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (URL)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional URL to redirect when banner is clicked
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where should this show?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "carousel"}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select placement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="carousel">
                          Main Ads Carousel (left, big banner)
                        </SelectItem>
                        <SelectItem value="sidebar">
                          Sidebar Countdown Card (right, &quot;Cyber Sale&quot; style)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose &quot;Sidebar Countdown Card&quot; to make this
                      banner drive the pink flash-deal card with the
                      countdown timer next to the main homepage banner.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Countdown Ends At</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      For the sidebar flash-deal banner: the live countdown
                      runs until this date & time. Leave empty to hide the
                      countdown.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable to show this banner on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Banner Sheet */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Ads Banner</SheetTitle>
            <SheetDescription>Update banner information</SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateBanner)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        folder="ads_banners"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (URL)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional URL to redirect when banner is clicked
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where should this show?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "carousel"}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select placement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="carousel">
                          Main Ads Carousel (left, big banner)
                        </SelectItem>
                        <SelectItem value="sidebar">
                          Sidebar Countdown Card (right, &quot;Cyber Sale&quot; style)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose &quot;Sidebar Countdown Card&quot; to make this
                      banner drive the pink flash-deal card with the
                      countdown timer next to the main homepage banner.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Countdown Ends At</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      For the sidebar flash-deal banner: the live countdown
                      runs until this date & time. Leave empty to hide the
                      countdown.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable to show this banner on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ads
              banner "{selectedBanner?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
