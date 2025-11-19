# Vox Language App - Future Features Roadmap

This document outlines features planned for future phases after MVP launch.

## Phase 8: Video/Audio Practice Sessions (Livekit Integration)

### Overview
Implement Omegle-style peer-to-peer practice sessions where users can practice with each other on weekends or during designated practice times.

### Core Features

**1. Matching System**
- Match users based on:
  - Target language (must match)
  - Proficiency level (similar or complementary)
  - Interests (bonus points for shared interests)
  - Availability (time zones)
  - Practice goals (casual chat, interview prep, etc.)

**2. Session Types**
- **Video Call**: Full video + audio
- **Audio Only**: Voice-only practice (for shy users)
- **Text Chat**: Fallback if connection is poor

**3. In-Session Features**
- Conversation prompts (based on user's practice history)
- Vocabulary hints
- Recording option (with both users' consent)
- Time tracker (earn points for time spent)
- Background noise suppression
- Auto-translation (emergency help button)

**4. Post-Session**
- Mutual feedback (rate each other)
- AI analysis of conversation (vocabulary used, fluency, etc.)
- Points awarded based on time spent
- Save recording for personal review

### Technical Implementation

**Technology: LiveKit (Open Source)**

**Advantages:**
- Self-hostable (control costs)
- WebRTC-based (low latency)
- React Native SDK available
- Scalable architecture

**Infrastructure Requirements:**
- VPS Server (4GB RAM minimum)
- Domain with SSL certificate
- TURN server for NAT traversal
- Load balancer for scaling

**Setup Steps:**
1. Provision server (DigitalOcean, AWS, etc.)
2. Install LiveKit server
3. Configure TURN server (coturn)
4. Set up SSL with Let's Encrypt
5. Deploy matchmaking service
6. Integrate React Native SDK

**Estimated Costs:**
- Server: $20-50/month (scales with users)
- Domain: $10/year
- SSL: Free (Let's Encrypt)

### Matchmaking Algorithm

```typescript
interface MatchCriteria {
  userId: string;
  targetLanguage: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  availability: {
    dayOfWeek: number;
    startHour: number;
    endHour: number;
  };
  preferredMode: 'video' | 'audio' | 'either';
}

function findMatch(user: MatchCriteria, waitingUsers: MatchCriteria[]): MatchCriteria | null {
  // Priority 1: Same language
  let candidates = waitingUsers.filter(u => u.targetLanguage === user.targetLanguage);

  // Priority 2: Compatible levels
  candidates = candidates.filter(u => {
    if (user.level === 'beginner') return u.level === 'beginner' || u.level === 'intermediate';
    if (user.level === 'intermediate') return true; // Can match with anyone
    if (user.level === 'advanced') return u.level === 'intermediate' || u.level === 'advanced';
  });

  // Priority 3: Shared interests (score-based)
  const scored = candidates.map(c => ({
    user: c,
    score: c.interests.filter(i => user.interests.includes(i)).length
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.user || null;
}
```

### Database Schema Additions

```sql
-- Practice sessions table
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES profiles(id),
  participant2_id UUID REFERENCES profiles(id),
  room_id TEXT NOT NULL,
  session_type TEXT CHECK (session_type IN ('video', 'audio', 'text')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session feedback
CREATE TABLE session_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES practice_sessions(id),
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waiting queue
CREATE TABLE practice_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  target_language TEXT,
  level TEXT,
  interests TEXT[],
  preferred_mode TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

---

## Phase 9: AI Conversation Agent (Loora-Style)

### Overview
Allow users to have voice/text conversations with an AI agent tailored to their learning level and goals.

### Core Features

**1. Conversational AI**
- Natural back-and-forth dialogue
- Adapts difficulty to user level
- Asks follow-up questions
- Provides gentle corrections
- Encourages more speaking/writing

**2. Credit System**
- Daily free credits (e.g., 10 minutes)
- Premium users get unlimited
- Progress bar shows remaining time
- Warns at 2 minutes remaining

**3. Session Types**
- **Casual Chat**: Open-ended conversation
- **Interview Prep**: Mock job interviews
- **Presentation Practice**: Public speaking practice
- **Debate**: Argue a point of view
- **Story Telling**: User tells a story, AI listens

**4. Real-time Feedback**
- Pronunciation correction
- Grammar suggestions (gentle)
- Vocabulary recommendations
- Fluency scoring

### Technical Implementation

**Technology Stack:**
- **Gemini AI**: Conversation generation
- **expo-speech**: Text-to-speech
- **@react-native-voice/voice**: Speech-to-text
- **Azure Speech Services** (optional): Better pronunciation assessment

**Implementation:**

```typescript
interface ConversationSession {
  id: string;
  userId: string;
  sessionType: 'casual' | 'interview' | 'presentation' | 'debate' | 'story';
  targetLanguage: string;
  difficulty: 'easy' | 'medium' | 'hard';
  messages: ConversationMessage[];
  creditsUsed: number;
  startedAt: Date;
  endedAt?: Date;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  feedback?: {
    pronunciation: string[];
    grammar: string[];
    vocabulary: string[];
  };
}

// Generate AI response
async function getAIResponse(
  sessionHistory: ConversationMessage[],
  userLevel: string,
  sessionType: string
): Promise<string> {
  const prompt = buildConversationPrompt(sessionHistory, userLevel, sessionType);

  const result = await gemini.generateContent(prompt);
  return result.response.text();
}
```

**Credit Tracking:**

```typescript
async function trackCreditUsage(userId: string, seconds: number) {
  const minutesUsed = seconds / 60;

  await supabase
    .from('ai_conversation_usage')
    .insert({
      user_id: userId,
      minutes_used: minutesUsed,
      date: new Date().toISOString().split('T')[0],
    });

  // Check daily limit
  const { data } = await supabase
    .from('ai_conversation_usage')
    .select('minutes_used')
    .eq('user_id', userId)
    .eq('date', new Date().toISOString().split('T')[0]);

  const totalToday = data?.reduce((sum, item) => sum + item.minutes_used, 0) || 0;

  return {
    used: totalToday,
    remaining: Math.max(0, 10 - totalToday), // 10 minute daily limit
  };
}
```

---

## Phase 10: "Better to Say" Vocabulary Enhancement Game

### Overview
Help users expand vocabulary by suggesting better/more natural ways to express themselves.

### Core Features

**1. Input Methods**
- Type a word or phrase
- Speak a sentence (voice input)
- Select from recent conversations

**2. Suggestion Modes**
- **Formal**: Professional/academic contexts
- **Casual**: Everyday conversation
- **Funny/Slang**: Informal, humorous
- **Professional**: Business settings
- **Poetic/Expressive**: Creative writing

**3. Learning Integration**
- Add suggested words to flashcards
- Track new vocabulary learned
- Quiz on better alternatives
- Show usage examples

**4. Community Contributions**
- Users can suggest alternatives
- Voting system for best suggestions
- Native speakers can contribute

### Implementation

**UI Flow:**

```
┌───────────────────────┐
│ Better to Say         │
├───────────────────────┤
│ Enter phrase:         │
│ [I am very tired___]  │
│                       │
│ Filter: [Casual ▼]    │
│                       │
│ 💡 Better alternatives:│
│  ⭐⭐⭐ I'm exhausted  │
│  ⭐⭐ I'm beat        │
│  ⭐ I'm wiped out     │
│                       │
│ [Add to Flashcards]   │
│ [Try Another]         │
└───────────────────────┘
```

**AI Integration:**

```typescript
async function getBetterAlternatives(
  phrase: string,
  context: 'formal' | 'casual' | 'funny' | 'professional' | 'poetic',
  targetLanguage: string
): Promise<Alternative[]> {
  const prompt = `
    User said: "${phrase}"
    Context: ${context}
    Language: ${targetLanguage}

    Suggest 5 better alternatives that are more natural or appropriate.
    For each, provide:
    1. The alternative phrase
    2. Rating (1-3 stars for how much better it is)
    3. Brief explanation why it's better
    4. Example sentence using it
  `;

  const result = await gemini.generateContent(prompt);
  return parseAlternatives(result.response.text());
}
```

---

## Phase 11: Podcasting & User-Generated Content

### Overview
Allow users to create and share educational content with the community.

### Core Features

**1. Content Types**
- **Reading Practice**: User-recorded stories
- **Podcasts**: Multi-episode series on topics
- **Lessons**: User-created mini-lessons
- **Tips & Tricks**: Short advice videos/audio

**2. Creation Tools**
- Built-in audio editor (trim, fade)
- Script teleprompter
- Background music library
- Intro/outro templates

**3. Discovery**
- Browse by topic
- Search by level
- Trending content
- Recommended based on interests

**4. Monetization (Optional Future)**
- Premium user content
- Tips/donations to creators
- Revenue sharing model

### Database Schema

```sql
CREATE TABLE user_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('reading', 'podcast', 'lesson', 'tip')),
  media_url TEXT NOT NULL,
  duration_seconds INTEGER,
  difficulty TEXT,
  topic TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES user_content(id),
  episode_number INTEGER,
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Phase 12: Advanced Games

### 1. Drag-and-Drop Matching
- More interactive than tap-to-match
- Smooth animations with Reanimated
- Timed challenges for extra points

### 2. Sentence Building
- Arrange words in correct order
- Grammar-focused
- Multiple difficulty levels

### 3. Picture Description
- Show image, user describes in target language
- AI evaluates description quality
- Suggests better vocabulary

### 4. Memory/Concentration
- Classic card-flipping game
- Match pairs (image-word, word-translation)
- Multiplayer mode (compete with friends)

---

## Phase 13: Social Features Expansion

### 1. Study Groups
- Create private groups
- Shared progress tracking
- Group challenges
- Scheduled practice sessions

### 2. Mentorship Program
- Advanced users mentor beginners
- Structured curriculum
- Achievement badges for mentors

### 3. Language Exchange
- Match native speakers of different languages
- Each helps the other learn
- Integrated translation tools

---

## Phase 14: Adaptive Learning AI

### Machine Learning Features

**1. Personalized Difficulty**
- AI adjusts content difficulty in real-time
- Based on success rate and time taken
- Predicts optimal review intervals

**2. Learning Style Detection**
- Visual learner → more images
- Auditory learner → more audio content
- Kinesthetic learner → more interactive games

**3. Vocabulary Prioritization**
- ML predicts which words user will need
- Based on goals, interests, and real-world usage
- Frequency analysis of user's target contexts

**4. Adaptive Spaced Repetition**
- ML-enhanced version of SM-2
- Considers individual forgetting curve
- Optimizes review schedule per user

---

## Implementation Priority

### High Priority (After MVP)
1. ✅ **Video/Audio Practice Sessions** - Core differentiator
2. ✅ **AI Conversation Agent** - Major user value

### Medium Priority
3. **"Better to Say" Game** - Unique vocabulary feature
4. **Podcasting/UGC** - Community growth

### Low Priority (Nice to Have)
5. Advanced Games
6. Social Features Expansion
7. Adaptive Learning AI

---

## Technical Debt & Infrastructure

### Before Scaling
- [ ] Set up CI/CD pipeline
- [ ] Implement error tracking (Sentry)
- [ ] Add analytics (Mixpanel/Amplitude)
- [ ] Performance monitoring (New Relic)
- [ ] Automated testing (Jest, Detox)
- [ ] Load testing for backend
- [ ] CDN for media assets
- [ ] Database backups automation
- [ ] Rate limiting on APIs
- [ ] Security audit

---

**Last Updated**: 2025-11-19
**Status**: Planning Phase
**Next Review**: After MVP Launch
