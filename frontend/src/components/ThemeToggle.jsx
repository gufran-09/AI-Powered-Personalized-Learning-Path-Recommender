import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
    const { isDark, toggleTheme } = useTheme()

    return (
        <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`
                relative inline-flex items-center justify-center
                w-10 h-10 rounded-xl
                cursor-pointer
                bg-surface-100 dark:bg-white/[0.06]
                border border-surface-200 dark:border-white/[0.06]
                text-surface-600 dark:text-surface-300
                hover:bg-surface-200 dark:hover:bg-white/[0.1]
                hover:border-surface-300 dark:hover:border-white/[0.1]
                transition-all duration-200
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/40
                ${className}
            `}
        >
            <motion.div
                initial={false}
                animate={{
                    rotate: isDark ? 0 : 180,
                    scale: [0.85, 1],
                }}
                transition={{
                    rotate: { duration: 0.25, ease: 'easeOut' },
                    scale: { duration: 0.2 },
                }}
            >
                {isDark ? (
                    <Sun
                        size={18}
                        strokeWidth={2}
                        className="text-amber-400"
                    />
                ) : (
                    <Moon
                        size={18}
                        strokeWidth={2}
                        className="text-surface-600 dark:text-surface-300"
                    />
                )}
            </motion.div>
        </motion.button>
    )
}