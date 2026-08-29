export function SkeletonLine({ className = '', width = 'w-full' }) {
    return (
        <div
            className={`${width} h-4 bg-surface-200 dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`}
        />
    )
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }) {
    return (
        <div
            className={`${size} rounded-full bg-surface-200 dark:bg-white/[0.06] animate-pulse ${className}`}
        />
    )
}

export function SkeletonCard({ className = '' }) {
    return (
        <div
            className={`rounded-2xl p-6 bg-white dark:bg-surface-800/60 border border-surface-200 dark:border-white/[0.06] space-y-4 ${className}`}
        >
            <SkeletonLine width="w-1/3" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-2/3" />
            <div className="flex gap-3 pt-2">
                <SkeletonCircle size="w-8 h-8" />
                <div className="space-y-2 flex-1">
                    <SkeletonLine width="w-1/2" />
                    <SkeletonLine width="w-1/4" />
                </div>
            </div>
        </div>
    )
}
