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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Package, Save, ArrowLeft, Calculator, Check, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemCreateSchema, ItemCreateFormValues } from "@/hooks/domain/useItemValidation";
import { useCreateItemMutation, useItemOptionsQuery } from "@/hooks/data/useItemsQuery";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AddItemPage() {
  const router = useRouter();
  const createMutation = useCreateItemMutation();
  const { data: optionsData, isLoading: optionsLoading } = useItemOptionsQuery();

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
  });

  const onSubmit = (data: ItemCreateFormValues) => {
    createMutation.mutate(data);
  };

  const handleBack = () => {
    router.push("/stock/item");
  };

  // Generate item code from item name
  const generateItemCode = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .toUpperCase();
  };

  // Auto-generate item code when item name changes
  useEffect(() => {
    const itemName = form.watch("item_name");
    const currentCode = form.watch("item_code");
    
    if (itemName && !currentCode) {
      const generatedCode = generateItemCode(itemName);
      form.setValue("item_code", generatedCode);
    }
  }, [form.watch("item_name"), form]);

  if (optionsLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading options...</p>
        </div>
      </div>
    );
  }

  const itemGroups = optionsData?.data?.item_groups || [];
  const uoms = optionsData?.data?.uoms || [];

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
              New Item
            </h1>
            <p className="text-muted-foreground">Create a new inventory item</p>
          </div>
        </div>
        <Button
          form="item-form"
          type="submit"
          disabled={createMutation.isPending}
          className="flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {createMutation.isPending ? "Creating..." : "Create Item"}
        </Button>
      </div>

      <Form {...form}>
        <form id="item-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic details for this item</CardDescription>
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
                            <Input
                              placeholder="Enter item code (e.g., ITM-001)"
                              {...field}
                            />
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
                            <Input
                              placeholder="Enter item name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="item_group"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Item Group *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "justify-between",
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
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search item group..." />
                                <CommandList>
                                  <CommandEmpty>No item group found.</CommandEmpty>
                                  <CommandGroup>
                                    {itemGroups.map((group) => (
                                      <CommandItem
                                        value={group}
                                        key={group}
                                        onSelect={(currentValue) => {
                                          form.setValue("item_group", currentValue);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            group === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {group}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock_uom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Stock Unit of Measure *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "justify-between",
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
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search UOM..." />
                                <CommandList>
                                  <CommandEmpty>No UOM found.</CommandEmpty>
                                  <CommandGroup>
                                    {uoms.map((uom) => (
                                      <CommandItem
                                        value={uom}
                                        key={uom}
                                        onSelect={(currentValue) => {
                                          form.setValue("stock_uom", currentValue);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            uom === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {uom}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
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
                            defaultValue={field.value.toString()}
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
                            defaultValue={field.value.toString()}
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
              {/* Summary Card */}
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
                      <span className="font-medium">
                        {form.watch("item_code") || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Item Name:</span>
                      <span className="font-medium">
                        {form.watch("item_name") || "-"}
                      </span>
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
                      <p>Fill in all required fields marked with (*) to create the item.</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    form="item-form"
                    disabled={createMutation.isPending || !form.formState.isValid}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? "Creating..." : "Create Item"}
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