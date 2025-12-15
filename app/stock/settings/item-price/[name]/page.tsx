// app/stock/settings/item-price/[name]/page.tsx
// Pana ERP v1.3 - Item Price Detail (Premium Airy Design)
"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useItemPriceQuery,
  useDeleteItemPriceMutation,
} from "@/hooks/data/useItemPriceQuery";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  MoreVertical,
  DollarSign,
  Tag,
  Calendar,
  Package,
  Users,
  Clock,
  FileText,
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
  icon: Icon,
  children,
  className,
  delay = 0,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-[2rem] p-8 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 animate-in fade-in slide-in-from-left-4",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 mb-6 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />} {title}
      </h3>
      {children}
    </div>
  );
}

function DataPoint({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span
        className={cn(
          "text-base font-medium text-foreground",
          mono && "font-mono tracking-tight",
          highlight && "text-xl font-bold text-primary"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function ItemPriceDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const priceName = decodeURIComponent(params.name);

  const { data: priceData, isLoading } = useItemPriceQuery(priceName);
  const deleteMutation = useDeleteItemPriceMutation();

  const price = priceData?.item_price;

  const isExpired =
    price?.valid_upto && new Date(price.valid_upto) < new Date();
  const isCustomerSpecific = !!price?.customer;
  const isSupplierSpecific = !!price?.supplier;

  if (isLoading || !price) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-8 animate-pulse">
        <div className="h-16 bg-secondary/50 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-secondary/30 rounded-[2rem]" />
          <div className="h-60 bg-secondary/20 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this item price?")) {
      deleteMutation.mutate(priceName, {
        onSuccess: () => router.push("/stock/settings/item-price"),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Floating Header */}
      <div className="flex items-center justify-between sticky top-4 z-20 bg-white/80 backdrop-blur-xl p-2 pr-4 rounded-full shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-white"
            onClick={() => router.push("/stock/settings/item-price")}
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="h-8 w-[1px] bg-border/50" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Item Price
            </span>
            <h1 className="text-lg font-bold leading-none truncate max-w-[300px]">
              {price.item_code}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Badges */}
          {price.selling ? (
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold">
              Selling
            </span>
          ) : null}
          {price.buying ? (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
              Buying
            </span>
          ) : null}

          {/* Status Badge */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
              isExpired
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-600"
            )}
          >
            {isExpired ? "Expired" : "Active"}
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
              className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0 p-2"
            >
              <DropdownMenuItem
                className="rounded-xl"
                onClick={() =>
                  router.push(
                    `/stock/settings/item-price/${encodeURIComponent(
                      priceName
                    )}/edit`
                  )
                }
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit Price
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                className="rounded-xl text-destructive focus:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pricing Information */}
          <InfoCard title="Pricing Details" icon={DollarSign} delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* <div className="sm:col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Rate
                </span>
                <span className="text-3xl font-bold text-primary tabular-nums">
                  {price.currency} {price.rate?.toLocaleString()}
                </span>
              </div> */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-6">
                <DataPoint label="Price List" value={price.price_list} />
                <DataPoint label="Currency" value={price.currency} mono />
                <DataPoint label="UOM" value={price.uom || "Default"} />
                <DataPoint
                  label="Min Quantity"
                  value={price.min_qty || "No minimum"}
                />
              </div>
            </div>
          </InfoCard>

          {/* Item Information */}
          <InfoCard title="Item Details" icon={Package} delay={200}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <DataPoint label="Item Code" value={price.item_code} mono />
              <DataPoint label="Item Name" value={price.item_name} />
              <div className="sm:col-span-2">
                <DataPoint
                  label="Description"
                  value={
                    price.item_description || (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )
                  }
                />
              </div>
            </div>
          </InfoCard>

          {/* Advanced Settings */}
          <InfoCard title="Advanced Settings" icon={Layers} delay={300}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-secondary/30 p-4 rounded-2xl">
                <DataPoint
                  label="Packing Unit"
                  value={price.packing_unit || "Not set"}
                />
              </div>
              <div className="bg-secondary/30 p-4 rounded-2xl">
                <DataPoint
                  label="Lead Time (Days)"
                  value={price.lead_time_in_days || "Not set"}
                />
              </div>
              <div className="bg-secondary/30 p-4 rounded-2xl">
                <DataPoint
                  label="Batch No"
                  value={price.batch_no || "Not set"}
                />
              </div>
            </div>

            {price.note && (
              <div className="mt-6 p-4 bg-secondary/20 rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Note
                </span>
                <p className="text-sm text-foreground">{price.note}</p>
              </div>
            )}
          </InfoCard>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Validity Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[2rem] p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" /> Validity Period
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valid From</p>
                <p className="font-mono text-sm font-semibold">
                  {price.valid_from
                    ? new Date(price.valid_from).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Valid Until
                </p>
                <p
                  className={cn(
                    "font-mono text-sm font-semibold",
                    isExpired && "text-destructive"
                  )}
                >
                  {price.valid_upto
                    ? new Date(price.valid_upto).toLocaleDateString()
                    : "No expiry"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer/Supplier Card */}
          {(isCustomerSpecific || isSupplierSpecific) && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[2rem] p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                {isCustomerSpecific ? "Customer Specific" : "Supplier Specific"}
              </h3>
              <p className="font-semibold">
                {price.customer || price.supplier}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This price applies only to this{" "}
                {isCustomerSpecific ? "customer" : "supplier"}
              </p>
            </div>
          )}

          {/* System Info */}
          <div className="bg-secondary/30 rounded-[2rem] p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> System Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                  Created
                </p>
                <p className="font-mono text-xs">
                  {new Date(price.creation || "").toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground/60">
                  Last Modified
                </p>
                <p className="font-mono text-xs">
                  {new Date(price.modified || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
