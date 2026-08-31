import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fetchQuestionsAdmin } from '../../lib/adminApi'
import { useToast } from '../../components/Toast'
import Button from '../../components/Button'

export default function QuestionBankManager() {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { user: currentUser } = useAuth()
    const toast = useToast()

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const res = await fetchQuestionsAdmin(currentUser.sessionToken, { search: searchTerm })
                if (res?.success === false) throw new Error(res.error)

                // MOCK DATA for layout if API isn't wired fully
                if (!res || !res.questions) {
                    setQuestions([
                        { id: 1, text: 'What is the sum of angles in a triangle?', subject: 'Math', topic: 'Geometry', difficulty: 1 },
                        { id: 2, text: 'Explain the concept of React hooks.', subject: 'Computer Science', topic: 'Frontend', difficulty: 2 },
                        { id: 3, text: 'Solve for x: 2x + 4 = 10', subject: 'Math', topic: 'Algebra', difficulty: 1 },
                    ])
                } else {
                    setQuestions(res.questions)
                }
            } catch (err) {
                console.error(err)
                toast.error('Failed to load questions')
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(loadQuestions, 300)
        return () => clearTimeout(timer)
    }, [currentUser, searchTerm, toast])

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white">
                        Question Bank
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Manage adaptive assessment questions
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button className="flex items-center gap-2">
                        <Plus size={18} /> Add Question
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-2xl flex flex-col md:flex-row p-4 gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/[0.08] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/[0.08] rounded-lg text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-white/[0.05] transition-colors flex-1 md:flex-none">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex-1 md:flex-none">
                        <ShieldAlert size={16} /> Bulk Delete
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-surface-200 dark:border-white/[0.08] bg-surface-50 dark:bg-surface-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider w-1/2">Question</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Subject & Topic</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-white/[0.08]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-surface-500">Loading bank...</td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-surface-500 dark:text-surface-400">
                                        No questions found. Try adding some.
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-surface-900 dark:text-white line-clamp-2">{q.text}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-surface-900 dark:text-white">{q.subject}</div>
                                            <div className="text-xs text-surface-500 dark:text-surface-400">{q.topic}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                Lvl {q.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button className="p-2 text-surface-400 hover:text-primary rounded-lg transition-colors mr-1">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-surface-400 hover:text-red-500 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
