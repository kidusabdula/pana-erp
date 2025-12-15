// app/api/stock/item-price/options/route.ts
// Pana ERP - Item Price Options API Route

import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { ItemPriceOptions } from "@/types/item-price";

// GET - Fetch options for item price form (price lists, items, customers, suppliers, uoms)
export async function GET(request: NextRequest) {
  return handleApiRequest<ItemPriceOptions>(
    withEndpointLogging("/api/stock/item-price/options - GET")(async () => {
      // Fetch all required options in parallel
      const [priceLists, items, customers, suppliers, uoms] = await Promise.all(
        [
          // Price Lists with currency and type info
          frappeClient.db.getDocList("Price List", {
            fields: ["name", "currency", "buying", "selling"],
            filters: [["enabled", "=", 1]],
            orderBy: { field: "name", order: "asc" },
            limit: 100,
          }),
          // Items for selection
          frappeClient.db.getDocList("Item", {
            fields: ["name", "item_name", "stock_uom"],
            filters: [["disabled", "=", 0]],
            orderBy: { field: "item_name", order: "asc" },
            limit: 500,
          }),
          // Customers for customer-specific pricing
          frappeClient.db.getDocList("Customer", {
            fields: ["name"],
            filters: [["disabled", "=", 0]],
            orderBy: { field: "name", order: "asc" },
            limit: 200,
          }),
          // Suppliers for supplier-specific pricing
          frappeClient.db.getDocList("Supplier", {
            fields: ["name"],
            filters: [["disabled", "=", 0]],
            orderBy: { field: "name", order: "asc" },
            limit: 200,
          }),
          // UOMs
          frappeClient.db.getDocList("UOM", {
            fields: ["name"],
            orderBy: { field: "name", order: "asc" },
            limit: 100,
          }),
        ]
      );

      return {
        price_lists: priceLists as ItemPriceOptions["price_lists"],
        items: items as ItemPriceOptions["items"],
        customers: customers.map((c: any) => c.name),
        suppliers: suppliers.map((s: any) => s.name),
        uoms: uoms.map((u: any) => u.name),
      };
    })
  );
}
