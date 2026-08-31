import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Input from '../components/Input'
import Button from '../components/Button'
import PageTransition from '../components/PageTransition'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const { user, signIn } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    const validate = () => {
        const e = {}
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
            await signIn(email, password)
            toast.success('Welcome back!')
            // Redirect happens automatically via useEffect when user state updates
        } catch (err) {
            toast.error(err.message || 'Failed to sign in')
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
                        <Sparkles size={28} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-4">
                        Welcome Back
                    </h2>
                    <p className="text-white/70 max-w-sm mx-auto">
                        Continue your personalized learning journey with AI-powered adaptive quizzes.
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
                        Sign In
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mb-8">
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline cursor-pointer font-medium">
                            Sign up
                        </Link>
                    </p>



                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                        />
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full" loading={loading}>
                            Sign In
                        </Button>
                    </form>
                </div>
            </div>
        </PageTransition>
    )
}
