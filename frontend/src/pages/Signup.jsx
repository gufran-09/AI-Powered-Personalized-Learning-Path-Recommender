import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Input from '../components/Input'
import Button from '../components/Button'
import PageTransition from '../components/PageTransition'
import ThemeToggle from '../components/ThemeToggle'

export default function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const { user, signUp, signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    const validate = () => {
        const e = {}
        if (!name.trim()) e.name = 'Name is required'
        if (!email) e.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email'
        if (!password) e.password = 'Password is required'
        else if (password.length < 6) e.password = 'Min 6 characters'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const data = await signUp(email, password, { full_name: name.trim() })
            if (data?.session) {
                toast.success('Account created! Welcome to AdaptIQ.')
            } else {
                toast.success('Account created! Please check your email to verify your account.')
                navigate('/login')
            }
        } catch (err) {
            toast.error(err.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        try {
            await signInWithGoogle()
        } catch (err) {
            toast.error('Google sign-in failed')
        }
    }

    return (
        <PageTransition className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-cyan-500 opacity-90" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center px-12"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                        <Sparkles size={28} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">
                        Start Your Journey
                    </h2>
                    <p className="text-white/70 max-w-sm mx-auto">
                        Create your account and unlock personalized AI-powered learning experiences.
                    </p>
                </motion.div>
            </div>

            {/* Right Panel */}
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
                        Create Account
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline cursor-pointer font-medium">
                            Sign in
                        </Link>
                    </p>

                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
              bg-white dark:bg-white/[0.04] border border-surface-200 dark:border-white/[0.08]
              text-surface-700 dark:text-surface-300 font-medium text-sm
              hover:bg-surface-50 dark:hover:bg-white/[0.06]
              transition-colors duration-200 cursor-pointer mb-6"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-surface-200 dark:bg-white/[0.06]" />
                        <span className="text-xs text-surface-400 uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-surface-200 dark:bg-white/[0.06]" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="name"
                            label="Full Name"
                            icon={User}
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={errors.name}
                        />
                        <Input
                            id="email"
                            label="Email"
                            type="email"
                            icon={Mail}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            icon={Lock}
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                        />
                        <Button type="submit" className="w-full" loading={loading}>
                            Create Account
                        </Button>
                    </form>

                    <p className="mt-6 text-xs text-center text-surface-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </PageTransition>
    )
}
