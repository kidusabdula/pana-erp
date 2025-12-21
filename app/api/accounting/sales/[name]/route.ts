// app/api/accounting/sales/[name]/route.ts
import { NextRequest } from 'next/server';
import { frappeClient } from '@/lib/frappe-client';
import { handleApiRequest, withEndpointLogging } from '@/lib/api-template';
import { SalesInvoice } from '@/types/accounting';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> } // 1️⃣ Promise wrapper
) {
  const { name } = await params; // 2️⃣ unwrap

  return handleApiRequest<{ salesInvoice: SalesInvoice }>(
    withEndpointLogging(`/api/accounting/sales/${name} - GET`)(async () => {
      const fullInvoice = await frappeClient.call.get('frappe.client.get', {
        doctype: 'Sales Invoice',
        name,
      });

      if (!fullInvoice?.message) throw new Error('Sales invoice not found');

      const doc = fullInvoice.message;

      const salesInvoice: SalesInvoice = {
        name: doc.name,
        customer: doc.customer,
        customer_name: doc.customer_name,
        posting_date: doc.posting_date,
        due_date: doc.due_date,
        grand_total: doc.grand_total,
        status: doc.status,
        docstatus: doc.docstatus,
        currency: doc.currency,
        company: doc.company,
        items: doc.items || [],
      };

      return { salesInvoice };
    }),
    { requireAuth: true }
  );
}

// PUT - Update a sales invoice (specifically for submission)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  
  return handleApiRequest<{ salesInvoice: SalesInvoice }>(
    withEndpointLogging(`/api/accounting/sales/${name} - PUT`)(async () => {
      const data = await request.json();

      if (data.status === "Submitted" || data.docstatus === 1) {
        // Submit the document
        // First fetch the latest version to ensure we have the correct modified timestamp
        const currentDoc = await frappeClient.call.get("frappe.client.get", {
          doctype: "Sales Invoice",
          name: name,
        });

        if (!currentDoc.message) {
          throw new Error("Sales Invoice not found");
        }

        const result = await frappeClient.call.post("frappe.client.submit", {
          doc: currentDoc.message,
        });

        if (!result.message) {
          throw new Error("Failed to submit sales invoice");
        }

        // Fetch the updated document
        const updatedDoc = await frappeClient.call.get("frappe.client.get", {
          doctype: "Sales Invoice",
          name: name,
        });

        if (!updatedDoc.message) {
          throw new Error("Failed to fetch updated sales invoice");
        }

        const doc = updatedDoc.message;
        const salesInvoice: SalesInvoice = {
          name: doc.name,
          customer: doc.customer,
          customer_name: doc.customer_name,
          posting_date: doc.posting_date,
          due_date: doc.due_date,
          grand_total: doc.grand_total,
          status: doc.status,
          docstatus: doc.docstatus,
          currency: doc.currency,
          company: doc.company,
          items: doc.items || [],
        };

        return { salesInvoice };
      }

      throw new Error("Invalid update request");
    }),
    { requireAuth: true }
  );
}