"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PurchaseReceiptItem } from "@/types/purchase-receipt";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

function NewPurchaseReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push: toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingPO, setFetchingPO] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<PurchaseReceiptItem[]>([]);
  const [company, setCompany] = useState("Pana ERP");

  useEffect(() => {
    const poName = searchParams.get('purchase_order');
    if (poName) {
      fetchPurchaseOrderDetails(poName);
    }
  }, [searchParams]);

  const fetchPurchaseOrderDetails = async (poName: string) => {
    setFetchingPO(true);
    try {
      // Fetch PO details using the API we updated to support name filter
      const res = await fetch(`/api/purchasing/purchase-orders?name=${poName}`);
      const data = await res.json();
      
      if (data.data?.purchaseOrders?.length > 0) {
        // Try to find exact match or take first
        const po = data.data.purchaseOrders.find((p: any) => p.name === poName) || data.data.purchaseOrders[0];
        
        setSupplier(po.supplier);
        setCompany(po.company);
        
        // Map items
        const mappedItems = po.items
          .map((item: any) => {
            // Calculate remaining qty
            const remainingQty = item.qty - (item.received_qty || 0); // Note: received_qty field should be on PO item
            // But wait, my PurchaseOrderItem type has `received_qty`. 
            // I need to ensure the API returns it. The API in Step 234 includes `items: doc.items`. 
            // Standard Frappe PO Item has `received_qty`.
            
            if (remainingQty <= 0) return null;

            return {
              item_code: item.item_code,
              item_name: item.item_name,
              description: item.description,
              qty: remainingQty,
              uom: item.uom,
              rate: item.rate,
              amount: remainingQty * item.rate,
              warehouse: item.warehouse,
              purchase_order: po.name,
              po_detail: item.name // Very important: Link to specific PO Item row
            };
          })
          .filter((i: any) => i !== null) as PurchaseReceiptItem[];
          
        setItems(mappedItems);
        
        toast({
          title: "Data Loaded",
          description: `Loaded details from ${po.name}`
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load Purchase Order details"
      });
    } finally {
      setFetchingPO(false);
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseReceiptItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'qty' || field === 'rate') {
      item.amount = Number(item.qty || 0) * Number(item.rate || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_code: "",
        qty: 1,
        uom: "Nos",
        rate: 0,
        amount: 0,
      }
    ]);
  };

  const handleSubmit = async () => {
    if (!supplier) {
      toast({ variant: "error", title: "Error", description: "Supplier is required" });
      return;
    }
    if (items.length === 0) {
      toast({ variant: "error", title: "Error", description: "At least one item is required" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier,
        posting_date: postingDate,
        company,
        items,
        purchase_order: searchParams.get('purchase_order') || undefined
      };

      const res = await fetch('/api/stock/purchase-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create Purchase Receipt");
      
      const data = await res.json();
      toast({
        title: "Success",
        description: `Purchase Receipt ${data.data.purchaseReceipt.name} created`
      });
      
      router.push('/stock/purchase-receipts'); // Or detail page logic if created
      // Since I haven't created List/Detail for Receipts yet, maybe go back to PO or Stock Dashboard?
      // "stock/purchase-receipts" doesn't exist yet as a list page.
      // I should modify this to go back to Purchase Order if it came from there.
      const fromPO = searchParams.get('purchase_order');
      if (fromPO) {
         router.push(`/purchasing/purchase-orders/${fromPO}`);
      } else {
         router.push('/purchasing/purchase-orders'); // Fallback
      }

    } catch (error) {
       toast({
        variant: "error",
        title: "Error",
        description: "Failed to create Purchase Receipt"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">New Purchase Receipt</h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading || fetchingPO}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Receipt"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input 
              value={supplier} 
              onChange={e => setSupplier(e.target.value)} 
              placeholder="Supplier Name"
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date"
              value={postingDate} 
              onChange={e => setPostingDate(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fetchingPO ? (
            <div className="py-8 text-center text-muted-foreground">Fetching Purchase Order items...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input 
                        value={item.item_code} 
                        onChange={e => handleItemChange(idx, 'item_code', e.target.value)}
                        placeholder="Item Code"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        value={item.qty} 
                        onChange={e => handleItemChange(idx, 'qty', parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                       <Input 
                        type="number"
                        value={item.rate} 
                        onChange={e => handleItemChange(idx, 'rate', parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      {(item.qty * item.rate).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPurchaseReceiptPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPurchaseReceiptContent />
    </Suspense>
  );
}
