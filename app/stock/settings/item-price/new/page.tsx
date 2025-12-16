// app/stock/settings/item-price/new/page.tsx
// Pana ERP v1.3 - Create Item Price (Premium Borderless Design)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateItemPriceMutation,
  useItemPriceOptionsQuery,
} from "@/hooks/data/useItemPriceQuery";
import {
  ArrowLeft,
  Save,
  DollarSign,
  Package,
  Tag,
  Calendar,
  Loader2,
  Layers,
  Users,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const itemPriceSchema = z.object({
  item_code: z.string().min(1, "Item is required"),
  price_list: z.string().min(1, "Price list is required"),
  price_list_rate: z.coerce.number().min(0, "Rate must be positive"),
  uom: z.string().optional(),
  min_qty: z.coerce.number().optional(),
  packing_unit: z.coerce.number().optional(),
  customer: z.string().optional(),
  supplier: z.string().optional(),
  batch_no: z.string().optional(),
  valid_from: z.string().optional(),
  valid_upto: z.string().optional(),
  lead_time_in_days: z.coerce.number().optional(),
  note: z.string().optional(),
});

type ItemPriceFormData = z.infer<typeof itemPriceSchema>;

function DataField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

export default function NewItemPricePage() {
  const router = useRouter();
  const { data: optionsData, isLoading: optionsLoading } =
    useItemPriceOptionsQuery();
  const createMutation = useCreateItemPriceMutation();

  const [selectedPriceList, setSelectedPriceList] = useState<{
    name: string;
    currency: string;
    buying: number;
    selling: number;
  } | null>(null);

  const form = useForm<ItemPriceFormData>({
    resolver: zodResolver(itemPriceSchema),
    defaultValues: {
      valid_from: new Date().toISOString().split("T")[0],
    },
  });

  const options = optionsData?.data;
  const items = options?.items || [];
  const priceLists = options?.price_lists || [];
  const customers = options?.customers || [];
  const suppliers = options?.suppliers || [];
  const uoms = options?.uoms || [];

  // Update currency when price list changes
  const handlePriceListChange = (value: string) => {
    form.setValue("price_list", value);
    const pl = priceLists.find((p) => p.name === value);
    setSelectedPriceList(pl || null);
    // Clear customer/supplier when switching price list types
    if (pl?.selling && !pl.buying) {
      form.setValue("supplier", "");
    } else if (pl?.buying && !pl.selling) {
      form.setValue("customer", "");
    }
  };

  const onSubmit = async (data: ItemPriceFormData) => {
    try {
      await createMutation.mutateAsync(data);
      router.push("/stock/settings/item-price");
    } catch (error) {
      console.error("Failed to create item price:", error);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-4 z-20 bg-white/80 backdrop-blur-xl p-2 pr-4 rounded-full shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/stock/settings/item-price")}
            className="rounded-full h-10 w-10 hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="h-8 w-[1px] bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              New
            </span>
            <h1 className="text-lg font-bold leading-none">Item Price</h1>
          </div>
        </div>

        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
          className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Create Price
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Core Pricing */}
              <div className="bg-card rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 mb-6 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="item_code"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Item *
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={items.map((item) => ({
                              value: item.name,
                              label: item.name,
                              description: item.item_name,
                            }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select item..."
                            searchPlaceholder="Search items..."
                            emptyText="No items found."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_list"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Price List *
                        </FormLabel>
                        <Select
                          onValueChange={handlePriceListChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0">
                              <SelectValue placeholder="Select price list..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0">
                            {priceLists.map((pl) => (
                              <SelectItem
                                key={pl.name}
                                value={pl.name}
                                className="rounded-xl"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{pl.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({pl.currency})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_list_rate"
                    render={({ field }) => (
                      <FormItem>
                        <DataField
                          label="Rate *"
                          error={form.formState.errors.price_list_rate?.message}
                        >
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                              {selectedPriceList?.currency || "$"}
                            </span>
                            <input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white focus:shadow-lg outline-none transition-all duration-300 font-mono text-lg"
                            />
                          </div>
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          UOM
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={uoms.map((uom) => ({
                              value: uom,
                              label: uom,
                            }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Default UOM"
                            searchPlaceholder="Search UOMs..."
                            emptyText="No UOMs found."
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_qty"
                    render={({ field }) => (
                      <FormItem>
                        <DataField label="Minimum Quantity">
                          <input
                            {...field}
                            type="number"
                            placeholder="No minimum"
                            className="w-full h-12 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white focus:shadow-lg outline-none transition-all duration-300"
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Customer/Supplier (Conditional) */}
              {selectedPriceList && (
                <div className="bg-card rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 mb-6 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Customer / Supplier Specific
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {(selectedPriceList.selling ||
                      (!selectedPriceList.selling &&
                        !selectedPriceList.buying)) && (
                      <FormField
                        control={form.control}
                        name="customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Customer
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0">
                                  <SelectValue placeholder="All customers" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0">
                                {customers.map((c) => (
                                  <SelectItem
                                    key={c}
                                    value={c}
                                    className="rounded-xl"
                                  >
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}

                    {(selectedPriceList.buying ||
                      (!selectedPriceList.selling &&
                        !selectedPriceList.buying)) && (
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Supplier
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0">
                                  <SelectValue placeholder="All suppliers" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0">
                                {suppliers.map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="rounded-xl"
                                  >
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Validity & Advanced */}
              <div className="bg-card rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 mb-6 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Validity & Advanced
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="valid_from"
                    render={({ field }) => (
                      <FormItem>
                        <DataField label="Valid From">
                          <input
                            {...field}
                            type="date"
                            className="w-full h-12 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white outline-none transition-all duration-300"
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valid_upto"
                    render={({ field }) => (
                      <FormItem>
                        <DataField label="Valid Until">
                          <input
                            {...field}
                            type="date"
                            className="w-full h-12 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white outline-none transition-all duration-300"
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lead_time_in_days"
                    render={({ field }) => (
                      <FormItem>
                        <DataField label="Lead Time (Days)">
                          <input
                            {...field}
                            type="number"
                            placeholder="0"
                            className="w-full h-12 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white outline-none transition-all duration-300"
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packing_unit"
                    render={({ field }) => (
                      <FormItem>
                        <DataField label="Packing Unit">
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="w-full h-12 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white outline-none transition-all duration-300"
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="batch_no"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <DataField label="Batch No">
                          <input
                            {...field}
                            placeholder="Leave empty for all batches"
                            className="w-full h-12 px-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white outline-none transition-all duration-300"
                          />
                        </DataField>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Note */}
              <div className="bg-card rounded-[2rem] p-8 shadow-sm animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 mb-6 flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Notes
                </h3>

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add any notes about this price..."
                          className="min-h-[100px] rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0 resize-none transition-all duration-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Preview */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-[2rem] p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Preview
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Item
                      </p>
                      <p className="font-bold text-sm truncate">
                        {watchedValues.item_code || "—"}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Price
                      </p>
                      <p className="font-bold text-xl text-primary tabular-nums">
                        {selectedPriceList?.currency || "$"}{" "}
                        {watchedValues.price_list_rate || "0.00"}
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                        Price List
                      </p>
                      <p className="font-medium text-sm">
                        {watchedValues.price_list || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-secondary/30 rounded-[2rem] p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Tips
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Select a Selling price list for customer pricing</p>
                    <p>• Select a Buying price list for supplier pricing</p>
                    <p>• Set validity dates for time-limited prices</p>
                    <p>• Use batch numbers for batch-specific pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
