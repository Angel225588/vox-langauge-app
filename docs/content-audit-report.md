# Vox Language App -- Content Audit Report

**Date**: 2026-02-11
**Auditor**: content-auditor agent
**Purpose**: Inventory all existing vocabulary, scenarios, grammar, and content across the codebase to inform the Vox Library design.

---

## Executive Summary

The codebase contains a moderate amount of static content, primarily English-Spanish vocabulary and English-only dialogue scenarios. French content is minimal (only 2 of 8 vocabulary themes). Professional/field-specific vocabulary exists for 4 motivations (career, travel, love, education) but is missing for 3 (relocation, challenge, custom). Grammar points are defined generically by stair index (not by language or CEFR level). The word bank module is well-architected with full CRUD, SRS (SM-2 + FSRS), and priority scoring, but contains zero pre-loaded content -- it is a runtime container, not a content source.

---

## 1. Vocabulary Inventory

### 1.1 UNIVERSAL_VOCAB (English -> Spanish)

**Location**: `lib/services/pathGeneration.ts` lines 830-911

| Theme | Word Count | Difficulty Mix | Part of Speech Mix |
|-------|-----------|----------------|-------------------|
| meeting_people | 8 | 8 easy | interjection(2), phrase(4), adverb(1), phrase(1) |
| talking_about_yourself | 8 | 8 easy | verb(2), phrase(2), noun(4) |
| daily_conversations | 8 | 6 easy, 2 medium | adverb(2), noun(2), verb(4) |
| food_and_plans | 8 | 5 easy, 3 medium | noun(4), verb(1), adjective(1), phrase(1), noun(1) |
| expressing_opinions | 8 | 3 easy, 5 medium | phrase(3), conjunction(1), adjective(3), verb(1) |
| asking_questions | 8 | 5 easy, 3 medium | adverb(2), phrase(4), verb(2) |
| handling_problems | 8 | 4 easy, 4 medium | noun(2), phrase(2), adjective(1), verb(3) |
| deeper_conversations | 8 | 2 easy, 6 medium | verb(4), noun(4) |

**Total English-Spanish Universal Vocabulary: 64 words/phrases**

### 1.2 UNIVERSAL_VOCAB_FR (French -> English)

**Location**: `lib/services/pathGeneration.ts` lines 917-938

| Theme | Word Count | Difficulty Mix |
|-------|-----------|----------------|
| meeting_people | 8 | 8 easy |
| daily_conversations | 8 | 6 easy, 2 medium |

**Total French Universal Vocabulary: 16 words/phrases**

**CRITICAL GAP**: Only 2 of 8 themes have French translations. Missing themes:
- talking_about_yourself
- food_and_plans
- expressing_opinions
- asking_questions
- handling_problems
- deeper_conversations

### 1.3 FIELD_VOCAB (Motivation-Specific, English -> Spanish)

**Location**: `lib/services/pathGeneration.ts` lines 943-1030

| Motivation | Themes Covered | Total Words |
|-----------|---------------|-------------|
| career | meeting_people(4), talking_about_yourself(4), daily_conversations(4), expressing_opinions(4) | **16** |
| travel | meeting_people(4), daily_conversations(4), food_and_plans(4), handling_problems(4) | **16** |
| love | meeting_people(4), talking_about_yourself(4), expressing_opinions(4) | **12** |
| education | meeting_people(4), daily_conversations(4) | **8** |

**Total Field-Specific Vocabulary: 52 words/phrases**

**Motivations with ZERO field vocab:**
- relocation (0 words)
- challenge (0 words)
- custom (0 words)

**Field vocab is English->Spanish ONLY. No French field vocabulary exists.**

### 1.4 Vocabulary Totals

| Category | en->es | fr->en | Total |
|----------|--------|--------|-------|
| Universal | 64 | 16 | 80 |
| Field: career | 16 | 0 | 16 |
| Field: travel | 16 | 0 | 16 |
| Field: love | 12 | 0 | 12 |
| Field: education | 8 | 0 | 8 |
| Field: relocation | 0 | 0 | 0 |
| Field: challenge | 0 | 0 | 0 |
| Field: custom | 0 | 0 | 0 |
| **GRAND TOTAL** | **116** | **16** | **132** |

