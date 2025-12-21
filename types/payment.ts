export type PaymentType = "Receive" | "Pay";
export type PartyType = "Customer" | "Supplier";

export interface PaymentReference {
  reference_doctype: "Sales Invoice" | "Purchase Invoice";
  reference_name: string;
  total_amount?: number;
  outstanding_amount?: number;
  allocated_amount: number;
}

export interface PaymentEntry {
  name?: string;
  payment_type: PaymentType;
  party_type: PartyType;
  party: string;
  party_name?: string;
  posting_date: string;
  mode_of_payment: string;
  paid_amount: number;
  received_amount?: number;
  reference_no?: string;
  reference_date?: string;
  paid_to?: string; // Account Paid To (for Receive)
  paid_from?: string; // Account Paid From (for Pay)
  references: PaymentReference[];
  docstatus?: 0 | 1 | 2;
  company: string;
}

export interface PaymentEntryCreateRequest {
    payment_type: PaymentType;
    party_type: PartyType;
    party: string;
    posting_date: string;
    mode_of_payment: string;
    paid_amount: number;
    company: string;
    references: PaymentReference[];
}
