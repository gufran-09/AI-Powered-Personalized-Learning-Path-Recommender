import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle,
    X,
    Send,
    Bot,
    Loader2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function AIAssistantChat() {
    const { user } = useAuth()
    const { error: showError } = useToast()

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content:
                'Hi! I am your AI Learning Assistant. Ask me anything about your learning path!',
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!user) return null

    const handleSend = async (e) => {
        e.preventDefault()

        const message = input.trim()

        if (!message || isLoading) return

        setMessages((prev) => [
            ...prev,
            {
                role: 'user',
                content: message,
            },
        ])

        setInput('')
        setIsLoading(true)

        try {
            const backendUrl =
                import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

            const response = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    message,
                    context: {
                        currentRoute: window.location.pathname,
                    },
                }),
            })

            if (!response.ok) {
                throw new Error(`Chat request failed: ${response.status}`)
            }

            const data = await response.json()

            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content:
                        data.reply ||
                        'I could not generate a response right now.',
                },
            ])
        } catch (err) {
            console.error('AI Assistant error:', err)

            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content:
                        'Sorry, I could not connect to the AI assistant. Please try again.',
                },
            ])

            showError('Failed to get a response from AI.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating AI button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setIsOpen(true)}
                        aria-label="Open AI Assistant"
                        className="
                            fixed bottom-6 right-6 z-50
                            w-14 h-14
                            rounded-full
                            bg-primary
                            text-white
                            flex items-center justify-center
                            shadow-lg shadow-primary/30
                            hover:shadow-xl hover:shadow-primary/40
                            transition-shadow duration-200
                        "
                    >
                        <MessageCircle size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 30,
                            scale: 0.95,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 30,
                            scale: 0.95,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="
                            fixed bottom-6 right-6 z-50
                            w-[calc(100vw-2rem)]
                            sm:w-[400px]
                            h-[520px]
                            max-h-[80vh]
                            flex flex-col
                            overflow-hidden
                            rounded-2xl
                            bg-white dark:bg-surface-900
                            border border-surface-200 dark:border-white/[0.08]
                            shadow-2xl
                        "
                    >
                        {/* Header */}
                        <div
                            className="
                                flex items-center justify-between
                                px-4 py-3.5
                                bg-primary
                                text-white
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        w-9 h-9
                                        rounded-xl
                                        bg-white/15
                                        flex items-center justify-center
                                    "
                                >
                                    <Bot size={19} />
                                </div>

                                <div>
                                    <h3 className="font-heading font-semibold text-sm">
                                        AI Learning Assistant
                                    </h3>

                                    <p className="text-xs text-white/70">
                                        Your personal study helper
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close AI Assistant"
                                className="
                                    p-2
                                    rounded-lg
                                    text-white/80
                                    hover:text-white
                                    hover:bg-white/10
                                    transition-colors
                                    cursor-pointer
                                "
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            className="
                                flex-1
                                overflow-y-auto
                                p-4
                                space-y-4
                                bg-surface-50
                                dark:bg-surface-950
                            "
                        >
                            {messages.map((message, index) => {
                                const isUser = message.role === 'user'

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-end gap-2.5 ${
                                            isUser
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        {!isUser && (
                                            <div
                                                className="
                                                    w-8 h-8
                                                    shrink-0
                                                    rounded-full
                                                    bg-primary/10
                                                    dark:bg-primary/20
                                                    text-primary
                                                    flex items-center justify-center
                                                "
                                            >
                                                <Bot size={16} />
                                            </div>
                                        )}

                                        <div
                                            className={`
                                                max-w-[78%]
                                                px-4 py-2.5
                                                rounded-2xl
                                                text-sm
                                                leading-relaxed
                                                ${
                                                    isUser
                                                        ? `
                                                            bg-primary
                                                            text-white
                                                            rounded-br-md
                                                        `
                                                        : `
                                                            bg-white
                                                            dark:bg-surface-800
                                                            text-surface-700
                                                            dark:text-surface-200
                                                            border
                                                            border-surface-200
                                                            dark:border-white/[0.06]
                                                            rounded-bl-md
                                                            shadow-sm
                                                        `
                                                }
                                            `}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex items-end gap-2.5">
                                    <div
                                        className="
                                            w-8 h-8
                                            shrink-0
                                            rounded-full
                                            bg-primary/10
                                            dark:bg-primary/20
                                            text-primary
                                            flex items-center justify-center
                                        "
                                    >
                                        <Bot size={16} />
                                    </div>

                                    <div
                                        className="
                                            px-4 py-3
                                            rounded-2xl
                                            rounded-bl-md
                                            bg-white
                                            dark:bg-surface-800
                                            border
                                            border-surface-200
                                            dark:border-white/[0.06]
                                            shadow-sm
                                        "
                                    >
                                        <Loader2
                                            size={17}
                                            className="animate-spin text-primary"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSend}
                            className="
                                flex items-center gap-2
                                p-3
                                bg-white
                                dark:bg-surface-900
                                border-t
                                border-surface-200
                                dark:border-white/[0.06]
                            "
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your learning..."
                                disabled={isLoading}
                                className="
                                    flex-1
                                    min-w-0
                                    px-4 py-2.5
                                    rounded-xl
                                    bg-surface-100
                                    dark:bg-white/[0.05]
                                    border
                                    border-surface-200
                                    dark:border-white/[0.08]
                                    text-sm
                                    text-surface-900
                                    dark:text-white
                                    placeholder-surface-400
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-primary/30
                                    focus:border-primary
                                    transition-all
                                    disabled:opacity-50
                                "
                            />

                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                aria-label="Send message"
                                className="
                                    w-10 h-10
                                    shrink-0
                                    rounded-xl
                                    bg-primary
                                    text-white
                                    flex items-center justify-center
                                    hover:bg-primary-500
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                    transition-all
                                    cursor-pointer
                                "
                            >
                                {isLoading ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Send size={17} />
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}