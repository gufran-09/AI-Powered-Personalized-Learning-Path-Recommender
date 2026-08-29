import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import Button from './Button'

export default function Navbar() {
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-4 left-4 right-4 z-40 rounded-2xl
        bg-white/80 dark:bg-surface-900/80
        backdrop-blur-xl
        border border-surface-200 dark:border-white/[0.06]
        shadow-lg dark:shadow-none"
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center group-hover:shadow-glow transition-shadow duration-300">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="font-heading font-bold text-lg text-surface-900 dark:text-white">
                        AdaptIQ
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {user ? (
                        <Button size="sm" onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                                Sign In
                            </Button>
                            <Button size="sm" onClick={() => navigate('/signup')}>
                                Get Started
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}
