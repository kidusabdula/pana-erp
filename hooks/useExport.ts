// hooks/useExport.ts
import { useState } from "react";
import { ExportableItem, getExportOptions } from "@/lib/export-utils";
import { toast } from "sonner";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async <T extends ExportableItem>(
    data: T[],
    filename: string,
    title: string,
    format: "csv" | "pdf",
    headers?: { [key: string]: string }
  ) => {
    if (data.length === 0) {
      toast.warning("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      const exportOptions = getExportOptions(data, filename, title, headers);
      await exportOptions[format]();
      toast.success(`Data exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
}