// app/stock/settings/item-price/page.tsx
// Pana ERP v1.3 - Item Price List (Premium Borderless Design)
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Filter,
  DollarSign,
  Tag,
  Calendar,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useItemPricesQuery,
  useDeleteItemPriceMutation,
  useItemPriceOptionsQuery,
} from "@/hooks/data/useItemPriceQuery";
import { ItemPrice } from "@/types/item-price";
import { cn } from "@/lib/utils";

// Price Row Component
function PriceRow({
  price,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  price: ItemPrice;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isExpired = price.valid_upto && new Date(price.valid_upto) < new Date();
  const isCustomerSpecific = !!price.customer;
  const isSupplierSpecific = !!price.supplier;

  return (
    <div
      className="group relative flex items-center justify-between p-4 mb-2 bg-card hover:bg-white hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl cursor-pointer animate-in fade-in slide-in-from-left-4"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onView}
    >
      {/* Left: Item Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-foreground text-sm truncate">
            {price.item_code}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {price.item_name}
          </span>
        </div>
      </div>

      {/* Center: Price & Price List */}
      <div className="hidden md:flex items-center gap-8">
        {/* <div className="flex flex-col items-end w-28">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/50">
            Rate
          </span>
          <span className="font-bold text-lg text-primary tabular-nums">
            {price.currency} {price.rate?.toLocaleString()}
          </span>
        </div> */}
        <div className="flex flex-col items-start w-32">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/50">
            Price List
          </span>
          <span className="font-medium text-sm truncate">
            {price.price_list}
          </span>
        </div>
        <div className="flex flex-col items-start w-24">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/50">
            Type
          </span>
          <div className="flex items-center gap-1.5">
            {price.selling ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-semibold">
                Selling
              </span>
            ) : null}
            {price.buying ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold">
                Buying
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right: Status & Actions */}
      <div className="flex items-center gap-3 pl-4">
        {/* Customer/Supplier Badge */}
        {(isCustomerSpecific || isSupplierSpecific) && (
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
              {price.customer || price.supplier}
            </span>
          </div>
        )}

        {/* Validity Badge */}
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
            isExpired
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-500/10 text-emerald-600"
          )}
        >
          {isExpired ? "Expired" : "Active"}
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
              className="rounded-xl shadow-xl bg-white/95 backdrop-blur-xl border-0"
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

export default function ItemPriceListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceListFilter, setPriceListFilter] = useState<string>("all");

  const { data: pricesData, isLoading } = useItemPricesQuery();
  const { data: optionsData } = useItemPriceOptionsQuery();
  const deleteMutation = useDeleteItemPriceMutation();

  const prices = pricesData?.data?.item_prices || [];
  const priceLists = optionsData?.data?.price_lists || [];

  const filteredPrices = useMemo(() => {
    let result = prices;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.item_code?.toLowerCase().includes(q) ||
          p.item_name?.toLowerCase().includes(q) ||
          p.price_list?.toLowerCase().includes(q)
      );
    }

    if (priceListFilter && priceListFilter !== "all") {
      result = result.filter((p) => p.price_list === priceListFilter);
    }

    return result;
  }, [prices, searchQuery, priceListFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Item Prices
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage selling and buying rates for items
          </p>
        </div>
        <Button
          onClick={() => router.push("/stock/settings/item-price/new")}
          className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" /> New Price
        </Button>
      </div>

      {/* Floating Toolbar */}
      <div className="sticky top-2 z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by item, price list..."
            className="w-full h-10 pl-10 pr-4 bg-transparent outline-none text-sm placeholder:text-muted-foreground/70 rounded-xl hover:bg-white/50 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={priceListFilter} onValueChange={setPriceListFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white/50 border-0 shadow-sm">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Price Lists" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl border-0">
              <SelectItem value="all" className="rounded-lg">
                All Price Lists
              </SelectItem>
              {priceLists.map((pl) => (
                <SelectItem
                  key={pl.name}
                  value={pl.name}
                  className="rounded-lg"
                >
                  {pl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{prices.length}</p>
              <p className="text-xs text-muted-foreground">Total Prices</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {prices.filter((p) => p.selling).length}
              </p>
              <p className="text-xs text-muted-foreground">Selling Prices</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {prices.filter((p) => p.buying).length}
              </p>
              <p className="text-xs text-muted-foreground">Buying Prices</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  prices.filter(
                    (p) => !p.valid_upto || new Date(p.valid_upto) >= new Date()
                  ).length
                }
              </p>
              <p className="text-xs text-muted-foreground">Active Prices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price List */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-card/40 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Item Prices Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || priceListFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first item price"}
            </p>
            {!searchQuery && priceListFilter === "all" && (
              <Button
                onClick={() => router.push("/stock/settings/item-price/new")}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Item Price
              </Button>
            )}
          </div>
        ) : (
          <div className="pb-10">
            {filteredPrices.map((price, idx) => (
              <PriceRow
                key={price.name}
                price={price}
                index={idx}
                onView={() =>
                  router.push(
                    `/stock/settings/item-price/${encodeURIComponent(
                      price.name
                    )}`
                  )
                }
                onEdit={() =>
                  router.push(
                    `/stock/settings/item-price/${encodeURIComponent(
                      price.name
                    )}/edit`
                  )
                }
                onDelete={() => {
                  if (confirm("Delete this item price?"))
                    deleteMutation.mutate(price.name);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
