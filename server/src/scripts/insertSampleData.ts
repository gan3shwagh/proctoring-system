import { supabase } from '../lib/supabase';

async function insertSampleData() {
    try {
        console.log('Inserting sample exam data...');

        const { data, error } = await supabase
            .from('exams')
            .insert({
                title: 'Data Structures & Algorithms',
                duration_minutes: 60,
                questions: [
                    {
                        id: 1,
                        question: 'What is the time complexity of binary search?',
                        options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
                        correct: 1
                    },
                    {
                        id: 2,
                        question: 'Which data structure uses LIFO (Last In First Out)?',
                        options: ['Queue', 'Stack', 'Array', 'Tree'],
                        correct: 1
                    },
                    {
                        id: 3,
                        question: 'What is the worst-case time complexity of QuickSort?',
                        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
                        correct: 1
                    }
                ]
            })
            .select();

        if (error) {
            console.error('Error inserting data:', error);
            process.exit(1);
        }

        console.log('Sample data inserted successfully!');
        console.log('Exam ID:', data[0].id);
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

insertSampleData();
