import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../frontend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE URL or KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPlaylistsAndQuestions() {
    console.log('Fetching subjects and topics...');
    const { data: subjects } = await supabase.from('subjects').select('*');
    const { data: topics } = await supabase.from('topics').select('*');

    if (!subjects || subjects.length === 0) {
        console.error("No subjects found.");
        return;
    }

    // 1. CLEAR OLD RESOURCES and QUESTIONS
    await supabase.from('learning_resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const resourcesToInsert = [];
    const questionsToInsert = [];

    // --- MAP CORE SUBJECTS ---
    const dsa = subjects.find(s => s.slug === 'dsa');
    const oop = subjects.find(s => s.slug === 'oop');
    const dbms = subjects.find(s => s.slug === 'dbms');
    const os = subjects.find(s => s.slug === 'os');
    const cn = subjects.find(s => s.slug === 'cn');
    const systemDesign = subjects.find(s => s.slug === 'system-design');
    const quant = subjects.find(s => s.slug === 'quant');
    const logical = subjects.find(s => s.slug === 'logical');
    const verbal = subjects.find(s => s.slug === 'verbal');

    // --- 2. LEARNING RESOURCES ---
    if (dsa) {
        // General full playlist for beginner DSA
        resourcesToInsert.push({ subject_id: dsa.id, topic_id: null, level: 'beginner', title: 'Complete DSA Bootcamp', youtube_url: 'https://www.youtube.com/embed/8hly31xKli0', priority: 1, resource_type: 'youtube_playlist' });

        const arrTopic = topics.find(t => t.slug === 'dsa-arrays');
        if (arrTopic) {
            resourcesToInsert.push({ subject_id: dsa.id, topic_id: arrTopic.id, level: 'beginner', title: 'Arrays Basics', youtube_url: 'https://www.youtube.com/embed/RBSGKlAvoiM', priority: 1, resource_type: 'youtube_video' });
            resourcesToInsert.push({ subject_id: dsa.id, topic_id: arrTopic.id, level: 'advanced', title: 'Advanced Array Manipulation', youtube_url: 'https://www.youtube.com/embed/QO1w8cMpsk4', priority: 1, resource_type: 'youtube_video' });
        }
        const treeTopic = topics.find(t => t.slug === 'dsa-trees');
        if (treeTopic) {
            resourcesToInsert.push({ subject_id: dsa.id, topic_id: treeTopic.id, level: 'intermediate', title: 'Trees & Graphs Deep Dive', youtube_url: 'https://www.youtube.com/embed/fAAZixRoEzM', priority: 1, resource_type: 'youtube_video' });
        }
    }

    if (oop) {
        resourcesToInsert.push({ subject_id: oop.id, topic_id: null, level: 'beginner', title: 'Object-Oriented Programming Course', youtube_url: 'https://www.youtube.com/embed/pTB0EiLXUC8', priority: 1, resource_type: 'youtube_playlist' });
    }

    if (dbms) {
        resourcesToInsert.push({ subject_id: dbms.id, topic_id: null, level: 'beginner', title: 'DBMS Full Course', youtube_url: 'https://www.youtube.com/embed/kBdlM6hNDAE', priority: 1, resource_type: 'youtube_playlist' });
    }

    if (systemDesign) {
        // Single playlist subjects (no topic, no level needed)
        resourcesToInsert.push({ subject_id: systemDesign.id, topic_id: null, level: null, title: 'System Design Interview Crash Course', youtube_url: 'https://www.youtube.com/embed/bBcPvA1E1l8', priority: 1, resource_type: 'youtube_playlist' });
    }

    if (quant) {
        resourcesToInsert.push({ subject_id: quant.id, topic_id: null, level: null, title: 'Quantitative Aptitude Masterclass', youtube_url: 'https://www.youtube.com/embed/2_tEwQc-J4M', priority: 1, resource_type: 'youtube_playlist' });
    }

    if (logical) {
        resourcesToInsert.push({ subject_id: logical.id, topic_id: null, level: null, title: 'Logical Reasoning Cracker', youtube_url: 'https://www.youtube.com/embed/o0h1vHwz0lM', priority: 1, resource_type: 'youtube_playlist' });
    }

    if (verbal) {
        resourcesToInsert.push({ subject_id: verbal.id, topic_id: null, level: null, title: 'Verbal Ability & English', youtube_url: 'https://www.youtube.com/embed/3Rz9N3oT0Hk', priority: 1, resource_type: 'youtube_playlist' });
    }

    if (resourcesToInsert.length > 0) {
        console.log('Inserting Learning Resources...', resourcesToInsert.length);
        const { error: resErr } = await supabase.from('learning_resources').insert(resourcesToInsert);
        if (resErr) { console.error('Error inserting resources:', resErr); }
    }


    // --- 3. DUMMY QUESTIONS ---
    console.log('Generating dummy questions...');

    // Minimal set of dummy questions to prevent empty DB crashes on Quiz load
    const makeQuestion = (subj, topic, diff, text, a, b, c, d, correct) => {
        questionsToInsert.push({
            subject_id: subj.id,
            topic_id: topic ? topic.id : null,
            difficulty: diff,
            question_text: text,
            option_a: a, option_b: b, option_c: c, option_d: d,
            correct_option: correct,
            explanation: "Generated based on topic.",
            generation_source: 'manual',
            is_active: true
        });
    };

    const arrTopic = topics.find(t => t.slug === 'dsa-arrays');
    const treeTopic = topics.find(t => t.slug === 'dsa-trees');
    const encapTopic = topics.find(t => t.slug === 'oop-encapsulation');
    const normTopic = topics.find(t => t.slug === 'dbms-norm');

    // DSA Questions
    if (dsa) {
        makeQuestion(dsa, arrTopic, 'easy', 'What is the time complexity to access an element in an array by index?', 'O(1)', 'O(N)', 'O(log N)', 'O(N^2)', 'A');
        makeQuestion(dsa, arrTopic, 'medium', 'Which sorting algorithm has a worst-case time complexity of O(N^2)?', 'Merge Sort', 'Heap Sort', 'Quick Sort', 'Radix Sort', 'C');
        makeQuestion(dsa, arrTopic, 'hard', 'In a rotated sorted array, what is the best search complexity?', 'O(N)', 'O(N log N)', 'O(log N)', 'O(1)', 'C');
        makeQuestion(dsa, arrTopic, 'easy', 'Which data structure is used to handle recursion?', 'Queue', 'Stack', 'Tree', 'Graph', 'B');
        makeQuestion(dsa, treeTopic, 'easy', 'What is the maximum number of children a node can have in a Binary Tree?', '1', '2', '3', 'Unlimited', 'B');
        makeQuestion(dsa, treeTopic, 'medium', 'What traversal prints a BST in sorted order?', 'Pre-order', 'In-order', 'Post-order', 'Level-order', 'B');
    }

    // OOP Questions
    if (oop) {
        makeQuestion(oop, encapTopic, 'easy', 'Which concept hides the internal implementation details?', 'Polymorphism', 'Inheritance', 'Encapsulation', 'Abstraction', 'C');
        makeQuestion(oop, encapTopic, 'medium', 'Can constructors be inherited in Java?', 'Yes', 'No', 'Only if protected', 'Only in abstract classes', 'B');
        makeQuestion(oop, null, 'hard', 'What does the L in SOLID principles stand for?', 'Local scope', 'Liskov Substitution', 'Lazy Loading', 'Linear Execution', 'B');
    }

    // DBMS Questions
    if (dbms) {
        makeQuestion(dbms, normTopic, 'easy', 'What is the main goal of database normalization?', 'Increase redundancy', 'Minimize anomalies', 'Decrease security', 'Increase complexity', 'B');
        makeQuestion(dbms, normTopic, 'medium', 'BCNF is a stricter version of which normal form?', '1NF', '2NF', '3NF', '4NF', 'C');
        makeQuestion(dbms, null, 'easy', 'Which SQL command is used to remove a table entirely?', 'DELETE', 'DROP', 'TRUNCATE', 'REMOVE', 'B');
    }

    // Aptitude Questions
    if (quant) {
        makeQuestion(quant, null, 'easy', 'If 2x = 10, what is x?', '2', '5', '10', '20', 'B');
        makeQuestion(quant, null, 'medium', 'A train running at speed 60 kmph crosses a pole in 9 sec. What is the length of train?', '120m', '180m', '324m', '150m', 'D');
    }

    if (logical) {
        makeQuestion(logical, null, 'easy', 'Find the missing number in the series: 2, 4, 8, 16, ?', '20', '24', '32', '64', 'C');
    }

    if (verbal) {
        makeQuestion(verbal, null, 'easy', 'Choose the synonym for "Abundant".', 'Scarce', 'Plentiful', 'Weak', 'Small', 'B');
    }

    if (systemDesign) {
        makeQuestion(systemDesign, null, 'easy', 'What does a Load Balancer do?', 'Stores data', 'Distributes incoming traffic', 'Encrypts passwords', 'Compresses images', 'B');
        makeQuestion(systemDesign, null, 'medium', 'Which database is best for highly connected graph data?', 'PostgreSQL', 'MongoDB', 'Neo4j', 'Redis', 'C');
    }

    if (questionsToInsert.length > 0) {
        console.log('Inserting Dummy Questions...', questionsToInsert.length);
        const { error: qErr } = await supabase.from('questions').insert(questionsToInsert);
        if (qErr) { console.error('Error inserting questions:', qErr); }
    }

    console.log('Seeding Complete!');
}

seedPlaylistsAndQuestions().catch(console.error);
