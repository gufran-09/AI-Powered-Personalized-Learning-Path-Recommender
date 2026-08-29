import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, BookOpen, Trophy, Settings, LogOut,
    ChevronLeft, ChevronRight, Menu, X, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quiz-setup', label: 'Start Quiz', icon: BookOpen },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
]

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-6">
                <div className="w-9 h-9 rounded-xl bg-hero-gradient flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} className="text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="font-heading font-bold text-lg text-surface-900 dark:text-white whitespace-nowrap overflow-hidden"
                        >
                            AdaptIQ
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
              ${isActive
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-white/[0.04] hover:text-surface-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* Sign Out */}
            <div className="px-3 pb-4">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full cursor-pointer
            text-surface-400 hover:text-red-400 hover:bg-red-500/5
            transition-all duration-200"
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-sm font-medium whitespace-nowrap overflow-hidden"
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
            {/* Mobile Hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border border-surface-200 dark:border-white/[0.08] lg:hidden cursor-pointer shadow-lg"
            >
                <Menu size={20} className="text-surface-700 dark:text-surface-300" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-0 left-0 bottom-0 w-[260px] z-50 lg:hidden
              bg-white dark:bg-surface-900
              border-r border-surface-200 dark:border-white/[0.06]"
                    >
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-white/5 cursor-pointer"
                        >
                            <X size={18} className="text-surface-500" />
                        </button>
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30
          bg-white dark:bg-surface-900
          border-r border-surface-200 dark:border-white/[0.06]"
            >
                {sidebarContent}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full cursor-pointer
            bg-white dark:bg-surface-800
            border border-surface-200 dark:border-white/[0.08]
            flex items-center justify-center shadow-md
            hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight size={12} className="text-surface-500" />
                    ) : (
                        <ChevronLeft size={12} className="text-surface-500" />
                    )}
                </button>
            </motion.aside>
        </>
    )
}
