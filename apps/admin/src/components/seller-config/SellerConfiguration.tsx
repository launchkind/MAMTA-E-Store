import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Loader2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

const sellerConfigSchema = z.object({
  sellerEnabled: z.boolean(),
  defaultCommissionRate: z.number().min(0).max(100),
  minOrderAmount: z.number().min(0),
  allowSellerRegistration: z.boolean(),
  requireApproval: z.boolean(),
  maxProductsPerSeller: z.number().min(0).optional(),
});

type SellerConfigFormValues = z.infer<typeof sellerConfigSchema>;

const DEFAULT_VALUES: SellerConfigFormValues = {
  sellerEnabled: true,
  defaultCommissionRate: 15,
  minOrderAmount: 0,
  allowSellerRegistration: true,
  requireApproval: true,
  maxProductsPerSeller: 1000,
};

const SellerConfiguration = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const { can } = usePermissions();
  const { toast } = useToast();

  const form = useForm<SellerConfigFormValues>({
    resolver: zodResolver(sellerConfigSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    fetchConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from("base_config")
        .select("id, seller_config")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setConfigId(data.id);
        const sc = data.seller_config as Partial<SellerConfigFormValues>;
        if (sc && Object.keys(sc).length > 0) {
          form.reset({
            sellerEnabled: sc.sellerEnabled ?? DEFAULT_VALUES.sellerEnabled,
            defaultCommissionRate: sc.defaultCommissionRate ?? DEFAULT_VALUES.defaultCommissionRate,
            minOrderAmount: sc.minOrderAmount ?? DEFAULT_VALUES.minOrderAmount,
            allowSellerRegistration: sc.allowSellerRegistration ?? DEFAULT_VALUES.allowSellerRegistration,
            requireApproval: sc.requireApproval ?? DEFAULT_VALUES.requireApproval,
            maxProductsPerSeller: sc.maxProductsPerSeller ?? DEFAULT_VALUES.maxProductsPerSeller,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching seller configuration:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load seller configuration" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SellerConfigFormValues) => {
    if (!can("manage_sellers")) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You don't have permission to update seller configuration" });
      return;
    }
    setSaving(true);
    try {
      if (configId) {
        const { error } = await supabase
          .from("base_config")
          .update({ seller_config: data })
          .eq("id", configId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from("base_config")
          .insert({ seller_config: data })
          .select("id")
          .single();
        if (error) throw error;
        setConfigId(inserted.id);
      }
      toast({ title: "Success", description: "Seller configuration updated successfully" });
    } catch (error) {
      console.error("Error updating seller configuration:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update seller configuration" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            <span>Seller System Configuration</span>
          </CardTitle>
          <CardDescription>Configure global settings for the seller management system</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">System Settings</h3>
                  <p className="text-sm text-muted-foreground">Control the overall seller system functionality</p>
                </div>
                <Separator />
                <FormField control={form.control} name="sellerEnabled" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Seller System</FormLabel>
                      <FormDescription>Turn on/off the entire seller functionality across the platform</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="allowSellerRegistration" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Seller Registration</FormLabel>
                      <FormDescription>Allow new users to apply as sellers</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="requireApproval" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Admin Approval</FormLabel>
                      <FormDescription>New seller applications require admin approval before activation</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Financial Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure commission rates and order minimums</p>
                </div>
                <Separator />
                <FormField control={form.control} name="defaultCommissionRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" min="0" max="100" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Default commission percentage taken from seller sales (0-100%)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="minOrderAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" min="0" step="1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormDescription>Minimum order amount required for seller products</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Seller Limits</h3>
                  <p className="text-sm text-muted-foreground">Set limits for seller accounts</p>
                </div>
                <Separator />
                <FormField control={form.control} name="maxProductsPerSeller" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Products Per Seller</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" min="0" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                    </FormControl>
                    <FormDescription>Maximum number of products a seller can list (leave empty for unlimited)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => form.reset()} disabled={saving}>Reset</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Configuration</>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerConfiguration;
