import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
    const { isDark, toggleTheme } = useTheme()

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
        relative p-2.5 rounded-xl cursor-pointer
        bg-surface-100 dark:bg-white/[0.06]
        hover:bg-surface-200 dark:hover:bg-white/[0.1]
        transition-colors duration-200
        ${className}
      `}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <motion.div
                initial={false}
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? (
                    <Sun size={18} className="text-amber-400" />
                ) : (
                    <Moon size={18} className="text-surface-600" />
                )}
            </motion.div>
        </motion.button>
    )
}
