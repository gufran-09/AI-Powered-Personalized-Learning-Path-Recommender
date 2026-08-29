import { useState, useEffect } from 'react'
import { Search, MoreVertical, Shield, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchUsersList } from '../../lib/adminApi'
import { useToast } from '../../components/Toast'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { user: currentUser } = useAuth()
    const toast = useToast()

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetchUsersList(currentUser.sessionToken, 1, searchTerm)
                if (res?.success === false) throw new Error(res.error)

                // MOCK DATA for layout if API isn't wired fully
                if (!res || !res.users) {
                    setUsers([
                        { id: 1, full_name: 'John Doe', email: 'john@example.com', role: 'user', created_at: '2023-10-01T12:00:00Z' },
                        { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin', created_at: '2023-10-02T14:30:00Z' },
                        { id: 3, full_name: 'Alice Johnson', email: 'alice@example.com', role: 'user', created_at: '2023-10-15T09:15:00Z' },
                    ])
                } else {
                    setUsers(res.users)
                }
            } catch (err) {
                console.error(err)
                toast.error('Failed to load users')
            } finally {
                setLoading(false)
            }
        }

        // Add a slight debounce to search to prevent rapid API calls
        const timer = setTimeout(() => {
            loadUsers()
        }, 300)

        return () => clearTimeout(timer)
    }, [currentUser, searchTerm, toast])

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        View and manage platform users
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-surface-200 dark:border-white/[0.08] bg-surface-50 dark:bg-surface-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-white/[0.08]">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-10 w-32 bg-surface-100 dark:bg-surface-800 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-surface-100 dark:bg-surface-800 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-surface-100 dark:bg-surface-800 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 ml-auto bg-surface-100 dark:bg-surface-800 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-surface-500 dark:text-surface-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((userRow) => (
                                    <tr key={userRow.id} className="hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {userRow.full_name ? userRow.full_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-surface-900 dark:text-white">{userRow.full_name}</div>
                                                    <div className="text-sm text-surface-500 dark:text-surface-400">{userRow.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${userRow.role === 'admin'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                                                : 'bg-surface-100 text-surface-700 border-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-700'
                                                }`}>
                                                {userRow.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                                {userRow.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-400">
                                            {new Date(userRow.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-surface-400 hover:text-primary rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
