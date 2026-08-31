import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle,
    X,
    Send,
    Bot,
    Loader2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AIAssistantWidget({ context }) {
    const { user } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                'Hi! I am your AI Learning Assistant. Ask me anything about your learning path!',
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
            setTimeout(() => inputRef.current?.focus(), 150)
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()

        if (!input.trim() || isLoading) return

        const userMessage = input.trim()

        setInput('')

        setMessages((prev) => [
            ...prev,
            {
                role: 'user',
                content: userMessage,
            },
        ])

        setIsLoading(true)

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/chat`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        message: userMessage,
                        context,
                    }),
                }
            )

            if (res.ok) {
                const data = await res.json()

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: data.reply,
                    },
                ])
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content:
                            'Oops! Something went wrong. Please try again.',
                    },
                ])
            }
        } catch (err) {
            console.error(err)

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        'Oops! Something went wrong. Please try again.',
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating Assistant Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        aria-label="Open AI Assistant"
                        className="
                            fixed bottom-6 right-6
                            z-40
                            w-14 h-14
                            rounded-2xl
                            flex items-center justify-center
                            cursor-pointer
                            bg-hero-gradient
                            text-white
                            shadow-xl shadow-primary/25
                            hover:shadow-2xl hover:shadow-primary/30
                            transition-shadow duration-300
                        "
                    >
                        <MessageCircle size={23} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 24,
                            scale: 0.96,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 28,
                        }}
                        className="
                            fixed
                            bottom-5 right-5
                            sm:bottom-6 sm:right-6
                            z-50
                            w-[calc(100vw-2rem)]
                            sm:w-[400px]
                            h-[560px]
                            max-h-[calc(100vh-2rem)]
                            flex flex-col
                            overflow-hidden
                            rounded-3xl
                            bg-white dark:bg-surface-900
                            border border-surface-200 dark:border-white/[0.08]
                            shadow-2xl shadow-surface-950/20
                        "
                    >
                        {/* Header */}
                        <div className="
                            relative
                            flex items-center justify-between
                            px-5 py-4
                            bg-hero-gradient
                            text-white
                        ">
                            <div className="flex items-center gap-3">
                                <div className="
                                    w-9 h-9
                                    rounded-xl
                                    flex items-center justify-center
                                    bg-white/15
                                    border border-white/20
                                ">
                                    <Bot size={19} />
                                </div>

                                <div>
                                    <h3 className="
                                        font-heading
                                        font-semibold
                                        text-sm
                                    ">
                                        AI Learning Assistant
                                    </h3>

                                    <div className="
                                        flex items-center gap-1.5
                                        mt-0.5
                                        text-[11px]
                                        text-white/70
                                    ">
                                        <span className="
                                            w-1.5 h-1.5
                                            rounded-full
                                            bg-emerald-300
                                        " />
                                        Ready to help
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close AI Assistant"
                                className="
                                    w-8 h-8
                                    flex items-center justify-center
                                    rounded-xl
                                    cursor-pointer
                                    text-white/80
                                    hover:text-white
                                    hover:bg-white/10
                                    transition-colors duration-200
                                "
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="
                            flex-1
                            overflow-y-auto
                            px-4 py-5
                            space-y-4
                            bg-surface-50 dark:bg-surface-950
                        ">
                            {messages.map((msg, idx) => {
                                const isUser = msg.role === 'user'

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                        }}
                                        className={`
                                            flex gap-2.5
                                            ${
                                                isUser
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }
                                        `}
                                    >
                                        {!isUser && (
                                            <div className="
                                                flex-shrink-0
                                                w-8 h-8
                                                mt-0.5
                                                rounded-xl
                                                flex items-center justify-center
                                                bg-primary/10
                                                dark:bg-primary/15
                                                text-primary
                                            ">
                                                <Bot size={16} />
                                            </div>
                                        )}

                                        <div
                                            className={`
                                                max-w-[78%]
                                                px-4 py-2.5
                                                text-sm
                                                leading-relaxed
                                                rounded-2xl
                                                ${
                                                    isUser
                                                        ? `
                                                            bg-primary
                                                            text-white
                                                            rounded-br-md
                                                            shadow-sm
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
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                )
                            })}

                            {/* Loading */}
                            {isLoading && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: 8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="flex gap-2.5 justify-start"
                                >
                                    <div className="
                                        flex-shrink-0
                                        w-8 h-8
                                        rounded-xl
                                        flex items-center justify-center
                                        bg-primary/10
                                        dark:bg-primary/15
                                        text-primary
                                    ">
                                        <Bot size={16} />
                                    </div>

                                    <div className="
                                        px-4 py-3
                                        rounded-2xl
                                        rounded-bl-md
                                        bg-white
                                        dark:bg-surface-800
                                        border
                                        border-surface-200
                                        dark:border-white/[0.06]
                                        shadow-sm
                                    ">
                                        <div className="flex items-center gap-1.5">
                                            <span className="
                                                w-1.5 h-1.5
                                                rounded-full
                                                bg-surface-400
                                                animate-pulse
                                            " />
                                            <span className="
                                                w-1.5 h-1.5
                                                rounded-full
                                                bg-surface-400
                                                animate-pulse
                                            " />
                                            <span className="
                                                w-1.5 h-1.5
                                                rounded-full
                                                bg-surface-400
                                                animate-pulse
                                            " />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSend}
                            className="
                                p-3
                                bg-white dark:bg-surface-900
                                border-t
                                border-surface-200
                                dark:border-white/[0.06]
                            "
                        >
                            <div className="
                                flex items-center gap-2
                                p-1.5
                                rounded-2xl
                                bg-surface-100
                                dark:bg-white/[0.05]
                                border
                                border-surface-200
                                dark:border-white/[0.06]
                                focus-within:border-primary/40
                                focus-within:ring-2
                                focus-within:ring-primary/10
                                transition-all duration-200
                            ">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ask about your learning..."
                                    value={input}
                                    onChange={(e) =>
                                        setInput(e.target.value)
                                    }
                                    disabled={isLoading}
                                    className="
                                        flex-1
                                        min-w-0
                                        px-3
                                        py-2
                                        bg-transparent
                                        text-sm
                                        text-surface-900
                                        dark:text-white
                                        placeholder-surface-400
                                        dark:placeholder-surface-500
                                        outline-none
                                    "
                                />

                                <motion.button
                                    type="submit"
                                    whileHover={{
                                        scale:
                                            input.trim() && !isLoading
                                                ? 1.05
                                                : 1,
                                    }}
                                    whileTap={{
                                        scale:
                                            input.trim() && !isLoading
                                                ? 0.95
                                                : 1,
                                    }}
                                    disabled={
                                        !input.trim() || isLoading
                                    }
                                    aria-label="Send message"
                                    className="
                                        flex-shrink-0
                                        w-9 h-9
                                        rounded-xl
                                        flex items-center justify-center
                                        bg-primary
                                        text-white
                                        cursor-pointer
                                        shadow-sm
                                        shadow-primary/20
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        transition-all duration-200
                                    "
                                >
                                    {isLoading ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                </motion.button>
                            </div>

                            <p className="
                                mt-2
                                text-center
                                text-[10px]
                                text-surface-400
                            ">
                                AI responses may not always be accurate.
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}