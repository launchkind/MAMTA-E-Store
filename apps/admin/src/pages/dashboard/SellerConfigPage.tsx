import { useEffect, useState } from "react";
import { isEqual } from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  Save,
  Undo2,
  Percent,
  Plus,
  Trash2,
  Pencil,
  Users,
} from "lucide-react";

interface SellerConfig {
  default_commission_pct: number;
  min_payout_amount: number;
  payout_schedule: "weekly" | "biweekly" | "monthly";
  auto_approve_sellers: boolean;
  seller_requirements: string;
}

const DEFAULT_CONFIG: SellerConfig = {
  default_commission_pct: 10,
  min_payout_amount: 0,
  payout_schedule: "monthly",
  auto_approve_sellers: false,
  seller_requirements: "",
};

interface CategoryOption {
  id: string;
  name: string;
}

interface CommissionRule {
  _id: string;
  category_id: string;
  category_name: string;
  commission_pct: number;
}

const ruleSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  commission_pct: z.coerce.number().min(0).max(100),
});

type RuleFormData = z.infer<typeof ruleSchema>;

export default function SellerConfigPage() {
  const { toast } = useToast();

  const [config, setConfig] = useState<SellerConfig>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<SellerConfig | null>(
    null
  );
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(
    null
  );
  const [ruleFormLoading, setRuleFormLoading] = useState(false);

  const formAdd = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { category_id: "", commission_pct: 10 },
  });
  const formEdit = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { category_id: "", commission_pct: 10 },
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seller_config")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        setConfigId(data.id);
        const normalized: SellerConfig = {
          default_commission_pct: data.default_commission_pct ?? 10,
          min_payout_amount: data.min_payout_amount ?? 0,
          payout_schedule: data.payout_schedule ?? "monthly",
          auto_approve_sellers: data.auto_approve_sellers ?? false,
          seller_requirements: data.seller_requirements ?? "",
        };
        setConfig(normalized);
        setOriginalConfig(normalized);
      } else {
        setOriginalConfig(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error("Failed to fetch seller config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load seller configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const { data, error } = await supabase
        .from("category_commission_rules")
        .select("id, category_id, commission_pct, category:categories!category_id(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setRules(
        (data || []).map((row) => ({
          _id: row.id,
          category_id: row.category_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category_name: (row.category as any)?.name || "Unknown Category",
          commission_pct: row.commission_pct,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch commission rules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load category commission rules",
      });
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchCategories();
    fetchRules();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (configId) {
        const { error } = await supabase
          .from("seller_config")
          .update(config)
          .eq("id", configId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("seller_config")
          .insert(config)
          .select("id")
          .single();
        if (error) throw error;
        setConfigId(data.id);
      }
      setOriginalConfig(config);
      toast({
        title: "Success",
        description: "Seller configuration saved successfully",
      });
    } catch (error) {
      console.error("Failed to save seller config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save seller configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalConfig) setConfig(originalConfig);
  };

  const hasChanges = !isEqual(config, originalConfig);

  // Category commission rule handlers
  const availableCategoriesForAdd = categories.filter(
    (c) => !rules.some((r) => r.category_id === c.id)
  );

  const handleAddRule = async (data: RuleFormData) => {
    setRuleFormLoading(true);
    try {
      const { error } = await supabase.from("category_commission_rules").insert({
        category_id: data.category_id,
        commission_pct: data.commission_pct,
      });
      if (error) throw error;

      toast({ title: "Success", description: "Commission rule added" });
      formAdd.reset({ category_id: "", commission_pct: 10 });
      setIsAddOpen(false);
      fetchRules();
    } catch (error) {
      console.error("Failed to add commission rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add commission rule",
      });
    } finally {
      setRuleFormLoading(false);
    }
  };

  const handleEditOpen = (rule: CommissionRule) => {
    setSelectedRule(rule);
    formEdit.reset({
      category_id: rule.category_id,
      commission_pct: rule.commission_pct,
    });
    setIsEditOpen(true);
  };

  const handleUpdateRule = async (data: RuleFormData) => {
    if (!selectedRule) return;
    setRuleFormLoading(true);
    try {
      const { error } = await supabase
        .from("category_commission_rules")
        .update({ commission_pct: data.commission_pct })
        .eq("id", selectedRule._id);
      if (error) throw error;

      toast({ title: "Success", description: "Commission rule updated" });
      setIsEditOpen(false);
      setSelectedRule(null);
      fetchRules();
    } catch (error) {
      console.error("Failed to update commission rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update commission rule",
      });
    } finally {
      setRuleFormLoading(false);
    }
  };

  const handleDeleteOpen = (rule: CommissionRule) => {
    setSelectedRule(rule);
    setIsDeleteOpen(true);
  };

  const handleDeleteRule = async () => {
    if (!selectedRule) return;
    try {
      const { error } = await supabase
        .from("category_commission_rules")
        .delete()
        .eq("id", selectedRule._id);
      if (error) throw error;

      toast({ title: "Success", description: "Commission rule removed" });
      setIsDeleteOpen(false);
      setSelectedRule(null);
      fetchRules();
    } catch (error) {
      console.error("Failed to delete commission rule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete commission rule",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="text-purple-600" size={32} />
          Seller Config
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure platform-wide vendor commission and payout rules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-purple-600" />
            Commission &amp; Payouts
          </CardTitle>
          <CardDescription>
            These apply to every seller unless overridden by a
            category-specific rule below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label>Default Commission (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={config.default_commission_pct}
                    disabled={saving}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        default_commission_pct: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Platform's cut of every sale, unless a category override
                    applies.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Minimum Payout Amount</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={config.min_payout_amount}
                    disabled={saving}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        min_payout_amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Sellers won't be paid out until their balance reaches
                    this amount.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Payout Schedule</Label>
                  <Select
                    value={config.payout_schedule}
                    onValueChange={(value) =>
                      setConfig((prev) => ({
                        ...prev,
                        payout_schedule: value as SellerConfig["payout_schedule"],
                      }))
                    }
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      Auto-approve Sellers
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Skip manual review for new seller applications.
                    </p>
                  </div>
                  <Switch
                    checked={config.auto_approve_sellers}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        auto_approve_sellers: checked,
                      }))
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Seller Requirements</Label>
                <Textarea
                  rows={4}
                  value={config.seller_requirements}
                  disabled={saving}
                  placeholder="e.g. Valid business registration, GST number, minimum 10 products to list..."
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      seller_requirements: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Shown to prospective sellers on the "Become a Seller" page.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!hasChanges || saving}
        >
          <Undo2 className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Category Commission Overrides</CardTitle>
            <CardDescription>
              Set a different commission rate for specific categories.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            disabled={availableCategoriesForAdd.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Override
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rulesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No category overrides yet. All categories use the
                      default commission rate.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule._id}>
                    <TableCell className="font-medium">
                      {rule.category_name}
                    </TableCell>
                    <TableCell>{rule.commission_pct}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditOpen(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOpen(rule)}
                          className="text-destructive hover:text-destructive"
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
        </CardContent>
      </Card>

      {/* Add Rule Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Commission Override</DialogTitle>
            <DialogDescription>
              Set a custom commission rate for a specific category.
            </DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddRule)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={ruleFormLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategoriesForAdd.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="commission_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        {...field}
                        disabled={ruleFormLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={ruleFormLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={ruleFormLoading}>
                  {ruleFormLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Override
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Commission Override</DialogTitle>
            <DialogDescription>
              Update the commission rate for{" "}
              <span className="font-medium">
                {selectedRule?.category_name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateRule)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="commission_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        {...field}
                        disabled={ruleFormLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={ruleFormLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={ruleFormLoading}>
                  {ruleFormLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Commission Override</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">
                {selectedRule?.category_name}
              </span>{" "}
              will fall back to the default commission rate. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
