# Gemini Tasks: Motivation Data Integration

**Date Created**: November 24, 2025
**Priority**: HIGH
**Estimated Time**: 90-120 minutes

## Context

We just added a new "Your Why Matters" motivation screen to onboarding (Step 4 of 5). This collects deep motivational insights from users:
- Why they want to learn English
- Their biggest fear/frustration
- What's at stake if they don't succeed
- Timeline/deadline (optional)

**Your mission**: Integrate this motivation data into the database and enhance the Gemini AI staircase generation to create truly personalized learning paths.

---

## Task 1: Update Database Schema (30 min)

### 1.1 Add motivation_data Column to Supabase

**File to update**: Create new migration or update existing schema

Add `motivation_data` JSONB column to `user_onboarding_profiles` table:

```sql
ALTER TABLE user_onboarding_profiles
ADD COLUMN motivation_data JSONB;

-- Add comment
COMMENT ON COLUMN user_onboarding_profiles.motivation_data IS
'User''s deep motivations: why, fear, stakes, timeline. Used for AI personalization.';

-- Example data structure:
-- {
--   "why": "I want to get a job abroad and connect with international colleagues",
--   "fear": "I'm afraid I'll freeze up when speaking in front of others",
--   "stakes": "I'll miss out on better career opportunities",
--   "timeline": "3 months"
-- }
```

**Row-Level Security**: Ensure existing RLS policies cover this column. Users should only read their own motivation data.

**Validation**: Test that JSONB structure is saved correctly.

---

### 1.2 Update TypeScript Types

**File**: `/lib/api/staircases.ts`

Update the `OnboardingProfile` interface to include motivation_data:

```typescript
interface OnboardingProfile {
  learning_goal: string;
  proficiency_level: string;
  daily_time_minutes: number;
  scenarios: string[];
  motivation_data?: {
    why: string;
    fear: string;
    stakes: string;
    timeline: string;
  };
}
```

Update the `completeOnboarding` function to accept and save motivation_data:

```typescript
export async function completeOnboarding(
  userId: string,
  profile: OnboardingProfile
): Promise<{ success: boolean; staircase?: any; error?: string }> {
  // ... existing code ...

  // Make sure motivation_data is included in the insert
  const { data: profileData, error: profileError } = await supabase
    .from('user_onboarding_profiles')
    .insert({
      user_id: userId,
      learning_goal: profile.learning_goal,
      proficiency_level: profile.proficiency_level,
      daily_time_minutes: profile.daily_time_minutes,
      scenarios: profile.scenarios,
      motivation_data: profile.motivation_data, // NEW
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  // ... rest of code ...
}
```

**Test**: Call completeOnboarding with sample motivation_data and verify it saves to database.

---

## Task 2: Enhance Gemini Staircase Prompt (45 min)

### 2.1 Update Staircase Generator Prompt

**File**: `/lib/gemini/staircase-generator.ts`

**Current prompt** (approximately):
```typescript
const prompt = `Create a personalized English learning staircase for:
- Goal: ${learningGoal}
- Level: ${proficiencyLevel}
- Time: ${dailyTimeMinutes} minutes/day
- Scenarios: ${scenarios.join(', ')}

Generate 8-12 steps...`;
```

**Enhanced prompt** (with motivation data):

```typescript
export async function generatePersonalizedStaircase(
  userId: string,
  profile: OnboardingProfile
): Promise<StaircaseData> {
  const { learning_goal, proficiency_level, daily_time_minutes, scenarios, motivation_data } = profile;

  // Build enhanced prompt with motivation insights
  const prompt = `You are an expert English learning coach. Create a deeply personalized learning staircase for this user.

## USER PROFILE

**Learning Goal**: ${learning_goal}
**Current Level**: ${proficiency_level}
**Daily Time**: ${daily_time_minutes} minutes per day
**Focus Scenarios**: ${scenarios.join(', ')}

## DEEP MOTIVATIONS (Most Important!)

**Why they want this**: "${motivation_data?.why || 'General interest in improving English'}"

**Their biggest fear**: "${motivation_data?.fear || 'No specific fears mentioned'}"

**What's at stake**: "${motivation_data?.stakes || 'Personal development'}"

**Timeline**: ${motivation_data?.timeline || 'No specific deadline'}

