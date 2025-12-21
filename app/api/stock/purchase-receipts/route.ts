import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { PurchaseReceipt } from "@/types/purchase-receipt";

export async function GET(request: NextRequest) {
  return handleApiRequest<{ purchaseReceipts: PurchaseReceipt[] }>(
    withEndpointLogging("/api/stock/purchase-receipts - GET")(async () => {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "100");
      const filters: any[] = [];
      
      if (searchParams.get("supplier")) filters.push(["supplier", "=", searchParams.get("supplier")]);
      if (searchParams.get("status")) filters.push(["status", "=", searchParams.get("status")]);
      if (searchParams.get("purchase_order")) filters.push(["purchase_order", "=", searchParams.get("purchase_order")]);

      const receiptNames = await frappeClient.db.getDocList<{ name: string }>(
        "Purchase Receipt",
        {
          fields: ["name"],
          filters,
          orderBy: { field: "posting_date", order: "desc" },
          limit,
        }
      );

      const receipts = await Promise.all(
        receiptNames.map(async (r) => {
            try {
                const doc = await frappeClient.db.getDoc<any>("Purchase Receipt", r.name);
                return {
                    name: doc.name,
                    supplier: doc.supplier,
                    supplier_name: doc.supplier_name,
                    posting_date: doc.posting_date,
                    items: doc.items || [],
                    company: doc.company,
                    docstatus: doc.docstatus,
                    purchase_order: doc.purchase_order,
                    creation: doc.creation,
                    modified: doc.modified
                } as PurchaseReceipt;
            } catch (e) {
                return null;
            }
        })
      );

      return { purchaseReceipts: receipts.filter((r): r is PurchaseReceipt => r !== null) };
    }),
    { requireAuth: true }
  );
}

export async function POST(request: NextRequest) {
  return handleApiRequest<{ purchaseReceipt: PurchaseReceipt }>(
    withEndpointLogging("/api/stock/purchase-receipts - POST")(async () => {
      const data = await request.json();

      if (!data.supplier || !data.items?.length) {
        throw new Error("Supplier and Items are required");
      }

      // Calculate totals and process items
      const processedItems = data.items.map((item: any) => {
          return {
              item_code: item.item_code,
              qty: Number(item.qty),
              rate: Number(item.rate || 0),
              amount: Number(item.qty) * Number(item.rate || 0),
              warehouse: item.warehouse,
              // Link fields
              purchase_order: item.purchase_order,
              po_detail: item.po_detail,
              doctype: "Purchase Receipt Item"
          };
      });

      const newReceipt = {
          doctype: "Purchase Receipt",
          supplier: data.supplier,
          posting_date: data.posting_date || new Date().toISOString().split('T')[0],
          company: data.company || "Pana ERP",
          items: processedItems,
          docstatus: 0 // Draft
      };

      const result = await frappeClient.call.post("frappe.client.insert", { doc: newReceipt });

      if (!result.message) {
          throw new Error("Failed to create Purchase Receipt");
      }

      return { purchaseReceipt: result.message };
    }),
    { requireAuth: true }
  );
}
