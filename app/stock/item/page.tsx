"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useItems } from "@/lib/hooks/data/useItems";
import { useDeleteItem } from "@/lib/hooks/mutations/useDeleteItem";
import LayoutClient from "@/components/Layout/LayoutClient";

export default function ItemPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const { items, isLoading, error, refetch } = useItems();
  const deleteItemMutation = useDeleteItem();

  const itemGroups = [...new Set(items.map((item) => item.item_group).filter(Boolean))];

  const filteredItems = items.filter(
    (item) =>
      (filterGroup === "all" || item.item_group === filterGroup) &&
      (filterStatus === "all" ||
        (filterStatus === "Enabled" && !item.disabled) ||
        (filterStatus === "Disabled" && item.disabled)) &&
      (searchQuery === "" ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleDelete = (name: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      deleteItemMutation.mutate(name);
    }
  };

  const handleExport = () => {
    // CSV export functionality
    const csvContent = [
      ["Item Code", "Item Name", "Item Group", "UOM", "Status"].join(","),
      ...filteredItems.map(item =>
        [
          item.item_code,
          item.item_name,
          item.item_group,
          item.stock_uom,
          item.disabled ? "Disabled" : "Enabled"
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (disabled?: number) => {
    return disabled ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  const getStatusText = (disabled?: number) => {
    return disabled ? "Disabled" : "Enabled";
  };

  return (
    <LayoutClient>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="w-8 h-8 mr-3 text-primary" />
              Items
            </h1>
            <p className="text-muted-foreground">
              Manage inventory items and stock
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => router.push("/stock/item/new")}>
              <Plus className="w-4 h-4 mr-2" />
              New Item
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter: {filterGroup === "all" ? "All Groups" : filterGroup}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterGroup("all")}>
                    All Groups
                  </DropdownMenuItem>
                  {itemGroups.map((group) => (
                    <DropdownMenuItem key={group} onClick={() => setFilterGroup(group)}>
                      {group}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Status: {filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("Enabled")}>
                    Enabled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("Disabled")}>
                    Disabled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Failed to load items: {error.message}</p>
                <Button onClick={() => refetch()} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item Group</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-mono text-sm">
                          {item.item_code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.item_name}
                        </TableCell>
                        <TableCell>{item.item_group}</TableCell>
                        <TableCell>{item.stock_uom}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.disabled)}>
                            {getStatusText(item.disabled)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/stock/item/${encodeURIComponent(item.item_code)}`)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/stock/item/${encodeURIComponent(item.item_code)}/edit`)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(item.name, item.item_name)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredItems.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items found</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/stock/item/new")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutClient>
  );
}