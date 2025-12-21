export interface PurchaseReceiptItem {
    name?: string;
    item_code: string;
    item_name?: string;
    description?: string;
    qty: number;
    uom: string;
    rate: number;
    amount: number;
    warehouse?: string;
    batch_no?: string;
    serial_no?: string;
    purchase_order?: string;
    po_detail?: string;
    idx?: number;
}

export interface PurchaseReceipt {
    name: string;
    supplier: string;
    supplier_name?: string;
    posting_date: string;
    posting_time?: string;
    items: PurchaseReceiptItem[];
    company: string;
    set_warehouse?: string;
    docstatus: 0 | 1 | 2;
    purchase_order?: string; // Reference to parent PO
    creation?: string;
    modified?: string;
    owner?: string;
}

export interface PurchaseReceiptCreateRequest {
    supplier: string;
    posting_date: string;
    items: Omit<PurchaseReceiptItem, 'name'>[];
    company: string;
    purchase_order?: string;
}
