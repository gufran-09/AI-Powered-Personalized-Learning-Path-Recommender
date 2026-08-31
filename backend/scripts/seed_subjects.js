import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '../frontend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE URL or KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newSubjects = [
    { name: 'Data Structures & Algorithms', slug: 'dsa', icon: 'Binary', has_levels: true, display_order: 1 },
    { name: 'Object-Oriented Programming', slug: 'oop', icon: 'Code', has_levels: true, display_order: 2 },
    { name: 'Database Management Systems', slug: 'dbms', icon: 'Database', has_levels: true, display_order: 3 },
    { name: 'Operating Systems (OS)', slug: 'os', icon: 'Terminal', has_levels: true, display_order: 4 },
    { name: 'Computer Networks (CN)', slug: 'cn', icon: 'Network', has_levels: true, display_order: 5 },
    { name: 'System Design', slug: 'system-design', icon: 'Server', has_levels: false, display_order: 6 },
    { name: 'Software Engineering', slug: 'se', icon: 'GitGraph', has_levels: true, display_order: 7 },
    { name: 'Quantitative Aptitude', slug: 'quant', icon: 'Calculator', has_levels: false, display_order: 8 },
    { name: 'Logical / Analytical Reasoning', slug: 'logical', icon: 'Brain', has_levels: false, display_order: 9 },
    { name: 'Verbal Ability', slug: 'verbal', icon: 'BookOpen', has_levels: false, display_order: 10 },
];

async function seedSubjects() {
    console.log('Seeding new subjects...');

    // 1. Delete old static subjects or clear entirely to start fresh
    const { error: delError } = await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) {
        console.error('Error clearing old subjects:', delError);
    }

    // 2. Insert new subjects
    const { data: insertedSubjects, error: insError } = await supabase
        .from('subjects')
        .insert(newSubjects)
        .select();

    if (insError) {
        console.error('Error inserting new subjects:', insError);
        return;
    }

    console.log(`Inserted ${insertedSubjects.length} subjects.`);

    // 3. Seed some dummy topics for Core subjects to ensure ML can work over them
    const topicsToInsert = [];

    const dsa = insertedSubjects.find(s => s.slug === 'dsa');
    if (dsa) {
        topicsToInsert.push(
            { subject_id: dsa.id, name: 'Arrays & Strings', slug: 'dsa-arrays' },
            { subject_id: dsa.id, name: 'Linked Lists', slug: 'dsa-linked-lists' },
            { subject_id: dsa.id, name: 'Trees (Binary Tree, BST)', slug: 'dsa-trees' }
        );
    }

    const oop = insertedSubjects.find(s => s.slug === 'oop');
    if (oop) {
        topicsToInsert.push(
            { subject_id: oop.id, name: 'Encapsulation & Inheritance', slug: 'oop-encapsulation' },
            { subject_id: oop.id, name: 'Polymorphism', slug: 'oop-poly' }
        );
    }

    const dbms = insertedSubjects.find(s => s.slug === 'dbms');
    if (dbms) {
        topicsToInsert.push({ subject_id: dbms.id, name: 'Normalization', slug: 'dbms-norm' });
    }

    if (topicsToInsert.length > 0) {
        const { error: topicErr } = await supabase.from('topics').insert(topicsToInsert);
        if (topicErr) {
            console.error("Error inserting topics:", topicErr);
        } else {
            console.log(`Inserted ${topicsToInsert.length} core topics.`);
        }
    }

    console.log('Done mapping subjects and topics.');
}

seedSubjects().catch(console.error);
