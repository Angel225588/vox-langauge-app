/**
 * Example Usage: Articulation Analysis Engine
 *
 * This file demonstrates how to use the articulation analysis engine
 * in a React Native component with the Vox language learning app.
 */

import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, ScrollView } from 'react-native';
import {
  useArticulationAnalysis,
  useTranscription,
  useAudioRecording,
  AnalysisResult,
} from '@/lib/reading';

/**
 * Complete Reading Practice Component
 *
 * Demonstrates the full workflow:
 * 1. Record audio
 * 2. Transcribe with Whisper
 * 3. Analyze articulation
 * 4. Display results and feedback
 */
export function ReadingPracticeExample() {
  // The text the user should read
  const expectedText = `
    The quick brown fox jumps over the lazy dog.
    She sells seashells by the seashore.
    How much wood would a woodchuck chuck if a woodchuck could chuck wood?
  `.trim();

  // Hooks
  const recording = useAudioRecording();
  const transcription = useTranscription();
  const analysis = useArticulationAnalysis();

  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Step 1: Start recording
  const handleStartRecording = async () => {
    try {
      await recording.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Step 2: Stop recording
  const handleStopRecording = async () => {
    try {
      const result = await recording.stopRecording();
      if (result) {
        setRecordingUri(result.uri);
        setDuration(result.durationMs);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Step 3: Transcribe and analyze
  const handleAnalyze = async () => {
    if (!recordingUri || !duration) {
      console.error('No recording available');
      return;
    }

    try {
      // Transcribe with Whisper
      const transcriptionResult = await transcription.transcribe(recordingUri, {
        language: 'en',
        prompt: expectedText, // Hint for better accuracy
      });

      if (!transcriptionResult) {
        console.error('Transcription failed');
        return;
      }

      // Analyze articulation
      const analysisResult = await analysis.analyze(
        expectedText,
        transcriptionResult,
        duration
      );

      if (analysisResult) {
        console.log('Analysis complete!', analysisResult);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Expected Text */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Read this text:
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>
          {expectedText}
        </Text>
      </View>

      {/* Recording Controls */}
      <View style={{ marginBottom: 20 }}>
        {!recording.isRecording ? (
          <Button
            title="Start Recording"
            onPress={handleStartRecording}
            disabled={recording.isLoading}
          />
        ) : (
          <View>
            <Text style={{ marginBottom: 10 }}>
              Recording: {recording.duration}ms
            </Text>
            <Button
              title="Stop Recording"
              onPress={handleStopRecording}
            />
          </View>
        )}
      </View>

      {/* Analyze Button */}
      {recordingUri && !analysis.result && (
        <View style={{ marginBottom: 20 }}>
          <Button
            title="Analyze My Reading"
            onPress={handleAnalyze}
            disabled={transcription.isTranscribing || analysis.isAnalyzing}
          />
        </View>
      )}

      {/* Loading States */}
      {(transcription.isTranscribing || analysis.isAnalyzing) && (
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>
            {transcription.isTranscribing ? 'Transcribing...' : 'Analyzing...'}
          </Text>
        </View>
      )}

      {/* Analysis Results */}
      {analysis.result && (
        <AnalysisResultsDisplay result={analysis.result} />
      )}

      {/* Errors */}
      {(transcription.error || analysis.error) && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#ffcccc' }}>
          <Text style={{ color: '#cc0000' }}>
            Error: {transcription.error || analysis.error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/**
 * Display Analysis Results
 */
function AnalysisResultsDisplay({ result }: { result: AnalysisResult }) {
  return (
    <View style={{ marginTop: 20 }}>
      {/* Scores */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Your Scores
        </Text>

        <ScoreBar label="Overall" score={result.overallScore} />
        <ScoreBar label="Articulation" score={result.articulationScore} />
        <ScoreBar label="Fluency" score={result.fluencyScore} />

        <Text style={{ marginTop: 10, color: '#666' }}>
          Accuracy: {result.accuracy}% ({result.wordsSpoken}/{result.wordsExpected} words)
        </Text>
      </View>

      {/* Feedback */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Feedback
        </Text>

        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          {result.feedback.summary}
        </Text>

        {result.feedback.strengths.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#2e7d32' }}>
              Strengths:
            </Text>
            {result.feedback.strengths.map((strength, i) => (
              <Text key={i} style={{ marginLeft: 10, color: '#2e7d32' }}>
                • {strength}
              </Text>
            ))}
          </View>
        )}

        {result.feedback.improvements.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#f57c00' }}>
              Areas to Improve:
            </Text>
            {result.feedback.improvements.map((improvement, i) => (
              <Text key={i} style={{ marginLeft: 10, color: '#f57c00' }}>
                • {improvement}
              </Text>
            ))}
          </View>
        )}

        <Text style={{ fontStyle: 'italic', color: '#666', marginTop: 10 }}>
          {result.feedback.encouragement}
        </Text>
      </View>

      {/* Problem Words */}
      {result.problemWords.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Words to Practice
          </Text>

          {result.problemWords.slice(0, 5).map((problem, i) => (
            <View
              key={i}
              style={{
                padding: 10,
                marginBottom: 10,
                backgroundColor: '#f5f5f5',
                borderRadius: 5,
              }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                {problem.word}
              </Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                Issue: {problem.issueType}
              </Text>
              <Text style={{ marginTop: 5 }}>
                {problem.suggestion}
              </Text>
              <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>
                Context: "{problem.context}"
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Next Steps */}
      {result.feedback.nextSteps.length > 0 && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Next Steps
          </Text>
          {result.feedback.nextSteps.map((step, i) => (
            <Text key={i} style={{ marginLeft: 10, marginBottom: 5 }}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Score Bar Component
 */
function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return '#2e7d32'; // Green
    if (score >= 60) return '#f57c00'; // Orange
    return '#c62828'; // Red
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontWeight: 'bold' }}>{label}</Text>
        <Text style={{ fontWeight: 'bold', color: getColor(score) }}>
          {score}/100
        </Text>
      </View>
      <View style={{ height: 20, backgroundColor: '#e0e0e0', borderRadius: 10 }}>
        <View
          style={{
            height: 20,
            width: `${score}%`,
            backgroundColor: getColor(score),
            borderRadius: 10,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Simpler Example: Using Mock Transcription
 *
 * For testing without an OpenAI API key
 */
export function SimpleMockExample() {
  const analysis = useArticulationAnalysis();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const expectedText = "Hello world, how are you today?";

  const handleMockAnalysis = async () => {
    // Import mockTranscribe
    const { mockTranscribe } = await import('@/lib/reading');

    // Generate mock transcription
    const mockTranscription = await mockTranscribe(expectedText, 2.5);

    // Analyze
    const analysisResult = await analysis.analyze(
      expectedText,
      mockTranscription,
      2500
    );

    if (analysisResult) {
      setResult(analysisResult);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Expected: "{expectedText}"
      </Text>

      <Button
        title="Run Mock Analysis"
        onPress={handleMockAnalysis}
        disabled={analysis.isAnalyzing}
      />

      {analysis.isAnalyzing && <ActivityIndicator style={{ marginTop: 20 }} />}

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text>Overall Score: {result.overallScore}/100</Text>
          <Text>Articulation: {result.articulationScore}/100</Text>
          <Text>Fluency: {result.fluencyScore}/100</Text>
          <Text style={{ marginTop: 10 }}>{result.feedback.summary}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Advanced Example: Custom Analysis Configuration
 */
export function AdvancedExample() {
  const analysis = useArticulationAnalysis();

  const handleCustomAnalysis = async (
    expectedText: string,
    audioUri: string,
    duration: number
  ) => {
    // Import transcription function
    const { transcribeWithHint } = await import('@/lib/reading');

    try {
      // Transcribe with custom options
      const transcription = await transcribeWithHint(
        audioUri,
        expectedText,
        'en' // language
      );

      // Analyze with custom handling
      const result = await analysis.analyze(
        expectedText,
        transcription,
        duration
      );

      if (result) {
        // Custom post-processing
        console.log('Analysis complete!');
        console.log('Problem words:', result.problemWords.length);
        console.log('Detailed analysis:', result.analysis);

        // Save to database, update UI, etc.
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Advanced Example - See code for details</Text>
    </View>
  );
}
