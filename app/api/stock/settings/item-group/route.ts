// app/api/stock/settings/item-group/route.ts
import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";
import {
  ItemGroup,
  ItemGroupCreateRequest,
  ItemGroupUpdateRequest,
} from "@/types/item-group";

const DOCTYPE = "Item Group";

// GET - Fetch all
export async function GET(request: NextRequest) {
  return handleApiRequest<{ item_groups: ItemGroup[] }>(
    withEndpointLogging("/api/stock/settings/item-group - GET")(async () => {
      const { searchParams } = new URL(request.url);
      const view = searchParams.get("view");
      const name = searchParams.get("name");
      const parent = searchParams.get("parent");
      const isGroup = searchParams.get("is_group");

      const fields = [
        "name",
        "item_group_name",
        "parent_item_group",
        "is_group",
        "old_parent",
        "lft",
        "rgt",
        "default_price_list",
        "default_warehouse",
        "default_buying_cost_center",
        "default_selling_cost_center",
        "default_expense_account",
        "default_income_account",
        "default_supplier",
        "default_item_tax_template",
        "tax_category",
        "disabled",
        "creation",
        "modified",
      ];

      const filters: any[] = [];

      if (name) {
        filters.push(["item_group_name", "like", `%${name}%`]);
      }

      if (parent) {
        filters.push(["parent_item_group", "=", parent]);
      }

      if (isGroup !== null) {
        filters.push(["is_group", "=", isGroup === "1" ? 1 : 0]);
      }

      // For tree view, we need to get all item groups ordered by lft
      const orderBy =
        view === "tree"
          ? { field: "lft", order: "asc" as const }
          : { field: "modified", order: "desc" as const };

      const docs = await frappeClient.db.getDocList(DOCTYPE, {
        fields,
        filters,
        orderBy,
        limit: 1000, // Increased limit for tree view
      });

      return { item_groups: docs };
    })
  );
}

// POST - Create
export async function POST(request: NextRequest) {
  return handleApiRequest<{ item_group: ItemGroup }>(
    withEndpointLogging("/api/stock/settings/item-group - POST")(async () => {
      const data: ItemGroupCreateRequest = await request.json();

      // Create the item group
      await frappeClient.db.createDoc(DOCTYPE, data);

      // Fetch the created document
      const doc = await frappeClient.db.getDoc<ItemGroup>(
        DOCTYPE,
        data.item_group_name
      );

      return { item_group: doc as ItemGroup };
    })
  );
}

// PUT - Update
export async function PUT(request: NextRequest) {
  return handleApiRequest<{ item_group: ItemGroup }>(
    withEndpointLogging("/api/stock/settings/item-group - PUT")(async () => {
      const { searchParams } = new URL(request.url);
      const name = searchParams.get("name");

      if (!name) {
        throw new Error("Name parameter is required");
      }

      const data: ItemGroupUpdateRequest = await request.json();

      // Update the item group
      await frappeClient.db.updateDoc(DOCTYPE, name, data);

      // Fetch the updated document
      const doc = await frappeClient.db.getDoc<ItemGroup>(DOCTYPE, name);

      return { item_group: doc as ItemGroup };
    })
  );
}

// DELETE
export async function DELETE(request: NextRequest) {
  return handleApiRequest<{ message: string }>(
    withEndpointLogging("/api/stock/settings/item-group - DELETE")(async () => {
      const { searchParams } = new URL(request.url);
      const name = searchParams.get("name");

      if (!name) {
        throw new Error("Name parameter is required");
      }

      // Check if this item group has children
      const children = await frappeClient.db.getDocList(DOCTYPE, {
        filters: [["parent_item_group", "=", name]],
        limit: 1,
      });

      if (children.length > 0) {
        throw new Error(
          "Cannot delete item group with child groups. Please delete or move child groups first."
        );
      }

      // Check if this item group is used in items
      const items = await frappeClient.db.getDocList("Item", {
        filters: [["item_group", "=", name]],
        limit: 1,
      });

      if (items.length > 0) {
        throw new Error(
          "Cannot delete item group that is used in items. Please update or delete those items first."
        );
      }

      await frappeClient.db.deleteDoc(DOCTYPE, name);

      return { message: `Item Group "${name}" deleted successfully` };
    })
  );
}
