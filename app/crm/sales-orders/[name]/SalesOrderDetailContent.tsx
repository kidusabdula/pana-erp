"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  ArrowLeft, 
  Edit, 
  Calendar,
  DollarSign,
  Users,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Download,
  Printer,
  Share
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesOrder, SalesOrderItem } from "@/types/crm";

export default function SalesOrderDetailContent() {
  const { push: toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);

  useEffect(() => {
    if (params.name) {
      fetchSalesOrder();
    }
  }, [params.name]);

  const fetchSalesOrder = async () => {
    try {
      const response = await fetch(`/api/crm/sales-orders/${params.name}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales order');
      }

      const data = await response.json();
      setSalesOrder(data.data.salesOrder);
    } catch (error: unknown) {
      toast({
        variant: "error",
        title: "Error",
        description: `Failed to load sales order: ${(error as Error).message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!salesOrder) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/crm/sales-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: salesOrder.name,
          status: 'Submitted',
          docstatus: 1
        })
      });
      
      if (!response.ok) throw new Error("Failed to submit order");
      
      const data = await response.json();
      setSalesOrder(data.data.salesOrder);
      toast({
        title: "Order Submitted",
        description: `${salesOrder.name} has been submitted successfully.`
      });
    } catch (error) {
       toast({
        variant: "error",
        title: "Error",
        description: "Failed to submit order"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status based on Frappe fields
  const getDerivedStatus = (order: SalesOrder) => {
    if (order.docstatus === 0) return "Draft";
    if (order.docstatus === 2) return "Cancelled";
    
    // If it's submitted (docstatus === 1)
    const delivered = order.per_delivered || 0;
    const billed = order.per_billed || 0;

    if (delivered >= 100 && billed >= 100) return "Completed";
    if (delivered < 100 && billed < 100) return "To Deliver and Bill";
    if (delivered < 100) return "To Deliver";
    if (billed < 100) return "To Bill";
    
    return "Submitted"; // Fallback
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "to deliver":
      case "to deliver and bill":
        return "bg-amber-100 text-amber-800";
      case "to bill":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = () => {
    if (!salesOrder) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return salesOrder.status === "To Deliver" && new Date(salesOrder.delivery_date) < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!salesOrder) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Sales Order not found.</p>
          <Button 
            variant="link" 
            onClick={() => router.push('/crm/sales-orders')}
            className="mt-4"
          >
            Go back to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/crm/sales-orders')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <ShoppingCart className="w-8 h-8 mr-3 text-primary" />
                {salesOrder.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={salesOrder.docstatus === 1 ? "default" : "secondary"}>
                    {salesOrder.docstatus === 1 ? "Submitted" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             {/* Submit Button (Draft Only) */}
            {salesOrder.docstatus === 0 && (
                <Button onClick={handleSubmit} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? "Submitting..." : "Submit Order"}
                </Button>
            )}

            {/* Create Delivery (Submitted & Not Fully Delivered) */}
            {salesOrder.docstatus === 1 && (salesOrder.per_delivered || 0) < 100 && (
                <Button 
                variant="outline"
                onClick={() => router.push(`/stock/delivery-notes/add-delivery-note?sales_order=${salesOrder.name}`)}
                >
                <Truck className="w-4 h-4 mr-2" />
                Create Delivery
                </Button>
            )}

            {/* Create Invoice (Submitted & Not Fully Billed) */}
            {salesOrder.docstatus === 1 && (salesOrder.per_billed || 0) < 100 && (
                <Button 
                variant="default"
                onClick={() => router.push(`/accounting/sales/new?sales_order=${salesOrder.name}`)}
                >
                <DollarSign className="w-4 h-4 mr-2" />
                Create Invoice
                </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Order Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sales Order Number</p>
                        <p className="font-medium text-lg">{salesOrder.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                          {salesOrder.customer}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="flex items-center">
                          <Badge className={getStatusColor(getDerivedStatus(salesOrder))}>
                            {getDerivedStatus(salesOrder)}
                          </Badge>
                          {isOverdue() && (
                            <Badge className="ml-2 bg-red-100 text-red-800">Overdue</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          {new Date(salesOrder.transaction_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Date</p>
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2 text-muted-foreground" />
                          {new Date(salesOrder.delivery_date).toLocaleDateString()}
                          {isOverdue() && (
                            <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Currency</p>
                        <p className="font-medium">{salesOrder.currency}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Ordered Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesOrder.items.map((item: SalesOrderItem, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                          <TableCell className="font-medium">{item.item_name}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.rate.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">{item.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            {/* Summary Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Sales Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sales Order #</span>
                    <span className="font-medium">{salesOrder.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span>{salesOrder.customer}</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Status</span>
                     <Badge className={getStatusColor(getDerivedStatus(salesOrder))}>
                       {getDerivedStatus(salesOrder)}
                     </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date</span>
                    <span>{new Date(salesOrder.transaction_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Date</span>
                    <span>{new Date(salesOrder.delivery_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{(salesOrder.total * 0.87).toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (15%)</span>
                    <span>{(salesOrder.total * 0.13).toFixed(2)} ETB</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{salesOrder.total.toFixed(2)} ETB</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{salesOrder.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span>{salesOrder.items.reduce((sum, item) => sum + item.qty, 0)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                   {/* Submit Button (Draft Only) */}
                  {salesOrder.docstatus === 0 && (
                      <Button onClick={handleSubmit} disabled={loading} className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {loading ? "Submitting..." : "Submit Order"}
                      </Button>
                  )}

                  {/* Create Delivery (Submitted & Not Fully Delivered) */}
                  {salesOrder.docstatus === 1 && (salesOrder.per_delivered || 0) < 100 && (
                      <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/stock/delivery-notes/add-delivery-note?sales_order=${salesOrder.name}`)}
                      >
                      <Truck className="w-4 h-4 mr-2" />
                      Create Delivery
                      </Button>
                  )}

                  {/* Create Invoice (Submitted & Not Fully Billed) */}
                  {salesOrder.docstatus === 1 && (salesOrder.per_billed || 0) < 100 && (
                      <Button 
                      variant="default"
                      className="w-full"
                      onClick={() => router.push(`/accounting/sales/new?sales_order=${salesOrder.name}`)}
                      >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Create Invoice
                      </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
