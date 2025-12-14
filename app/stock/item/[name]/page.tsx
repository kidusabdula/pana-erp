// app/stock/item/[name]/page.tsx
// Pana ERP v1.3 - Airy Detail Board
"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useItemQuery,
  useDeleteItemMutation,
} from "@/hooks/data/useItemsQuery";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Printer,
  Download,
  Clock,
  Package,
  MoreVertical,
  Activity,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function InfoCard({
  title,
  children,
  className,
  delay = 0,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 mb-6 flex items-center gap-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DataPoint({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-base font-medium text-foreground",
          mono && "font-mono tracking-tight"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const itemName = decodeURIComponent(params.name);

  const { data: itemData, isLoading } = useItemQuery(itemName);
  const deleteMutation = useDeleteItemMutation();

  const item = itemData?.item;

  if (isLoading || !item) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-8 animate-pulse">
        <div className="h-20 bg-secondary/50 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-secondary/30 rounded-[2rem]" />
          <div className="h-64 bg-secondary/20 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Navbar / Header */}
      <div className="flex items-center justify-between sticky top-4 z-20 bg-white/80 backdrop-blur-xl p-2 pr-4 rounded-full border border-white/40 shadow-sm animate-slide-up">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-white"
            onClick={() => router.push("/stock/item")}
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="h-8 w-[1px] bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Item Details
            </span>
            <h1 className="text-lg font-bold leading-none">{item.item_name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
              item.disabled
                ? "bg-destructive/5 text-destructive border-destructive/10"
                : "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
            )}
          >
            {item.disabled ? "Inactive" : "Active"}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl border-none shadow-xl bg-white/90 backdrop-blur-xl p-2"
            >
              <DropdownMenuItem
                className="rounded-xl"
                onClick={() =>
                  router.push(
                    `/stock/item/${encodeURIComponent(itemName)}/edit`
                  )
                }
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl">
                <Printer className="mr-2 h-4 w-4" /> Print Label
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="rounded-xl text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Center Panel */}
        <div className="lg:col-span-8 space-y-8">
          <InfoCard
            title={
              <>
                <Package className="h-4 w-4" /> Core Data
              </>
            }
            delay={100}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <DataPoint label="Item Name" value={item.item_name} />
              <DataPoint label="Item Code" value={item.item_code} mono />
              <DataPoint label="Group" value={item.item_group} />
              <DataPoint label="Brand" value={item.brand} />
              <div className="sm:col-span-2">
                <DataPoint
                  label="Description"
                  value={
                    item.description || (
                      <span className="text-muted-foreground italic">
                        No description provided.
                      </span>
                    )
                  }
                />
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title={
              <>
                <Layers className="h-4 w-4" /> Inventory Configuration
              </>
            }
            delay={200}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-secondary/30 p-4 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  Default UOM
                </span>
                <span className="text-xl font-mono text-primary">
                  {item.stock_uom}
                </span>
              </div>
              <div className="bg-secondary/30 p-4 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  Stock Item
                </span>
                <span
                  className={cn(
                    "text-xl font-bold",
                    item.is_stock_item
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  )}
                >
                  {item.is_stock_item ? "Yes" : "No"}
                </span>
              </div>
              <div className="bg-secondary/30 p-4 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  Fixed Asset
                </span>
                <span
                  className={cn(
                    "text-xl font-bold",
                    item.is_fixed_asset
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  )}
                >
                  {item.is_fixed_asset ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-4 space-y-8">
          <InfoCard
            title={
              <>
                <Activity className="h-4 w-4" /> Status
              </>
            }
            delay={300}
            className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-white/50"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valuation Rate</span>
                <span className="font-mono text-lg font-bold">120.00</span>
              </div>
              <div className="h-[1px] bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Stock</span>
                <span className="font-mono text-lg font-bold text-primary">
                  1,240
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title={
              <>
                <Clock className="h-4 w-4" /> System Info
              </>
            }
            delay={400}
            className="bg-transparent border-none shadow-none p-0 hover:shadow-none"
          >
            <div className="space-y-4 text-sm text-muted-foreground/80">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="font-mono">
                  {new Date(item.creation || "").toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified</span>
                <span className="font-mono">
                  {new Date(item.modified || "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
