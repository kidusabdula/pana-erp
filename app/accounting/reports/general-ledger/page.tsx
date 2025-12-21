"use client";

import { useState, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Download, RefreshCw, Filter, FileText } from "lucide-react";
import { GLEntry } from "@/types/reports";

export default function GeneralLedgerPage() {
  const { push: toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<GLEntry[]>([]);
  
  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [account, setAccount] = useState("");
  const [partyType, setPartyType] = useState("all");
  const [party, setParty] = useState("");

  const fetchReport = useCallback(async () => {
      setLoading(true);
      try {
          const params = new URLSearchParams({
              from_date: fromDate,
              to_date: toDate,
              company: "Pana ERP" // Default
          });
          if (account) params.set("account", account);
          if (partyType !== "all") params.set("party_type", partyType);
          if (party) params.set("party", party);

          const res = await fetch(`/api/accounting/reports/gl?${params}`);
          if (!res.ok) throw new Error("Failed to fetch report");
          
          const data = await res.json();
          setEntries(data.data.entries || []);
          toast({ title: "Report Generated", description: `${data.data.entries?.length || 0} entries found` });
      } catch (error) {
          toast({ variant: "error", title: "Error", description: "Failed to generate report" });
      } finally {
          setLoading(false);
      }
  }, [fromDate, toDate, account, partyType, party, toast]);

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat("en-ET", {
          style: "currency",
          currency: "ETB",
          minimumFractionDigits: 2
      }).format(val);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-8 w-8 mr-2 text-primary" />
            General Ledger
          </h1>
          <p className="text-muted-foreground">View detailed transactions and account movements</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
            <Button onClick={fetchReport} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Generate
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
          <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label>Account</Label>
                      <Input placeholder="e.g. 1100 - Debtors" value={account} onChange={e => setAccount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label>Party Type</Label>
                        <Select value={partyType} onValueChange={setPartyType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="Customer">Customer</SelectItem>
                              <SelectItem value="Supplier">Supplier</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Party</Label>
                      <Input placeholder="Name..." value={party} onChange={e => setParty(e.target.value)} />
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
                          <TableHead>Date</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Voucher</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead>Remarks</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {entries.length === 0 ? (
                          <TableRow>
                              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                  No entries found. Click Generate to fetch data.
                              </TableCell>
                          </TableRow>
                      ) : (
                          entries.map((entry) => (
                              <TableRow key={entry.name}>
                                  <TableCell>{entry.posting_date}</TableCell>
                                  <TableCell className="font-medium">{entry.account}</TableCell>
                                  <TableCell>
                                      {entry.party ? (
                                          <div className="flex flex-col">
                                              <span>{entry.party}</span>
                                              <span className="text-xs text-muted-foreground">{entry.party_type}</span>
                                          </div>
                                      ) : "-"}
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex flex-col">
                                          <span className="text-xs font-semibold">{entry.voucher_type}</span>
                                          <span className="text-xs text-muted-foreground">{entry.voucher_no}</span>
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : "-"}</TableCell>
                                  <TableCell className="text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : "-"}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]" title={entry.remarks}>
                                      {entry.remarks}
                                  </TableCell>
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
