import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
}

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.96,
        y: 12,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 26,
            stiffness: 320,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: 12,
        transition: {
            duration: 0.15,
            ease: 'easeOut',
        },
    },
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    className = '',
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? 'modal-title' : undefined}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-surface-950/60 backdrop-blur-md"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`
                            relative z-10 w-full max-w-lg
                            overflow-hidden
                            rounded-2xl
                            bg-white dark:bg-surface-800
                            border border-surface-200 dark:border-white/[0.08]
                            shadow-2xl shadow-surface-950/20
                            ${className}
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-surface-200 dark:border-white/[0.06]">
                            {title ? (
                                <h3
                                    id="modal-title"
                                    className="text-lg font-heading font-semibold text-surface-900 dark:text-white"
                                >
                                    {title}
                                </h3>
                            ) : (
                                <div />
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close modal"
                                className="
                                    flex-shrink-0
                                    w-9 h-9
                                    inline-flex items-center justify-center
                                    rounded-xl
                                    cursor-pointer
                                    text-surface-400
                                    hover:text-surface-700 dark:hover:text-white
                                    hover:bg-surface-100 dark:hover:bg-white/[0.06]
                                    transition-all duration-200
                                    focus:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-primary/40
                                "
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}