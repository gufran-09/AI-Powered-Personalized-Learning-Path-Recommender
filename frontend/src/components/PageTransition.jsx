import { motion } from 'framer-motion'

export default function PageTransition({ children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.25,
                ease: 'easeOut',
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}