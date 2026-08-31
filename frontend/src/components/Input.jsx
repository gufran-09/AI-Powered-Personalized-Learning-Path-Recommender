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
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="
                        block text-sm font-medium
                        text-surface-700 dark:text-surface-300
                    "
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                            text-surface-400
                            pointer-events-none
                        "
                    />
                )}

                <motion.input
                    id={id}
                    type={isPassword && showPassword ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`
                        w-full
                        px-4 py-2.5
                        rounded-lg

                        bg-white dark:bg-surface-900/70
                        border
                        ${error
                            ? 'border-red-400 dark:border-red-500/70'
                            : 'border-surface-200 dark:border-white/10'
                        }

                        text-surface-900 dark:text-white
                        placeholder:text-surface-400 dark:placeholder:text-surface-500
                        text-sm sm:text-base
                        font-body

                        outline-none
                        transition-all duration-200

                        hover:border-surface-300
                        dark:hover:border-white/15

                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/15

                        ${Icon ? 'pl-10' : ''}
                        ${isPassword ? 'pr-11' : ''}
                    `}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="
                            absolute right-3 top-1/2
                            -translate-y-1/2
                            p-1
                            rounded-md
                            text-surface-400
                            hover:text-surface-600
                            dark:hover:text-surface-200
                            hover:bg-surface-100
                            dark:hover:bg-white/5
                            transition-colors
                            cursor-pointer
                        "
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm text-red-500 dark:text-red-400"
                >
                    {error}
                </motion.p>
            )}
        </div>
    )
}