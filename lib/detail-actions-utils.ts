// lib/detail-actions-utils.ts
import { ExportableItem, exportToCSV, exportToPDF } from './export-utils';

// Share functionality
export function shareData(
  title: string,
  text: string,
  url?: string
): Promise<void> | void {
  if (navigator.share) {
    // Use Web Share API if available
    return navigator.share({
      title,
      text,
      url: url || window.location.href,
    });
  } else {
    // Fallback: Copy to clipboard
    const shareText = `${title}\n${text}\n${url || window.location.href}`;
    navigator.clipboard.writeText(shareText).then(() => {
      return Promise.resolve();
    });
  }
}

// Print functionality
export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Create a new document with the cloned element
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .no-print { display: none; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${clonedElement.innerHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for the content to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

// Print functionality for generating PDF
export async function printToPDF<T extends ExportableItem>(
  data: T[],
  filename: string,
  title: string,
  headers?: { [key: string]: string }
): Promise<void> {
  // Reuse the PDF export functionality
  await exportToPDF(data, filename, title, headers);
}

// Download functionality
export async function downloadData<T extends ExportableItem>(
  data: T[],
  filename: string,
  title: string,
  format: "csv" | "pdf",
  headers?: { [key: string]: string }
): Promise<void> {
  if (format === "csv") {
    exportToCSV(data, filename, headers);
  } else {
    await exportToPDF(data, filename, title, headers);
  }
}