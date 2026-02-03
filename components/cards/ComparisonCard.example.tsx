/**
 * ComparisonCard Example Usage
 *
 * Demonstrates all use cases:
 * - Verb tenses
 * - Homophones
 * - Formal vs Informal
 * - Regional differences
 */

import React from 'react';
import { ComparisonCard } from './ComparisonCard';
import { colors } from '@/constants/designSystem';

// Example 1: Verb Tenses (4 items)
export const VerbTenseExample = () => (
  <ComparisonCard
    title="Verb Tenses: To Go"
    type="verb-tense"
    items={[
      {
        label: 'Present',
        word: 'go',
        phonetic: '/ɡoʊ/',
        examples: [
          {
            text: 'I go to school every day.',
            translation: 'Voy a la escuela todos los días.',
          },
          {
            text: 'They go to the park on weekends.',
            translation: 'Ellos van al parque los fines de semana.',
          },
        ],
        tagColor: [...colors.gradients.primary],
      },
      {
        label: 'Past',
        word: 'went',
        phonetic: '/wɛnt/',
        examples: [
          {
            text: 'Yesterday, I went to the movies.',
            translation: 'Ayer, fui al cine.',
          },
          {
            text: 'She went home early.',
            translation: 'Ella se fue a casa temprano.',
          },
        ],
        tagColor: [...colors.gradients.warning],
      },
      {
        label: 'Past Participle',
        word: 'gone',
        phonetic: '/ɡɔːn/',
        examples: [
          {
            text: 'He has gone to the store.',
            translation: 'Él ha ido a la tienda.',
          },
          {
            text: 'They have gone on vacation.',
            translation: 'Ellos se han ido de vacaciones.',
          },
        ],
        tagColor: [...colors.gradients.accent],
      },
      {
        label: 'Present Participle',
        word: 'going',
        phonetic: '/ˈɡoʊɪŋ/',
        examples: [
          {
            text: 'I am going to the gym now.',
            translation: 'Voy al gimnasio ahora.',
          },
          {
            text: 'We are going to celebrate tonight.',
            translation: 'Vamos a celebrar esta noche.',
          },
        ],
        tagColor: [...colors.gradients.secondary],
      },
    ]}
    onComplete={(quality) => {
      console.log('User rated as:', quality);
    }}
  />
);

// Example 2: Homophones (3 items)
export const HomophoneExample = () => (
  <ComparisonCard
    title="Homophones: There, Their, They're"
    type="homophone"
    items={[
      {
        label: 'Location',
        word: 'there',
        phonetic: '/ðɛr/',
        examples: [
          {
            text: 'Put the book over there.',
            translation: 'Pon el libro allí.',
          },
          {
            text: 'There is a cat on the roof.',
            translation: 'Hay un gato en el techo.',
          },
        ],
      },
      {
        label: 'Possession',
        word: 'their',
        phonetic: '/ðɛr/',
        examples: [
          {
            text: 'Their house is beautiful.',
            translation: 'Su casa es hermosa.',
          },
          {
            text: 'The students forgot their homework.',
            translation: 'Los estudiantes olvidaron su tarea.',
          },
        ],
      },
      {
        label: 'Contraction',
        word: "they're",
        phonetic: '/ðɛr/',
        examples: [
          {
            text: "They're going to the party.",
            translation: 'Ellos van a la fiesta.',
          },
          {
            text: "They're very happy today.",
            translation: 'Ellos están muy felices hoy.',
          },
        ],
      },
    ]}
    onComplete={(quality) => {
      console.log('User rated as:', quality);
    }}
  />
);

// Example 3: Formal vs Informal (2 items)
export const FormalInformalExample = () => (
  <ComparisonCard
    title="Greetings: Formal vs Informal"
    type="formal-informal"
    items={[
      {
        label: 'Formal',
        word: 'Good morning',
        phonetic: '/ɡʊd ˈmɔːrnɪŋ/',
        examples: [
          {
            text: 'Good morning, Mr. Smith.',
            translation: 'Buenos días, Sr. Smith.',
          },
          {
            text: 'Good morning, how may I help you?',
            translation: 'Buenos días, ¿en qué puedo ayudarle?',
          },
        ],
        tagColor: [...colors.gradients.primary],
      },
      {
        label: 'Informal',
        word: "What's up?",
        phonetic: '/wʌts ʌp/',
        examples: [
          {
            text: "Hey! What's up?",
            translation: '¡Hola! ¿Qué tal?',
          },
          {
            text: "What's up, dude?",
            translation: '¿Qué onda, amigo?',
          },
        ],
        tagColor: [...colors.gradients.secondary],
      },
    ]}
    onComplete={(quality) => {
      console.log('User rated as:', quality);
    }}
  />
);

// Example 4: Regional Differences (2 items)
export const RegionalExample = () => (
  <ComparisonCard
    title="Regional: Apartment"
    type="regional"
    items={[
      {
        label: 'American',
        word: 'apartment',
        phonetic: '/əˈpɑːrtmənt/',
        examples: [
          {
            text: 'I live in a small apartment.',
            translation: 'Vivo en un apartamento pequeño.',
          },
          {
            text: 'The apartment has two bedrooms.',
            translation: 'El apartamento tiene dos dormitorios.',
          },
        ],
        tagColor: [...colors.gradients.primary],
      },
      {
        label: 'British',
        word: 'flat',
        phonetic: '/flæt/',
        examples: [
          {
            text: 'She bought a lovely flat in London.',
            translation: 'Ella compró un hermoso piso en Londres.',
          },
          {
            text: 'We are renting a flat near the city center.',
            translation: 'Estamos alquilando un piso cerca del centro de la ciudad.',
          },
        ],
        tagColor: [...colors.gradients.accent],
      },
    ]}
    onComplete={(quality) => {
      console.log('User rated as:', quality);
    }}
  />
);