---

## 2. Scenario Inventory

### 2.1 Dialogue Scenarios (Interactive, with full dialogue lines)

**Location**: `lib/scenarios/dialogueScenarios.ts`

| # | ID | Title | Category | Difficulty | Language | Premium | Lines |
|---|-----|-------|----------|------------|----------|---------|-------|
| 1 | greeting-first-meeting | Nice to Meet You | greetings | beginner | en | No | 6 |
| 2 | restaurant-ordering | At the Restaurant | food | beginner | en | No | 8 |
| 3 | asking-directions | Getting Around | travel | beginner | en | No | 6 |
| 4 | small-talk-weather | Weather Chat | social | beginner | en | No | 6 |
| 5 | shopping-clothes | Shopping for Clothes | shopping | intermediate | en | No | 8 |
| 6 | phone-call-appointment | Making an Appointment | daily | intermediate | en | Yes | 8 |
| 7 | emergency-help | Emergency Situations | emergency | beginner | en | No | 6 |
| 8 | job-interview-intro | Job Interview Start | work | intermediate | en | Yes | 8 |
| 9 | making-plans-friends | Making Plans | social | intermediate | en | No | 6 |
| 10 | expressing-opinions | Sharing Your Opinion | social | advanced | en | Yes | 8 |

**Total Dialogue Scenarios: 10**
- Language: English ONLY (no Spanish, no French dialogue scenarios)
- Categories covered: greetings(1), food(1), travel(1), social(3), shopping(1), daily(1), emergency(1), work(1)
- Difficulty: beginner(5), intermediate(4), advanced(1)
- Premium: 3 premium, 7 free

### 2.2 Scenario Templates (Brief, for fallback path generation)

**Location**: `lib/services/pathGeneration.ts` lines 1086-1139

| Motivation | Themes with Scenarios | Scenarios per Theme | Total |
|-----------|----------------------|-------------------|-------|
| career | meeting_people, daily_conversations | 2 each | 4 |
| travel | meeting_people, food_and_plans | 2 each | 4 |
| love | meeting_people, expressing_opinions | 2 each | 4 |
| education | meeting_people, daily_conversations | 2 each | 4 |

**Total Scenario Templates: 16** (across 4 motivations)

**Motivations with ZERO scenario templates:**
- relocation
- challenge
- custom

Each scenario template has: title, description, context, key_phrases[4]

### 2.3 SCENARIOS_BY_CONTEXT (Onboarding Scenario Choices)

**Location**: `hooks/useOnboardingV2.ts` lines 213-294

These are the selectable scenarios users pick during onboarding. They define WHAT users want to practice but have NO associated content (vocabulary or dialogue).

| Profession Context | Scenario Count | Example Scenarios |
|-------------------|---------------|-------------------|
| business | 6 | Pitching Ideas, Negotiating Deals, Leading Meetings, Networking, Client Calls, Professional Emails |
| tech | 6 | Code Reviews, Daily Standups, Tech Presentations, Tech Interviews, Client Demos, Documentation |
| healthcare | 6 | Patient Consultations, Medical History, Colleague Handoffs, Medical Conferences, Emergency Communication, Patient Education |
| legal | 6 | Client Intake, Courtroom Language, Contract Discussion, Depositions, Legal Writing, Mediation |
| education | 6 | Giving Lectures, Student Feedback, Academic Writing, Conference Talks, Parent Meetings, Research Collaboration |
| creative | 6 | Client Briefs, Creative Pitches, Feedback Sessions, Content Creation, Media Interviews, Creative Collaboration |
| hospitality | 6 | Guest Reception, Complaint Handling, Tour Guiding, Restaurant Service, Event Coordination, Travel Advice |
| government | 6 | Diplomatic Meetings, Public Speaking, Policy Discussion, Constituent Services, International Relations, Report Writing |
| student | 6 | Classroom Participation, Study Groups, Class Presentations, Office Hours, Campus Social Life, Job Interviews |
| default | 6 | Daily Conversations, Travel Situations, Making Friends, Professional Meetings, Phone Calls, Social Events |

