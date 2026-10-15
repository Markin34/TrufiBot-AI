export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center px-6 gap-4">
        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
        <div className="w-20 h-5 bg-gray-200 rounded" />
        <div className="ml-auto flex gap-4">
          <div className="w-20 h-5 bg-gray-200 rounded" />
          <div className="w-24 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="bg-red-600/20 py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="w-64 h-6 bg-white/30 rounded-full" />
            <div className="w-4/5 h-12 bg-white/30 rounded-xl" />
            <div className="w-3/5 h-12 bg-white/30 rounded-xl" />
            <div className="w-full h-36 bg-white/30 rounded-2xl mt-4" />
          </div>
          <div className="hidden lg:block h-96 bg-white/20 rounded-3xl" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="bg-gray-50 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-8 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Features skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="w-72 h-8 bg-gray-200 rounded mx-auto mb-4" />
        <div className="w-96 h-4 bg-gray-200 rounded mx-auto mb-12" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
              <div className="w-3/4 h-5 bg-gray-200 rounded" />
              <div className="w-full h-4 bg-gray-100 rounded" />
              <div className="w-5/6 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
