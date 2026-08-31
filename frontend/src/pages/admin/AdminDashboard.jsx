import { useState, useEffect } from 'react'
import { Users, FileText, CheckCircle, Activity } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchAdminStats } from '../../lib/adminApi'
import { useToast } from '../../components/Toast'

// Separate component for the statistical cards
function StatCard({ title, value, icon: Icon, colorClass, loading }) {
    return (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-2xl p-6 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <p className="text-surface-500 dark:text-surface-400 text-sm font-medium mb-1">
                    {title}
                </p>
                {loading ? (
                    <div className="h-8 w-24 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
                ) : (
                    <h3 className="text-2xl font-bold text-surface-900 dark:text-white">
                        {value}
                    </h3>
                )}
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAssessments: 0,
        averageAccuracy: 0,
        activeUsers: 0
    })
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const toast = useToast()

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Fetch stats using the placeholder API call
                const res = await fetchAdminStats(user.sessionToken)
                if (res?.success === false) throw new Error(res.error)

                // If API is not implemented yet, just mock some data for presentation
                if (!res || !res.stats) {
                    setStats({
                        totalUsers: 1248,
                        totalAssessments: 5230,
                        averageAccuracy: 76.5,
                        activeUsers: 342
                    })
                } else {
                    setStats(res.stats)
                }
            } catch (err) {
                console.error(err)
                toast.error('Failed to load dashboard statistics')
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [user, toast])

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white">
                    Overview
                </h1>
                <p className="text-surface-500 dark:text-surface-400 mt-1">
                    Welcome to the AdaptIQ Admin Dashboard
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    loading={loading}
                />
                <StatCard
                    title="Total Assessments"
                    value={stats.totalAssessments.toLocaleString()}
                    icon={FileText}
                    colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    loading={loading}
                />
                <StatCard
                    title="Average Accuracy"
                    value={`${stats.averageAccuracy.toFixed(1)}%`}
                    icon={CheckCircle}
                    colorClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                    loading={loading}
                />
                <StatCard
                    title="Active Users (7d)"
                    value={stats.activeUsers.toLocaleString()}
                    icon={Activity}
                    colorClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                    loading={loading}
                />
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-surface-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">Detailed Analytics Upcoming</h3>
                    <p className="text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
                        We are working on bringing you more detailed charts and activity graphs for the platform.
                    </p>
                </div>
            </div>
        </div>
    )
}
