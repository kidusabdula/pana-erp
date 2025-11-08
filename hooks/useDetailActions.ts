// hooks/useDetailActions.ts
import { useState } from "react";
import { shareData, printElement, printToPDF, downloadData } from "@/lib/detail-actions-utils";
import { ExportableItem } from "@/lib/export-utils";
import { toast } from "sonner";

export function useDetailActions() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShare = async (
    title: string,
    text: string,
    url?: string
  ) => {
    setIsProcessing(true);
    try {
      await shareData(title, text, url);
      toast.success("Shared successfully");
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = (elementId?: string) => {
    setIsProcessing(true);
    try {
      if (elementId) {
        printElement(elementId);
      } else {
        window.print();
      }
      toast.info("Print dialog opened");
    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Failed to open print dialog");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintPDF = async (
    data: ExportableItem[],
    filename: string,
    title: string,
    headers?: { [key: string]: string }
  ) => {
    if (data.length === 0) {
      toast.warning("No data available for PDF generation");
      return;
    }

    setIsProcessing(true);
    try {
      await printToPDF(data, filename, title, headers);
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
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
    handleShare,
    handlePrint,
    handlePrintPDF,
    handleDownload,
    isProcessing,
  };
}