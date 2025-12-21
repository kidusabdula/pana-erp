import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { AgingEntry } from "@/types/reports";

export async function GET(request: NextRequest) {
  return handleApiRequest(
    withEndpointLogging("/api/accounting/reports/aging - GET")(async () => {
      const { searchParams } = new URL(request.url);
      const party_type = searchParams.get("party_type") as "Customer" | "Supplier";
      const report_date = searchParams.get("report_date") || new Date().toISOString().split('T')[0];
      
      if (!party_type) throw new Error("Party Type is required");
      
      const doctype = party_type === "Customer" ? "Sales Invoice" : "Purchase Invoice";
      // Fetch outstanding invoices
      // We rely on 'outstanding_amount' field being accurate in ERPNext
      const invoices = await frappeClient.db.getDocList(doctype, {
          fields: [
              "name", "posting_date", party_type.toLowerCase() as "customer" | "supplier", 
              party_type === "Customer" ? "customer_name" : "supplier_name",
              "outstanding_amount", "currency"
          ],
          filters: [
              ["docstatus", "=", 1],
              ["outstanding_amount", ">", 0]
          ],
          limit: 5000
      });

      // Group by Party
      const partyMap = new Map<string, AgingEntry>();

      const reportDateObj = new Date(report_date);

      for (const inv of invoices) {
          const partyId = inv[party_type.toLowerCase()];
          const partyName = inv[party_type === "Customer" ? "customer_name" : "supplier_name"] || partyId;
          
          if (!partyMap.has(partyId)) {
              partyMap.set(partyId, {
                  party_type,
                  party: partyId,
                  party_name: partyName,
                  total_outstanding: 0,
                  range1: 0, // 0-30
                  range2: 0, // 31-60
                  range3: 0, // 61-90
                  range4: 0, // 90+
                  currency: inv.currency
              });
          }

          const entry = partyMap.get(partyId)!;
          const amount = inv.outstanding_amount;
          entry.total_outstanding += amount;

          // Calculate Age
          const postingDate = new Date(inv.posting_date);
          const diffTime = Math.abs(reportDateObj.getTime() - postingDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 30) entry.range1 += amount;
          else if (diffDays <= 60) entry.range2 += amount;
          else if (diffDays <= 90) entry.range3 += amount;
          else entry.range4 += amount;
      }

      return { data: Array.from(partyMap.values()) };
    }),
    { requireAuth: true }
  );
}
