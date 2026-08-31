import { motion } from 'framer-motion'

const variants = {
    primary: `
        bg-primary
        hover:bg-primary-500
        text-white
        shadow-sm shadow-primary/20
        hover:shadow-md hover:shadow-primary/20
    `,

    secondary: `
        bg-white dark:bg-surface-900
        border border-surface-200 dark:border-white/10
        text-surface-700 dark:text-surface-200
        hover:bg-surface-50 dark:hover:bg-white/5
        hover:border-primary/40
        shadow-sm
    `,

    accent: `
        bg-accent
        hover:bg-accent-600
        text-white
        shadow-sm shadow-accent/20
        hover:shadow-md
    `,

    ghost: `
        bg-transparent
        text-surface-600 dark:text-surface-300
        hover:text-surface-900 dark:hover:text-white
        hover:bg-surface-100 dark:hover:bg-white/5
    `,

    danger: `
        bg-red-500
        hover:bg-red-600
        text-white
        shadow-sm
    `,
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-9',
    md: 'px-4 py-2 text-sm sm:text-base min-h-10',
    lg: 'px-6 py-3 text-base sm:text-lg min-h-12',
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    ...props
}) {
    return (
        <motion.button
            type={type}
            whileHover={{ scale: disabled ? 1 : 1.01 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2
                rounded-lg
                font-heading font-semibold
                cursor-pointer select-none
                transition-all duration-200 ease-out
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/40
                focus-visible:ring-offset-2
                focus-visible:ring-offset-white
                dark:focus-visible:ring-offset-surface-950
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}

            {children}
        </motion.button>
    )
}