// app/stock/item/[name]/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ArrowLeft, Edit, FileText } from "lucide-react";
import { useItemQuery } from "@/hooks/data/useItemsQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeaderActions } from "@/components/ui/detail-header-actions";
import { toast } from "sonner";

interface MovementHistoryItem {
  id: string;
  date: string;
  type: string;
  qty: number;
  uom?: string;
  reference?: string;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const itemName = decodeURIComponent(params.name);

  const { data: itemData, isLoading, error } = useItemQuery(itemName);
  const [history] = useState<MovementHistoryItem[]>([]); // Placeholder for history

  const item = itemData?.item;

  // Prepare data for export/download
  const exportData = useMemo(() => {
    if (!item) return [];

    return [
      {
        "Item Code": item.item_code,
        "Item Name": item.item_name,
        "Item Group": item.item_group,
        UOM: item.stock_uom,
        Brand: item.brand || "",
        Status: item.disabled ? "Disabled" : "Enabled",
        "Is Stock Item": item.is_stock_item ? "Yes" : "No",
        "Is Fixed Asset": item.is_fixed_asset ? "Yes" : "No",
        Description: item.description || "",
        "Last Modified": new Date(item.modified).toLocaleString(),
      },
    ];
  }, [item]);

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Item</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || "Something went wrong"}
          </p>
          <Button onClick={() => router.push("/stock/item")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Skeleton className="h-8 w-8 mr-3" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-80 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The item you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/stock/item")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (disabled?: number) => {
    return disabled
      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  const getStatusText = (disabled?: number) => {
    return disabled ? "Disabled" : "Enabled";
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/stock/item")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Package className="w-8 h-8 mr-3 text-primary" />
                Item Details
              </h1>
              <p className="text-muted-foreground">
                View and manage item details
              </p>
            </div>
          </div>
          <DetailHeaderActions
            data={item}
            printElementId="item-details-content"
            shareTitle={`${item.item_name} - Item Details`}
            shareText={`View details for ${item.item_name} (${item.item_code})`}
            downloadData={exportData}
            downloadFilename={`item-${item.item_code}`}
            downloadTitle={`${item.item_name} - Item Details`}
            onEdit={() =>
              router.push(
                `/stock/item/${encodeURIComponent(item.item_name)}/edit`
              )
            }
          />
        </div>

        <div
          id="item-details-content"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Item Code
                        </p>
                        <p className="font-medium text-lg">{item.item_code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Item Name
                        </p>
                        <p className="font-medium">{item.item_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(item.disabled)}>
                          {getStatusText(item.disabled)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Item Group
                        </p>
                        <p className="font-medium">{item.item_group}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Stock UOM
                        </p>
                        <p className="font-medium">{item.stock_uom}</p>
                      </div>
                      {item.brand && (
                        <div>
                          <p className="text-sm text-muted-foreground">Brand</p>
                          <p className="font-medium">{item.brand}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Is Stock Item
                        </p>
                        <p className="font-medium">
                          {item.is_stock_item ? "Yes" : "No"}
                        </p>
                      </div>
                      {item.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Description
                          </p>
                          <p className="font-medium text-sm">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Movement History */}
            <Card>
              <CardHeader>
                <CardTitle>Movement History</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Reference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.type}</TableCell>
                            <TableCell>
                              {record.type === "ISSUE" || record.type === "SELL"
                                ? `-${record.qty}`
                                : `+${record.qty}`}{" "}
                              {record.uom || ""}
                            </TableCell>
                            <TableCell>{record.reference || ""}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No movement history available for this item.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            {/* Summary Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Item Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Item Code:</span>
                    <span className="font-medium">{item.item_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item Name:</span>
                    <span className="font-medium">{item.item_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item Group:</span>
                    <span>{item.item_group}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock UOM:</span>
                    <span>{item.stock_uom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(item.disabled)}>
                      {getStatusText(item.disabled)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Is Stock Item:</span>
                    <span>{item.is_stock_item ? "Yes" : "No"}</span>
                  </div>
                  {item.brand && (
                    <div className="flex justify-between">
                      <span>Brand:</span>
                      <span>{item.brand}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Stock Balance
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      import("@/lib/detail-actions-utils").then(
                        ({ downloadData }) => {
                          downloadData(
                            exportData,
                            `item-${item.item_code}`,
                            `${item.item_name} - Item Details`,
                            "pdf"
                          ).then(() => {
                            toast.success("PDF downloaded successfully");
                          });
                        }
                      );
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
