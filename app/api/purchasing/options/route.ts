import { NextRequest } from "next/server";
import { frappeClient } from "@/lib/frappe-client";
import { handleApiRequest, withEndpointLogging } from "@/lib/api-template";

interface PurchasingOptions {
  suppliers: Array<{ name: string; supplier_name: string }>;
  items: Array<{
    name: string;
    item_code: string;
    item_name: string;
    description: string;
    stock_uom: string;
    standard_rate: number;
    is_stock_item: number;
  }>;
  companies: Array<{ name: string; company_name: string }>;
}

export async function GET() {
  return handleApiRequest<{ options: PurchasingOptions }>(
    withEndpointLogging("/api/purchasing/options - GET")(async () => {
      
      // Fetch Suppliers
      const suppliers = await frappeClient.call.get("frappe.client.get_list", {
        doctype: "Supplier",
        fields: ["name", "supplier_name"],
        limit: 100,
      });

      // Fetch Items (is_purchase_item filter ideally, but for now generic items)
      // Frappe usually has 'is_purchase_item' field.
      const items = await frappeClient.call.get("frappe.client.get_list", {
        doctype: "Item",
        fields: [
          "name",
          "item_code",
          "item_name",
          "description",
          "stock_uom",
          "standard_rate",
          "is_stock_item",
        ],
        filters: [["is_purchase_item", "=", 1]],
        limit: 100,
      });

      // Fetch Companies
      const companies = await frappeClient.call.get("frappe.client.get_list", {
        doctype: "Company",
        fields: ["name", "company_name"],
        limit: 20,
      });

      const processedSuppliers =
        suppliers.message?.map((supplier: any) => ({
          name: supplier.name,
          supplier_name: supplier.supplier_name,
        })) || [];

      const processedItems =
        items.message?.map((item: any) => ({
          name: item.name,
          item_code: item.item_code,
          item_name: item.item_name,
          description: item.description || "",
          stock_uom: item.stock_uom || "",
          standard_rate: item.standard_rate || 0,
          is_stock_item: item.is_stock_item || 0,
        })) || [];
        
      const processedCompanies =
        companies.message?.map((comp: any) => ({
          name: comp.name,
          company_name: comp.company_name,
        })) || [];

      const options: PurchasingOptions = {
        suppliers: processedSuppliers,
        items: processedItems,
        companies: processedCompanies
      };

      return { options };
    })
  );
}
