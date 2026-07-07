import { Skeleton } from "@/components/ui/skeleton";

// Card-style skeleton matching the new order card layout
const OrderCardSkeleton = () => (
  <div className="border border-border rounded-xl p-4 space-y-4 bg-card">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    {/* Thumbnail row */}
    <div className="flex items-center gap-2">
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5 ml-1">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-1">
      <Skeleton className="h-5 w-16" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

const OrderTableSkeleton = () => (
  <div className="space-y-4 p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Legacy skeleton (kept for backward compat)
const OrderSkeleton = () => (
  <div className="border border-border rounded-xl p-4 space-y-4 bg-card">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    <div className="border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  </div>
);

export { OrderSkeleton, OrderCardSkeleton, OrderTableSkeleton };
