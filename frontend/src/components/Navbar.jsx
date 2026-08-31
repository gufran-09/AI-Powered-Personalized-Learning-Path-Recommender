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
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="
                fixed top-3 left-3 right-3
                sm:top-4 sm:left-5 sm:right-5
                z-40
                rounded-xl
                bg-white/90 dark:bg-surface-900/90
                backdrop-blur-xl
                border border-surface-200/80 dark:border-white/[0.07]
                shadow-md dark:shadow-none
            "
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-5 py-2 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2.5 group"
                    aria-label="AdaptIQ home"
                >
                    <div
                        className="
                            w-8 h-8
                            rounded-lg
                            bg-hero-gradient
                            flex items-center justify-center
                            transition-transform duration-200
                            group-hover:scale-105
                        "
                    >
                        <Sparkles size={15} className="text-white" />
                    </div>

                    <span className="font-heading font-bold text-base sm:text-lg text-surface-900 dark:text-white">
                        AdaptIQ
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">

                    <ThemeToggle />

                    {user ? (
                        <Button
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => navigate('/signup')}
                                className="hidden xs:inline-flex sm:inline-flex"
                            >
                                Get Started
                            </Button>
                        </>
                    )}

                </div>
            </div>
        </motion.nav>
    )
}