import { z } from "zod";

export const itemCreateSchema = z.object({
  item_code: z.string().min(1, "Item code is required"),
  item_name: z.string().min(1, "Item name is required"),
  item_group: z.string().min(1, "Item group is required"),
  stock_uom: z.string().min(1, "Stock UOM is required"),
  is_stock_item: z.number().int().min(0).max(1).default(1),
  is_fixed_asset: z.number().int().min(0).max(1).default(0),
  description: z.string().optional(),
  brand: z.string().optional(),
});

export const itemUpdateSchema = itemCreateSchema.partial().extend({
  name: z.string().min(1, "Item name is required"),
});

export type ItemCreateFormValues = z.infer<typeof itemCreateSchema>;
export type ItemUpdateFormValues = z.infer<typeof itemUpdateSchema>;