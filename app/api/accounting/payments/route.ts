import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { PaymentEntry } from "@/types/payment";

export async function GET(request: NextRequest) {
  return handleApiRequest(
    withEndpointLogging("/api/accounting/payments - GET")(async () => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get("action");

      if (action === "get_outstanding_invoices") {
          const partyType = searchParams.get("party_type");
          const party = searchParams.get("party");

          if (!partyType || !party) throw new Error("Party Type and Party are required");

          const doctype = partyType === "Customer" ? "Sales Invoice" : "Purchase Invoice";
          const accountField = partyType === "Customer" ? "debit_to" : "credit_to";

          const invoices = await frappeClient.db.getDocList(doctype, {
              fields: ["name", "posting_date", "grand_total", "outstanding_amount", "currency", accountField],
              filters: [
                  [partyType.toLowerCase(), "=", party],
                  ["docstatus", "=", 1],
                  ["outstanding_amount", ">", 0]
              ]
          });
          
          // Map backend specific account fields to generic 'party_account' for frontend
          const mappedInvoices = invoices.map((inv: any) => ({
             ...inv,
             party_account: inv[accountField]
          }));

          return { invoices: mappedInvoices };
      }

      if (action === "get_payment_modes") {
          const modes = await frappeClient.db.getDocList("Mode of Payment", {
              fields: ["name", "type"]
          });
          return { modes };
      }

      if (action === "get_parties") {
        const partyType = searchParams.get("party_type");
        if (!partyType) throw new Error("Party Type required");

        const doctype = partyType; // "Customer" or "Supplier"
        const nameField = partyType === "Customer" ? "customer_name" : "supplier_name";
        
        const parties = await frappeClient.db.getDocList(doctype, {
            fields: ["name", nameField],
            orderBy: { field: "creation", order: "desc" },
            limit: 1000
        });
        return { parties };
      }

      // Default: List Payments
      const limit = parseInt(searchParams.get("limit") || "100");
      const paymentNames = await frappeClient.db.getDocList<{ name: string }>(
        "Payment Entry",
        {
          fields: ["name"],
          orderBy: { field: "posting_date", order: "desc" },
          limit,
        }
      );
      
      const payments = await Promise.all(
          paymentNames.map(async (p) => {
              const doc = await frappeClient.db.getDoc<any>("Payment Entry", p.name);
              return {
                  name: doc.name,
                  payment_type: doc.payment_type,
                  party_type: doc.party_type,
                  party: doc.party,
                  posting_date: doc.posting_date,
                  paid_amount: doc.paid_amount,
                  docstatus: doc.docstatus,
                  company: doc.company
              } as PaymentEntry;
          })
      );

      return { payments };
    }),
    { requireAuth: true }
  );
}

export async function POST(request: NextRequest) {
  return handleApiRequest<{ payment: PaymentEntry }>(
    withEndpointLogging("/api/accounting/payments - POST")(async () => {
      const data = await request.json();

      // Required fields validation
      if (!data.payment_type || !data.party_type || !data.party || !data.paid_amount) {
          throw new Error("Missing required fields");
      }

      // Prepare References Table
      const references = data.references?.map((ref: any) => ({
          reference_doctype: ref.reference_doctype,
          reference_name: ref.reference_name,
          allocated_amount: ref.allocated_amount
      })) || [];

      // Determine Accounts (simplified logic, ideally user selects specific accounts)
      // For now, we rely on ERPNext default account determination or simplistic defaults if not provided
      // If user provides paid_to/paid_from, use them.
      
      const newPayment: any = {
          doctype: "Payment Entry",
          payment_type: data.payment_type,
          party_type: data.party_type,
          party: data.party,
          posting_date: data.posting_date || new Date().toISOString().split('T')[0],
          mode_of_payment: data.mode_of_payment || "Cash",
          paid_amount: data.paid_amount,
          received_amount: data.paid_amount, // Assuming 1:1 for simplicity unless exchange rate involved
          source_exchange_rate: 1,
          target_exchange_rate: 1,
          references: references,
          company: data.company || "Pana ERP"
          // account paid to/from will be handled by ERPNext defaults if not set, or we must fetch defaults.
          // For Cash, it needs a Cash Account.
      };

      // If mode is Cash and no account provided, let's try to let ERPNext handle it or we might error.
      // ERPNext usually requires `paid_from` (for Pay) or `paid_to` (for Receive).
      // We will add specific logic in UI to fetch 'Cash' or 'Bank' accounts and pass them.
      
      // Map party_account to proper field based on type
      if (data.payment_type === "Receive") {
          // Customer paying us
          if (data.party_account) newPayment.paid_from = data.party_account;
          
          // Destination defaults to Cash if not provided
          if (!newPayment.paid_to) {
             // Ideally fetch default company/mode account. 
             // Using a safe Fallback like "Cash - PP" or similar if known, 
             // but lacking that, we rely on user input or fetch.
             // For now, if "paid_to" missing, defaulting to the Company default
             // or letting ERPNext error out if it can't find default.
             // But we can try to find "Cash" account if we had it.
          }
      } else if (data.payment_type === "Pay") {
          // Us paying Supplier
          if (data.party_account) newPayment.paid_to = data.party_account;
      }
      
      // Explicit overrides

      
      // Explicit overrides
      if (data.paid_to) Object.assign(newPayment, { paid_to: data.paid_to });
      if (data.paid_from) Object.assign(newPayment, { paid_from: data.paid_from });

      const result = await frappeClient.call.post("frappe.client.insert", { doc: newPayment });
      
      // Auto-submit if requested? Normally Payment Entries are drafted first. 
      // We'll leave it as Draft (docstatus 0).

      return { payment: result.message };
    }),
    { requireAuth: true }
  );
}
