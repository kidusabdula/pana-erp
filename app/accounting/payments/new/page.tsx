"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowLeft,
  DollarSign,
  Save,
  Search,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentReference } from "@/types/payment";

export default function NewPaymentPage() {
  const { push: toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);
  
  const [paymentType, setPaymentType] = useState<"Receive" | "Pay">("Receive");
  const [partyType, setPartyType] = useState<"Customer" | "Supplier">("Customer");
  const [party, setParty] = useState("");
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split('T')[0]);
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [references, setReferences] = useState<PaymentReference[]>([]);
  
  const [parties, setParties] = useState<any[]>([]); // Simplified for demo
  const [modes, setModes] = useState<any[]>([]);

  // Initialize from URL params
  useEffect(() => {
    const paramPaymentType = searchParams.get('payment_type') as "Receive" | "Pay";
    const paramPartyType = searchParams.get('party_type') as "Customer" | "Supplier";
    const paramParty = searchParams.get('party');

    if (paramPaymentType) setPaymentType(paramPaymentType);
    
    // Determine party type based on payment type if provided, or explicit param
    let initialPartyType = paramPartyType;
    if (!initialPartyType && paramPaymentType) {
        initialPartyType = paramPaymentType === "Receive" ? "Customer" : "Supplier";
    }
    
    if (initialPartyType) setPartyType(initialPartyType);

    // Initial data fetch
    fetchPaymentModes();
    
    // Fetch parties and then set selected party if available
    const typeToFetch = initialPartyType || partyType;
    fetchParties(typeToFetch).then(() => {
        if (paramParty) setParty(paramParty);
    });

  }, []); // Run once on mount

  // Watch for manual paymentType changes to update partyType default (but strictly handled in UI)
  useEffect(() => {
     // This effect might conflict with initial load if not careful, 
     // but the Select's onValueChange handles the main logic. 
     // We only need to refetch parties if partyType changes.
     if (!searchParams.get('party_type')) {
         // Only auto-switch if not forced by URL? 
         // Actually, the UI select handler does the switching.
         // We just verify we have the right parties.
         fetchParties(partyType);
     }
  }, [partyType]);

  const fetchPaymentModes = async () => {
    try {
        const res = await fetch("/api/accounting/payments?action=get_payment_modes");
        const data = await res.json();
        setModes(data.data?.modes || []);
    } catch (e) { console.error(e); }
  };

  const fetchParties = async (type: string) => {
      try {
          const res = await fetch(`/api/accounting/payments?action=get_parties&party_type=${type}`);
          const data = await res.json();
          setParties(data.data?.parties || []);
      } catch (e) {
          console.error("Failed to fetch parties", e);
          toast({ variant: "error", title: "Error", description: "Failed to fetch parties" });
      }
  };

  // Auto-allocate logic
  const autoAllocate = (amount: number, refs: PaymentReference[]) => {
      let remaining = amount;
      const newRefs = refs.map(ref => {
          if (remaining <= 0) {
              return { ...ref, allocated_amount: 0 };
          }
          
          const pending = ref.outstanding_amount || 0;
          const toAllocate = Math.min(pending, remaining);
          remaining -= toAllocate;
          
          return { ...ref, allocated_amount: toAllocate };
      });
      setReferences(newRefs);
  };

  // Trigger auto-allocation when Paid Amount changes
  useEffect(() => {
     if (references.length > 0) {
         autoAllocate(paidAmount, references);
     }
  }, [paidAmount]);

  const getOutstandingInvoices = async () => {
    if (!party) {
        toast({ variant: "error", title: "Error", description: "Please enter a Party name" });
        return;
    }
    setFetchingInvoices(true);
    try {
        const res = await fetch(`/api/accounting/payments?action=get_outstanding_invoices&party_type=${partyType}&party=${party}`);
        const data = await res.json();
        
        if (data.data?.invoices) {
            const newRefs = data.data.invoices.map((inv: any) => ({
                reference_doctype: partyType === "Customer" ? "Sales Invoice" : "Purchase Invoice",
                reference_name: inv.name,
                total_amount: inv.grand_total,
                outstanding_amount: inv.outstanding_amount,
                allocated_amount: 0,
                party_account: inv.party_account
            }));
            
            // If paid amount is already set, auto allocate immediately
            if (paidAmount > 0) {
                // We utilize the local variable for refs but call the logic
                // Actually helper function expects state, let's just set state and let effect handle? 
                // No, effect depends on references state which hasn't updated yet.
                // Let's modify autoAllocate to accept refs
                let remaining = paidAmount;
                const allocatedRefs = newRefs.map((ref: any) => {
                    if (remaining <= 0) return { ...ref, allocated_amount: 0 };
                    const pending = ref.outstanding_amount || 0;
                    const toAllocate = Math.min(pending, remaining);
                    remaining -= toAllocate;
                    return { ...ref, allocated_amount: toAllocate };
                });
                setReferences(allocatedRefs);
            } else {
                setReferences(newRefs);
            }
            
            toast({ title: "Invoices Fetched", description: `Found ${newRefs.length} outstanding invoices` });
        }
    } catch (error) {
        toast({ variant: "error", title: "Error", description: "Failed to fetch invoices" });
    } finally {
        setFetchingInvoices(false);
    }
  };

  const handleAllocateChange = (index: number, amount: number) => {
      const newRefs = [...references];
      newRefs[index].allocated_amount = amount;
      setReferences(newRefs);
  };

  const totalAllocated = references.reduce((sum, ref) => sum + (ref.allocated_amount || 0), 0);
  const unallocated = paidAmount - totalAllocated;

  const handleSubmit = async () => {
      if (!party || paidAmount <= 0) {
          toast({ variant: "error", title: "Error", description: "Party and Paid Amount required" });
          return;
      }
      if (Math.abs(unallocated) > 0.01 && references.length > 0) {
          // It's allowed to have unallocated amount (on account payment), but usually warnings are good.
          // For now, proceed.
      }

      setLoading(true);
      try {
          const payload = {
              payment_type: paymentType,
              party_type: partyType,
              party,
              posting_date: postingDate,
              mode_of_payment: modeOfPayment,
              paid_amount: paidAmount,
              company: "Pana ERP", // Default or select
              references: references.filter(r => r.allocated_amount > 0),
              party_account: references.length > 0 ? (references[0] as any).party_account : undefined
          };

          const res = await fetch("/api/accounting/payments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });
          
          if (!res.ok) throw new Error("Failed");
          
          const data = await res.json();
          toast({ title: "Success", description: `Payment ${data.data.payment.name} created` });
          router.push("/accounting/payments"); // Need to create list page? Or just back to dashboard
      } catch (error) {
          toast({ variant: "error", title: "Error", description: "Failed to create payment" });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <DollarSign className="h-8 w-8 mr-2 text-primary" />
            New Payment Entry
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Payment"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              <Card>
                  <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label>Payment Type</Label>
                              <Select value={paymentType} onValueChange={(v: any) => {
                                  setPaymentType(v);
                                  setPartyType(v === "Receive" ? "Customer" : "Supplier");
                                  setReferences([]);
                                  setParty("");
                              }}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="Receive">Receive (In)</SelectItem>
                                      <SelectItem value="Pay">Pay (Out)</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label>Party Type</Label>
                              <Input value={partyType} disabled />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label>Party Name</Label>
                              <div className="flex gap-2">
                                  <Select value={party} onValueChange={setParty}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={`Select ${partyType}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.map((p: any) => (
                                            <SelectItem key={p.name} value={p.name}>
                                                {p.customer_name || p.supplier_name || p.name} ({p.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <Button variant="outline" size="icon" onClick={getOutstandingInvoices} title="Get Open Invoices">
                                      <RefreshCw className={`h-4 w-4 ${fetchingInvoices ? 'animate-spin' : ''}`} />
                                  </Button>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label>Date</Label>
                              <Input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} />
                           </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label>Mode of Payment</Label>
                              <Select value={modeOfPayment} onValueChange={setModeOfPayment}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                      {modes.map((m: any) => (
                                          <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                                      ))}
                                      {modes.length === 0 && <SelectItem value="Cash">Cash</SelectItem>}
                                  </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label>Paid Amount</Label>
                              <Input type="number" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value))} />
                           </div>
                      </div>
                  </CardContent>
              </Card>

              {references.length > 0 && (
                  <Card>
                      <CardHeader>
                          <div className="flex justify-between items-center">
                              <CardTitle>Allocate Payment</CardTitle>
                              <Badge variant={unallocated === 0 ? "outline" : "destructive"}>
                                  Unallocated: {unallocated.toFixed(2)}
                              </Badge>
                          </div>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Invoice</TableHead>
                                      <TableHead>Outstanding</TableHead>
                                      <TableHead>Allocate</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {references.map((ref, idx) => (
                                      <TableRow key={idx}>
                                          <TableCell>{ref.reference_name}</TableCell>
                                          <TableCell>{ref.outstanding_amount?.toFixed(2)}</TableCell>
                                          <TableCell>
                                              <Input 
                                                  type="number" 
                                                  className="w-32" 
                                                  value={ref.allocated_amount} 
                                                  onChange={e => handleAllocateChange(idx, parseFloat(e.target.value))}
                                              />
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              )}
          </div>

          <div>
               <Card>
                  <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex justify-between text-lg font-bold">
                          <span>Total Paid:</span>
                          <span>{paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span>Allocated:</span>
                          <span>{totalAllocated.toFixed(2)}</span>
                      </div>
                  </CardContent>
               </Card>
          </div>
      </div>
    </div>
  );
}