**Total Selectable Scenario Options: 60** (10 profession contexts x 6 each)

**CRITICAL FINDING**: These 60 scenarios are metadata only. They have NO vocabulary, NO dialogue lines, NO grammar points. They are purely UI labels for onboarding selection.

---

## 3. Grammar Inventory

### 3.1 Grammar Points by Stair Index

**Location**: `lib/services/pathGeneration.ts` lines 1144-1157

| Stair Index | Grammar Points (3 per stair) |
|------------|------------------------------|
| 0 (A1) | Present tense (to be, to have); Basic sentence structure (SVO); Masculine/feminine nouns |
| 1 (A1) | Present tense (regular verbs); Yes/no questions; Possessive adjectives (my, your) |
| 2 (A1-A2) | Present tense (irregular verbs); Prepositions of place and time; Articles (the, a/an) |
| 3 (A2) | Past tense (regular verbs); Time expressions (yesterday, last week); Direct object pronouns |
| 4 (A2-B1) | Past tense (irregular verbs); Comparatives and superlatives; Indirect object pronouns |
| 5 (B1) | Future tense; Conditional expressions (I would like); Reflexive verbs |
| 6 (B1-B2) | Subjunctive mood (basics); Expressing obligation (have to, must); Relative clauses |
| 7 (B2) | Advanced past tenses; Reported speech; Complex sentence connectors |
| 8 (B2-C1) | Subjunctive vs indicative; Passive voice; Hypothetical situations (if I were...) |

**Total Grammar Points: 27** (9 levels x 3 points each)

**Limitations:**
- Language-agnostic (same grammar list for Spanish, French, English)
- Not organized by CEFR level -- organized by stair index position
- No language-specific grammar (e.g., French subjunctive vs Spanish subjunctive)
- No explanations or examples, just labels

---

## 4. PATH_TEMPLATES (Stair Progression Templates)

**Location**: `lib/ai/prompts/pathGeneration.ts` lines 39-138

| Motivation | Stairs in Progression | Focus Areas |
|-----------|----------------------|-------------|
| career | 9 | formal language, professional vocabulary, business phrases |
| travel | 9 | survival phrases, navigation, social interactions |
| love | 9 | casual conversation, emotions, daily life |
| education | 9 | grammar, reading, writing, formal register |
| relocation | 9 | daily life, bureaucracy, integration |
| challenge | 9 | well-rounded skills, confidence building, real-world fluency |
| custom | 9 | personalized learning, real-world scenarios, practical fluency |

**Total Path Templates: 7** (all motivations covered)

These are stair TITLE progressions only, used as guidance for AI generation. No vocabulary or scenario content is attached.

---

## 5. Word Bank Module Architecture

**Location**: `lib/word-bank/` (9 files)

| File | Purpose | Lines |
|------|---------|-------|
| types.ts | BankWord, PriorityFactors, ReviewResult, etc. | 539 |
| schema.ts | SQLite CREATE TABLE, indexes, CEFR/PartOfSpeech enums | 353 |
| storage.ts | CRUD operations, review recording, SM-2 algorithm | 849 |
| priority.ts | Priority calculation (milestoneUrgency*0.3 + weakness*0.4 + recency*0.2 + cefr*0.1) | 431 |
| hooks.ts | useWordBank, useWordPriority, useWordSearch, useReviewSession | 613 |
| migrations.ts | v1 (initial schema) + v2 (FSRS columns) | 449 |
| index.ts | Barrel export of all types, functions, hooks | 128 |

**Key characteristics:**
- Zero pre-loaded vocabulary -- purely a runtime container
- FSRS active (v2 migration adds FSRS columns alongside SM-2)
- New words default to FSRS; SM-2 words auto-migrate on next review
- `algorithm` column: 'sm2' | 'fsrs'
- Supports: addOrReinforceWord (encounter multiplier), category filtering, CEFR level filtering
- 6 indexes for performance (priority, next_review, category, cefr, source, mastery)

