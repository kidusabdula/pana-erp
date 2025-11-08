// components/ui/detail-actions.tsx
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Download, Printer, Share, FileText, FileSpreadsheet } from "lucide-react";
import { shareData, printElement, printToPDF, downloadData } from "@/lib/detail-actions-utils";
import { ExportableItem } from "@/lib/export-utils";
import { toast } from "sonner";

interface DetailActionsProps {
  data: ExportableItem;
  printElementId?: string;
  shareTitle?: string;
  shareText?: string;
  downloadData?: ExportableItem[];
  downloadFilename?: string;
  downloadTitle?: string;
  downloadHeaders?: { [key: string]: string };
}

export function DetailActions({
  data,
  printElementId,
  shareTitle,
  shareText,
  downloadData,
  downloadFilename,
  downloadTitle,
  downloadHeaders,
}: DetailActionsProps) {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "pdf">("pdf");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async () => {
    try {
      await shareData(
        shareTitle || "Item Details",
        shareText || `View details for ${data.name || data.item_name || "this item"}`,
        window.location.href
      );
      toast.success("Item details shared successfully");
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share item details");
    }
  };

  const handlePrint = () => {
    if (printElementId) {
      printElement(printElementId);
      toast.info("Print dialog opened");
    } else {
      // Fallback to browser print
      window.print();
      toast.info("Print dialog opened");
    }
  };

  const handlePrintPDF = async () => {
    if (!downloadData || downloadData.length === 0) {
      toast.warning("No data available for PDF generation");
      return;
    }

    setIsDownloading(true);
    try {
      await printToPDF(
        downloadData,
        downloadFilename || "item-details",
        downloadTitle || "Item Details",
        downloadHeaders
      );
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadData || downloadData.length === 0) {
      toast.warning("No data available for download");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadData(
        downloadData,
        downloadFilename || "item-details",
        downloadTitle || "Item Details",
        downloadFormat,
        downloadHeaders
      );
      toast.success(`Data downloaded as ${downloadFormat.toUpperCase()} successfully`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download data as ${downloadFormat.toUpperCase()}`);
    } finally {
      setIsDownloading(false);
      setDownloadDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrintPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Print to PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDownloadDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Download Data</DialogTitle>
            <DialogDescription>
              Choose the format for your download.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={downloadFormat} onValueChange={(value) => setDownloadFormat(value as "csv" | "pdf")}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF (Portable Document Format)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Comma Separated Values)
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}