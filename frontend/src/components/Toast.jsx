import { useState, useEffect, createContext, useContext, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle2,
    AlertCircle,
    Info,
    X,
} from 'lucide-react'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

const toastStyles = {
    success: {
        icon: CheckCircle2,
        iconClass: 'text-accent',
        accentClass: 'bg-accent',
    },
    error: {
        icon: AlertCircle,
        iconClass: 'text-red-500',
        accentClass: 'bg-red-500',
    },
    info: {
        icon: Info,
        iconClass: 'text-primary',
        accentClass: 'bg-primary',
    },
}

const ToastItem = forwardRef(function ToastItem(
    { toast, onDismiss, ...motionProps },
    ref
) {
    const style = toastStyles[toast.type] || toastStyles.info
    const Icon = style.icon

    useEffect(() => {
        const timer = setTimeout(
            () => onDismiss(toast.id),
            toast.duration || 4000
        )

        return () => clearTimeout(timer)
    }, [toast.id, toast.duration, onDismiss])

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
                opacity: 0,
                x: 40,
                scale: 0.96,
                transition: { duration: 0.2 },
            }}
            transition={{
                type: 'spring',
                stiffness: 350,
                damping: 28,
            }}
            className="
                relative flex items-center gap-3
                w-[calc(100vw-2rem)] sm:min-w-[320px] sm:w-auto
                max-w-[420px]
                overflow-hidden
                rounded-2xl
                px-4 py-3.5
                bg-white/95 dark:bg-surface-800/95
                backdrop-blur-xl
                border border-surface-200 dark:border-white/[0.08]
                shadow-xl shadow-surface-950/10
            "
            {...motionProps}
        >
            {/* Accent indicator */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${style.accentClass}`}
            />

            {/* Icon */}
            <div className="flex-shrink-0">
                <Icon
                    size={20}
                    strokeWidth={2}
                    className={style.iconClass}
                />
            </div>

            {/* Message */}
            <p className="
                flex-1
                text-sm
                leading-relaxed
                font-body
                font-medium
                text-surface-800 dark:text-surface-200
            ">
                {toast.message}
            </p>

            {/* Close */}
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="
                    flex-shrink-0
                    w-7 h-7
                    inline-flex items-center justify-center
                    rounded-lg
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
                <X size={15} />
            </button>
        </motion.div>
    )
})

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random()

        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type,
                duration,
            },
        ])
    }

    const dismissToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const toast = {
        success: (message, duration) =>
            addToast(message, 'success', duration),

        error: (message, duration) =>
            addToast(message, 'error', duration),

        info: (message, duration) =>
            addToast(message, 'info', duration),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}

            <div
                className="
                    fixed
                    top-4 right-4
                    z-[100]
                    flex flex-col items-end
                    gap-2.5
                    pointer-events-none
                "
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className="pointer-events-auto"
                        >
                            <ToastItem
                                toast={toast}
                                onDismiss={dismissToast}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}