// hooks/useDetailActions.ts
import { useState } from "react";
import { printPDF, downloadData } from "@/lib/detail-actions-utils";
import { ExportableItem } from "@/lib/export-utils";
import { toast } from "sonner";

export function useDetailActions() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrint = async (
    data: ExportableItem[],
    filename: string,
    title: string,
    headers?: { [key: string]: string }
  ) => {
    if (data.length === 0) {
      toast.warning("No data available for printing");
      return;
    }

    setIsProcessing(true);
    try {
      await printPDF(data, filename, title, headers);
      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Failed to open print dialog");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (
    data: ExportableItem[],
    filename: string,
    title: string,
    format: "csv" | "pdf",
    headers?: { [key: string]: string }
  ) => {
    if (data.length === 0) {
      toast.warning("No data available for download");
      return;
    }

    setIsProcessing(true);
    try {
      await downloadData(data, filename, title, format, headers);
      toast.success(`Data downloaded as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download data as ${format.toUpperCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handlePrint,
    handleDownload,
    isProcessing,
  };
}