// types/item-price.ts
// Pana ERP - Item Price Type Definitions

export interface ItemPrice {
  name: string;
  item_code: string;
  item_name?: string;
  item_description?: string;
  price_list: string;
  buying?: number;
  selling?: number;
  currency: string;
  price_list_rate: number; // Required - the actual rate/price
  uom?: string;
  packing_unit?: number;
  min_qty?: number;
  customer?: string;
  supplier?: string;
  batch_no?: string;
  valid_from?: string;
  valid_upto?: string;
  lead_time_in_days?: number;
  note?: string;
  // Standard Frappe fields
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: 0 | 1 | 2;
}

export interface ItemPriceCreateRequest {
  item_code: string;
  price_list: string;
  price_list_rate: number; // Required - the actual rate/price
  uom?: string;
  packing_unit?: number;
  min_qty?: number;
  customer?: string;
  supplier?: string;
  batch_no?: string;
  valid_from?: string;
  valid_upto?: string;
  lead_time_in_days?: number;
  note?: string;
}

export interface ItemPriceUpdateRequest
  extends Partial<ItemPriceCreateRequest> {
  name?: string;
}

export interface ItemPriceFilters {
  item_code?: string;
  price_list?: string;
  customer?: string;
  supplier?: string;
  valid?: boolean; // Filter for currently valid prices
}

export interface ItemPriceOptions {
  price_lists: Array<{
    name: string;
    currency: string;
    buying: number;
    selling: number;
  }>;
  items: Array<{
    name: string;
    item_name: string;
    stock_uom: string;
  }>;
  customers: string[];
  suppliers: string[];
  uoms: string[];
}
