import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
    label,
    type = 'text',
    id,
    placeholder,
    value,
    onChange,
    error,
    icon: Icon,
    className = '',
    ...props
}) {
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-surface-600 dark:text-surface-400"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-primary' : 'text-surface-400'
                            }`}
                    />
                )}
                <motion.input
                    id={id}
                    type={isPassword && showPassword ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    animate={{
                        borderColor: error
                            ? '#EF4444'
                            : focused
                                ? '#6C63FF'
                                : 'rgba(226, 232, 240, 0.2)',
                    }}
                    className={`
            w-full px-4 py-3 rounded-xl
            bg-white/5 dark:bg-white/[0.04]
            border border-surface-200 dark:border-white/[0.08]
            text-surface-900 dark:text-white
            placeholder-surface-400 dark:placeholder-surface-500
            text-base font-body
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
          `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-300 cursor-pointer transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
                {focused && (
                    <motion.div
                        layoutId="input-focus"
                        className="absolute inset-0 rounded-xl border-2 border-primary/30 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </div>
    )
}