## YOUR MISSION

Using their motivations above, create a staircase (8-12 steps) that:

1. **Addresses their fear directly** - If they fear speaking, include early speaking practice with low-pressure scenarios
2. **Keeps their "why" visible** - Reference their motivation in step descriptions
3. **Respects their timeline** - If urgent (e.g., "3 months"), pace content faster
4. **Matches their stakes** - High stakes = more intensive; low stakes = more exploratory

## PERSONALIZATION EXAMPLES

If fear = "freeze up when speaking":
→ Include early steps with recorded practice (not live)
→ Build confidence gradually before live conversation scenarios

If why = "job interviews abroad":
→ Prioritize professional vocabulary
→ Include interview-specific scenarios early
→ Add cultural workplace phrases

If stakes = "miss out on opportunities":
→ Frame encouragement around opportunity: "This unlocks new doors for you"
→ Higher urgency tone in descriptions

If timeline = "3 months":
→ Compress 12 steps into faster pacing
→ Mark steps as "Week 1-2", "Week 3-4", etc.

## OUTPUT FORMAT

Return a JSON object with this structure:
{
  "title": "Your Path to [their goal]", // Personalized title
  "description": "Designed for someone who [reference their why]",
  "total_steps": 10,
  "estimated_weeks": 8,
  "steps": [
    {
      "step_number": 1,
      "title": "Breaking the Ice with Basic Greetings",
      "description": "Start building confidence without pressure. Perfect for overcoming [reference their fear].",
      "target_vocabulary_count": 15,
      "estimated_minutes": ${daily_time_minutes},
      "focus_areas": ["greetings", "introductions"],
      "motivation_note": "Remember: This is your first step toward [their goal]!"
    },
    // ... 9-11 more steps
  ]
}

**CRITICAL**:
- Use their exact words from motivation_data in descriptions (makes it feel personal)
- First 2 steps should address their fear
- Last 2 steps should celebrate their progress toward their goal
- If no motivation_data provided, create a solid generic path`;

  // Call Gemini API with enhanced prompt
  const result = await model.generateContent(prompt);

  // ... parse and return JSON ...
}
```

**Key improvements**:
1. Motivation data is the **star** of the prompt
2. Specific guidance on how to use fear, why, stakes, timeline
3. Examples show Gemini how to personalize
4. Output includes `motivation_note` field in each step
5. Fallback to generic path if no motivation data

---

### 2.2 Add Motivation References to Stair Steps

**Database update**: Add `motivation_note` column to `staircase_steps` table (optional):

```sql
ALTER TABLE staircase_steps
ADD COLUMN motivation_note TEXT;

COMMENT ON COLUMN staircase_steps.motivation_note IS
'Personalized encouragement referencing user''s motivation. E.g., "This brings you closer to your dream job!"';
```

**Why**: Each step can include a personalized note that references the user's "why" or "stakes". This keeps motivation visible throughout learning.

**Example**:
```
Step 3: "Job Interview Basics"
motivation_note: "You're building the skills you need to confidently interview abroad!"
```

Display this in the lesson UI to remind users why they're doing this.

---

## Task 3: Testing & Validation (15 min)

### 3.1 Test Complete Flow

1. **Start fresh onboarding**:
   - Go through Steps 1-4
   - Fill out motivation screen with sample data:
     ```
     Why: "I want to move to Canada for better tech jobs"
     Fear: "I'm scared of video interviews in English"
     Stakes: "I'll be stuck in my current low-paying role"
     Timeline: "6 months"
     ```
   - Complete scenarios

2. **Check database**:
   - Query `user_onboarding_profiles` → verify `motivation_data` JSONB is saved
   - Query `user_staircases` → verify staircase was generated
   - Query `staircase_steps` → verify steps reference motivation (check descriptions/motivation_note)

3. **Review generated staircase**:
   - Do early steps address "fear of video interviews"? (e.g., recorded practice first)
   - Does description mention "tech jobs" or "Canada"?
   - Is pacing appropriate for "6 months" timeline?
   - Are `motivation_note` fields populated with personalized encouragement?

4. **Test skip flow**:
   - Start new onboarding
   - Click "Skip for now" on motivation screen
   - Verify generic answers are used
   - Verify staircase is still generated (just less personalized)

