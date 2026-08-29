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
            whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
            onClick={onClick}
            className={`
        rounded-2xl ${padding}
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer' : ''}
        ${glass
                    ? 'glass dark:glass'
                    : 'bg-white dark:bg-surface-800/60 border border-surface-200 dark:border-white/[0.06]'
                }
        ${hover ? 'hover:shadow-lg dark:hover:shadow-glow/20' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    )
}
