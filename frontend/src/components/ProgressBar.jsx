import { motion } from 'framer-motion'

export default function ProgressBar({
    value = 0,
    max = 100,
    size = 'md',
    color = 'primary',
    showLabel = false,
    className = '',
    animated = true,
}) {
    const percentage = Math.min(Math.round((value / max) * 100), 100)

    const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
    const colors = {
        primary: 'bg-primary',
        accent: 'bg-accent',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        gradient: 'bg-gradient-to-r from-primary via-accent to-cyan-400',
    }

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Progress</span>
                    <span className="text-sm font-heading font-semibold text-primary">{percentage}%</span>
                </div>
            )}
            <div className={`w-full ${heights[size]} bg-surface-200 dark:bg-white/[0.06] rounded-full overflow-hidden`}>
                <motion.div
                    initial={animated ? { width: 0 } : false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className={`h-full rounded-full ${colors[color]}`}
                />
            </div>
        </div>
    )
}

export function ProgressRing({
    value = 0,
    max = 100,
    size = 80,
    strokeWidth = 6,
    color = '#6C63FF',
    className = '',
}) {
    const percentage = Math.min((value / max) * 100, 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-surface-200 dark:text-white/[0.06]"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    strokeDasharray={circumference}
                />
            </svg>
            <span className="absolute text-sm font-heading font-bold text-surface-900 dark:text-white">
                {Math.round(percentage)}%
            </span>
        </div>
    )
}
