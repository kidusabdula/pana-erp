// lib/detail-actions-utils.ts
import { ExportableItem, exportToCSV, exportToPDF } from './export-utils';

// Print functionality - generates and prints PDF
export async function printPDF<T extends ExportableItem>(
  data: T[],
  filename: string,
  title: string,
  headers?: { [key: string]: string }
): Promise<void> {
  try {
    // Generate the PDF
    await exportToPDF(data, filename, title, headers);
    
    // Get the PDF blob URL
    const pdfBlob = await generatePDFBlob(data, filename, title, headers);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open the PDF in a new window and trigger print
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        // Clean up the object URL after printing
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
          printWindow.close();
        }, 100);
      };
    } else {
      // Fallback if popup is blocked
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${filename}.pdf`;
      link.click();
      URL.revokeObjectURL(pdfUrl);
    }
  } catch (error) {
    console.error('Print PDF failed:', error);
    throw error;
  }
}

// Helper function to generate PDF blob
async function generatePDFBlob<T extends ExportableItem>(
  data: T[],
  filename: string,
  title: string,
  headers?: { [key: string]: string }
): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  
  if (data.length === 0) {
    throw new Error('No data to generate PDF');
  }

  // Get all keys from the first item to use as columns
  const keys = Object.keys(data[0]);
  
  // Create header row
  const headerRow = keys.map(key => headers?.[key] || key);
  
  // Create data rows
  const dataRows = data.map(item => 
    keys.map(key => {
      const value = item[key];
      // Convert to string and handle null/undefined
      return value !== null && value !== undefined ? String(value) : '';
    })
  );
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Add table
  autoTable(doc, {
    head: [headerRow],
    body: dataRows,
    startY: 40,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 } // Adjust column widths as needed
    }
  });
  
  // Return the PDF as a blob
  return doc.output('blob');
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