import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Input from '../components/Input'
import Button from '../components/Button'
import PageTransition from '../components/PageTransition'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { updatePassword } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    useEffect(() => {
        // Check if we have a session (Supabase handles the recovery token redirect)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('Session expired or invalid reset link')
                navigate('/login')
            }
        }
        checkSession()
    }, [navigate, toast])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await updatePassword(password)
            setSuccess(true)
            toast.success('Password updated successfully!')
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            toast.error(err.message || 'Failed to update password')
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
                        <Lock size={28} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">
                        Reset Password
                    </h2>
                    <p className="text-white/70 max-w-sm mx-auto">
                        Almost there! Create a strong new password for your AdaptIQ account.
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
                        Set New Password
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-8">
                        Please enter your new password below.
                    </p>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                id="password"
                                label="New Password"
                                type="password"
                                icon={Lock}
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Input
                                id="confirmPassword"
                                label="Confirm New Password"
                                type="password"
                                icon={Lock}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Button type="submit" className="w-full" loading={loading}>
                                Reset Password
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="text-success-600 dark:text-success-400" size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                                    Password reset complete
                                </h3>
                                <p className="text-surface-500 dark:text-surface-400">
                                    Your password has been updated successfully. Redirecting you to login...
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                Go to Login Now
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