---

## 6. Language Coverage Analysis

### 6.1 Target Languages Supported

| Language Pair | Universal Vocab | Field Vocab | Dialogue Scenarios | Path Templates |
|-------------|----------------|-------------|-------------------|----------------|
| en -> es | 64 words | 52 words | 0 | 7 templates |
| fr -> en | 16 words | 0 | 0 | 7 templates |
| en (dialogue) | 0 | 0 | 10 scenarios | 0 |
| es -> en | 0 | 0 | 0 | 0 |
| en -> fr | 0 | 0 | 0 | 0 |
| Any other | 0 | 0 | 0 | 0 |

### 6.2 Accent/Region Support

From `hooks/useOnboardingV2.ts` ACCENT_OPTIONS:
- Spanish: es-latam (Latin American), es-spain (Castilian)
- English: en-american, en-british
- French: fr-france (Parisian), fr-canada (Quebecois)

**No accent-specific vocabulary exists.** All Spanish vocab is neutral (not latam/spain specific). No French regional variants.

---

## 7. CEFR Level Coverage

### 7.1 Vocabulary by Implied CEFR

All existing vocabulary is difficulty-tagged (easy/medium/hard), NOT CEFR-tagged:

| Difficulty | Approx CEFR | Count (Universal+Field) |
|-----------|-------------|------------------------|
| easy | A1-A2 | ~95 words (72%) |
| medium | A2-B1 | ~37 words (28%) |
| hard | B2+ | 0 words (0%) |

**Gap**: Zero B2, C1, or C2 vocabulary. The entire static content library is beginner/elementary level.

### 7.2 Scenarios by CEFR

| Difficulty | Count |
|-----------|-------|
| beginner (A1-A2) | 5 dialogue scenarios |
| intermediate (B1-B2) | 4 dialogue scenarios |
| advanced (C1+) | 1 dialogue scenario |

---

## 8. Profession Coverage Gap Analysis

### 8.1 Professions with Content vs Metadata Only

| Profession | Onboarding Scenarios | Field Vocab | Scenario Templates | Status |
|-----------|---------------------|-------------|-------------------|--------|
| business | 6 scenarios | 16 words (as "career") | 4 templates | PARTIAL |
| tech | 6 scenarios | 0 | 0 | METADATA ONLY |
| healthcare | 6 scenarios | 0 | 0 | METADATA ONLY |
| legal | 6 scenarios | 0 | 0 | METADATA ONLY |
| education | 6 scenarios | 8 words | 4 templates | PARTIAL |
| creative | 6 scenarios | 0 | 0 | METADATA ONLY |
| hospitality | 6 scenarios | 0 | 0 | METADATA ONLY |
| government | 6 scenarios | 0 | 0 | METADATA ONLY |
| student | 6 scenarios | 0 | 0 | METADATA ONLY |

**6 of 9 professions have ZERO vocabulary and ZERO scenario content.**

### 8.2 Motivation Coverage

| Motivation | Path Template | Universal Vocab | Field Vocab | Scenario Templates |
|-----------|--------------|----------------|-------------|-------------------|
| career | 9 stairs | 64 (shared) | 16 | 4 |
| travel | 9 stairs | 64 (shared) | 16 | 4 |
| love | 9 stairs | 64 (shared) | 12 | 4 |
| education | 9 stairs | 64 (shared) | 8 | 4 |
| relocation | 9 stairs | 64 (shared) | 0 | 0 |
| challenge | 9 stairs | 64 (shared) | 0 | 0 |
| custom | 9 stairs | 64 (shared) | 0 | 0 |

---

## 9. Content Quality Assessment

