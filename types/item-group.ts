// types/item-group.ts
// Pana ERP - Item Group Type Definitions

/**
 * Item Group - Frappe API response format
 * Uses numbers (0/1) for boolean fields as returned by Frappe
 */
export interface ItemGroup {
  name: string;
  item_group_name: string;
  parent_item_group: string;
  is_group: number; // 0 or 1 - indicates if this is a group node
  old_parent: string;
  lft: number;
  rgt: number;
  default_price_list?: string;
  default_warehouse?: string;
  default_buying_cost_center?: string;
  default_selling_cost_center?: string;
  default_expense_account?: string;
  default_income_account?: string;
  default_supplier?: string;
  default_item_tax_template?: string;
  tax_category?: string;
  disabled?: number; // 0 or 1
  // Standard Frappe fields
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: 0 | 1 | 2;
}

export interface ItemGroupCreateRequest {
  item_group_name: string;
  parent_item_group: string;
  is_group?: number; // 0 or 1
  default_price_list?: string;
  default_warehouse?: string;
  default_buying_cost_center?: string;
  default_selling_cost_center?: string;
  default_expense_account?: string;
  default_income_account?: string;
  default_supplier?: string;
  default_item_tax_template?: string;
  tax_category?: string;
}

export interface ItemGroupUpdateRequest extends Partial<ItemGroupCreateRequest> {
  name?: string;
}

export interface ItemGroupFilters {
  name?: string;
  parent?: string;
  is_group?: boolean;
}

export interface ItemGroupOptions {
  item_groups: ItemGroup[];
  price_lists: { value: string; label: string }[];
  warehouses: { value: string; label: string }[];
  cost_centers: { value: string; label: string }[];
  expense_accounts: { value: string; label: string }[];
  income_accounts: { value: string; label: string }[];
  suppliers: { value: string; label: string }[];
  tax_templates: { value: string; label: string }[];
  tax_categories: { value: string; label: string }[];
}

export interface ItemGroupTreeNode extends ItemGroup {
  children: ItemGroupTreeNode[];
  expanded?: boolean;
}