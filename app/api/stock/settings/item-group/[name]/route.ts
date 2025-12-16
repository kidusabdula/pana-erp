// app/api/stock/settings/item-group/[name]/route.ts
import { NextRequest } from 'next/server';
import { frappeClient } from '@/lib/frappe-client';
import { handleApiRequest, withEndpointLogging } from '@/lib/api-template';
import { ItemGroup } from '@/types/item-group';

const DOCTYPE = 'Item Group';

// GET - Fetch single item group
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  return handleApiRequest<{ item_group: ItemGroup }>(
    withEndpointLogging(`/api/stock/settings/item-group/${params.name} - GET`)(async () => {
      const name = decodeURIComponent(params.name);
      
      const doc = await frappeClient.db.getDoc<ItemGroup>(DOCTYPE, name);
      
      return { item_group: doc as ItemGroup };
    })
  );
}