"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Package, Save, ArrowLeft, Calculator, Check, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemUpdateSchema, ItemUpdateFormValues } from "@/hooks/domain/useItemValidation";
import { useUpdateItemMutation, useItemQuery, useItemOptionsQuery } from "@/hooks/data/useItemsQuery";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const itemName = decodeURIComponent(params.name);

    const updateMutation = useUpdateItemMutation({
        onSuccess: () => {
        // After successful update, redirect back to the item detail page
        router.push(`/stock/item/${itemName}`);
        },
    });
  const { data: itemData, isLoading: itemLoading } = useItemQuery(itemName);
  const { data: optionsData, isLoading: optionsLoading } = useItemOptionsQuery();

  // *** NEW: State for custom dropdowns ***
  const [itemGroupOpen, setItemGroupOpen] = useState(false);
  const [stockUomOpen, setStockUomOpen] = useState(false);
  const [itemGroupSearch, setItemGroupSearch] = useState("");
  const [uomSearch, setUomSearch] = useState("");

  const form = useForm<ItemUpdateFormValues>({
    resolver: zodResolver(itemUpdateSchema),
    defaultValues: {
      name: "",
      item_code: "",
      item_name: "",
      item_group: "",
      stock_uom: "",
      is_stock_item: 1,
      is_fixed_asset: 0,
      description: "",
      brand: "",
    },
  });

  // Populate form when item data is loaded
  useEffect(() => {
    if (itemData?.item) {
      const item = itemData.item;
      form.reset({
        name: item.name,
        item_code: item.item_code,
        item_name: item.item_name,
        item_group: item.item_group,
        stock_uom: item.stock_uom,
        is_stock_item: item.is_stock_item,
        is_fixed_asset: item.is_fixed_asset || 0,
        description: item.description || "",
        brand: item.brand || "",
      });
    }
  }, [itemData, form]);

  const onSubmit = (data: ItemUpdateFormValues) => {
    updateMutation.mutate({
      name: data.name, // Use the unique 'name' (e.g., P-004) for the update
      data,
    });
  };

  const handleBack = () => {
    router.push(`/stock/item/${itemName}`);
  };

  if (itemLoading || optionsLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Skeleton className="h-8 w-8 mr-3" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!itemData?.item) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
          <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  const itemGroups = optionsData?.data?.item_groups || [];
  const uoms = optionsData?.data?.uoms || [];

  // *** NEW: Filter logic for custom dropdowns ***
  const filteredItemGroups = itemGroups.filter((group) =>
    group.toLowerCase().includes(itemGroupSearch.toLowerCase())
  );
  const filteredUoms = uoms.filter((uom) =>
    uom.toLowerCase().includes(uomSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="w-8 h-8 mr-3 text-primary" />
              Edit Item
            </h1>
            <p className="text-muted-foreground">Update inventory item details</p>
          </div>
        </div>
        <Button
          form="item-form"
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateMutation.isPending ? "Updating..." : "Update Item"}
        </Button>
      </div>

      <Form {...form}>
        <form id="item-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update details for this item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="item_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item code" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="item_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* *** UPDATED: Custom Dropdown for Item Group *** */}
                    <FormField
                      control={form.control}
                      name="item_group"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Item Group *</FormLabel>
                          <Popover open={itemGroupOpen} onOpenChange={setItemGroupOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? itemGroups.find((group) => group === field.value)
                                    : "Select item group"}
                                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                              <div className="p-3">
                                <Input
                                  placeholder="Search item group..."
                                  value={itemGroupSearch}
                                  onChange={(e) => setItemGroupSearch(e.target.value)}
                                  className="mb-2"
                                />
                              </div>
                              <div className="max-h-60 overflow-auto p-1">
                                {filteredItemGroups.length > 0 ? (
                                  filteredItemGroups.map((group) => (
                                    <Button
                                      key={group}
                                      variant="ghost"
                                      className="w-full justify-start font-normal"
                                      onClick={() => {
                                        form.setValue("item_group", group, { shouldValidate: true });
                                        setItemGroupOpen(false);
                                        setItemGroupSearch("");
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          group === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {group}
                                    </Button>
                                  ))
                                ) : (
                                  <p className="py-6 text-center text-sm text-muted-foreground">No item group found.</p>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* *** UPDATED: Custom Dropdown for UOM *** */}
                    <FormField
                      control={form.control}
                      name="stock_uom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Stock Unit of Measure *</FormLabel>
                          <Popover open={stockUomOpen} onOpenChange={setStockUomOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? uoms.find((uom) => uom === field.value)
                                    : "Select UOM"}
                                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                              <div className="p-3">
                                <Input
                                  placeholder="Search UOM..."
                                  value={uomSearch}
                                  onChange={(e) => setUomSearch(e.target.value)}
                                  className="mb-2"
                                />
                              </div>
                              <div className="max-h-60 overflow-auto p-1">
                                {filteredUoms.length > 0 ? (
                                  filteredUoms.map((uom) => (
                                    <Button
                                      key={uom}
                                      variant="ghost"
                                      className="w-full justify-start font-normal"
                                      onClick={() => {
                                        form.setValue("stock_uom", uom, { shouldValidate: true });
                                        setStockUomOpen(false);
                                        setUomSearch("");
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          uom === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {uom}
                                    </Button>
                                  ))
                                ) : (
                                  <p className="py-6 text-center text-sm text-muted-foreground">No UOM found.</p>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_stock_item"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintain Stock</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Yes</SelectItem>
                              <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                          </Select>
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
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Yes</SelectItem>
                              <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
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
                          <textarea
                            placeholder="Enter item description"
                            className="w-full min-h-[80px] p-2 border rounded-md resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Item Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Item Code:</span>
                      <span className="font-medium">{form.watch("item_code") || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Item Name:</span>
                      <span className="font-medium">{form.watch("item_name") || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Item Group:</span>
                      <span>{form.watch("item_group") || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UOM:</span>
                      <span>{form.watch("stock_uom") || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maintain Stock:</span>
                      <span>{form.watch("is_stock_item") ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Asset:</span>
                      <span>{form.watch("is_fixed_asset") ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Review changes before updating the item.</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    form="item-form"
                    disabled={updateMutation.isPending || !form.formState.isValid}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? "Updating..." : "Update Item"}
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