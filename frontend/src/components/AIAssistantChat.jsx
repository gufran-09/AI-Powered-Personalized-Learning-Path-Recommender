import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function AIAssistantChat() {
    const { user } = useAuth()
    const { addToast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!user) return null

    const handleSend = async () => {
        if (!input.trim()) return
        
        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    message: userMessage.content,
                    context: { currentRoute: window.location.pathname }
                })
            })
            
            if (!res.ok) throw new Error('Chat failed')
            const data = await res.json()
            
            setMessages(prev => [...prev, { role: 'ai', content: data.reply }])
        } catch (err) {
            console.error(err)
            addToast('error', 'Failed to get a response from AI.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors z-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white dark:bg-dark-surface rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col border border-gray-200 dark:border-gray-700"
                        style={{ height: '500px', maxHeight: '80vh' }}
                    >
                        <div className="flex justify-between items-center p-4 bg-primary text-white">
                            <h3 className="font-semibold">AI Learning Assistant</h3>
                            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-dark-bg">
                            {messages.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                                    Ask me anything about your learning path, recommendations, or specific topics!
                                </p>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                        m.role === 'user' 
                                            ? 'bg-primary text-white rounded-br-none' 
                                            : 'bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-800 rounded-bl-none'
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 text-sm animate-pulse">
                                        ...
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-primary dark:bg-dark-bg dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
