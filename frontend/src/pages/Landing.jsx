import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Sparkles, Brain, BarChart3, Zap, Target, ArrowRight, Star,
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
        desc: 'Difficulty adjusts in real time based on your performance, so every session stays personalized.',
        color: '#6C63FF',
    },
    {
        icon: BarChart3,
        title: 'Deep Analytics',
        desc: 'Understand your strengths, weaknesses, and progress with clear performance insights.',
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
        desc: 'Follow a learning path that evolves with your progress and goals.',
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
    const { count } = useCountUp(
        isDecimal ? value * 10 : value,
        1800,
        isInView
    )

    return (
        <div ref={ref} className="text-center">
            <div className="text-2xl sm:text-3xl font-heading font-bold text-surface-900 dark:text-white">
                {isDecimal
                    ? (count / 10).toFixed(1)
                    : count.toLocaleString()}
                <span className="text-gradient">{suffix}</span>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-surface-500 dark:text-surface-400">
                {label}
            </p>
        </div>
    )
}

function FloatingShape({ className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 1 }}
            className={`absolute rounded-full blur-3xl ${className}`}
        />
    )
}

export default function Landing() {
    const navigate = useNavigate()
    const [testimonialIndex, setTestimonialIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setTestimonialIndex(
                (i) => (i + 1) % testimonials.length
            )
        }, 5000)

        return () => clearInterval(timer)
    }, [])

    return (
        <PageTransition className="min-h-screen bg-surface-50 dark:bg-surface-950">

            <Navbar />

            {/* HERO */}
            <section className="relative overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-14">

                {/* Subtle background */}
                <FloatingShape
                    className="w-80 h-80 bg-primary/10 -top-32 -left-32"
                    delay={0}
                />

                <FloatingShape
                    className="w-72 h-72 bg-accent/10 top-1/3 -right-24"
                    delay={0.2}
                />

                <FloatingShape
                    className="w-56 h-56 bg-cyan-400/10 bottom-10 left-1/3"
                    delay={0.4}
                />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(108,99,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 dark:bg-primary/15 border border-primary/15 mb-5">
                            <Sparkles
                                size={13}
                                className="text-primary"
                            />

                            <span className="text-xs sm:text-sm font-medium text-primary">
                                AI-Powered Learning
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-[1.08] tracking-tight mb-5">
                            <span className="text-surface-900 dark:text-white">
                                Learn Smarter,
                            </span>

                            <br />

                            <span className="text-gradient">
                                Not Harder
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base md:text-lg text-surface-500 dark:text-surface-400 max-w-xl mx-auto mb-7 leading-relaxed">
                            AdaptIQ creates personalized learning experiences
                            that adapt to your skill level and help you master
                            any subject faster.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

                            <Button
                                size="lg"
                                onClick={() => navigate('/signup')}
                                className="min-w-[190px]"
                            >
                                Start Learning Free
                                <ArrowRight size={17} />
                            </Button>

                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate('/login')}
                                className="min-w-[120px]"
                            >
                                Sign In
                            </Button>

                        </div>
                    </motion.div>

                    {/* PRODUCT PREVIEW */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.25,
                        }}
                        className="mt-10 sm:mt-12 relative"
                    >

                        <div className="relative mx-auto max-w-4xl">

                            {/* Soft shadow */}
                            <div className="absolute inset-8 bg-primary/10 blur-3xl rounded-full" />

                            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-surface-200 dark:border-white/[0.08] bg-white dark:bg-surface-800 shadow-xl">

                                {/* Browser header */}
                                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-100 dark:border-white/[0.06]">

                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                                    </div>

                                    <div className="flex-1 mx-4">
                                        <div className="h-5 rounded-md bg-surface-100 dark:bg-white/[0.05] max-w-xs mx-auto" />
                                    </div>

                                </div>

                                {/* Dashboard */}
                                <div className="p-3 sm:p-5 bg-surface-50 dark:bg-surface-900">

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">

                                        {[72, 58, 45].map((val, i) => (
                                            <div
                                                key={i}
                                                className="rounded-lg sm:rounded-xl p-3 sm:p-4 bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/[0.06]"
                                            >

                                                <div className="h-2 w-10 rounded bg-surface-200 dark:bg-white/[0.07] mb-3" />

                                                <div className="h-1.5 rounded-full bg-surface-100 dark:bg-white/[0.05] overflow-hidden">

                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${val}%`,
                                                        }}
                                                        transition={{
                                                            delay: 0.8 + i * 0.15,
                                                            duration: 0.8,
                                                        }}
                                                        className="h-full rounded-full"
                                                        style={{
                                                            background:
                                                                [
                                                                    '#6C63FF',
                                                                    '#22C55E',
                                                                    '#F59E0B',
                                                                ][i],
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        ))}

                                    </div>

                                    {/* Chart */}
                                    <div className="mt-3 h-28 sm:h-36 rounded-lg sm:rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-white/[0.06] flex items-end p-3 sm:p-4 gap-1.5 sm:gap-2">

                                        {[40, 65, 35, 80, 55, 90, 70].map(
                                            (height, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{
                                                        height: `${height}%`,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            1.2 +
                                                            i * 0.08,
                                                        duration: 0.5,
                                                    }}
                                                    className="flex-1 rounded-t-sm sm:rounded-t-md bg-gradient-to-t from-primary/50 to-primary"
                                                />
                                            )
                                        )}

                                    </div>

                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* STATS */}
            <section className="py-9 sm:py-11 px-4 sm:px-6 border-y border-surface-200/70 dark:border-white/[0.05] bg-white/40 dark:bg-white/[0.01]">

                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-7 gap-x-5">

                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                            }}
                            transition={{
                                delay: i * 0.08,
                            }}
                        >
                            <StatCounter {...stat} />
                        </motion.div>
                    ))}

                </div>
            </section>

            {/* FEATURES */}
            <section className="py-16 sm:py-20 px-4 sm:px-6">

                <div className="max-w-6xl mx-auto">

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                        className="text-center mb-9 sm:mb-11"
                    >

                        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2.5">
                            Why AdaptIQ
                        </p>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-3">
                            Everything You Need to{' '}
                            <span className="text-gradient">
                                Excel
                            </span>
                        </h2>

                        <p className="text-sm sm:text-base text-surface-500 dark:text-surface-400 max-w-lg mx-auto">
                            Powerful tools designed to make your learning
                            journey more focused and effective.
                        </p>

                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                }}
                                transition={{
                                    delay: i * 0.08,
                                }}
                            >

                                <Card className="h-full group transition-all duration-300 hover:-translate-y-1">

                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                                        style={{
                                            background: `${feature.color}12`,
                                        }}
                                    >
                                        <feature.icon
                                            size={21}
                                            style={{
                                                color: feature.color,
                                            }}
                                        />
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

            {/* TESTIMONIALS */}
            <section className="py-16 sm:py-20 px-4 sm:px-6">

                <div className="max-w-3xl mx-auto text-center">

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                    >

                        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2.5">
                            Student Stories
                        </p>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-surface-900 dark:text-white mb-8">
                            Loved by{' '}
                            <span className="text-gradient">
                                Students
                            </span>
                        </h2>

                    </motion.div>

                    <motion.div
                        key={testimonialIndex}
                        initial={{
                            opacity: 0,
                            x: 25,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.35,
                        }}
                    >

                        <Card
                            glass
                            className="py-8 sm:py-9 px-5 sm:px-8"
                        >

                            <div className="flex justify-center gap-1 mb-5">

                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={17}
                                        className="text-amber-400 fill-amber-400"
                                    />
                                ))}

                            </div>

                            <p className="text-base sm:text-lg text-surface-700 dark:text-surface-300 leading-relaxed mb-6 italic">
                                &ldquo;
                                {testimonials[testimonialIndex].text}
                                &rdquo;
                            </p>

                            <div className="flex items-center justify-center gap-3">

                                <div className="w-10 h-10 rounded-full bg-hero-gradient flex items-center justify-center text-white text-sm font-bold">
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

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-5">

                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() =>
                                    setTestimonialIndex(i)
                                }
                                aria-label={`Show testimonial ${i + 1}`}
                                className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                                    i === testimonialIndex
                                        ? 'bg-primary w-6'
                                        : 'bg-surface-300 dark:bg-surface-600 w-1.5 hover:bg-primary/50'
                                }`}
                            />
                        ))}

                    </div>

                </div>
            </section>

            {/* CTA */}
            <section className="py-10 sm:py-14 px-4 sm:px-6">

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                    }}
                    className="max-w-4xl mx-auto"
                >

                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-8 sm:p-10 md:p-12 text-center shadow-lg">

                        <div className="absolute inset-0 bg-hero-gradient opacity-90" />

                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

                        <div className="relative z-10">

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                                Ready to Transform Your Learning?
                            </h2>

                            <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto mb-7">
                                Join thousands of students already learning
                                smarter with AI.
                            </p>

                            <Button
                                variant="ghost"
                                size="lg"
                                className="!bg-white !text-surface-900 hover:!bg-white/90"
                                onClick={() => navigate('/signup')}
                            >
                                Get Started Free
                                <ArrowRight size={17} />
                            </Button>

                        </div>

                    </div>

                </motion.div>

            </section>

            {/* FOOTER */}
            <footer className="py-8 px-4 sm:px-6 border-t border-surface-200 dark:border-white/[0.06]">

                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

                    <div className="flex items-center gap-2">

                        <div className="w-7 h-7 rounded-lg bg-hero-gradient flex items-center justify-center">
                            <Sparkles
                                size={13}
                                className="text-white"
                            />
                        </div>

                        <span className="font-heading font-bold text-surface-900 dark:text-white">
                            AdaptIQ
                        </span>

                    </div>

                    <p className="text-xs sm:text-sm text-surface-400">
                        &copy; {new Date().getFullYear()} AdaptIQ. All rights reserved.
                    </p>

                </div>

            </footer>

        </PageTransition>
    )
}