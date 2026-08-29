import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20 },
}

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`
              relative z-10 w-full max-w-lg
              bg-white dark:bg-surface-800
              border border-surface-200 dark:border-white/[0.08]
              rounded-2xl p-6 shadow-xl
              ${className}
            `}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-heading font-semibold text-surface-900 dark:text-white">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                                <X size={20} className="text-surface-500" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
