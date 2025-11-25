export const MOCK_LEARNING_PLAN = {
  id: 'plan-1',
  user_id: 'user-123',
  title: 'Beginner Spanish for Travelers',
  description: 'A 10-step plan to learn the basics of Spanish for your next trip.',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Basic Greetings',
      description: 'Learn how to say hello, goodbye, and introduce yourself.',
      order: 1,
      activities: [
        { id: 'activity-1', type: 'SingleVocabCard', data: { word: 'Hola', translation: 'Hello' }, order: 1 },
        { id: 'activity-2', type: 'SingleVocabCard', data: { word: 'Adiós', translation: 'Goodbye' }, order: 2 },
        { id: 'activity-3', type: 'ImageMultipleChoiceCard', data: { question: 'Which one is "Hola"?', options: ['Hola', 'Adiós', 'Gracias'], correctAnswer: 'Hola' }, order: 3 },
      ],
    },
    {
      id: 'lesson-2',
      title: 'At the Restaurant',
      description: 'Learn how to order food and drinks.',
      order: 2,
      activities: [
        { id: 'activity-4', type: 'SingleVocabCard', data: { word: 'Agua', translation: 'Water' }, order: 1 },
        { id: 'activity-5', type: 'TextInputCard', data: { question: 'How do you say "water"?', correctAnswer: 'Agua' }, order: 2 },
      ],
    },
    {
      id: 'lesson-3',
      title: 'Asking for Directions',
      description: 'Learn how to ask for and understand basic directions.',
      order: 3,
      activities: [],
    },
  ],
};
