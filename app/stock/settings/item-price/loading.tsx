// app/stock/settings/item-price/loading.tsx
// Loading skeleton for Item Price list page

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-secondary/50 rounded-lg" />
          <div className="h-4 w-64 bg-secondary/30 rounded-lg mt-2" />
        </div>
        <div className="h-10 w-32 bg-primary/30 rounded-full" />
      </div>

      {/* Toolbar skeleton */}
      <div className="h-14 bg-white/60 rounded-2xl" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-card rounded-2xl" />
        ))}
      </div>

      {/* List items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-card/40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
