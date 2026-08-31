import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Input from '../components/Input'
import Button from '../components/Button'
import PageTransition from '../components/PageTransition'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const { resetPassword } = useAuth()
    const toast = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            toast.error('Please enter your email')
            return
        }

        if (cooldown > 0) {
            toast.error(`Please wait ${cooldown} seconds before trying again`)
            return
        }

        setLoading(true)
        try {
            await resetPassword(email)
            setSubmitted(true)
            toast.success('Reset link sent to your email!')
        } catch (err) {
            const message = err.message || ''
            if (message.toLowerCase().includes('rate limit')) {
                setCooldown(60)
                const timer = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
                toast.error('Email rate limit exceeded. Please wait 60 seconds before trying again.')
            } else {
                toast.error(message || 'Failed to send reset link')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageTransition className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient opacity-90" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center px-12"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                        <Mail size={28} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">
                        Secure Recovery
                    </h2>
                    <p className="text-white/70 max-w-sm mx-auto">
                        Don't worry! It happens. Let's get you back into your AdaptIQ account.
                    </p>
                </motion.div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="flex justify-between items-center mb-8">
                        <Link to="/" className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <span className="font-heading font-bold text-lg text-surface-900 dark:text-white">
                                AdaptIQ
                            </span>
                        </Link>
                        <ThemeToggle />
                    </div>

                    <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white mb-2">
                        Forgot Password
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-8">
                        Enter your email address to receive a password reset link.
                    </p>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                id="email"
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Send Reset Link
                            </Button>

                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-primary transition-colors duration-200"
                            >
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center mx-auto">
                                <Mail className="text-success-600 dark:text-success-400" size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                                    Check your email
                                </h3>
                                <p className="text-surface-500 dark:text-surface-400">
                                    We've sent a password reset link to <span className="font-medium text-surface-900 dark:text-white">{email}</span>.
                                </p>
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-600 transition-colors duration-200"
                            >
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
