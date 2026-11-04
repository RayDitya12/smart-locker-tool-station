import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-line/60',
        className,
      )}
    />
  )
}

export function ToolCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-surface-2 to-signal-50">
        <Skeleton className="h-16 w-16 rounded-xl" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="mt-3 h-3 w-full" />
        <Skeleton className="mt-1.5 h-3 w-4/5" />
        <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="mt-3.5 h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}
