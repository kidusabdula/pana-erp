// components/ui/detail-header-actions.tsx
import { Button } from "@/components/ui/button";
import { Edit, Printer, Download, Share } from "lucide-react";
import { DetailActions } from "./detail-actions";
import { ExportableItem } from "@/lib/export-utils";

interface DetailHeaderActionsProps {
  data: ExportableItem;
  printElementId?: string;
  shareTitle?: string;
  shareText?: string;
  downloadData?: ExportableItem[];
  downloadFilename?: string;
  downloadTitle?: string;
  downloadHeaders?: { [key: string]: string };
  onEdit?: () => void;
}

export function DetailHeaderActions({
  data,
  printElementId,
  shareTitle,
  shareText,
  downloadData,
  downloadFilename,
  downloadTitle,
  downloadHeaders,
  onEdit,
}: DetailHeaderActionsProps) {
  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={() => {
        if (downloadData && downloadData.length > 0) {
          import('@/lib/detail-actions-utils').then(({ printToPDF }) => {
            printToPDF(
              downloadData,
              downloadFilename || "item-details",
              downloadTitle || "Item Details",
              downloadHeaders
            ).then(() => {
              // Show success message
            });
          });
        }
      }}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button variant="outline" size="sm" onClick={() => {
        import('@/lib/detail-actions-utils').then(({ shareData }) => {
          shareData(
            shareTitle || "Item Details",
            shareText || `View details for ${data.name || data.item_name || "this item"}`,
            window.location.href
          ).then(() => {
            // Show success message
          });
        });
      }}>
        <Share className="w-4 h-4 mr-2" />
        Share
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