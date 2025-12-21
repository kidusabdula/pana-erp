export interface PurchaseOrderItem {
  name: string;
  item_code: string;
  item_name?: string;
  description?: string;
  qty: number;
  received_qty?: number;
  billed_qty?: number;
  uom: string;
  rate: number;
  amount: number;
  warehouse?: string;
}

export interface PurchaseOrder {
  name: string;
  supplier: string;
  supplier_name?: string;
  transaction_date: string;
  schedule_date?: string;
  total: number;
  grand_total: number;
  currency: string;
  status: "Draft" | "Submitted" | "To Receive" | "To Bill" | "To Receive and Bill" | "Completed" | "Cancelled" | "Closed";
  docstatus: 0 | 1 | 2;
  per_received: number;
  per_billed: number;
  items: PurchaseOrderItem[];
  company: string;
  creation: string;
  modified: string;
  owner: string;
}

export interface PurchaseOrderFilters {
  status?: string;
  supplier?: string;
  date_from?: string;
  date_to?: string;
}
