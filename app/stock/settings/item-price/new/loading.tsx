// app/stock/settings/item-price/new/loading.tsx
// Loading skeleton for New Item Price page

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-white/80 rounded-full" />

      {/* Form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main form column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="h-72 bg-card rounded-[2rem]" />
          <div className="h-48 bg-card rounded-[2rem]" />
          <div className="h-32 bg-card rounded-[2rem]" />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-48 bg-primary/10 rounded-[2rem]" />
          <div className="h-32 bg-secondary/30 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
