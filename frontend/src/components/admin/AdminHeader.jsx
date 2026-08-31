import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ThemeToggle'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminHeader() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        try {
            await signOut()
            navigate('/login')
        } catch (err) {
            console.error('Sign out failed', err)
        }
    }

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-white/[0.08] z-10 transition-colors">
            {/* Mobile Header Title */}
            <div className="md:hidden font-heading font-bold text-lg text-primary">
                AdaptIQ Admin
            </div>

            {/* Empty div for desktop alignment */}
            <div className="hidden md:block"></div>

            <div className="flex items-center gap-6">
                <ThemeToggle />

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                            {user?.fullName || 'Admin User'}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                            {user?.role || 'Admin'}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    )
}
