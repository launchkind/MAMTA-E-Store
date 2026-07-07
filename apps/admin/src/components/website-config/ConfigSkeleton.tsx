export default function ConfigSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="group relative bg-white dark:bg-slate-800 border rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            {/* Drag Handle Skeleton */}
            <div className="w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded"></div>

            {/* Weight Badge Skeleton */}
            <div className="w-10 h-6 bg-gray-200 dark:bg-slate-700 rounded"></div>

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-64"></div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
