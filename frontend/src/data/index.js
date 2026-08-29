export const quizQuestions = {
    'linear-algebra': [
        {
            id: 1,
            question: 'What is the derivative of x² + 3x + 5?',
            options: ['2x + 3', '2x + 5', 'x² + 3', '2x'],
            correct: 0,
            topic: 'Calculus',
        },
        {
            id: 2,
            question: 'If f(x) = sin(x), what is f\'(π/2)?',
            options: ['1', '0', '-1', 'π/2'],
            correct: 1,
            topic: 'Trigonometry',
        },
        {
            id: 3,
            question: 'What is the integral of 2x dx?',
            options: ['x²', 'x² + C', '2x² + C', 'x + C'],
            correct: 1,
            topic: 'Calculus',
        },
        {
            id: 4,
            question: 'Solve: 3x + 7 = 22',
            options: ['x = 3', 'x = 5', 'x = 7', 'x = 4'],
            correct: 1,
            topic: 'Algebra',
        },
        {
            id: 5,
            question: 'What is the sum of interior angles of a hexagon?',
            options: ['540°', '720°', '900°', '360°'],
            correct: 1,
            topic: 'Geometry',
        },
        {
            id: 6,
            question: 'What is log₂(64)?',
            options: ['4', '5', '6', '8'],
            correct: 2,
            topic: 'Algebra',
        },
        {
            id: 7,
            question: 'The probability of getting heads in 3 consecutive coin flips is:',
            options: ['1/2', '1/4', '1/8', '3/8'],
            correct: 2,
            topic: 'Probability',
        },
        {
            id: 8,
            question: 'What is the determinant of matrix [[1,2],[3,4]]?',
            options: ['-2', '2', '10', '-10'],
            correct: 0,
            topic: 'Linear Algebra',
        },
        {
            id: 9,
            question: 'What is the value of e⁰?',
            options: ['0', '1', 'e', 'undefined'],
            correct: 1,
            topic: 'Calculus',
        },
        {
            id: 10,
            question: 'In a right triangle, if one angle is 30°, the side opposite to 30° is:',
            options: ['Hypotenuse', 'Half the hypotenuse', 'Equal to adjacent', 'Twice the hypotenuse'],
            correct: 1,
            topic: 'Trigonometry',
        },
    ],
    'data-structures': [
        {
            id: 1,
            question: 'What is the time complexity of searching in a perfectly balanced binary search tree?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
            correct: 2,
            topic: 'Trees',
        },
        {
            id: 2,
            question: 'Which data structure uses LIFO (Last In First Out)?',
            options: ['Queue', 'Stack', 'Linked List', 'Array'],
            correct: 1,
            topic: 'Basics',
        },
        {
            id: 3,
            question: 'What is the worst-case time complexity of QuickSort?',
            options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
            correct: 2,
            topic: 'Sorting',
        },
        {
            id: 4,
            question: 'Which traversal visits the root node first?',
            options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
            correct: 1,
            topic: 'Trees',
        },
        {
            id: 5,
            question: 'In a graph, BFS uses which data structure?',
            options: ['Stack', 'Queue', 'Priority Queue', 'Array'],
            correct: 1,
            topic: 'Graphs',
        },
        {
            id: 6,
            question: 'What is the space complexity of a recursive algorithm doing n calls?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            correct: 2,
            topic: 'Complexity',
        },
        {
            id: 7,
            question: 'Which of these is a non-linear data structure?',
            options: ['Array', 'Linked List', 'Stack', 'Tree'],
            correct: 3,
            topic: 'Basics',
        },
        {
            id: 8,
            question: 'A hash table resolves collisions using:',
            options: ['Chaining', 'Queuing', 'Sorting', 'Stacking'],
            correct: 0,
            topic: 'Hashing',
        },
        {
            id: 9,
            question: 'What is the self-balancing binary search tree?',
            options: ['Heap', 'AVL Tree', 'B-Tree', 'Trie'],
            correct: 1,
            topic: 'Trees',
        },
        {
            id: 10,
            question: 'Dijkstra\'s algorithm finds the shortest path using:',
            options: ['DFS', 'Greedy approach', 'Dynamic Programming', 'Backtracking'],
            correct: 1,
            topic: 'Graphs',
        },
    ],
    'operating-systems': [
        {
            id: 1,
            question: 'What is the atomic number of Carbon?',
            options: ['4', '6', '8', '12'],
            correct: 1,
            topic: 'Periodic Table',
        },
        {
            id: 2,
            question: 'Which gas is most abundant in Earth\'s atmosphere?',
            options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
            correct: 1,
            topic: 'General',
        },
        {
            id: 3,
            question: 'What is the pH of pure water?',
            options: ['0', '7', '14', '1'],
            correct: 1,
            topic: 'Acids & Bases',
        },
        {
            id: 4,
            question: 'Which bond is formed by sharing electrons?',
            options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
            correct: 1,
            topic: 'Chemical Bonding',
        },
        {
            id: 5,
            question: 'What is Avogadro\'s number?',
            options: ['6.022 × 10²³', '6.022 × 10²²', '3.14 × 10²³', '1.6 × 10⁻¹⁹'],
            correct: 0,
            topic: 'Mole Concept',
        },
        {
            id: 6,
            question: 'Which element has the highest electronegativity?',
            options: ['Oxygen', 'Nitrogen', 'Fluorine', 'Chlorine'],
            correct: 2,
            topic: 'Periodic Table',
        },
        {
            id: 7,
            question: 'The process of conversion of solid to gas is called:',
            options: ['Evaporation', 'Condensation', 'Sublimation', 'Deposition'],
            correct: 2,
            topic: 'States of Matter',
        },
        {
            id: 8,
            question: 'Which law states that volume is directly proportional to temperature?',
            options: ["Boyle's Law", "Charles's Law", "Gay-Lussac's Law", "Dalton's Law"],
            correct: 1,
            topic: 'Gas Laws',
        },
        {
            id: 9,
            question: 'What is the molecular formula of glucose?',
            options: ['C₆H₁₂O₆', 'C₂H₅OH', 'CH₃COOH', 'C₁₂H₂₂O₁₁'],
            correct: 0,
            topic: 'Organic Chemistry',
        },
        {
            id: 10,
            question: 'Rusting of iron is an example of:',
            options: ['Physical change', 'Chemical change', 'Nuclear change', 'No change'],
            correct: 1,
            topic: 'Chemical Reactions',
        },
    ],
}

