// app/stock/item/page.tsx
// Pana ERP v1.3 - Borderless "Air" List
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useItemsQuery,
  useDeleteItemMutation,
  useItemOptionsQuery,
} from "@/hooks/data/useItemsQuery";
import { Item } from "@/types/item";
import { cn } from "@/lib/utils";

// Custom "Air" Row Component
function ItemRow({
  item,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  item: Item;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group relative flex items-center justify-between p-4 mb-2 bg-card hover:bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl cursor-pointer animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, transitionDelay: "0ms" }}
      onClick={onView}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {item.item_name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-foreground text-sm truncate">
            {item.item_name}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {item.item_code}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-end w-24">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/50">
            Group
          </span>
          <span className="font-medium text-foreground">{item.item_group}</span>
        </div>
        <div className="flex flex-col items-end w-20">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/50">
            Details
          </span>
          <span className="font-medium text-foreground">{item.stock_uom}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-4 border-l border-transparent sm:border-border/40">
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
            item.disabled
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-500/10 text-emerald-600"
          )}
        >
          {item.disabled ? "Inactive" : "Active"}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-secondary"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-none shadow-xl bg-white/90 backdrop-blur-xl"
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg" onClick={onView}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg" onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                className="rounded-lg text-destructive focus:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function ItemPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: itemsData, isLoading } = useItemsQuery();
  const deleteMutation = useDeleteItemMutation();

  const items = itemsData?.data?.items || [];

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.item_name.toLowerCase().includes(q) ||
        i.item_code.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your catalogue and stock.
          </p>
        </div>
        <Button
          onClick={() => router.push("/stock/item/new")}
          className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> New Item
        </Button>
      </div>

      {/* Floating Toolbar */}
      <div className="sticky top-2 z-10 flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/20 shadow-sm animate-scale-in delay-100 max-w-2xl mx-auto sm:mx-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search items..."
            className="w-full h-9 pl-10 pr-4 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="h-4 w-[1px] bg-border/50" />
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          Export
        </Button>
      </div>

      {/* Items List */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-card/40 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Items Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters.
            </p>
          </div>
        ) : (
          <div className="pb-10">
            {filteredItems.map((item, idx) => (
              <ItemRow
                key={item.name}
                item={item}
                index={idx}
                onView={() =>
                  router.push(
                    `/stock/item/${encodeURIComponent(item.item_name)}`
                  )
                }
                onEdit={() =>
                  router.push(
                    `/stock/item/${encodeURIComponent(item.item_name)}/edit`
                  )
                }
                onDelete={() => {
                  if (confirm("Delete?")) deleteMutation.mutate(item.name);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
