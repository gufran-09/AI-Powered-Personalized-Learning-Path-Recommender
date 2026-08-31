import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Trophy, Flame, Star, Zap, GraduationCap, Brain,
    ChevronLeft, Lock, Swords, Compass, Crown, CalendarCheck,
    Target, BookOpen, Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Card from '../components/Card'
import PageTransition from '../components/PageTransition'
import ThemeToggle from '../components/ThemeToggle'
import { fetchAchievements } from '../lib/api'

const iconMap = { Trophy, Flame, Star, Zap, GraduationCap, Brain, Swords, Compass, Crown, CalendarCheck, Target, BookOpen }

const categoryColors = {
    milestone: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-500', ring: 'ring-blue-500/30' },
    streak: { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-500', ring: 'ring-orange-500/30' },
    performance: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-500', ring: 'ring-emerald-500/30' },
    mastery: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-500', ring: 'ring-purple-500/30' },
    exploration: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-500', ring: 'ring-cyan-500/30' },
}

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
}

function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Achievements() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [filter, setFilter] = useState('all') // all | unlocked | locked

    useEffect(() => {
        const load = async () => {
            if (!user?.sessionToken) return
            setLoading(true)
            const res = await fetchAchievements(user.sessionToken)
            if (res.success) {
                setData(res.data)
            }
            setLoading(false)
        }
        load()
    }, [user?.sessionToken])

    const achievements = data?.achievements || []
    const summary = data?.summary || { total: 0, unlocked: 0, currentStreak: 0, maxStreak: 0, totalQuizzes: 0, totalAnswers: 0 }

    const filtered = filter === 'all'
        ? achievements
        : filter === 'unlocked'
            ? achievements.filter(a => a.unlocked)
            : achievements.filter(a => !a.unlocked)

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
                className="min-h-screen max-lg:!ml-0"
            >
                <PageTransition>
                    <div className="sticky top-0 z-20 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-white/[0.04]">
                        <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 pl-12 lg:pl-0">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <ChevronLeft size={20} className="text-surface-500" />
                                </button>
                                <h1 className="text-xl font-heading font-bold text-surface-900 dark:text-white">
                                    Achievements
                                </h1>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="px-6 lg:px-8 py-8 max-w-5xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 size={32} className="animate-spin text-primary mb-3" />
                                <p className="text-surface-500 text-sm">Loading achievements...</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Header */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8"
                                >
                                    <Card glass className="text-center py-8">
                                        <div className="w-16 h-16 rounded-2xl bg-hero-gradient flex items-center justify-center mx-auto mb-4">
                                            <Trophy size={28} className="text-white" />
                                        </div>
                                        <h2 className="text-2xl font-heading font-bold text-surface-900 dark:text-white mb-2">
                                            {summary.unlocked} of {summary.total} Unlocked
                                        </h2>
                                        <p className="text-surface-500 dark:text-surface-400 text-sm">
                                            Keep going to unlock all achievements!
                                        </p>
                                        <div className="mt-4 max-w-xs mx-auto">
                                            <div className="h-2.5 bg-surface-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${summary.total > 0 ? (summary.unlocked / summary.total) * 100 : 0}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                                                    className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-cyan-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
                                            <div>
                                                <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.totalQuizzes}</p>
                                                <p className="text-surface-400">Quizzes</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.totalAnswers}</p>
                                                <p className="text-surface-400">Answers</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.currentStreak}</p>
                                                <p className="text-surface-400">Day Streak</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-surface-900 dark:text-white">{summary.maxStreak}</p>
                                                <p className="text-surface-400">Best Streak</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2 mb-6">
                                    {[
                                        { key: 'all', label: `All (${achievements.length})` },
                                        { key: 'unlocked', label: `Unlocked (${summary.unlocked})` },
                                        { key: 'locked', label: `Locked (${summary.total - summary.unlocked})` },
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setFilter(tab.key)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${filter === tab.key
                                                ? 'bg-primary text-white'
                                                : 'bg-surface-100 dark:bg-white/[0.04] text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-white/[0.08]'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Badges Grid */}
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    {filtered.map((achievement) => {
                                        const Icon = iconMap[achievement.icon] || Trophy
                                        const catStyle = categoryColors[achievement.category] || categoryColors.milestone
                                        const progressPct = achievement.target > 0
                                            ? Math.round((achievement.progress / achievement.target) * 100)
                                            : 0

                                        return (
                                            <motion.div key={achievement.id} variants={item}>
                                                <Card
                                                    className={`relative text-center py-6 ${!achievement.unlocked ? 'opacity-70' : ''}`}
                                                >
                                                    {!achievement.unlocked && (
                                                        <div className="absolute top-3 right-3">
                                                            <Lock size={14} className="text-surface-400" />
                                                        </div>
                                                    )}

                                                    {/* Category badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
                                                            {achievement.category}
                                                        </span>
                                                    </div>

                                                    <div
                                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 mt-2 ${achievement.unlocked
                                                            ? catStyle.bg
                                                            : 'bg-surface-100 dark:bg-white/[0.04]'
                                                            }`}
                                                    >
                                                        <Icon
                                                            size={24}
                                                            className={
                                                                achievement.unlocked
                                                                    ? catStyle.text
                                                                    : 'text-surface-400'
                                                            }
                                                        />
                                                    </div>

                                                    <h4 className="font-heading font-semibold text-surface-900 dark:text-white mb-1">
                                                        {achievement.name}
                                                    </h4>
                                                    <p className="text-xs text-surface-400 mb-3">{achievement.desc}</p>

                                                    {/* Progress bar */}
                                                    <div className="mx-6 mb-2">
                                                        <div className="h-1.5 bg-surface-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progressPct}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                                                                className={`h-full rounded-full ${achievement.unlocked
                                                                    ? 'bg-gradient-to-r from-primary to-accent'
                                                                    : 'bg-surface-300 dark:bg-surface-600'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-surface-400 mt-1">
                                                            {achievement.progress} / {achievement.target}
                                                        </p>
                                                    </div>

                                                    {achievement.unlocked ? (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.5, type: 'spring' }}
                                                            className="inline-flex flex-col items-center gap-0.5"
                                                        >
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                                                                <Star size={12} className="fill-accent" />
                                                                Unlocked
                                                            </span>
                                                            {achievement.unlockedAt && (
                                                                <span className="text-[10px] text-surface-400">
                                                                    {formatDate(achievement.unlockedAt)}
                                                                </span>
                                                            )}
                                                        </motion.div>
                                                    ) : (
                                                        <span className="text-[10px] text-surface-400">
                                                            {progressPct}% complete
                                                        </span>
                                                    )}
                                                </Card>
                                            </motion.div>
                                        )
                                    })}
                                </motion.div>

                                {filtered.length === 0 && (
                                    <div className="text-center py-12 text-surface-500">
                                        <p>No achievements in this category yet.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </PageTransition>
            </motion.main>
        </div>
    )
}
