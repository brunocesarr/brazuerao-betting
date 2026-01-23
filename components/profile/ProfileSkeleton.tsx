export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 rounded-lg bg-gray-200 p-6 shadow-lg">
        <div className="h-20 w-20 rounded-full bg-gray-300" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-48 rounded bg-gray-300" />
          <div className="h-4 w-64 rounded bg-gray-300" />
          <div className="h-3 w-40 rounded bg-gray-300" />
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-6">
          <div>
            <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-200" />
          </div>
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
