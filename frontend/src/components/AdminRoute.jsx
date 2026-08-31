import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-surface-400 font-body">Verifying Access...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        // Not logged in -> redirect to login
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'admin') {
        // Logged in but not an admin -> redirect to home/dashboard
        return <Navigate to="/" replace />
    }

    // Role is admin, render the nested routes/content
    return children
}
