import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, Layers } from 'lucide-react'

const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Learning Resources', path: '/admin/resources', icon: Layers },
]

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-white/[0.08] flex flex-col h-full overflow-y-auto transition-colors z-20 hidden md:flex">
            {/* Logo/Brand Area */}
            <div className="h-16 flex items-center px-6 border-b border-surface-200 dark:border-white/[0.08]">
                <span className="font-heading font-bold text-xl text-primary flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">A</span>
                    AdaptIQ Admin
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-white/5'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {link.name}
                        </NavLink>
                    )
                })}
            </nav>
        </aside>
    )
}
