/**
 * ComparisonCardV2 Example Usage
 *
 * IMPORTANT RULES:
 * 1. MAX 2 ITEMS per card! Never more - users shouldn't need to scroll.
 * 2. NOT for direct translations! Only for comparing similar sounds.
 * 3. Use sequences for 3+ tenses (go/went, then went/gone)
 *
 * Use cases:
 * - Verb tenses (go/went, went/gone)
 * - Homophones (there/their, their/they're)
 * - Similar words that are often confused (affect/effect)
 * - Formal vs informal variations
 * - Regional differences (US vs UK English)
 */

import React from 'react';
import { ComparisonCardV2 } from './ComparisonCardV2';

// =============================================================================
// EXAMPLE 1: Verb Tenses - Go vs Went (Present/Past)
// =============================================================================
export const VerbTenseGoPresentPastExample = () => (
  <ComparisonCardV2
    type="verb-tense"
    items={[
      {
        label: 'Present',
        word: 'go',
        phonetic: '/ɡoʊ/',
        nativeApprox: 'góu',
        definition: 'Base form - action happening now or regularly',
        example: {
          text: 'I go to the gym every morning.',
          translation: 'Voy al gimnasio cada mañana.',
        },
      },
      {
        label: 'Past',
        word: 'went',
        phonetic: '/wɛnt/',
        nativeApprox: 'uent',
        definition: 'Irregular past - action completed in the past',
        example: {
          text: 'Yesterday, I went to the beach.',
          translation: 'Ayer, fui a la playa.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Verb tense rated:', quality)}
  />
);

// =============================================================================
// EXAMPLE 2: Verb Tenses - Went vs Gone (Past/Past Participle) - Sequence
// =============================================================================
export const VerbTenseGoPastParticipleExample = () => (
  <ComparisonCardV2
    type="verb-tense"
    items={[
      {
        label: 'Past',
        word: 'went',
        phonetic: '/wɛnt/',
        nativeApprox: 'uent',
        definition: 'Irregular past - action completed in the past',
        example: {
          text: 'Yesterday, I went to the beach.',
          translation: 'Ayer, fui a la playa.',
        },
      },
      {
        label: 'Past Participle',
        word: 'gone',
        phonetic: '/ɡɔːn/',
        nativeApprox: 'gon',
        definition: 'Used with have/has for perfect tenses',
        example: {
          text: 'She has gone home already.',
          translation: 'Ella ya se ha ido a casa.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Verb tense rated:', quality)}
  />
);

// =============================================================================
// EXAMPLE 3: Homophones - There vs Their
// =============================================================================
export const HomophoneThereTheirExample = () => (
  <ComparisonCardV2
    type="homophone"
    items={[
      {
        label: 'Place',
        word: 'there',
        phonetic: '/ðɛr/',
        nativeApprox: 'der',
        definition: 'Indicates a location or position',
        example: {
          text: 'The book is over there on the table.',
          translation: 'El libro está allí sobre la mesa.',
        },
      },
      {
        label: 'Possession',
        word: 'their',
        phonetic: '/ðɛr/',
        nativeApprox: 'der',
        definition: 'Shows something belongs to them',
        example: {
          text: 'Their car is parked outside.',
          translation: 'Su carro está estacionado afuera.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Homophone rated:', quality)}
  />
);

// =============================================================================
// EXAMPLE 4: Homophones - Their vs They're (Sequence)
// =============================================================================
export const HomophoneTheirTheyreExample = () => (
  <ComparisonCardV2
    type="homophone"
    items={[
      {
        label: 'Possession',
        word: 'their',
        phonetic: '/ðɛr/',
        nativeApprox: 'der',
        definition: 'Shows something belongs to them',
        example: {
          text: 'Their car is parked outside.',
          translation: 'Su carro está estacionado afuera.',
        },
      },
      {
        label: 'They + Are',
        word: "they're",
        phonetic: '/ðɛr/',
        nativeApprox: 'der',
        definition: 'Contraction of "they are"',
        example: {
          text: "They're coming to the party tonight.",
          translation: 'Ellos vienen a la fiesta esta noche.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Homophone rated:', quality)}
  />
);

// =============================================================================
// EXAMPLE 5: Similar Words - Affect vs Effect
// =============================================================================
export const SimilarAffectEffectExample = () => (
  <ComparisonCardV2
    type="similar-words"
    items={[
      {
        label: 'Verb',
        word: 'affect',
        phonetic: '/əˈfɛkt/',
        nativeApprox: 'a-FECT',
        definition: 'To influence or cause change (action word)',
        example: {
          text: 'The rain will affect our outdoor plans.',
          translation: 'La lluvia afectará nuestros planes.',
        },
      },
      {
        label: 'Noun',
        word: 'effect',
        phonetic: '/ɪˈfɛkt/',
        nativeApprox: 'i-FECT',
        definition: 'The result or outcome of a change',
        example: {
          text: 'The effect of exercise is better health.',
          translation: 'El efecto del ejercicio es mejor salud.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Similar words rated:', quality)}
  />
);

// =============================================================================
// EXAMPLE 6: Homophones - To vs Too
// =============================================================================
export const HomophoneToTooExample = () => (
  <ComparisonCardV2
    type="homophone"
    items={[
      {
        label: 'Direction',
        word: 'to',
        phonetic: '/tuː/',
        nativeApprox: 'tu',
        definition: 'Indicates direction or purpose',
        example: {
          text: "I'm going to the store.",
          translation: 'Voy a la tienda.',
        },
      },
      {
        label: 'Also/Excess',
        word: 'too',
        phonetic: '/tuː/',
        nativeApprox: 'tu',
        definition: 'Means "also" or "excessively"',
        example: {
          text: 'This coffee is too hot to drink.',
          translation: 'Este café está muy caliente para beber.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Homophone rated:', quality)}
  />
);

// =============================================================================
// EXAMPLE 7: Verb Tenses - Eat vs Ate
// =============================================================================
export const VerbTenseEatAteExample = () => (
  <ComparisonCardV2
    type="verb-tense"
    items={[
      {
        label: 'Present',
        word: 'eat',
        phonetic: '/iːt/',
        nativeApprox: 'iit',
        definition: 'Base form - consuming food now or regularly',
        example: {
          text: 'I eat breakfast at 7am.',
          translation: 'Desayuno a las 7am.',
        },
      },
      {
        label: 'Past',
        word: 'ate',
        phonetic: '/eɪt/',
        nativeApprox: 'éit',
        definition: 'Irregular past - consumed food before',
        example: {
          text: 'I ate too much pizza last night.',
          translation: 'Comí demasiada pizza anoche.',
        },
      },
    ]}
    onComplete={(quality) => console.log('Verb tense rated:', quality)}
  />
);

// =============================================================================
// ALL EXAMPLES - For Testing (2 items max per card!)
// =============================================================================
export const ALL_COMPARISON_EXAMPLES = [
  { id: 'verb-go-present-past', name: 'Verb: Go vs Went', component: VerbTenseGoPresentPastExample },
  { id: 'verb-go-past-participle', name: 'Verb: Went vs Gone', component: VerbTenseGoPastParticipleExample },
  { id: 'homophone-there-their', name: 'Homophone: There vs Their', component: HomophoneThereTheirExample },
  { id: 'homophone-their-theyre', name: 'Homophone: Their vs They\'re', component: HomophoneTheirTheyreExample },
  { id: 'similar-affect-effect', name: 'Similar: Affect vs Effect', component: SimilarAffectEffectExample },
  { id: 'homophone-to-too', name: 'Homophone: To vs Too', component: HomophoneToTooExample },
  { id: 'verb-eat-ate', name: 'Verb: Eat vs Ate', component: VerbTenseEatAteExample },
];
