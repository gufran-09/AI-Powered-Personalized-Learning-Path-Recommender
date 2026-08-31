import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quiz-setup', label: 'Start Quiz', icon: BookOpen },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
]

export default function Sidebar({
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
}) {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-20 flex items-center px-4">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-3 group min-w-0"
                    onClick={() => setMobileOpen(false)}
                >
                    <div className="
                        w-9 h-9
                        rounded-lg
                        bg-hero-gradient
                        flex items-center justify-center
                        flex-shrink-0
                        transition-transform duration-200
                        group-hover:scale-105
                    ">
                        <Sparkles size={17} className="text-white" />
                    </div>

                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className="
                                    font-heading font-bold text-lg
                                    text-surface-900 dark:text-white
                                    whitespace-nowrap overflow-hidden
                                "
                            >
                                AdaptIQ
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) => `
                            flex items-center gap-3
                            px-3 py-2.5
                            rounded-lg
                            transition-colors duration-200
                            group
                            ${
                                isActive
                                    ? `
                                        bg-primary/10
                                        dark:bg-primary/15
                                        text-primary
                                      `
                                    : `
                                        text-surface-500
                                        dark:text-surface-400
                                        hover:bg-surface-100
                                        dark:hover:bg-white/[0.04]
                                        hover:text-surface-900
                                        dark:hover:text-white
                                      `
                            }
                        `}
                    >
                        <item.icon
                            size={19}
                            strokeWidth={1.9}
                            className="flex-shrink-0"
                        />

                        <AnimatePresence initial={false}>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="
                                        text-sm font-medium
                                        whitespace-nowrap overflow-hidden
                                    "
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Sign out */}
            <div className="px-3 pb-4">
                <button
                    onClick={handleSignOut}
                    title={collapsed ? 'Sign Out' : undefined}
                    className="
                        flex items-center gap-3
                        w-full
                        px-3 py-2.5
                        rounded-lg
                        text-surface-500 dark:text-surface-400
                        hover:text-red-500
                        hover:bg-red-500/5
                        transition-colors duration-200
                        cursor-pointer
                    "
                >
                    <LogOut
                        size={19}
                        strokeWidth={1.9}
                        className="flex-shrink-0"
                    />

                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className="
                                    text-sm font-medium
                                    whitespace-nowrap overflow-hidden
                                "
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="
                    fixed top-4 left-4 z-50
                    lg:hidden
                    p-2
                    rounded-lg
                    bg-white/90 dark:bg-surface-800/90
                    backdrop-blur-xl
                    border border-surface-200 dark:border-white/[0.08]
                    shadow-md
                    text-surface-700 dark:text-surface-300
                    hover:bg-surface-50 dark:hover:bg-surface-700
                    transition-colors
                    cursor-pointer
                "
            >
                <Menu size={19} />
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="
                            fixed inset-0
                            bg-black/40
                            backdrop-blur-[2px]
                            z-40 lg:hidden
                        "
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{
                            type: 'spring',
                            damping: 28,
                            stiffness: 320,
                        }}
                        className="
                            fixed top-0 left-0 bottom-0
                            w-[260px]
                            z-50 lg:hidden
                            bg-white dark:bg-surface-900
                            border-r border-surface-200
                            dark:border-white/[0.06]
                            shadow-xl
                        "
                    >
                        <button
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close navigation"
                            className="
                                absolute top-5 right-4
                                p-1.5
                                rounded-lg
                                text-surface-400
                                hover:text-surface-700
                                dark:hover:text-white
                                hover:bg-surface-100
                                dark:hover:bg-white/5
                                transition-colors
                                cursor-pointer
                            "
                        >
                            <X size={18} />
                        </button>

                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="
                    hidden lg:flex
                    flex-col
                    fixed top-0 left-0 bottom-0
                    z-30
                    bg-white dark:bg-surface-900
                    border-r border-surface-200
                    dark:border-white/[0.06]
                "
            >
                {sidebarContent}

                {/* Collapse button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="
                        absolute -right-3 top-[76px]
                        w-6 h-6
                        rounded-full
                        bg-white dark:bg-surface-800
                        border border-surface-200
                        dark:border-white/[0.08]
                        flex items-center justify-center
                        shadow-sm
                        text-surface-400
                        hover:text-surface-700
                        dark:hover:text-white
                        hover:bg-surface-50
                        dark:hover:bg-surface-700
                        transition-colors
                        cursor-pointer
                    "
                >
                    {collapsed ? (
                        <ChevronRight size={12} />
                    ) : (
                        <ChevronLeft size={12} />
                    )}
                </button>
            </motion.aside>
        </>
    )
}