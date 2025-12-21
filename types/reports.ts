export interface GLEntry {
  name: string;
  posting_date: string;
  account: string;
  party_type?: string;
  party?: string;
  voucher_type: string;
  voucher_no: string;
  debit: number;
  credit: number;
  balance?: number; // Calculated on fly usually, or fetched
  against?: string;
  remarks?: string;
}

export interface GLReportFilters {
    from_date: string;
    to_date: string;
    company: string;
    account?: string;
    party_type?: string;
    party?: string;
}

export interface AgingEntry {
    party_type: string;
    party: string;
    party_name: string;
    total_outstanding: number;
    range1: number; // 0-30
    range2: number; // 31-60
    range3: number; // 61-90
    range4: number; // 90+
    currency: string;
}

export interface AgingReportFilters {
    report_date: string;
    company: string;
    party_type: "Customer" | "Supplier";
    range_1?: number;
    range_2?: number;
    range_3?: number;
}
