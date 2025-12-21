import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { GLEntry } from "@/types/reports";

export async function GET(request: NextRequest) {
  return handleApiRequest(
    withEndpointLogging("/api/accounting/reports/gl - GET")(async () => {
      const { searchParams } = new URL(request.url);
      const from_date = searchParams.get("from_date");
      const to_date = searchParams.get("to_date");
      const company = searchParams.get("company");
      const account = searchParams.get("account");
      const party_type = searchParams.get("party_type");
      const party = searchParams.get("party");

      if (!from_date || !to_date) {
          throw new Error("From Date and To Date are required");
      }

      // Build filters
      const filters: any[] = [
          ["posting_date", ">=", from_date],
          ["posting_date", "<=", to_date],
          // ["company", "=", company || "Pana ERP"] // Optional if we assume 1 company
      ];

      if (account) filters.push(["account", "=", account]);
      if (party_type) filters.push(["party_type", "=", party_type]);
      if (party) filters.push(["party", "=", party]);

      const glEntries = await frappeClient.db.getDocList<GLEntry>("GL Entry", {
          fields: [
              "name", "posting_date", "account", "party_type", "party", 
              "voucher_type", "voucher_no", "debit", "credit", "remarks", 
              "against"
          ],
          filters: filters,
          orderBy: { field: "posting_date", order: "asc" },
          limit: 5000 
      });

      return { entries: glEntries };
    }),
    { requireAuth: true }
  );
}
