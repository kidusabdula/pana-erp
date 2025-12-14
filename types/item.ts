// types/item.ts
// Pana ERP v1.3 - Item Type Definitions

/**
 * Item - Frappe API response format
 * Uses numbers (0/1) for boolean fields as returned by Frappe
 */
export interface Item {
  name: string;
  item_code: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  is_stock_item: number;
  is_fixed_asset?: number;
  valuation_rate?: number;
  brand?: string;
  disabled?: number;
  description?: string;
  qty?: number;
  uom?: string;
  basic_rate?: number;
  warehouse?: string;
  // Standard Frappe fields
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: 0 | 1 | 2;
}

/**
 * Item with computed stock information
 */
export interface ItemWithStock extends Item {
  actual_qty?: number;
  reserved_qty?: number;
  ordered_qty?: number;
  projected_qty?: number;
}

/**
 * Item Create/Update Request - Frappe API format
 */
export interface ItemCreateRequest {
  item_code: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  is_stock_item: number;
  is_fixed_asset?: number;
  description?: string;
  brand?: string;
  disabled?: number;
}

/**
 * Item Update Request - Partial create request with name
 */
export interface ItemUpdateRequest extends Partial<ItemCreateRequest> {
  name?: string;
}

/**
 * Item Options - Dropdown options from API
 */
export interface ItemOptions {
  item_groups: string[];
  stock_uoms: string[];
}

/**
 * Item Filters for list queries
 */
export interface ItemFilters {
  name?: string;
  group?: string;
  status?: string;
  id?: string;
}
