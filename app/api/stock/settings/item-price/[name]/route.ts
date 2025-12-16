// app/api/stock/settings/item-price/[name]/route.ts
// Pana ERP - Item Price Single Item API Route

import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import { ItemPrice } from "@/types/item-price";

// GET - Fetch single item price by name
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  return handleApiRequest<{ item_price: ItemPrice }>(
    withEndpointLogging("/api/stock/settings/item-price/[name] - GET")(
      async () => {
        const { name } = await params;
        const decodedName = decodeURIComponent(name);

        const item_price = await frappeClient.db.getDoc<ItemPrice>(
          "Item Price",
          decodedName
        );

        if (!item_price) {
          throw new Error(`Item Price "${decodedName}" not found`);
        }

        return { item_price: item_price as ItemPrice };
      }
    )
  );
}
