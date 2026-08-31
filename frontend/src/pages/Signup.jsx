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
    const { user, signUp } = useAuth()
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
