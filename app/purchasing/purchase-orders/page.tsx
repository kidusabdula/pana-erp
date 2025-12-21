"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Search, 
  Filter, 
  ArrowUpDown,
  Calendar,
  Eye,
  ShoppingCart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { PurchaseOrder } from "@/types/purchasing";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { push: toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPurchaseOrders();
  }, [statusFilter]);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      let url = '/api/purchasing/purchase-orders?';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        // We'll filter derived statuses on client side for now, or implement smarter API filters later
        // For standard statuses like "Draft", "Submitted", "Cancelled", "Closed" we can pass to API
        if (['Draft', 'Submitted', 'Cancelled', 'Closed'].includes(statusFilter)) {
           params.append('status', statusFilter);
        }
      }
      
      const response = await fetch(url + params.toString());
      if (!response.ok) throw new Error('Failed to load purchase orders');
      
      const data = await response.json();
      setPurchaseOrders(data.data.purchaseOrders);
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load purchase orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDerivedStatus = (po: PurchaseOrder) => {
    if (po.status === "Cancelled" || po.status === "Closed" || po.status === "Draft") {
      return po.status;
    }
    
    // If DocStatus is 1 (Submitted) check percentages
    if (po.docstatus === 1) {
      const delivered = po.per_received || 0;
      const billed = po.per_billed || 0;

      if (delivered >= 100 && billed >= 100) return "Completed";
      if (delivered < 100 && billed < 100) return "To Receive and Bill";
      if (delivered < 100) return "To Receive";
      if (billed < 100) return "To Bill";
      
      return "Submitted"; // Fallback
    }

    return po.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'To Receive': return 'bg-orange-100 text-orange-800';
      case 'To Bill': return 'bg-amber-100 text-amber-800';
      case 'To Receive and Bill': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPOs = purchaseOrders
    .map(po => ({ ...po, derivedStatus: getDerivedStatus(po) }))
    .filter(po => {
    const matchesSearch = 
      po.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || po.derivedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your procurement and track orders.
          </p>
        </div>
        <Button onClick={() => router.push('/purchasing/purchase-orders/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            A list of all purchase orders including their status and amount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="To Receive">To Receive</option>
                <option value="To Bill">To Bill</option>
                <option value="To Receive and Bill">To Receive and Bill</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Received %</TableHead>
                  <TableHead className="text-right">Billed %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredPOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPOs.map((po) => (
                    <TableRow key={po.name} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/purchasing/purchase-orders/${po.name}`)}>
                      <TableCell className="font-medium">{po.name}</TableCell>
                      <TableCell>
                        <div className="font-medium">{po.supplier_name || po.supplier}</div>
                        <div className="text-xs text-muted-foreground">{po.company}</div>
                      </TableCell>
                      <TableCell>{po.transaction_date}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(po.derivedStatus)}>
                          {po.derivedStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {po.grand_total.toLocaleString()} {po.currency}
                      </TableCell>
                       <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                           <span className="text-xs text-muted-foreground">
                            {po.per_received.toFixed(0)}%
                           </span>
                           <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${Math.min(po.per_received, 100)}%` }}
                              />
                           </div>
                        </div>
                      </TableCell>
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                           <span className="text-xs text-muted-foreground">
                            {po.per_billed.toFixed(0)}%
                           </span>
                           <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${Math.min(po.per_billed, 100)}%` }}
                              />
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/purchasing/purchase-orders/${po.name}`);
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
