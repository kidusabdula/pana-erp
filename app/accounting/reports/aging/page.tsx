"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, RefreshCw, Clock } from "lucide-react";
import { AgingEntry } from "@/types/reports";

export default function AgingReportPage() {
  const { push: toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<AgingEntry[]>([]);
  const [partyType, setPartyType] = useState<"Customer" | "Supplier">("Customer");

  const fetchReport = useCallback(async () => {
      setLoading(true);
      try {
          const params = new URLSearchParams({
              party_type: partyType,
              report_date: new Date().toISOString().split('T')[0]
          });

          const res = await fetch(`/api/accounting/reports/aging?${params}`);
          if (!res.ok) throw new Error("Failed to fetch report");
          
          const data = await res.json();
          setEntries(data.data.data || []);
          toast({ title: "Report Generated", description: `${data.data.data?.length || 0} parties found` });
      } catch (error) {
          toast({ variant: "error", title: "Error", description: "Failed to generate report" });
      } finally {
          setLoading(false);
      }
  }, [partyType, toast]);

  useEffect(() => {
      fetchReport();
  }, [fetchReport]);

  const formatCurrency = (val: number, currency: string) => {
      return new Intl.NumberFormat("en-ET", {
          style: "currency",
          currency: currency || "ETB",
          minimumFractionDigits: 2
      }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Clock className="h-8 w-8 mr-2 text-primary" />
            Aging Summary ({partyType})
          </h1>
          <p className="text-muted-foreground">Accounts {partyType === 'Customer' ? 'Receivable' : 'Payable'} Aging Report</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
            <Button onClick={fetchReport} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
          <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                  <div className="w-48">
                      <Select value={partyType} onValueChange={(v: "Customer" | "Supplier") => setPartyType(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Customer">Accounts Receivable (AR)</SelectItem>
                              <SelectItem value="Supplier">Accounts Payable (AP)</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
          </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
          <CardContent className="pt-6">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Party</TableHead>
                          <TableHead className="text-right">0-30 Days</TableHead>
                          <TableHead className="text-right">31-60 Days</TableHead>
                          <TableHead className="text-right">61-90 Days</TableHead>
                          <TableHead className="text-right">90+ Days</TableHead>
                          <TableHead className="text-right font-bold">Total Outstanding</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {entries.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                  No outstanding invoices found.
                              </TableCell>
                          </TableRow>
                      ) : (
                          entries.map((entry) => (
                              <TableRow key={entry.party}>
                                  <TableCell>
                                      <div className="flex flex-col">
                                          <span className="font-medium">{entry.party_name}</span>
                                          <span className="text-xs text-muted-foreground">{entry.party}</span>
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-right">{entry.range1 > 0 ? formatCurrency(entry.range1, entry.currency) : "-"}</TableCell>
                                  <TableCell className="text-right">{entry.range2 > 0 ? formatCurrency(entry.range2, entry.currency) : "-"}</TableCell>
                                  <TableCell className="text-right">{entry.range3 > 0 ? formatCurrency(entry.range3, entry.currency) : "-"}</TableCell>
                                  <TableCell className="text-right text-red-600">{entry.range4 > 0 ? formatCurrency(entry.range4, entry.currency) : "-"}</TableCell>
                                  <TableCell className="text-right font-bold">{formatCurrency(entry.total_outstanding, entry.currency)}</TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
