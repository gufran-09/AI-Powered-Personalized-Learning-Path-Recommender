import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('adaptiq-theme')
            if (stored) return stored === 'dark'
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return true
    })

    useEffect(() => {
        const root = document.documentElement
        if (isDark) {
            root.classList.add('dark')
            document.body.style.backgroundColor = '#020617'
            document.body.style.color = '#F8FAFC'
        } else {
            root.classList.remove('dark')
            document.body.style.backgroundColor = '#F8FAFC'
            document.body.style.color = '#0F172A'
        }
        localStorage.setItem('adaptiq-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