export const subjects = [
    {
        category: 'Core Technical',
        courses: [
            { id: 'data-structures', name: 'Data Structures & Algorithms', icon: 'Binary', color: '#6C63FF', progress: 0 },
            { id: 'oop', name: 'Object-Oriented Programming', icon: 'Code', color: '#22C55E', progress: 0 },
            { id: 'dbms', name: 'Database Management Systems', icon: 'Database', color: '#F59E0B', progress: 0 },
        ]
    },
    {
        category: 'Systems & Engineering',
        courses: [
            { id: 'operating-systems', name: 'Operating Systems (OS)', icon: 'Terminal', color: '#3B82F6', progress: 0 },
            { id: 'computer-networks', name: 'Computer Networks (CN)', icon: 'Network', color: '#8B5CF6', progress: 0 },
            { id: 'system-design', name: 'System Design', icon: 'Server', color: '#EC4899', progress: 0 },
            { id: 'software-engineering', name: 'Software Engineering', icon: 'GitGraph', color: '#14B8A6', progress: 0 },
        ]
    },
    {
        category: 'Non-Technical / Aptitude',
        courses: [
            { id: 'quantitative-aptitude', name: 'Quantitative Aptitude', icon: 'Calculator', color: '#F97316', progress: 0 },
            { id: 'logical-reasoning', name: 'Logical / Analytical Reasoning', icon: 'Brain', color: '#EAB308', progress: 0 },
            { id: 'verbal-ability', name: 'Verbal Ability', icon: 'BookOpen', color: '#06B6D4', progress: 0 },
        ]
    },
]

export const weeklyProgress = [
    { day: 'Mon', score: 65, quizzes: 3 },
    { day: 'Tue', score: 78, quizzes: 4 },
    { day: 'Wed', score: 55, quizzes: 2 },
    { day: 'Thu', score: 82, quizzes: 5 },
    { day: 'Fri', score: 90, quizzes: 3 },
    { day: 'Sat', score: 73, quizzes: 4 },
    { day: 'Sun', score: 85, quizzes: 2 },
]

export const recentActivity = [
    { id: 1, subject: 'Data Structures', topic: 'Trees and Graphs', score: 85, date: '2 hours ago', questions: 10 },
    { id: 2, subject: 'Operating Systems', topic: 'Process Scheduling', score: 72, date: '5 hours ago', questions: 8 },
    { id: 3, subject: 'Database Management', topic: 'SQL Queries', score: 90, date: 'Yesterday', questions: 10 },
    { id: 4, subject: 'Machine Learning', topic: 'Linear Regression', score: 68, date: 'Yesterday', questions: 12 },
    { id: 5, subject: 'Python Programming', topic: 'Dictionaries', score: 95, date: '2 days ago', questions: 8 },
]

export const achievements = [
    { id: 1, name: 'First Steps', desc: 'Complete your first quiz', icon: 'Trophy', unlocked: true },
    { id: 2, name: 'On Fire', desc: 'Maintain a 7-day streak', icon: 'Flame', unlocked: true },
    { id: 3, name: 'Perfect Score', desc: 'Score 100% on any quiz', icon: 'Star', unlocked: true },
    { id: 4, name: 'Speed Demon', desc: 'Finish a quiz in under 2 minutes', icon: 'Zap', unlocked: false },
    { id: 5, name: 'Scholar', desc: 'Complete 50 quizzes', icon: 'GraduationCap', unlocked: false },
    { id: 6, name: 'Polymath', desc: 'Score 80%+ in all subjects', icon: 'Brain', unlocked: false },
]

export const performanceData = [
    { subject: 'Data Structures', score: 85 },
    { subject: 'OS', score: 72 },
    { subject: 'DBMS', score: 90 },
    { subject: 'Networks', score: 65 },
    { subject: 'Algorithms', score: 78 },
    { subject: 'Python', score: 82 },
]

export const testimonials = [
    {
        name: 'Sarah Chen',
        role: 'IT Student, Vardhaman',
        text: 'AdaptIQ transformed how I study. The adaptive quizzes pinpoint exactly where I need to improve.',
        avatar: 'SC',
    },
    {
        name: 'Marcus Johnson',
        role: 'Engineering Student',
        text: 'The streak system keeps me motivated every day. I have never been this consistent with studying.',
        avatar: 'MJ',
    },
    {
        name: 'Priya Sharma',
        role: 'IT Student, Vardhaman',
        text: 'The performance analytics helped me boost my test scores by 40% in just one month.',
        avatar: 'PS',
    },
]
