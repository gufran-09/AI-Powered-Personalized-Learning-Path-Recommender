import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Sparkles, Brain, BarChart3, Zap, Target, TrendingUp,
    ArrowRight, Star, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import Card from '../components/Card'
import PageTransition from '../components/PageTransition'
import { useCountUp, useInView } from '../hooks'
import { testimonials } from '../data'

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Adaptation',
        desc: 'Our algorithm adjusts difficulty in real-time based on your performance patterns.',
        color: '#6C63FF',
    },
    {
        icon: BarChart3,
        title: 'Deep Analytics',
        desc: 'Comprehensive performance insights with topic-level breakdown and trend analysis.',
        color: '#22C55E',
    },
    {
        icon: Zap,
        title: 'Instant Feedback',
        desc: 'Get immediate explanations and recommendations after every answer.',
        color: '#F59E0B',
    },
    {
        icon: Target,
        title: 'Smart Goals',
        desc: 'Personalized learning paths that evolve with your progress and goals.',
        color: '#06B6D4',
    },
]

const stats = [
    { value: 50000, suffix: '+', label: 'Active Learners' },
    { value: 2, suffix: 'M+', label: 'Questions Answered' },
    { value: 95, suffix: '%', label: 'Improvement Rate' },
    { value: 4.9, suffix: '', label: 'Average Rating', isDecimal: true },
]

function StatCounter({ value, suffix, label, isDecimal }) {
    const { ref, isInView } = useInView()
    const { count } = useCountUp(isDecimal ? value * 10 : value, 2000, isInView)

    return (
        <div ref={ref} className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white">
                {isDecimal ? (count / 10).toFixed(1) : count.toLocaleString()}
                <span className="text-gradient">{suffix}</span>
            </div>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{label}</p>
        </div>
    )
}

function FloatingShape({ className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.8 }}
            className={`absolute rounded-full blur-3xl opacity-20 dark:opacity-10 ${className}`}
        />
    )
}

export default function Landing() {
    const navigate = useNavigate()
    const [testimonialIndex, setTestimonialIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setTestimonialIndex((i) => (i + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <PageTransition className="min-h-screen bg-surface-50 dark:bg-surface-950">
            <Navbar />

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Floating Shapes */}
                <FloatingShape className="w-96 h-96 bg-primary -top-20 -left-20 animate-float" delay={0} />
                <FloatingShape className="w-80 h-80 bg-accent top-1/3 -right-10 animate-float-delayed" delay={0.3} />
                <FloatingShape className="w-64 h-64 bg-cyan-400 bottom-20 left-1/4 animate-float-slow" delay={0.6} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(108,99,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(108,99,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.05)_1px,transparent_1px)]" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-8">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold leading-tight mb-6">
                            <span className="text-surface-900 dark:text-white">Learn Smarter,</span>
                            <br />
                            <span className="text-gradient">Not Harder</span>
                        </h1>

                        <p className="text-lg md:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
                            AdaptIQ uses artificial intelligence to create personalized quizzes that
                            adapt to your skill level, helping you master any subject faster.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" onClick={() => navigate('/signup')}>
                                Start Learning Free
                                <ArrowRight size={18} />
                            </Button>
                            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                                Sign In
                            </Button>
                        </div>
                    </motion.div>

                    {/* Hero Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mt-16 relative"
                    >
                        <div className="relative mx-auto max-w-3xl rounded-2xl overflow-hidden border border-surface-200 dark:border-white/[0.06] shadow-2xl">
                            <div className="bg-white dark:bg-surface-800 p-1">
                                {/* Mock browser chrome */}
                                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-100 dark:border-white/[0.04]">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="h-6 rounded-lg bg-surface-100 dark:bg-white/[0.04] max-w-xs mx-auto" />
                                    </div>
                                </div>
                                {/* Mock dashboard preview */}
                                <div className="p-6 bg-surface-50 dark:bg-surface-900 space-y-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[72, 58, 45].map((val, i) => (
                                            <div key={i} className="rounded-xl p-4 bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/[0.06]">
                                                <div className="h-2 w-12 rounded bg-surface-200 dark:bg-white/[0.06] mb-3" />
                                                <div className="relative h-1.5 rounded-full bg-surface-100 dark:bg-white/[0.04]">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${val}%` }}
                                                        transition={{ delay: 1 + i * 0.2, duration: 1 }}
                                                        className="absolute h-full rounded-full"
                                                        style={{ background: ['#6C63FF', '#22C55E', '#F59E0B'][i] }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-32 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/[0.06] flex items-end p-4 gap-2">
                                        {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: 1.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                                                className="flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Glow behind */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-accent/20 to-cyan-400/20 blur-3xl scale-110 opacity-50" />
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <StatCounter {...s} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-4">
                            Everything You Need to <span className="text-gradient">Excel</span>
                        </h2>
                        <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto">
                            Powerful features designed to accelerate your learning journey
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="h-full group">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: `${feature.color}15` }}
                                    >
                                        <feature.icon size={22} style={{ color: feature.color }} />
                                    </div>
                                    <h3 className="font-heading font-semibold text-surface-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-12">
                            Loved by <span className="text-gradient">Students</span>
                        </h2>
                    </motion.div>

                    <div className="relative">
                        <motion.div
                            key={testimonialIndex}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card glass className="py-10 px-8">
                                <div className="flex justify-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-lg text-surface-700 dark:text-surface-300 leading-relaxed mb-6 italic font-body">
                                    &ldquo;{testimonials[testimonialIndex].text}&rdquo;
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-hero-gradient flex items-center justify-center text-white font-heading text-sm font-bold">
                                        {testimonials[testimonialIndex].avatar}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-surface-900 dark:text-white text-sm">
                                            {testimonials[testimonialIndex].name}
                                        </p>
                                        <p className="text-xs text-surface-500 dark:text-surface-400">
                                            {testimonials[testimonialIndex].role}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Nav dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTestimonialIndex(i)}
                                    className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${i === testimonialIndex
                                            ? 'bg-primary w-6'
                                            : 'bg-surface-300 dark:bg-surface-600 hover:bg-primary/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="relative rounded-3xl overflow-hidden p-12 md:p-16">
                        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                                Ready to Transform Your Learning?
                            </h2>
                            <p className="text-white/80 max-w-lg mx-auto mb-8">
                                Join thousands of students who are already learning smarter with AI.
                            </p>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="!bg-white !text-surface-900 hover:!bg-white/90"
                                onClick={() => navigate('/signup')}
                            >
                                Get Started Free
                                <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-surface-200 dark:border-white/[0.06]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-hero-gradient flex items-center justify-center">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="font-heading font-bold text-surface-900 dark:text-white">AdaptIQ</span>
                    </div>
                    <p className="text-sm text-surface-400">
                        &copy; {new Date().getFullYear()} AdaptIQ. All rights reserved.
                    </p>
                </div>
            </footer>
        </PageTransition>
    )
}
