// api/stock/item/route.ts
import { NextRequest } from 'next/server';
import { frappeClient } from '@/lib/frappe-client';
import { handleApiRequest, withEndpointLogging } from '@/lib/api-template';
import { Item, ItemCreateRequest, ItemUpdateRequest } from '@/types/item';

// GET - Fetch all items
export async function GET(request: NextRequest) {
  return handleApiRequest<{ items: Item[] }>(
    withEndpointLogging('/api/stock/item - GET')(async () => {
      const { searchParams } = new URL(request.url);
      
      // Extract filter parameters from the URL
      const nameFilter = searchParams.get('name');
      const groupFilter = searchParams.get('group');
      const statusFilter = searchParams.get('status');
      const limit = searchParams.get('limit') || '100';

      const fields = ['name', 'item_code', 'item_name', 'stock_uom', 'item_group', 'brand', 'is_stock_item', 'is_fixed_asset', 'disabled', 'modified'];

      const filters: any[] = [];

      // Handle group filter (AND condition)
      if (groupFilter && groupFilter !== 'all') {
        filters.push(['item_group', '=', groupFilter]);
      }

      // Handle status filter (AND condition)
      if (statusFilter && statusFilter !== 'all') {
        const isDisabled = statusFilter === 'Disabled' ? 1 : 0;
        filters.push(['disabled', '=', isDisabled]);
      }

      // Handle name search (OR condition)
      if (nameFilter) {
        // The frappe-js-sdk interprets an array of arrays as an OR clause
        filters.push([
          ['item_name', 'like', `%${nameFilter}%`],
          ['item_code', 'like', `%${nameFilter}%`]
        ]);
      }
      
      const items = await frappeClient.db.getDocList('Item', {
        fields: fields,
        filters: filters, // Pass the correctly structured filters array
        orderBy: {
          field: 'modified',
          order: 'desc',
        },
        limit: parseInt(limit),
      });

      return { items };
    })
  );
}
// POST - Create a new item
export async function POST(request: NextRequest) {
  return handleApiRequest<{ item: Item }>(
    withEndpointLogging('/api/stock/item - POST')(async () => {
      const data: ItemCreateRequest = await request.json();

      // Validation
      if (!data.item_name || !data.stock_uom) {
        throw new Error('Missing required fields: item_name and stock_uom');
      }

      if (!data.item_code) {
        // Generate item_code from item_name if not provided
        data.item_code = data.item_name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }

      // Ensure is_stock_item is set (default to 1 if not provided)
      if (data.is_stock_item === undefined) {
        data.is_stock_item = 1;
      }

      // Create the item
      await frappeClient.db.createDoc<ItemCreateRequest>('Item', data);
      const item = await frappeClient.db.getDoc<Item>('Item', data.item_code);

      return { item: item as Item };
    })
  );
}

// PUT - Update an existing item
export async function PUT(request: NextRequest) {
  return handleApiRequest<{ item: Item }>(
    withEndpointLogging('/api/stock/item - PUT')(async () => {
      const { searchParams } = new URL(request.url);
      const name = searchParams.get('name');
      
      if (!name) {
        throw new Error('Item name (name parameter) is required');
      }

      const data: ItemUpdateRequest = await request.json();

      // Update the item
      await frappeClient.db.updateDoc<ItemUpdateRequest>('Item', name, data);
      const item = await frappeClient.db.getDoc<Item>('Item', name);

      return { item: item as Item };
    })
  );
}

// DELETE - Delete an item
export async function DELETE(request: NextRequest) {
  return handleApiRequest<{ message: string }>(
    withEndpointLogging('/api/stock/item - DELETE')(async () => {
      const { searchParams } = new URL(request.url);
      const name = searchParams.get('name');
      
      if (!name) {
        throw new Error('Item name (name parameter) is required');
      }

      await frappeClient.db.deleteDoc('Item', name);

      return { message: `Item ${name} deleted successfully` };
    })
  );
}