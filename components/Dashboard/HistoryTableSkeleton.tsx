export function HistoryTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-20 w-full bg-gray-100 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
