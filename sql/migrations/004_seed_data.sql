-- ============================================================================
-- Quiz Engine & ML Logic - Seed Data
-- Version: 1.0.0
-- Author: Person 2 - Quiz Engine Team
-- Date: 2026-03-01
-- ============================================================================

-- ============================================================================
-- SUBJECTS
-- ============================================================================
INSERT INTO subjects (id, name, slug, description, icon, has_levels, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Data Structures & Algorithms', 'dsa', 'Arrays, Trees, Graphs, Sorting, Searching, Dynamic Programming', '🔧', TRUE, 1),
  ('22222222-2222-2222-2222-222222222222', 'Object-Oriented Programming', 'oop', 'Classes, Inheritance, Polymorphism, Design Patterns', '🎯', TRUE, 2),
  ('33333333-3333-3333-3333-333333333333', 'Database Management', 'dbms', 'SQL, Normalization, Transactions, Indexing', '🗄️', TRUE, 3),
  ('44444444-4444-4444-4444-444444444444', 'Operating Systems', 'os', 'Processes, Memory, Scheduling, Deadlocks', '💻', TRUE, 4),
  ('55555555-5555-5555-5555-555555555555', 'Computer Networks', 'cn', 'OSI Model, TCP/IP, Protocols, Security', '🌐', TRUE, 5),
  ('66666666-6666-6666-6666-666666666666', 'System Design', 'system-design', 'Scalability, Distributed Systems, Architecture', '🏗️', TRUE, 6),
  ('77777777-7777-7777-7777-777777777777', 'Verbal Ability', 'verbal', 'Reading Comprehension, Grammar, Vocabulary', '📝', FALSE, 7),
  ('88888888-8888-8888-8888-888888888888', 'Quantitative Aptitude', 'quant', 'Numbers, Algebra, Geometry, Data Interpretation', '🔢', FALSE, 8),
  ('99999999-9999-9999-9999-999999999999', 'Logical Reasoning', 'logical', 'Puzzles, Patterns, Deductions, Arrangements', '🧩', FALSE, 9)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TOPICS
-- ============================================================================

-- DSA Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Arrays', 'arrays', 'foundational', 1),
  ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Linked Lists', 'linked-lists', 'foundational', 2),
  ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Stacks & Queues', 'stacks-queues', 'foundational', 3),
  ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Trees', 'trees', 'core', 4),
  ('a1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'Graphs', 'graphs', 'core', 5),
  ('a1111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', 'Sorting Algorithms', 'sorting', 'core', 6),
  ('a1111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', 'Searching Algorithms', 'searching', 'foundational', 7),
  ('a1111111-1111-1111-1111-111111111118', '11111111-1111-1111-1111-111111111111', 'Dynamic Programming', 'dp', 'advanced', 8),
  ('a1111111-1111-1111-1111-111111111119', '11111111-1111-1111-1111-111111111111', 'Hashing', 'hashing', 'core', 9),
  ('a1111111-1111-1111-1111-111111111120', '11111111-1111-1111-1111-111111111111', 'Heaps', 'heaps', 'core', 10)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- OOP Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('b2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Classes & Objects', 'classes-objects', 'foundational', 1),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Inheritance', 'inheritance', 'foundational', 2),
  ('b2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Polymorphism', 'polymorphism', 'core', 3),
  ('b2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'Encapsulation', 'encapsulation', 'foundational', 4),
  ('b2222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 'Abstraction', 'abstraction', 'core', 5),
  ('b2222222-2222-2222-2222-222222222226', '22222222-2222-2222-2222-222222222222', 'Design Patterns', 'design-patterns', 'advanced', 6),
  ('b2222222-2222-2222-2222-222222222227', '22222222-2222-2222-2222-222222222222', 'SOLID Principles', 'solid', 'advanced', 7)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- DBMS Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('c3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'SQL Basics', 'sql-basics', 'foundational', 1),
  ('c3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Joins', 'joins', 'core', 2),
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Normalization', 'normalization', 'core', 3),
  ('c3333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'Transactions', 'transactions', 'core', 4),
  ('c3333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'Indexing', 'indexing', 'advanced', 5),
  ('c3333333-3333-3333-3333-333333333336', '33333333-3333-3333-3333-333333333333', 'ACID Properties', 'acid', 'core', 6)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- OS Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('d4444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Process Management', 'processes', 'foundational', 1),
  ('d4444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Threads', 'threads', 'core', 2),
  ('d4444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 'CPU Scheduling', 'scheduling', 'core', 3),
  ('d4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Memory Management', 'memory', 'core', 4),
  ('d4444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', 'Deadlocks', 'deadlocks', 'advanced', 5),
  ('d4444444-4444-4444-4444-444444444446', '44444444-4444-4444-4444-444444444444', 'Virtual Memory', 'virtual-memory', 'advanced', 6)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- CN Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('e5555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'OSI Model', 'osi', 'foundational', 1),
  ('e5555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', 'TCP/IP', 'tcp-ip', 'core', 2),
  ('e5555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555555', 'HTTP/HTTPS', 'http', 'core', 3),
  ('e5555555-5555-5555-5555-555555555554', '55555555-5555-5555-5555-555555555555', 'DNS', 'dns', 'core', 4),
  ('e5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Network Security', 'security', 'advanced', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- System Design Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('f6666666-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666666', 'Scalability', 'scalability', 'core', 1),
  ('f6666666-6666-6666-6666-666666666662', '66666666-6666-6666-6666-666666666666', 'Load Balancing', 'load-balancing', 'core', 2),
  ('f6666666-6666-6666-6666-666666666663', '66666666-6666-6666-6666-666666666666', 'Caching', 'caching', 'core', 3),
  ('f6666666-6666-6666-6666-666666666664', '66666666-6666-6666-6666-666666666666', 'Database Design', 'db-design', 'advanced', 4),
  ('f6666666-6666-6666-6666-666666666665', '66666666-6666-6666-6666-666666666666', 'Microservices', 'microservices', 'advanced', 5)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Verbal Topics (Single playlist subjects still need topics for question organization)
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('g7777777-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777', 'Reading Comprehension', 'reading', 'core', 1),
  ('g7777777-7777-7777-7777-777777777772', '77777777-7777-7777-7777-777777777777', 'Grammar', 'grammar', 'foundational', 2),
  ('g7777777-7777-7777-7777-777777777773', '77777777-7777-7777-7777-777777777777', 'Vocabulary', 'vocabulary', 'foundational', 3)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Quant Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('h8888888-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888888', 'Number Systems', 'numbers', 'foundational', 1),
  ('h8888888-8888-8888-8888-888888888882', '88888888-8888-8888-8888-888888888888', 'Algebra', 'algebra', 'core', 2),
  ('h8888888-8888-8888-8888-888888888883', '88888888-8888-8888-8888-888888888888', 'Geometry', 'geometry', 'core', 3),
  ('h8888888-8888-8888-8888-888888888884', '88888888-8888-8888-8888-888888888888', 'Data Interpretation', 'di', 'core', 4)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Logical Topics
INSERT INTO topics (id, subject_id, name, slug, difficulty_level, display_order) VALUES
  ('i9999999-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999999', 'Puzzles', 'puzzles', 'core', 1),
  ('i9999999-9999-9999-9999-999999999992', '99999999-9999-9999-9999-999999999999', 'Patterns', 'patterns', 'foundational', 2),
  ('i9999999-9999-9999-9999-999999999993', '99999999-9999-9999-9999-999999999999', 'Syllogisms', 'syllogisms', 'core', 3),
  ('i9999999-9999-9999-9999-999999999994', '99999999-9999-9999-9999-999999999999', 'Arrangements', 'arrangements', 'advanced', 4)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================================
-- ASSESSMENT BLUEPRINTS
-- ============================================================================
INSERT INTO assessment_blueprints (id, name, assessment_type, description, config, is_default) VALUES
  (
    'bp111111-1111-1111-1111-111111111111',
    'Standard Diagnostic',
    'diagnostic',
    'Full diagnostic assessment covering all subjects',
    '{
      "numQuestions": 30,
      "difficultyDistribution": {"easy": 0.4, "medium": 0.4, "hard": 0.2},
      "subjectStrategy": "all",
      "excludeRecentDays": 90,
      "timeLimitSeconds": 2700,
      "questionsPerSubject": 3
    }'::jsonb,
    TRUE
  ),
  (
    'bp222222-2222-2222-2222-222222222222',
    'Topic Practice',
    'practice',
    'Focused practice on a specific topic',
    '{
      "numQuestions": 20,
      "difficultyDistribution": {"easy": 0.3, "medium": 0.5, "hard": 0.2},
      "subjectStrategy": "topic-focused",
      "topicShare": 0.6,
      "relatedTopicShare": 0.3,
      "randomShare": 0.1,
      "excludeRecentDays": 30,
      "timeLimitSeconds": 1800
    }'::jsonb,
    TRUE
  ),
  (
    'bp333333-3333-3333-3333-333333333333',
    'Weak Topic Retest',
    'retest',
    'Adaptive retest focusing on weak topics',
    '{
      "numQuestions": 25,
      "difficultyDistribution": {"easy": 0.3, "medium": 0.5, "hard": 0.2},
      "subjectStrategy": "weak-priority",
      "weakTopicShare": 0.6,
      "neutralTopicShare": 0.3,
      "challengeShare": 0.1,
      "excludeRecentDays": 14,
      "timeLimitSeconds": 2250
    }'::jsonb,
    TRUE
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- LEARNING RESOURCES (Sample)
-- ============================================================================

-- DSA Resources (Multi-level)
INSERT INTO learning_resources (subject_id, topic_id, level, title, resource_type, youtube_url, priority) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'beginner', 'Arrays Basics - Complete Guide', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU', 1),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'intermediate', 'Array Problems - Medium Level', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PL2_aWCzGMAwLPEZrZIcNEq9ukGWPfLT4A', 2),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'advanced', 'Advanced Array Techniques', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLgUwDviBIf0rENwdL0nEH0uGom9no0nyB', 3),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111112', 'beginner', 'Linked Lists for Beginners', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLdo5W4Nhv31a5ucNswDhK9FXAJIJz8JRD', 1),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111118', 'beginner', 'DP Basics - Start Here', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PL-Jc9J83PIiFxaDaJIwKomWvFhIFBSxUV', 1),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111118', 'advanced', 'Advanced DP Patterns', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY', 2)
ON CONFLICT DO NOTHING;

-- OOP Resources
INSERT INTO learning_resources (subject_id, topic_id, level, title, resource_type, youtube_url, priority) VALUES
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222221', 'beginner', 'OOP Fundamentals', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk', 1),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222226', 'intermediate', 'Design Patterns Explained', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLrhzvIcii6GNjpARdnO4ueTUAVR9eMBpc', 1)
ON CONFLICT DO NOTHING;

-- Single-playlist subjects (subject-level resources, topic_id NULL)
INSERT INTO learning_resources (subject_id, topic_id, level, title, resource_type, youtube_url, priority) VALUES
  ('77777777-7777-7777-7777-777777777777', NULL, NULL, 'Complete Verbal Ability Course', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLpyc33gOcbVBdCEUebCn6WOQVHb-Y3qCL', 1),
  ('88888888-8888-8888-8888-888888888888', NULL, NULL, 'Quantitative Aptitude Full Course', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLpyc33gOcbVADMKqylI__O_O_RMeHTyNK', 1),
  ('99999999-9999-9999-9999-999999999999', NULL, NULL, 'Logical Reasoning Complete Guide', 'youtube_playlist', 'https://www.youtube.com/playlist?list=PLpyc33gOcbVAVNsPRE_jb7pDrJaFgKSuz', 1)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE QUESTIONS
-- ============================================================================

-- DSA - Arrays (Easy)
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'easy', 
   'What is the time complexity of accessing an element in an array by index?',
   'O(1)', 'O(n)', 'O(log n)', 'O(n²)',
   'A', 'Array access by index is O(1) because arrays store elements in contiguous memory locations.', 'manual'),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'easy',
   'What is the index of the first element in an array?',
   '0', '1', '-1', 'Depends on the language',
   'A', 'In most programming languages, array indexing starts at 0.', 'manual'),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'medium',
   'What is the time complexity of inserting an element at the beginning of an array?',
   'O(1)', 'O(n)', 'O(log n)', 'O(n²)',
   'B', 'Inserting at the beginning requires shifting all existing elements, making it O(n).', 'manual'),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'hard',
   'Given an array of integers, find the maximum sum subarray. Which algorithm would you use?',
   'Binary Search', 'Kadane''s Algorithm', 'Bubble Sort', 'Linear Search',
   'B', 'Kadane''s Algorithm solves the maximum subarray problem in O(n) time.', 'manual');

-- DSA - Linked Lists
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111112', 'easy',
   'What is the time complexity of inserting an element at the head of a singly linked list?',
   'O(1)', 'O(n)', 'O(log n)', 'O(n²)',
   'A', 'Inserting at the head only requires updating the head pointer, which is O(1).', 'manual'),
  ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111112', 'medium',
   'What is a disadvantage of linked lists compared to arrays?',
   'Dynamic size', 'O(n) random access', 'Easy insertion', 'Memory efficiency for pointers',
   'B', 'Linked lists require O(n) time for random access as you must traverse from the head.', 'manual');

-- OOP Questions
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'easy',
   'What is inheritance in OOP?',
   'Creating objects from classes', 'Deriving new classes from existing classes', 'Hiding implementation details', 'Having multiple forms',
   'B', 'Inheritance allows a class to inherit properties and methods from another class.', 'manual'),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222223', 'medium',
   'What is runtime polymorphism achieved through?',
   'Method overloading', 'Method overriding', 'Operator overloading', 'Constructor overloading',
   'B', 'Runtime polymorphism is achieved through method overriding and virtual functions.', 'manual'),
  ('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222226', 'hard',
   'Which design pattern ensures a class has only one instance?',
   'Factory', 'Observer', 'Singleton', 'Strategy',
   'C', 'The Singleton pattern restricts instantiation to one object.', 'manual');

