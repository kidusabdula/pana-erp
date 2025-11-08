import { Item } from "@/types/item";

export function exportItemsToCSV(items: Item[]) {
  if (items.length === 0) {
    return;
  }

  const headers = [
    "Item Code",
    "Item Name",
    "Item Group",
    "Stock UOM",
    "Brand",
    "Is Stock Item",
    "Status",
    "Created",
    "Modified",
  ];

  const csvContent = [
    headers.join(","),
    ...items.map((item) =>
      [
        item.item_code,
        `"${item.item_name}"`,
        `"${item.item_group}"`,
        item.stock_uom,
        item.brand || "",
        item.is_stock_item ? "Yes" : "No",
        item.disabled ? "Disabled" : "Enabled",
        item.creation || "",
        item.modified || "",
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `items_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}