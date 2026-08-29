import { useState, useEffect, createContext, useContext, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
}

const ToastItem = forwardRef(function ToastItem({ toast, onDismiss, ...motionProps }, ref) {
    const Icon = icons[toast.type] || Info

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000)
        return () => clearTimeout(timer)
    }, [toast, onDismiss])

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl
        border backdrop-blur-xl
        bg-white/90 dark:bg-surface-800/90
        border-surface-200 dark:border-white/[0.08]
        shadow-lg min-w-[300px] max-w-[420px]"
            {...motionProps}
        >
            <Icon size={20} className={
                toast.type === 'success' ? 'text-accent' :
                    toast.type === 'error' ? 'text-red-400' : 'text-primary'
            } />
            <p className="flex-1 text-sm font-body text-surface-800 dark:text-surface-200">
                {toast.message}
            </p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="p-0.5 rounded cursor-pointer hover:bg-surface-100 dark:hover:bg-white/5 transition-colors"
            >
                <X size={14} className="text-surface-400" />
            </button>
        </motion.div>
    )
})

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type, duration }])
    }

    const dismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
