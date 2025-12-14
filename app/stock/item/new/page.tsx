// app/stock/item/new/page.tsx
// Pana ERP v1.3 - Create Item Page (Production-Ready Template)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateItemMutation,
  useItemOptionsQuery,
} from "@/hooks/data/useItemsQuery";
import {
  Save,
  Sparkles,
  Package,
  FileText,
  Settings,
  Loader2,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { InfoCard } from "@/components/ui/info-card";
import {
  DataField,
  PremiumInput,
  ToggleCard,
} from "@/components/ui/form-field";
import {
  itemFormSchema,
  ItemFormData,
  formToFrappe,
  generateItemCode,
  defaultItemFormValues,
} from "@/lib/schemas/item";

// ============================================================================
// Main Page Component
// ============================================================================

export default function CreateItemPage() {
  const router = useRouter();
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { data: optionsData } = useItemOptionsQuery();
  const createMutation = useCreateItemMutation();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: defaultItemFormValues,
  });

  const itemGroups = optionsData?.data?.item_groups || [];
  const uoms = optionsData?.data?.stock_uoms || [];

  // Auto-generate item code from name
  const handleNameChange = (name: string) => {
    form.setValue("item_name", name);
    if (!form.getValues("item_code") || isGeneratingCode) {
      setIsGeneratingCode(true);
      const code = generateItemCode(name);
      form.setValue("item_code", code);
      setTimeout(() => setIsGeneratingCode(false), 300);
    }
  };

  // Submit handler
  const onSubmit = async (data: ItemFormData) => {
    try {
      const frappeData = formToFrappe(data);
      await createMutation.mutateAsync(frappeData as any);
      router.push("/stock/item");
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <PageHeader
        backUrl="/stock/item"
        label="New Item"
        title="Create Product"
        primaryAction={{
          label: "Create Item",
          icon: <Save className="h-4 w-4" />,
          onClick: form.handleSubmit(onSubmit),
          loading: createMutation.isPending,
        }}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Core Information */}
              <InfoCard
                title={
                  <>
                    <Package className="h-4 w-4" /> Core Information
                  </>
                }
                delay={100}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="item_name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <DataField
                          label="Item Name"
                          required
                          error={form.formState.errors.item_name?.message}
                        >
                          <PremiumInput
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Enter item name..."
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="item_code"
                    render={({ field }) => (
                      <FormItem>
                        <DataField
                          label="Item Code"
                          required
                          error={form.formState.errors.item_code?.message}
                        >
                          <div className="relative">
                            <PremiumInput
                              {...field}
                              placeholder="Auto-generated..."
                              mono
                            />
                            {isGeneratingCode && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                            )}
                          </div>
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <DataField label="Brand (Optional)">
                          <PremiumInput
                            {...field}
                            placeholder="Brand name..."
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="item_group"
                    render={({ field }) => (
                      <FormItem>
                        <DataField
                          label="Item Group"
                          required
                          error={form.formState.errors.item_group?.message}
                        >
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0 shadow-none">
                                <SelectValue placeholder="Select group..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0">
                              {itemGroups.map((g) => (
                                <SelectItem
                                  key={g}
                                  value={g}
                                  className="rounded-xl"
                                >
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </DataField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock_uom"
                    render={({ field }) => (
                      <FormItem>
                        <DataField
                          label="Unit of Measure"
                          required
                          error={form.formState.errors.stock_uom?.message}
                        >
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0 shadow-none">
                                <SelectValue placeholder="Select UOM..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0">
                              {uoms.map((u) => (
                                <SelectItem
                                  key={u}
                                  value={u}
                                  className="rounded-xl"
                                >
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </DataField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InfoCard>

              {/* Description */}
              <InfoCard
                title={
                  <>
                    <FileText className="h-4 w-4" /> Description
                  </>
                }
                delay={200}
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter a detailed description of the item..."
                          className="min-h-[120px] rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0 resize-none transition-all duration-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </InfoCard>

              {/* Configuration */}
              <InfoCard
                title={
                  <>
                    <Settings className="h-4 w-4" /> Configuration
                  </>
                }
                delay={300}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_stock_item"
                    render={({ field }) => (
                      <ToggleCard
                        checked={field.value}
                        onChange={field.onChange}
                        title="Maintain Stock"
                        description="Track inventory levels"
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_fixed_asset"
                    render={({ field }) => (
                      <ToggleCard
                        checked={field.value}
                        onChange={field.onChange}
                        title="Fixed Asset"
                        description="Depreciate over time"
                      />
                    )}
                  />
                </div>
              </InfoCard>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-20 space-y-6">
                {/* Live Preview */}
                <InfoCard
                  variant="gradient"
                  gradientFrom="from-primary/5"
                  gradientTo="to-primary/10"
                  delay={100}
                >
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Preview
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Name
                      </p>
                      <p className="font-bold text-sm truncate">
                        {watchedValues.item_name || "—"}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Code
                      </p>
                      <p className="font-mono text-sm font-semibold truncate">
                        {watchedValues.item_code || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                          Group
                        </p>
                        <p className="font-medium text-xs truncate">
                          {watchedValues.item_group || "—"}
                        </p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                          UOM
                        </p>
                        <p className="font-medium text-xs truncate">
                          {watchedValues.stock_uom || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </InfoCard>

                {/* Tips */}
                <InfoCard delay={200} className="bg-secondary/30">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Quick Tips
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Item code auto-generates from name</p>
                    <p>• Stock items track inventory levels</p>
                    <p>• Fixed assets depreciate over time</p>
                  </div>
                </InfoCard>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
