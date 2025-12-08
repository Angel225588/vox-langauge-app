/**
 * Teleprompter Screen
 *
 * Premium, immersive reading experience.
 * Now receives passage data from the Library → About Lecture flow.
 *
 * Flow:
 * Library → About Lecture → Teleprompter → Analyzing → Results
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/designSystem';
import { TeleprompterCard, TeleprompterResults } from '@/components/cards/TeleprompterCard';
import { ReadingResultsCard } from '@/components/cards/ReadingResultsCard';
import { AnalyzingScreen } from '@/components/reading/AnalyzingScreen';
import {
  useActiveSession,
  useTranscription,
  useArticulationAnalysis,
  type Passage,
  type AnalysisResult,
} from '@/lib/reading';

type ScreenState = 'teleprompter' | 'analyzing' | 'results';

// Sample passages - in production these would come from the library
const SAMPLE_PASSAGES: Record<string, Passage> = {
  '1': {
    id: '1',
    title: 'A Morning in Paris',
    text: `Bonjour! Je m'appelle Marie et j'habite à Paris.

Chaque matin, je me réveille à sept heures. Je prends mon petit-déjeuner dans un café près de chez moi. J'aime le croissant et le café au lait.

Après le petit-déjeuner, je marche le long de la Seine. C'est très beau le matin. Les oiseaux chantent et le soleil brille.

Je travaille dans une galerie d'art. J'adore mon travail parce que je vois des tableaux magnifiques tous les jours.

Le soir, je retrouve mes amis au restaurant. Nous mangeons et nous parlons de notre journée. C'est la vie parisienne!`,
    difficulty: 'beginner',
    category: 'Travel',
    wordCount: 120,
    estimatedDuration: 180,
    sourceType: 'curated',
    createdAt: new Date().toISOString(),
  },
  '2': {
    id: '2',
    title: 'The Job Interview',
    text: `Good morning! Thank you for coming in today. Please, have a seat.

I've reviewed your resume and I'm impressed with your experience. Can you tell me why you're interested in this position?

Well, I've been following your company for several years. I admire your commitment to innovation and your company culture. I believe my skills in project management and team leadership would be a great fit.

That's wonderful to hear. Can you describe a challenging situation you faced at work and how you handled it?

Certainly. At my previous job, we had a project that was falling behind schedule. I organized daily stand-up meetings and redistributed tasks based on team members' strengths. We completed the project on time and received positive feedback from the client.

Excellent example. Do you have any questions for me?`,
    difficulty: 'intermediate',
    category: 'Work',
    wordCount: 200,
    estimatedDuration: 300,
    sourceType: 'curated',
    createdAt: new Date().toISOString(),
  },
  '3': {
    id: '3',
    title: 'Ordering at a Restaurant',
    text: `Waiter: Good evening! Welcome to La Bella Italia. Do you have a reservation?

Customer: Yes, the name is Johnson. A table for two, please.

Waiter: Right this way. Here are your menus. Can I get you something to drink while you decide?

Customer: I'll have a glass of red wine, please. And water for the table.

Waiter: Excellent choice. Are you ready to order, or do you need a few more minutes?

Customer: I think we're ready. I'll have the mushroom risotto as a starter and the grilled salmon for my main course.

Waiter: And for you, sir?

Customer 2: The Caesar salad to start, and the beef tenderloin, medium rare, please.

Waiter: Perfect. Would you like any sides with that?

Customer: Yes, some roasted vegetables, please.

Waiter: I'll have that right out for you.`,
    difficulty: 'beginner',
    category: 'Food',
    wordCount: 150,
    estimatedDuration: 240,
    sourceType: 'curated',
    createdAt: new Date().toISOString(),
  },
  'default': {
    id: 'default',
    title: 'Practice Text',
    text: `Welcome to the reading practice! This is a sample text to help you improve your reading fluency.

Reading aloud is one of the best ways to improve your pronunciation and build confidence in speaking. Take your time, focus on clarity, and don't worry about making mistakes.

The key to improvement is consistent practice. Try to read a little bit every day, even if it's just for a few minutes. Over time, you'll notice significant progress in your reading speed and comprehension.

Remember, everyone starts somewhere. Be patient with yourself and celebrate small victories along the way. You're doing great!`,
    difficulty: 'beginner',
    category: 'Practice',
    wordCount: 100,
    estimatedDuration: 120,
    sourceType: 'curated',
    createdAt: new Date().toISOString(),
  },
};

export default function TeleprompterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    storyId?: string;
    title?: string;
  }>();

  const [screenState, setScreenState] = useState<ScreenState>('teleprompter');
  const [results, setResults] = useState<TeleprompterResults | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Get passage based on storyId from params, or use default
  const passage = params.storyId
    ? SAMPLE_PASSAGES[params.storyId] || SAMPLE_PASSAGES['default']
    : SAMPLE_PASSAGES['default'];

  // Integration hooks
  const { activeSession, startSession, updateSession } = useActiveSession();
  const { transcribe, isTranscribing, progress: transcriptionProgress } = useTranscription();
  const { analyze, isAnalyzing } = useArticulationAnalysis();

  // Calculate overall progress for analyzing screen
  const analyzingProgress = isTranscribing
    ? transcriptionProgress * 0.5
    : isAnalyzing
    ? 50 + (50 * 0.5)
    : 100;

  const analyzingStage = isTranscribing
    ? 'transcribing'
    : isAnalyzing
    ? 'analyzing'
    : 'uploading';

  // Start session when component mounts
  useEffect(() => {
    const initSession = async () => {
      await startSession({
        userId: 'user_123', // TODO: Get from auth context
        sourceType: passage.sourceType as any,
        text: passage.text,
        title: passage.title,
        difficulty: passage.difficulty,
      });
    };
    initSession();
  }, []);

  const handleTeleprompterFinish = async (teleprompterResults: TeleprompterResults) => {
    setResults(teleprompterResults);

    if (teleprompterResults.recordingUri) {
      setRecordingUri(teleprompterResults.recordingUri);
      setScreenState('analyzing');

      try {
        // Step 1: Transcribe the audio
        const transcriptionResult = await transcribe(
          teleprompterResults.recordingUri,
          passage.text
        );

        if (!transcriptionResult) {
          throw new Error('Transcription failed');
        }

        // Step 2: Analyze articulation
        const analysis = await analyze(
          passage.text,
          transcriptionResult,
          teleprompterResults.duration * 1000
        );

        if (!analysis) {
          throw new Error('Analysis failed');
        }

        setAnalysisResult(analysis);

        // Step 3: Update session with results
        if (activeSession) {
          await updateSession({
            transcription: transcriptionResult.text,
            wordsSpoken: analysis.wordsSpoken,
            articulationScore: analysis.articulationScore,
            fluencyScore: analysis.fluencyScore,
            overallScore: analysis.overallScore,
            problemWords: analysis.problemWords,
            feedback: analysis.feedback,
          });
        }

        setScreenState('results');
      } catch (error) {
        console.error('Analysis error:', error);
        setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
        setScreenState('results');
      }
    } else {
      // No recording - show results with basic stats
      setScreenState('results');
    }
  };

  const handlePracticeAgain = () => {
    setResults(null);
    setAnalysisResult(null);
    setRecordingUri(null);
    setAnalysisError(null);
    setScreenState('teleprompter');
  };

  const handleFinish = () => {
    // Go back to library
    router.back();
    router.back(); // Go past about-lecture too
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {screenState === 'teleprompter' && (
        <TeleprompterCard
          passage={passage}
          onFinish={handleTeleprompterFinish}
          onBack={handleBack}
        />
      )}

      {screenState === 'analyzing' && (
        <AnalyzingScreen
          progress={analyzingProgress}
          stage={analyzingStage}
        />
      )}

      {screenState === 'results' && results && (
        <ReadingResultsCard
          results={results}
          analysisResult={analysisResult}
          recordingUri={recordingUri}
          onPracticeAgain={handlePracticeAgain}
          onFinish={handleFinish}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