### Strengths
1. **Universal vocabulary is well-structured**: 8 themes x 8 words, each with word, translation, part_of_speech, difficulty, example_sentence, example_translation
2. **Dialogue scenarios are production-quality**: 10 scenarios with speaker tags, pronunciation tips, key vocabulary, estimated duration
3. **Blended learning model is sound**: 60% universal + 40% field-specific per stair is a good architecture
4. **Word bank module is excellent**: Full CRUD, FSRS+SM-2, priority algorithm, React hooks, migrations -- best module in codebase
5. **Grammar progression is logical**: Present tense -> Past -> Future -> Subjunctive follows standard CEFR progression

### Weaknesses
1. **French content is 87.5% missing**: Only 2 of 8 vocabulary themes have French translations
2. **No hard/advanced vocabulary**: 100% of static content is easy/medium difficulty
3. **Profession content is hollow**: 6 of 9 professions have onboarding UI but zero learning content
4. **Grammar is language-agnostic**: Same 27 points used regardless of target language
5. **Dialogue scenarios are English-only**: No Spanish or French interactive dialogues
6. **No scenario-vocabulary linking**: Scenarios and vocabulary exist in separate silos with no cross-references
7. **Accent-specific content missing**: 6 accent options in UI, zero accent-specific vocabulary
8. **AI generates 100% of real content**: Static content only serves as fallback; AI (Gemini) generates all personalized paths

---

## 10. Migration Plan for Vox Library

### 10.1 What Can Be Pre-Built (Static Content for Vox Library)

| Content Type | Source | Action |
|-------------|--------|--------|
| 64 en->es universal words | UNIVERSAL_VOCAB | Migrate to Vox Library as seed content, add CEFR tags |
| 16 fr->en universal words | UNIVERSAL_VOCAB_FR | Migrate, then expand to all 8 themes |
| 52 field-specific words | FIELD_VOCAB | Migrate with profession + theme tags |
| 10 dialogue scenarios | ESSENTIAL_SCENARIOS | Migrate as scenario templates |
| 16 scenario templates | scenarioTemplates (pathGeneration.ts) | Migrate with profession linking |
| 27 grammar points | grammarByLevel | Migrate with CEFR tags, add language-specific variants |

### 10.2 What AI Must Fill In

| Gap | Scope | Priority |
|-----|-------|----------|
| Missing French vocabulary (6 themes) | ~48 words needed | HIGH |
| Missing field vocab (relocation, challenge, custom) | ~48 words needed | MEDIUM |
| Missing profession vocab (tech, healthcare, legal, creative, hospitality, government) | ~96 words needed (16 per profession) | HIGH |
| Spanish/French dialogue scenarios | ~20 scenarios needed | HIGH |
| Advanced (B2+) vocabulary | ~100+ words needed | MEDIUM |
| Accent-specific vocabulary | Variable per accent | LOW |
| Language-specific grammar explanations | ~54 needed (27 x 2 languages) | MEDIUM |

### 10.3 Architecture Recommendation

The Vox Library should:
1. **Absorb all static content** from pathGeneration.ts into a structured database/JSON
2. **Tag everything** with: language, CEFR level, profession, theme, scenario linkage
3. **Bridge the scenario gap**: Link the 60 onboarding scenarios to actual vocabulary and dialogue content
4. **Make AI a "filler", not the sole creator**: Pre-build enough content for reliable fallbacks; AI enhances and personalizes
5. **Build on the word bank module**: It is the best-architected module -- use its patterns (CRUD, SRS, priority) as the foundation

---

## 11. Quick Reference Numbers

| Metric | Count |
|--------|-------|
| Total static vocabulary items | 132 |
| English->Spanish vocabulary | 116 |
| French->English vocabulary | 16 |
| Dialogue scenarios (full interactive) | 10 |
| Scenario templates (brief) | 16 |
| Selectable profession scenarios (metadata only) | 60 |
| Grammar points | 27 |
| Path templates | 7 |
| Target languages supported | 3 (en, es, fr) |
| Accent options | 6 (2 per language) |
| Professions with content | 3 (career/business, travel, education) |
| Professions metadata-only | 6 |
| CEFR levels with content | 2 (A1-A2 approx) |
| CEFR levels without content | 4 (B1, B2, C1, C2) |
