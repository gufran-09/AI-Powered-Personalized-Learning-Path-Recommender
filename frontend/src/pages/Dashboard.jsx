import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, BookOpen, ChevronRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import ThemeToggle from '../components/ThemeToggle'
import PageTransition from '../components/PageTransition'
import AIAssistantWidget from '../components/AIAssistantWidget'

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [path, setPath] = useState(null)

    const firstName = user?.fullName?.split(' ')[0]
        || user?.email?.split('@')[0]
        || 'Learner'

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/paths?user_id=${user.id}`)
                if (res.ok) {
                    const { data } = await res.json()
                    if (data && data.length > 0) {
                        setPath(data[0])
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadDashboard()
    }, [user.id])

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <motion.main
                initial={false}
                animate={{ marginLeft: collapsed ? 72 : 240 }}
                transition={{ duration: 0.2 }}
                className="min-h-screen transition-[margin] hidden-lg:ml-0 max-lg:!ml-0"
            >
                <PageTransition>
                    <div className="sticky top-0 z-20 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-white/[0.04]">
                        <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
                            <div className="pl-12 lg:pl-0">
                                <h1 className="text-xl font-heading font-bold text-surface-900 dark:text-white">
                                    Welcome back, <span className="text-gradient">{firstName}</span>
                                </h1>
                                <p className="text-sm text-surface-500 dark:text-surface-400">
                                    Ready to continue learning?
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <div className="w-9 h-9 rounded-xl bg-hero-gradient flex items-center justify-center text-white font-heading text-sm font-bold">
                                    {firstName[0]?.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 lg:px-8 py-6 space-y-6">
                        {loading ? (
                            <div className="flex bg-surface-100 dark:bg-surface-800 animate-pulse rounded-xl h-40"></div>
                        ) : !path ? (
                            <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Start Your Journey</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't set up a personalized learning path yet.</p>
                                <button onClick={() => navigate('/onboarding')} className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">
                                    Create My Roadmap
                                </button>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card hover={false}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-heading font-semibold text-surface-900 dark:text-white text-xl">
                                                Active Roadmap: {path.title}
                                            </h3>
                                            <button onClick={() => navigate('/roadmap')} className="text-sm text-primary hover:underline flex items-center">
                                                View full roadmap <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {path.learning_path_milestones?.sort((a,b)=>a.step_order - b.step_order).slice(0,3).map(m => (
                                                <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg">
                                                    <div className={`p-2 rounded-full ${m.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {m.status === 'completed' ? <CheckCircle size={20} /> : <BookOpen size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{m.title}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{m.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                                <div className="space-y-4">
                                    <Card onClick={() => navigate('/roadmap')} className="bg-hero-gradient !border-0 cursor-pointer">
                                        <h4 className="font-heading font-semibold text-white mb-1">Continue Learning</h4>
                                        <p className="text-sm text-white/70 mb-3">Jump back into your active roadmap step.</p>
                                        <div className="flex items-center text-white/90 text-sm font-medium">
                                            Resume <ChevronRight size={16} className="ml-1" />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </PageTransition>
                {path && <AIAssistantWidget context={path} />}
            </motion.main>
        </div>
    )
}
