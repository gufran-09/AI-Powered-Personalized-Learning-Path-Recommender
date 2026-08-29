import { motion } from 'framer-motion'

const variants = {
    primary: 'bg-primary hover:bg-primary-500 text-white shadow-glow hover:shadow-glow-lg',
    secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
    accent: 'bg-accent hover:bg-accent-600 text-white shadow-glow-accent',
    ghost: 'bg-transparent text-surface-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
}

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
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
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        font-heading font-semibold rounded-xl cursor-pointer
        transition-all duration-200 ease-out
        inline-flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface-950
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </motion.button>
    )
}
