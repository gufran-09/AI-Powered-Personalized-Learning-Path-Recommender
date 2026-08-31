import { motion } from 'framer-motion'

export default function Card({
    children,
    className = '',
    glass = false,
    hover = true,
    padding = 'p-6',
    onClick,
    ...props
}) {
    return (
        <motion.div
            whileHover={
                hover
                    ? {
                          y: -2,
                          transition: { duration: 0.18, ease: 'easeOut' },
                      }
                    : {}
            }
            onClick={onClick}
            className={`
                ${padding}
                rounded-xl
                transition-all duration-200 ease-out
                ${onClick ? 'cursor-pointer' : ''}

                ${
                    glass
                        ? `
                            bg-white/75 dark:bg-surface-800/70
                            backdrop-blur-xl
                            border border-white/60 dark:border-white/[0.07]
                        `
                        : `
                            bg-white dark:bg-surface-800/60
                            border border-surface-200/80 dark:border-white/[0.06]
                        `
                }

                ${
                    hover
                        ? `
                            hover:border-surface-300
                            dark:hover:border-white/[0.10]
                            hover:shadow-lg
                            hover:shadow-surface-900/5
                            dark:hover:shadow-black/20
                        `
                        : ''
                }

                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    )
}