// app/stock/settings/item-price/[name]/loading.tsx
// Loading skeleton for Item Price detail page

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-secondary/50 rounded-full" />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 bg-secondary/30 rounded-[2rem]" />
          <div className="h-48 bg-secondary/30 rounded-[2rem]" />
          <div className="h-32 bg-secondary/30 rounded-[2rem]" />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-40 bg-secondary/20 rounded-[2rem]" />
          <div className="h-32 bg-secondary/20 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