-- DBMS Questions
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333331', 'easy',
   'What SQL keyword is used to retrieve data from a database?',
   'GET', 'FETCH', 'SELECT', 'RETRIEVE',
   'C', 'SELECT is the SQL command used to query data from tables.', 'manual'),
  ('33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333332', 'medium',
   'Which JOIN returns only matching rows from both tables?',
   'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN',
   'C', 'INNER JOIN returns only rows that have matching values in both tables.', 'manual'),
  ('33333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'hard',
   'A relation is in BCNF if every determinant is a:',
   'Primary key', 'Foreign key', 'Candidate key', 'Super key',
   'C', 'In BCNF, every determinant must be a candidate key.', 'manual');

-- OS Questions
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('44444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444441', 'easy',
   'What is a process?',
   'A program stored on disk', 'A program in execution', 'A CPU register', 'A memory address',
   'B', 'A process is an instance of a program that is being executed.', 'manual'),
  ('44444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444445', 'medium',
   'Which condition is NOT required for deadlock?',
   'Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait',
   'C', 'The four conditions for deadlock are: mutual exclusion, hold and wait, no preemption, and circular wait.', 'manual');

-- CN Questions
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('55555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555551', 'easy',
   'How many layers are in the OSI model?',
   '5', '6', '7', '8',
   'C', 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', 'manual'),
  ('55555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555552', 'medium',
   'TCP is a _____ protocol.',
   'Connection-oriented', 'Connectionless', 'Stateless', 'Unreliable',
   'A', 'TCP establishes a connection before data transfer, making it connection-oriented.', 'manual');

-- Verbal Questions
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('77777777-7777-7777-7777-777777777777', 'g7777777-7777-7777-7777-777777777772', 'easy',
   'Choose the correct sentence:',
   'He don''t like coffee', 'He doesn''t likes coffee', 'He doesn''t like coffee', 'He not like coffee',
   'C', 'The correct form uses "doesn''t" with the base form of the verb.', 'manual');

-- Quant Questions
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('88888888-8888-8888-8888-888888888888', 'h8888888-8888-8888-8888-888888888881', 'easy',
   'What is 25% of 200?',
   '25', '50', '75', '100',
   'B', '25% × 200 = 0.25 × 200 = 50', 'manual');

-- Logical Questions  
INSERT INTO questions (subject_id, topic_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, generation_source) VALUES
  ('99999999-9999-9999-9999-999999999999', 'i9999999-9999-9999-9999-999999999992', 'easy',
   'What comes next in the sequence: 2, 4, 8, 16, __?',
   '20', '24', '32', '64',
   'C', 'Each number is doubled: 16 × 2 = 32', 'manual');
