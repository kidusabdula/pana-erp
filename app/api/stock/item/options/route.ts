// api/stock/item/options/route.ts
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";

export async function GET() {
  return handleApiRequest<{ item_groups: string[]; stock_uoms: string[] }>(
    withEndpointLogging("/api/stock/item/options - GET")(async () => {
      // Fetch item groups
      const itemGroups = await frappeClient.db.getDocList("Item Group", {
        fields: ["name"],
        limit: 1000,
      });

      // Fetch UOMs
      const uoms = await frappeClient.db.getDocList("UOM", {
        fields: ["name"],
        limit: 1000,
      });

      return {
        item_groups: itemGroups.map((group) => group.name),
        stock_uoms: uoms.map((uom) => uom.name),
      };
    })
  );
}