---

### 3.2 Error Handling

Ensure graceful degradation if:
- Gemini API fails → use fallback generic staircase
- motivation_data is missing → generate without it
- motivation_data has empty strings → treat as skipped

---

## Task 4: Documentation (10 min)

### 4.1 Update API Documentation

**File**: `/docs/API.md` (or relevant file)

Document the new motivation_data field:

```markdown
## POST /api/onboarding/complete

Completes user onboarding and generates personalized staircase.

**Request Body**:
```json
{
  "user_id": "uuid",
  "learning_goal": "job_interview",
  "proficiency_level": "intermediate",
  "daily_time_minutes": 20,
  "scenarios": ["interview_introduction", "interview_experience"],
  "motivation_data": {
    "why": "I want to confidently interview for remote jobs",
    "fear": "I freeze up when speaking under pressure",
    "stakes": "I'll miss out on international opportunities",
    "timeline": "3 months"
  }
}
```

**Response**:
- Success: Returns generated staircase with personalized steps
- Error: Returns error message
```
```

---

### 4.2 Add Code Comments

Add clear comments in:
- `completeOnboarding()` → "Uses motivation_data to enhance AI personalization"
- `generatePersonalizedStaircase()` → "Motivation insights drive staircase customization"
- Database schema → Comment on motivation_data column purpose

---

## Task 5: Optional Enhancements (20 min)

### 5.1 Add Motivation to Daily Encouragement

When user opens app, show a motivational message based on their "why":

```typescript
export function getDailyMotivation(motivationData?: MotivationData): string {
  if (!motivationData?.why) {
    return "Keep practicing! Consistency is key.";
  }

  const messages = [
    `Remember why you started: ${motivationData.why}`,
    `Every lesson brings you closer to: ${motivationData.stakes}`,
    `You're overcoming ${motivationData.fear} one step at a time!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
```

Display this on home screen or at start of lessons.

---

### 5.2 Add Motivation Edit to Profile

**File**: Create `/app/(tabs)/profile.tsx` section

Allow users to edit their motivation answers:
- Button: "Edit My Why"
- Opens modal or navigates to edit screen
- Pre-fills with existing answers
- Saves back to database
- Optionally: "Regenerate staircase with new motivation" button

---

## Success Criteria

### Must Have ✅
- [ ] `motivation_data` column added to `user_onboarding_profiles` table
- [ ] `completeOnboarding()` function saves motivation_data
- [ ] Gemini prompt enhanced with motivation insights
- [ ] Test shows personalized staircase references motivation
- [ ] Skip flow works (uses generic answers)

### Nice to Have ⭐
- [ ] `motivation_note` field added to `staircase_steps`
- [ ] Daily motivation messages reference user's "why"
- [ ] Profile section allows editing motivation
- [ ] Documentation updated

---

## Files You'll Modify

1. **Database schema** (SQL migration)
2. `/lib/api/staircases.ts` (completeOnboarding function)
3. `/lib/gemini/staircase-generator.ts` (enhance prompt)
4. `/docs/API.md` (optional - documentation)

---

## Tips & Guidance

### Gemini Prompt Engineering
- Be explicit about how to use each field (why, fear, stakes, timeline)
- Give examples in the prompt ("If fear = X, then do Y")
- Use user's exact words in generated content (feels more personal)
- Remind Gemini to address fear early in staircase

### Testing Strategy
- Test with rich motivation data first (full answers)
- Then test with skipped data (generic answers)
- Compare both staircases → personalized one should be noticeably different

### Privacy
- motivation_data is sensitive personal information
- Ensure RLS policies protect it
- Never share with other users
- Consider adding note in UI: "Only you can see this"

---

## Questions?

If anything is unclear:
1. Check existing code in `/lib/gemini/staircase-generator.ts` for prompt structure
2. Look at `/lib/api/staircases.ts` for onboarding flow
3. Review `motivation.tsx` screen to see data structure
4. Ask Angel for clarification if needed

**Your work will make this app truly personalized and motivating for users. Let's do this! 🚀**

---

**Deadline**: Complete before next session
**Priority**: HIGH - This unlocks truly personalized learning paths
**Estimated Time**: 90-120 minutes total

Good luck, Gemini! 💪
