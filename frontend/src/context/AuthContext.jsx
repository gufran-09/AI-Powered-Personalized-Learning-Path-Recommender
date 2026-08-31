import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../lib/api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const handleUserSession = async (sessionUser, token) => {
        try {
            const profileRes = await fetchProfile(token);
            setUser({
                ...sessionUser,
                userId: sessionUser.id,
                sessionToken: token,
                fullName: profileRes?.profile?.full_name || sessionUser.user_metadata?.full_name || 'Learner',
                profile: profileRes?.profile || null,
                role: profileRes?.profile?.role || 'user'
            })
        } catch (err) {
            console.error("Profile fetch failed", err);
            setUser({
                ...sessionUser,
                userId: sessionUser.id,
                sessionToken: token,
                fullName: sessionUser.user_metadata?.full_name || 'Learner',
                role: 'user' // Default safe fallback
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    await handleUserSession(session.user, session.access_token)
                } else {
                    setUser(null)
                    setLoading(false)
                }
            } catch (err) {
                setUser(null)
                setLoading(false)
            }
        }

        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // We'll handle navigation in the component or App.jsx if needed, 
                // but Supabase usually handles the initial redirect to the site.
            }
            if (session?.user) {
                await handleUserSession(session.user, session.access_token)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, metadata = {}) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        })
        if (error) throw error
        return data
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Properly set user with sessionToken before returning,
        // so Dashboard's effect can fetch data immediately on mount
        await handleUserSession(data.user, data.session.access_token)
        return data
    }

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
    }

    const updatePassword = async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
    }

    const value = { user, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
