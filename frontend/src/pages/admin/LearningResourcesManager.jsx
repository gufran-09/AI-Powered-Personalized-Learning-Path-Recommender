import { useState } from 'react'
import { Plus, Link as LinkIcon, Edit2, Trash2, GripVertical, AlertCircle, Loader, ExternalLink } from 'lucide-react'
import Button from '../../components/Button'

const HARDCODED_RESOURCES = [
    { id: 1, title: 'Kunal Kushwaha – Java DSA', type: 'youtube_playlist', subject: 'Data Structures & Algorithms (DSA)', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_Dm-kGHG3GohdwrQ5kWk3' },
    { id: 2, title: 'Love Babbar – Complete DSA Playlist', type: 'youtube_playlist', subject: 'Data Structures & Algorithms (DSA)', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA' },
    { id: 3, title: 'Aditya Verma – DP, Sliding Window, Binary Search', type: 'youtube_playlist', subject: 'Data Structures & Algorithms (DSA)', level: 'Advanced', source: 'YouTube', url: 'https://www.youtube.com/c/AdityaVermaTheCodingMinutes/playlists' },
    { id: 4, title: 'Abdul Bari – Data Structures', type: 'youtube_playlist', subject: 'Data Structures & Algorithms (DSA)', level: 'Advanced', source: 'YouTube', url: 'https://www.youtube.com/c/abdulbarikcs/playlists' },

    { id: 5, title: 'Telusko – Java OOP', type: 'youtube_playlist', subject: 'Object-Oriented Programming (OOP)', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/c/Telusko/playlists' },
    { id: 6, title: 'Code with Harry – OOP + SOLID', type: 'youtube_playlist', subject: 'Object-Oriented Programming (OOP)', level: 'Advanced', source: 'YouTube', url: 'https://www.youtube.com/c/CodeWithHarry/playlists' },

    { id: 7, title: 'Gate Smashers – DBMS', type: 'youtube_playlist', subject: 'DBMS', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFM9Lj5G9G_76adtyb4ef7i' },
    { id: 8, title: 'Knowledge Gate – SQL & DBMS', type: 'youtube_playlist', subject: 'DBMS', level: 'Advanced', source: 'YouTube', url: 'https://www.youtube.com/c/KnowledgeGate/playlists' },

    { id: 9, title: 'Jenny’s Lectures – OS', type: 'youtube_playlist', subject: 'Operating Systems (OS)', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/c/JennyslecturesCSIT/playlists' },
    { id: 10, title: 'Gate Smashers – OS', type: 'youtube_playlist', subject: 'Operating Systems (OS)', level: 'Advanced', source: 'YouTube', url: 'https://www.youtube.com/c/GateSmashers/playlists' },

    { id: 11, title: 'Neso Academy – CN', type: 'youtube_playlist', subject: 'Computer Networks (CN)', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O' },
    { id: 12, title: 'Gate Smashers – CN', type: 'youtube_playlist', subject: 'Computer Networks (CN)', level: 'Advanced', source: 'YouTube', url: 'https://www.youtube.com/c/GateSmashers/playlists' },

    { id: 13, title: 'Gaurav Sen – System Design', type: 'youtube_playlist', subject: 'System Design', level: 'Beginner', source: 'YouTube', url: 'https://www.youtube.com/c/GauravSensei/playlists' },

    { id: 14, title: 'Feel Free to Learn – Aptitude', type: 'youtube_playlist', subject: 'Quantitative Aptitude', level: 'All', source: 'YouTube', url: 'https://www.youtube.com/c/FeelFreetoLearn/playlists' },

    { id: 15, title: 'StudyIQ – Reasoning', type: 'youtube_playlist', subject: 'Logical Reasoning', level: 'All', source: 'YouTube', url: 'https://www.youtube.com/c/StudyIQeducation/playlists' },

    { id: 16, title: 'Unacademy CAT – Verbal', type: 'youtube_playlist', subject: 'Verbal Ability', level: 'All', source: 'YouTube', url: 'https://www.youtube.com/c/UnacademyCAT/playlists' }
]

export default function LearningResourcesManager() {
    const [resources] = useState(HARDCODED_RESOURCES)
    const loading = false;
    const error = null;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-surface-900 dark:text-white">
                        Learning Resources
                    </h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">
                        Curate playlists and articles for adaptation loops
                    </p>
                </div>

                <Button className="flex items-center gap-2">
                    <Plus size={18} /> Add Resource
                </Button>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-surface-200 dark:border-white/[0.08] bg-surface-50 dark:bg-surface-800/50">
                    <h2 className="font-semibold text-surface-700 dark:text-surface-300">Active Materials (Drag to re-order priority)</h2>
                </div>

                <div className="divide-y divide-surface-200 dark:divide-white/[0.08]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                            <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p>Loading learning resources...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-red-500">
                            <AlertCircle className="w-8 h-8 mb-4" />
                            <p>{error}</p>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                            <p>No learning resources found.</p>
                        </div>
                    ) : resources.map((res) => (
                        <div key={res.id} className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors group">
                            <div className="cursor-grab text-surface-300 hover:text-surface-500">
                                <GripVertical size={20} />
                            </div>

                            <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-primary flex-shrink-0">
                                <LinkIcon size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-surface-900 dark:text-white truncate">{res.title}</h4>
                                    {res.level === 'Beginner' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Beginner</span>}
                                    {res.level === 'Advanced' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Advanced</span>}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-surface-500 dark:text-surface-400">
                                    <span className="capitalize">{res.type?.replace('_', ' ')}</span>
                                    <span>•</span>
                                    <span>{res.subject}</span>
                                    {res.topic && (
                                        <>
                                            <span>•</span>
                                            <span>{res.topic}</span>
                                        </>
                                    )}
                                    {res.source && (
                                        <>
                                            <span>•</span>
                                            <span>{res.source}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {res.url && (
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 text-surface-400 hover:text-primary rounded-lg transition-colors">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                                <button className="p-2 text-surface-400 hover:text-primary rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-surface-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
