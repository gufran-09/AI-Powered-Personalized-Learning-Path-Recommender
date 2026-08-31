import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { useToast } from '../components/Toast'
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'

export default function Onboarding() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { addToast } = useToast()
    
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "Hi there! I'm your AI Learning Assistant. To build your personalized roadmap, tell me a bit about what you want to learn, your current experience level, and any specific career goals you have." 
        }
    ])
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim() || isGenerating) return
        
        setMessages(prev => [...prev, { role: 'user', content: input.trim() }])
        setInput('')
        
        // Add a generic AI acknowledgment after a short delay to keep conversation flowing
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Got it! Tell me more, or if you feel you've shared enough, click 'Generate My Path' below!" 
            }])
        }, 1000)
    }

    const handleGeneratePath = async () => {
        // Must have at least one user message
        if (messages.filter(m => m.role === 'user').length === 0) {
            addToast('error', 'Please tell me what you want to learn first!')
            return
        }

        setIsGenerating(true)
        addToast('info', 'Analyzing your conversation to build a profile...')

        try {
            // 1. Extract Profile
            const extractRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/paths/extract-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatHistory: messages })
            })
            
            if (!extractRes.ok) throw new Error('Failed to extract profile')
            const { profile } = await extractRes.json()

            addToast('info', 'Profile built! Generating your custom roadmap...')

            // 2. Generate Path
            const genRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/paths/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    profile
                })
            })
            
            if (!genRes.ok) throw new Error('Failed to generate path')
            
            addToast('success', 'Your personalized learning path has been generated!')
            navigate('/roadmap')
        } catch (err) {
            console.error(err)
            addToast('error', 'Something went wrong while generating your path.')
            setIsGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4 sm:p-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-dark-surface max-w-3xl w-full h-[80vh] flex flex-col rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
                {/* Header */}
                <div className="bg-primary p-6 text-white text-center">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Sparkles size={24} /> Conversational Onboarding
                    </h2>
                    <p className="text-primary-100">
                        Chat with our AI to generate a highly personalized learning roadmap.
                    </p>
                </div>

                {/* Chat Log */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-dark-bg">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <Bot size={20} />
                                </div>
                            )}
                            <div className={`px-5 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-sm' 
                                    : 'bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                            }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isGenerating && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <Bot size={20} />
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
                                <Loader2 size={18} className="animate-spin text-primary" />
                                <span className="text-gray-600 dark:text-gray-300">Processing your roadmap...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input & Action Area */}
                <div className="p-4 bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSend} className="flex gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="I want to learn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isGenerating}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-dark-bg text-gray-800 dark:text-white transition"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isGenerating}
                            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 transition flex items-center gap-2 font-semibold"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    
                    <button
                        onClick={handleGeneratePath}
                        disabled={isGenerating || messages.filter(m => m.role === 'user').length === 0}
                        className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-black dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2 font-bold text-lg shadow-md"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} /> Generate My Path
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
