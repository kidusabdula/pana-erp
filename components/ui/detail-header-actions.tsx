// components/ui/detail-header-actions.tsx
import { Button } from "@/components/ui/button";
import { Edit, Printer, Download } from "lucide-react";
import { DetailActions } from "./detail-actions";
import { ExportableItem } from "@/lib/export-utils";

interface DetailHeaderActionsProps {
  data: ExportableItem;
  downloadData?: ExportableItem[];
  downloadFilename?: string;
  downloadTitle?: string;
  downloadHeaders?: { [key: string]: string };
  onEdit?: () => void;
}

export function DetailHeaderActions({
  data,
  downloadData,
  downloadFilename,
  downloadTitle,
  downloadHeaders,
  onEdit,
}: DetailHeaderActionsProps) {
  const handlePrint = async () => {
    if (!downloadData || downloadData.length === 0) {
      return;
    }

    try {
      const { printPDF } = await import('@/lib/detail-actions-utils');
      await printPDF(
        downloadData,
        downloadFilename || "item-details",
        downloadTitle || "Item Details",
        downloadHeaders
      );
    } catch (error) {
      console.error("Print failed:", error);
    }
  };

  const handleDownload = async () => {
    if (!downloadData || downloadData.length === 0) {
      return;
    }

    try {
      const { downloadData: downloadUtil } = await import('@/lib/detail-actions-utils');
      await downloadUtil(
        downloadData,
        downloadFilename || "item-details",
        downloadTitle || "Item Details",
        "pdf",
        downloadHeaders
      );
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
      {onEdit && (
        <Button size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      )}
    </div>
  );
}