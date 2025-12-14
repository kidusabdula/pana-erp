// app/stock/item/[name]/edit/page.tsx
// Pana ERP v1.3 - Edit Item Page (Production-Ready Template)
"use client";

import { useParams, useRouter } from "next/navigation";
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
  useItemQuery,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useItemOptionsQuery,
} from "@/hooks/data/useItemsQuery";
import {
  Save,
  Package,
  FileText,
  Settings,
  Clock,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  frappeToForm,
  defaultItemFormValues,
} from "@/lib/schemas/item";
import { cn } from "@/lib/utils";

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-16 bg-secondary/50 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-80 bg-secondary/30 rounded-[2rem]" />
          <div className="h-40 bg-secondary/30 rounded-[2rem]" />
        </div>
        <div className="lg:col-span-4 h-60 bg-secondary/20 rounded-[2rem]" />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const itemName = decodeURIComponent(params.name);

  const { data: itemData, isLoading } = useItemQuery(itemName);
  const { data: optionsData } = useItemOptionsQuery();
  const updateMutation = useUpdateItemMutation();
  const deleteMutation = useDeleteItemMutation();

  const item = itemData?.item;
  const itemGroups = optionsData?.data?.item_groups || [];
  const uoms = optionsData?.data?.stock_uoms || [];

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: defaultItemFormValues,
  });

  // Initialize form with item data
  useEffect(() => {
    if (item) {
      const formData = frappeToForm(item);
      form.reset(formData);
    }
  }, [item, form]);

  // Track unsaved changes
  const watchedValues = form.watch();
  const hasChanges = useMemo(() => {
    if (!item) return false;
    const originalData = frappeToForm(item);
    return JSON.stringify(watchedValues) !== JSON.stringify(originalData);
  }, [item, watchedValues]);

  // Submit handler
  const onSubmit = async (data: ItemFormData) => {
    try {
      const frappeData = formToFrappe(data);
      await updateMutation.mutateAsync({
        name: itemName,
        data: frappeData as any,
      });
      router.push(`/stock/item/${encodeURIComponent(itemName)}`);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${item?.item_name}"?`)) {
      try {
        await deleteMutation.mutateAsync(item?.name || itemName);
        router.push("/stock/item");
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  if (isLoading || !item) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <PageHeader
        backUrl={`/stock/item/${encodeURIComponent(itemName)}`}
        label="Editing"
        title={item.item_name}
        status={{
          label: item.disabled ? "Inactive" : "Active",
          variant: item.disabled ? "destructive" : "success",
        }}
        hasChanges={hasChanges}
        primaryAction={{
          label: "Save Changes",
          icon: <Save className="h-4 w-4" />,
          onClick: form.handleSubmit(onSubmit),
          loading: updateMutation.isPending,
          disabled: !hasChanges,
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0 p-2"
          >
            <DropdownMenuItem
              className="rounded-xl text-destructive focus:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

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
                        <DataField label="Item Code" hint="Cannot be changed">
                          <PremiumInput {...field} disabled mono />
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
                                <SelectValue />
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
                                <SelectValue />
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
                          placeholder="Enter a detailed description..."
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="is_stock_item"
                    render={({ field }) => (
                      <ToggleCard
                        checked={field.value}
                        onChange={field.onChange}
                        title="Stock Item"
                        description="Track inventory"
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
                        description="Depreciate"
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disabled"
                    render={({ field }) => (
                      <ToggleCard
                        checked={field.value}
                        onChange={field.onChange}
                        title="Disabled"
                        description="Inactive"
                        variant="destructive"
                      />
                    )}
                  />
                </div>
              </InfoCard>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-20 space-y-6">
                {/* Status */}
                <InfoCard
                  variant="gradient"
                  gradientFrom={
                    hasChanges ? "from-amber-50" : "from-emerald-50"
                  }
                  gradientTo={
                    hasChanges ? "to-amber-100/50" : "to-emerald-100/50"
                  }
                  delay={100}
                >
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Status
                  </h3>
                  {hasChanges ? (
                    <div className="space-y-2">
                      <p className="text-amber-700 font-semibold text-sm">
                        Unsaved changes
                      </p>
                      <p className="text-xs text-amber-600/80">
                        Click &quot;Save Changes&quot; to apply
                      </p>
                    </div>
                  ) : (
                    <p className="text-emerald-700 font-semibold text-sm">
                      All changes saved
                    </p>
                  )}
                </InfoCard>

                {/* Metadata */}
                <InfoCard delay={200} className="bg-secondary/30">
                  <h3 className="font-bold text-sm mb-4">System Info</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Created
                      </p>
                      <p className="font-mono text-xs">
                        {item.creation
                          ? new Date(item.creation).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Last Modified
                      </p>
                      <p className="font-mono text-xs">
                        {item.modified
                          ? new Date(item.modified).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
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
