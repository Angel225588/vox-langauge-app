import { MOCK_LEARNING_PLAN } from '@/lib/db/mock-data';

// TODO: Replace this with a real Gemini API call
export const generateLearningPlan = async (onboardingData: any) => {
  console.log('Generating learning plan for:', onboardingData);
  // For now, return the mock data
  return Promise.resolve(MOCK_LEARNING_PLAN);
};
