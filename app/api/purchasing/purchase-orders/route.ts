import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { PurchaseOrder } from "@/types/purchasing";

export async function GET(request: NextRequest) {
  return handleApiRequest<{ purchaseOrders: PurchaseOrder[] }>(
    withEndpointLogging("/api/purchasing/purchase-orders - GET")(async () => {
      const { searchParams } = new URL(request.url);
      const filters: Record<string, any> = {};

      if (searchParams.get("status")) filters.status = searchParams.get("status");
      if (searchParams.get("supplier")) filters.supplier = searchParams.get("supplier");

      const limit = parseInt(searchParams.get("limit") || "50");

      // 1. Get Names
      const poNames = await frappeClient.db.getDocList<{ name: string }>(
        "Purchase Order",
        {
          fields: ["name"],
          filters: searchParams.get("name") 
            ? [["name", "=", searchParams.get("name")]]
            : Object.entries(filters).map(([key, value]) => [key, "=", value]),
          orderBy: { field: "transaction_date", order: "desc" },
          limit,
        }
      );

      // 2. Fetch Full Docs with Items
      const purchaseOrders = await Promise.all(
        poNames.map(async (po) => {
          try {
            const doc = await frappeClient.db.getDoc<any>("Purchase Order", po.name);
            return {
              name: doc.name,
              supplier: doc.supplier,
              supplier_name: doc.supplier_name,
              transaction_date: doc.transaction_date,
              schedule_date: doc.schedule_date,
              total: doc.total,
              grand_total: doc.grand_total,
              currency: doc.currency,
              status: doc.status,
              docstatus: doc.docstatus,
              per_received: doc.per_received,
              per_billed: doc.per_billed,
              company: doc.company,
              items: doc.items || [],
              creation: doc.creation,
              modified: doc.modified,
              owner: doc.owner,
            } as PurchaseOrder;
          } catch (error) {
            console.error(`Error fetching PO ${po.name}`, error);
            return null;
          }
        })
      );

      return { 
        purchaseOrders: purchaseOrders.filter((p): p is PurchaseOrder => p !== null) 
      };
    }),
    { requireAuth: true }
  );
}

export async function POST(request: NextRequest) {
  return handleApiRequest<{ purchaseOrder: PurchaseOrder }>(
    withEndpointLogging("/api/purchasing/purchase-orders - POST")(async () => {
      const data = await request.json();
      
      // Basic validation
      if (!data.supplier || !data.items?.length) {
        throw new Error("Supplier and Items are required");
      }

      // Create new Purchase Order
      const newPO = {
        doctype: "Purchase Order",
        supplier: data.supplier,
        transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
        schedule_date: data.schedule_date,
        company: data.company || "Pana ERP", // Default company
        items: data.items.map((item: any) => ({
          item_code: item.item_code,
          qty: item.qty,
          rate: item.rate,
          schedule_date: data.schedule_date || data.transaction_date,
          warehouse: item.warehouse // Optional: Default warehouse
        })),
        docstatus: 0 // Draft
      };

      const result = await frappeClient.call.post("frappe.client.insert", { doc: newPO });
      
      if (!result.message) {
         throw new Error("Failed to create Purchase Order");
      }

      return { purchaseOrder: result.message };
    }),
    { requireAuth: true }
  );
}
