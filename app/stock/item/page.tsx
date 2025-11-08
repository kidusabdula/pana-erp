"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // *** IMPORT: AlertDialog components ***
import {
  Package,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useItemsQuery, useDeleteItemMutation } from "@/hooks/data/useItemsQuery";
import { useItemOptionsQuery } from "@/hooks/data/useItemsQuery";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { SearchBar } from "@/components/ui/search-bar";
import { toast } from "sonner";
import { Item } from "@/types/item";

interface Filters {
  name: string;
  group: string;
  status: string;
  id: string;
}

export default function ItemPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>({
    name: "",
    group: "all",
    status: "all",
    id: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // *** NEW: State for the delete confirmation dialog ***
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Fetch items with filters
  const { data: itemsData, isLoading, error, refetch } = useItemsQuery(filters);
  const { data: optionsData } = useItemOptionsQuery();
  const deleteMutation = useDeleteItemMutation();

  const items = itemsData?.data?.items || [];
  const itemGroups = optionsData?.data?.item_groups || [];

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(query) ||
        item.item_code.toLowerCase().includes(query) ||
        (item.brand && item.brand.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  // *** UPDATED: Function to open the delete dialog ***
  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // *** NEW: Function to confirm the deletion ***
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.name, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        },
        onError: () => {
          // Keep dialog open on error to allow user to retry or cancel
        }
      });
    }
  };

  // *** NEW: Function to cancel the deletion ***
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info("Export feature coming soon!");
  };

  const getStatusColor = (disabled?: number) => {
    return disabled ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  const getStatusText = (disabled?: number) => {
    return disabled ? "Disabled" : "Enabled";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error loading items</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || "Something went wrong"}
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => router.push("/stock/item/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 mb-6">
        <FilterDropdown
          filters={filters}
          onFiltersChange={handleFilterChange}
          itemGroups={itemGroups}
          onApply={() => refetch()}
          onClear={() => {
            setFilters({
              name: "",
              group: "all",
              status: "all",
              id: "",
            });
          }}
        />
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items..."
        />
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
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
                    <TableRow
                      key={item.name}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        const encodedName = encodeURIComponent(item.item_name);
                        router.push(`/stock/item/${encodedName}`);
                      }}
                    >
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const encodedName = encodeURIComponent(item.item_name);
                              router.push(`/stock/item/${encodedName}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const encodedName = encodeURIComponent(item.item_name);
                              router.push(`/stock/item/${encodedName}/edit`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(item)} // *** UPDATED: Call new handler ***
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* *** NEW: Delete Confirmation Dialog *** */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              <span className="font-semibold"> "{itemToDelete?.item_name}" </span>
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}