// lib/schemas/item.ts
// Pana ERP v1.3 - Centralized Item Schema & Type Utilities

import { z } from "zod";
import { Item } from "@/types/item";

/**
 * Item Form Schema - Used for form validation
 * All fields have explicit types matching the default values
 */
export const itemFormSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  item_code: z.string().min(1, "Item code is required"),
  item_group: z.string().min(1, "Item group is required"),
  stock_uom: z.string().min(1, "Unit of measure is required"),
  description: z.string(),
  brand: z.string(),
  is_stock_item: z.boolean(),
  is_fixed_asset: z.boolean(),
  disabled: z.boolean(),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

/**
 * Default form values - ensure types match schema exactly
 */
export const defaultItemFormValues: ItemFormData = {
  item_name: "",
  item_code: "",
  item_group: "",
  stock_uom: "",
  description: "",
  brand: "",
  is_stock_item: true,
  is_fixed_asset: false,
  disabled: false,
};

/**
 * Convert form data (boolean) to Frappe API format (0/1)
 */
export function formToFrappe(
  data: ItemFormData
): Record<string, string | number> {
  return {
    item_name: data.item_name,
    item_code: data.item_code,
    item_group: data.item_group,
    stock_uom: data.stock_uom,
    description: data.description,
    brand: data.brand,
    is_stock_item: data.is_stock_item ? 1 : 0,
    is_fixed_asset: data.is_fixed_asset ? 1 : 0,
    disabled: data.disabled ? 1 : 0,
  };
}

/**
 * Convert Frappe API response (0/1) to form data (boolean)
 */
export function frappeToForm(item: Item): ItemFormData {
  return {
    item_name: item.item_name || "",
    item_code: item.item_code || "",
    item_group: item.item_group || "",
    stock_uom: item.stock_uom || "",
    description: item.description || "",
    brand: item.brand || "",
    is_stock_item: Boolean(item.is_stock_item),
    is_fixed_asset: Boolean(item.is_fixed_asset),
    disabled: Boolean(item.disabled),
  };
}

/**
 * Generate item code from name
 */
export function generateItemCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 20);
}
