import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import PageTransition from '../components/PageTransition'
import Skeleton from '../components/Skeleton'
import AIAssistantWidget from '../components/AIAssistantWidget'

export default function Roadmap() {
    const { user } = useAuth()
    const [path, setPath] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/paths?user_id=${user.id}`)
                if (res.ok) {
                    const { data } = await res.json()
                    if (data && data.length > 0) {
                        setPath(data[0]) // Get most recent path
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPaths()
    }, [user.id])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                
                <PageTransition>
                    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                        {isLoading ? (
                            <div className="space-y-6">
                                <Skeleton className="h-12 w-64" />
                                <Skeleton className="h-6 w-96" />
                                <div className="space-y-4 mt-10">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                                </div>
                            </div>
                        ) : !path ? (
                            <div className="text-center py-20">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Learning Path Found</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't generated a personalized learning roadmap yet.</p>
                                <a href="/onboarding" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold">
                                    Create My Roadmap
                                </a>
                            </div>
                        ) : (
                            <div>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-10"
                                >
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{path.title}</h1>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">{path.description}</p>
                                </motion.div>

                                <div className="relative border-l-4 border-gray-200 dark:border-gray-700 ml-6 pl-8 space-y-12">
                                    {path.learning_path_milestones?.sort((a, b) => a.step_order - b.step_order).map((milestone, idx) => (
                                        <motion.div 
                                            key={milestone.id}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative"
                                        >
                                            <div className={`absolute -left-11 w-6 h-6 rounded-full border-4 border-white dark:border-dark-bg ${
                                                milestone.status === 'completed' ? 'bg-green-500' : 
                                                milestone.status === 'in_progress' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                            }`} />
                                            
                                            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Step {idx + 1}: {milestone.title}</h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                        milestone.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {milestone.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 mb-4">{milestone.description}</p>
                                                
                                                <div className="bg-primary/5 border border-primary/20 dark:border-primary/30 p-4 rounded-lg flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                                        <span className="font-semibold not-italic">AI says: </span>
                                                        {milestone.ai_explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </PageTransition>
                {path && <AIAssistantWidget context={path} />}
            </div>
        </div>
    )
}
