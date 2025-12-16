// app/api/stock/item-price/route.ts
// Pana ERP - Item Price API Routes

import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import {
  ItemPrice,
  ItemPriceCreateRequest,
  ItemPriceUpdateRequest,
} from "@/types/item-price";

// GET - Fetch all item prices
export async function GET(request: NextRequest) {
  return handleApiRequest<{ item_prices: ItemPrice[] }>(
    withEndpointLogging("/api/stock/item-price - GET")(async () => {
      const { searchParams } = new URL(request.url);

      const itemCodeFilter = searchParams.get("item_code");
      const priceListFilter = searchParams.get("price_list");
      const customerFilter = searchParams.get("customer");
      const supplierFilter = searchParams.get("supplier");
      const validFilter = searchParams.get("valid");
      const limit = searchParams.get("limit") || "100";

      // Only query fields that are permitted by Frappe Item Price doctype
      const fields = [
        "name",
        "item_code",
        "item_name",
        "price_list",
        "buying",
        "selling",
        "currency",
        "uom",
        "customer",
        "supplier",
        "batch_no",
        "valid_from",
        "valid_upto",
        "modified",
      ];

      const filters: any[] = [];

      if (itemCodeFilter) {
        filters.push(["item_code", "like", `%${itemCodeFilter}%`]);
      }

      if (priceListFilter && priceListFilter !== "all") {
        filters.push(["price_list", "=", priceListFilter]);
      }

      if (customerFilter) {
        filters.push(["customer", "=", customerFilter]);
      }

      if (supplierFilter) {
        filters.push(["supplier", "=", supplierFilter]);
      }

      // Filter for currently valid prices
      if (validFilter === "true") {
        const today = new Date().toISOString().split("T")[0];
        filters.push(["valid_from", "<=", today]);
        filters.push([
          ["valid_upto", ">=", today],
          ["valid_upto", "is", "not set"],
        ]);
      }

      const item_prices = await frappeClient.db.getDocList("Item Price", {
        fields: fields,
        filters: filters,
        orderBy: {
          field: "modified",
          order: "desc",
        },
        limit: parseInt(limit),
      });

      return { item_prices };
    })
  );
}

// POST - Create a new item price
export async function POST(request: NextRequest) {
  return handleApiRequest<{ item_price: ItemPrice }>(
    withEndpointLogging("/api/stock/item-price - POST")(async () => {
      const data: ItemPriceCreateRequest = await request.json();

      // Validation
      if (
        !data.item_code ||
        !data.price_list ||
        data.price_list_rate === undefined
      ) {
        throw new Error(
          "Missing required fields: item_code, price_list, and price_list_rate"
        );
      }

      // Set default valid_from to today if not provided
      if (!data.valid_from) {
        data.valid_from = new Date().toISOString().split("T")[0];
      }

      // Create the item price
      const doc = await frappeClient.db.createDoc<ItemPriceCreateRequest>(
        "Item Price",
        data
      );
      const item_price = await frappeClient.db.getDoc<ItemPrice>(
        "Item Price",
        doc.name
      );

      return { item_price: item_price as ItemPrice };
    })
  );
}

// PUT - Update an existing item price
export async function PUT(request: NextRequest) {
  return handleApiRequest<{ item_price: ItemPrice }>(
    withEndpointLogging("/api/stock/item-price - PUT")(async () => {
      const { searchParams } = new URL(request.url);
      const name = searchParams.get("name");

      if (!name) {
        throw new Error("Item price name (name parameter) is required");
      }

      const data: ItemPriceUpdateRequest = await request.json();

      await frappeClient.db.updateDoc<ItemPriceUpdateRequest>(
        "Item Price",
        name,
        data
      );
      const item_price = await frappeClient.db.getDoc<ItemPrice>(
        "Item Price",
        name
      );

      return { item_price: item_price as ItemPrice };
    })
  );
}

// DELETE - Delete an item price
export async function DELETE(request: NextRequest) {
  return handleApiRequest<{ message: string }>(
    withEndpointLogging("/api/stock/item-price - DELETE")(async () => {
      const { searchParams } = new URL(request.url);
      const name = searchParams.get("name");

      if (!name) {
        throw new Error("Item price name (name parameter) is required");
      }

      await frappeClient.db.deleteDoc("Item Price", name);

      return { message: `Item Price ${name} deleted successfully` };
    })
  );
}
