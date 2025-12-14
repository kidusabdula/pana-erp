// app/stock/item/new/page.tsx
// Pana ERP v1.2 - Premium Add Item Page Template
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Package,
  Save,
  ArrowLeft,
  Check,
  Search,
  Sparkles,
  Box,
  Tag,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  itemCreateSchema,
  ItemCreateFormValues,
} from "@/hooks/domain/useItemValidation";
import {
  useCreateItemMutation,
  useItemOptionsQuery,
} from "@/hooks/data/useItemsQuery";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Searchable Select Component
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal h-10",
            !value && "text-muted-foreground"
          )}
        >
          {value || placeholder}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2 border-b border-border">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="max-h-60 overflow-auto p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <Button
                key={option}
                variant="ghost"
                className="w-full justify-start font-normal h-9"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    option === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </Button>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Loading Skeleton for Options
function FormSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-9 w-9 rounded" />
        <div className="space-y-2">
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="skeleton h-96 rounded-xl" />
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function AddItemPage() {
  const router = useRouter();
  const createMutation = useCreateItemMutation({
    onSuccess: (data) => {
      const newItemName = data.data.item.item_name;
      router.push(`/stock/item/${encodeURIComponent(newItemName)}`);
    },
  });

  const { data: optionsData, isLoading: optionsLoading } =
    useItemOptionsQuery();

  const form = useForm<ItemCreateFormValues>({
    resolver: zodResolver(itemCreateSchema),
    defaultValues: {
      item_code: "",
      item_name: "",
      item_group: "",
      stock_uom: "Nos",
      is_stock_item: 1,
      is_fixed_asset: 0,
      description: "",
      brand: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: ItemCreateFormValues) => {
    createMutation.mutate(data);
  };

  // Auto-generate item code from item name
  const generateItemCode = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .toUpperCase()
      .slice(0, 20);
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "item_name") {
        const itemName = value.item_name;
        const currentCode = form.getValues("item_code");
        if (itemName && !currentCode) {
          const generatedCode = generateItemCode(itemName);
          form.setValue("item_code", generatedCode, { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  if (optionsLoading) {
    return <FormSkeleton />;
  }

  const itemGroups = optionsData?.data?.item_groups || [];
  const uoms = optionsData?.data?.uoms || [];

  const watchedValues = form.watch();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/stock/item")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
              Add New Item
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new inventory item
            </p>
          </div>
        </div>
        <Button
          form="item-form"
          type="submit"
          disabled={createMutation.isPending || !form.formState.isValid}
          className="w-full sm:w-auto"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Item
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form id="item-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">
                      Basic Information
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Enter the essential details for this item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="item_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Business Cards"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="item_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Item Code *
                            <span className="text-xs text-muted-foreground font-normal">
                              (auto-generated)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., BC-001"
                              className="font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="item_group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Group *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              value={field.value}
                              onChange={field.onChange}
                              options={itemGroups}
                              placeholder="Select group"
                              searchPlaceholder="Search groups..."
                              emptyMessage="No groups found"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock_uom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              value={field.value}
                              onChange={field.onChange}
                              options={uoms}
                              placeholder="Select UOM"
                              searchPlaceholder="Search UOM..."
                              emptyMessage="No UOM found"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Pana Promotion"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Enter the brand or manufacturer name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a detailed description of the item..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how this item is managed in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_stock_item"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintain Stock</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Yes</SelectItem>
                              <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Track stock levels for this item
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_fixed_asset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is Fixed Asset</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">No</SelectItem>
                              <SelectItem value="1">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Treat as a fixed asset for accounting
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Summary */}
            <div className="space-y-6">
              <Card className="shadow-sm sticky top-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Item Name</span>
                      <span className="font-medium truncate max-w-[140px]">
                        {watchedValues.item_name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Item Code</span>
                      <span className="font-mono text-xs">
                        {watchedValues.item_code || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Group</span>
                      <span>{watchedValues.item_group || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">UOM</span>
                      <span>{watchedValues.stock_uom || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Maintain Stock
                      </span>
                      <span>{watchedValues.is_stock_item ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fixed Asset</span>
                      <span>{watchedValues.is_fixed_asset ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Fill in all required fields marked with (*) to create the
                      item.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    form="item-form"
                    disabled={
                      createMutation.isPending || !form.formState.isValid
                    }
                    className="w-full"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Item
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
