export function SkeletonLoader() {
  return (
    <div className="flex gap-3 animate-pulse px-4 py-3">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-red-100 flex-shrink-0" />
      {/* Bubbles */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-4 bg-gray-200 rounded-full w-1/2" />
        <div className="h-16 bg-gray-100 rounded-2xl w-full mt-1" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
    </div>
  )
}
