"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Calendar, 
  User, 
  Truck, 
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { PurchaseOrder } from "@/types/purchasing";

export default function PurchaseOrderDetailPage() {
  const { name } = useParams();
  const router = useRouter();
  const { push: toast } = useToast();
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPO();
  }, [name]);

  const fetchPO = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/purchasing/purchase-orders/${name}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      setPO(data.data.purchaseOrder);
    } catch (error) {
      toast({ variant: "error", title: "Error", description: "Failed to load order details" });
    } finally {
      setLoading(false);
    }
  };

  const getDerivedStatus = (po: PurchaseOrder) => {
      if (po.status === "Cancelled" || po.status === "Closed" || po.status === "Draft") return po.status;
      if (po.docstatus === 1) {
          const received = po.per_received || 0;
          const billed = po.per_billed || 0;
          if (received >= 100 && billed >= 100) return "Completed";
          if (received < 100 && billed < 100) return "To Receive and Bill";
          if (received < 100) return "To Receive";
          if (billed < 100) return "To Bill";
          return "Submitted";
      }
      return po.status;
  };

  const handleSubmitOrder = async () => {
      if (!confirm("Are you sure you want to finalize this order? This action cannot be undone.")) return;
      setSubmitting(true);
      try {
          const res = await fetch(`/api/purchasing/purchase-orders/${name}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "submit" })
          });
          if (!res.ok) throw new Error("Failed to submit");
          toast({ title: "Success", description: "Purchase Order Submitted" });
          fetchPO();
      } catch (e) {
          toast({ variant: "error", title: "Error", description: "Submission failed" });
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!po) return <div className="p-8">Order not found</div>;

  const status = getDerivedStatus(po);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/crm/purchase-orders")}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    {po.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant={status === "Completed" ? "default" : "secondary"}>
                        {status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{po.company}</span>
                </div>
            </div>
        </div>
        
        <div className="flex gap-2">
            {po.docstatus === 0 && (
                <Button onClick={handleSubmitOrder} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Order"}
                </Button>
            )}
            {po.docstatus === 1 && (po.per_received < 100) && (
                <Button variant="outline" onClick={() => router.push(`/stock/purchase-receipts/new?purchase_order=${po.name}`)}>
                   <Truck className="w-4 h-4 mr-2" /> Receive
                </Button>
            )}
            {po.docstatus === 1 && (po.per_billed < 100) && (
                <Button variant="outline" onClick={() => router.push(`/accounting/purchases/new?purchase_order=${po.name}`)}>
                   <CreditCard className="w-4 h-4 mr-2" /> Make Bill
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
              <Card>
                  <CardHeader><CardTitle>Items</CardTitle></CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead>Amount</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {po.items.map((item, i) => (
                                  <TableRow key={i}>
                                      <TableCell>
                                          <div className="font-medium">{item.item_name}</div>
                                          <div className="text-xs text-muted-foreground">{item.item_code}</div>
                                      </TableCell>
                                      <TableCell>{item.qty}</TableCell>
                                      <TableCell>{item.rate.toFixed(2)}</TableCell>
                                      <TableCell>{item.amount.toFixed(2)}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>

          <div className="space-y-6">
              <Card>
                  <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <User className="h-4 w-4" /> Supplier
                          </span>
                          <span className="font-medium">{po.supplier}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> Date
                          </span>
                          <span className="font-medium">{po.transaction_date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <FileText className="h-4 w-4" /> Schedule
                          </span>
                          <span className="font-medium">{po.schedule_date}</span>
                      </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold text-lg">{po.grand_total.toLocaleString()} {po.currency}</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                          Received: {po.per_received.toFixed(0)}% | Billed: {po.per_billed.toFixed(0)}%
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}
