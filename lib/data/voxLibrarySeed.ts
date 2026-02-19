/**
 * Vox Library Seed Data
 *
 * Comprehensive CEFR-organized vocabulary for en-es and en-fr language pairs.
 * Also includes scenario seed data mapping the 60 onboarding scenarios.
 *
 * Generated with Perplexity research + manual curation.
 */

// ============================================================================
// TYPES
// ============================================================================

import type {
  CEFRLevel,
  ContextType,
  VocabCategory,
  PartOfSpeech,
  Difficulty,
} from '@/types/voxLibrary';

export type VoxVocabularySeed = {
  word: string;
  translation: string;
  pronunciation: string | null;
  native_approximation: string | null;
  language_pair: string;
  target_language: string;
  native_language: string;
  part_of_speech: PartOfSpeech;
  cefr_level: CEFRLevel;
  difficulty: Difficulty;
  category: VocabCategory;
  profession_tags: string[];
  topic_tags: string[];
  example_sentence: string | null;
  example_translation: string | null;
  usage_notes: string | null;
  memory_tip: string | null;
  frequency_rank: number | null;
};

export type VoxScenarioSeed = {
  slug: string;
  title: string;
  description: string;
  profession_tags: string[];
  context_type: ContextType;
  cefr_levels: CEFRLevel[];
  language_pairs: string[];
  key_phrases: Array<{
    phrase: string;
    translation: string;
    language_pair: string;
    when_to_use: string;
  }>;
  ai_persona: {
    role: string;
    personality: string;
    background: string;
    speaking_style: string;
  } | null;
  objectives: string[];
  estimated_minutes: number;
  difficulty_weight: number;
};

// ============================================================================
// HELPER
// ============================================================================

function es(
  word: string,
  translation: string,
  pronunciation: string,
  approx: string,
  pos: PartOfSpeech,
  cefr: CEFRLevel,
  difficulty: Difficulty,
  category: VocabCategory,
  professions: string[],
  topics: string[],
  example: string,
  exTrans: string,
  notes: string,
  freq: number,
  tip?: string,
): VoxVocabularySeed {
  return {
    word,
    translation,
    pronunciation,
    native_approximation: approx,
    language_pair: 'en-es',
    target_language: 'es',
    native_language: 'en',
    part_of_speech: pos,
    cefr_level: cefr,
    difficulty,
    category,
    profession_tags: professions,
    topic_tags: topics,
    example_sentence: example,
    example_translation: exTrans,
    usage_notes: notes,
    memory_tip: tip ?? null,
    frequency_rank: freq,
  };
}

function fr(
  word: string,
  translation: string,
  pronunciation: string,
  approx: string,
  pos: PartOfSpeech,
  cefr: CEFRLevel,
  difficulty: Difficulty,
  category: VocabCategory,
  professions: string[],
  topics: string[],
  example: string,
  exTrans: string,
  notes: string,
  freq: number,
  tip?: string,
): VoxVocabularySeed {
  return {
    word,
    translation,
    pronunciation,
    native_approximation: approx,
    language_pair: 'en-fr',
    target_language: 'fr',
    native_language: 'en',
    part_of_speech: pos,
    cefr_level: cefr,
    difficulty,
    category,
    profession_tags: professions,
    topic_tags: topics,
    example_sentence: example,
    example_translation: exTrans,
    usage_notes: notes,
    memory_tip: tip ?? null,
    frequency_rank: freq,
  };
}

// ============================================================================
// EN-ES VOCABULARY — A1 (~100 words)
// ============================================================================

const ES_A1: VoxVocabularySeed[] = [
  // Greetings & Politeness
  es('hola', 'hello', '/ˈo.la/', 'OH-lah', 'other', 'A1', 'easy', 'universal', ['general'], ['greetings'], '¡Hola! ¿Cómo estás?', 'Hello! How are you?', 'Informal greeting used anytime', 1),
  es('buenos días', 'good morning', '/ˈbwe.nos ˈdi.as/', 'BWAY-nos DEE-ahs', 'phrase', 'A1', 'easy', 'universal', ['general', 'business'], ['greetings', 'time'], 'Buenos días, señor García.', 'Good morning, Mr. Garcia.', 'Used until midday; formal appropriate', 2),
  es('buenas tardes', 'good afternoon', '/ˈbwe.nas ˈtar.des/', 'BWAY-nas TAR-dehs', 'phrase', 'A1', 'easy', 'universal', ['general', 'business'], ['greetings', 'time'], 'Buenas tardes, ¿cómo está usted?', 'Good afternoon, how are you?', 'Used from midday until evening', 3),
  es('buenas noches', 'good evening', '/ˈbwe.nas ˈno.tʃes/', 'BWAY-nas NOH-ches', 'phrase', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['greetings', 'time'], 'Buenas noches, que descanses.', 'Good night, rest well.', 'Used after evening or before bed', 4),
  es('adiós', 'goodbye', '/a.ˈdi.os/', 'ah-dee-OHS', 'other', 'A1', 'easy', 'universal', ['general'], ['greetings'], '¡Adiós! Nos vemos pronto.', 'Goodbye! See you soon.', 'Standard farewell for all contexts', 5),
  es('gracias', 'thank you', '/ˈɡɾa.sjas/', 'GRAH-see-ahs', 'other', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Gracias por tu ayuda.', 'Thank you for your help.', 'Essential politeness marker', 6),
  es('de nada', "you're welcome", '/de ˈna.da/', 'deh NAH-dah', 'phrase', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['politeness'], '—Gracias. —De nada.', '—Thank you. —You\'re welcome.', 'Standard response to thanks', 7),
  es('por favor', 'please', '/poɾ fa.ˈβoɾ/', 'por fah-VOR', 'phrase', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Un café, por favor.', 'A coffee, please.', 'Essential politeness; precedes or follows requests', 8),
  es('lo siento', "I'm sorry", '/lo ˈsjen.to/', 'loh see-EHN-toh', 'phrase', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Lo siento, no entiendo.', "I'm sorry, I don't understand.", 'Apology expression', 9),
  es('perdón', 'excuse me / pardon', '/peɾ.ˈdon/', 'pehr-DOHN', 'other', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Perdón, ¿dónde está el baño?', 'Excuse me, where is the bathroom?', 'Used to get attention or apologize lightly', 10),

  // Pronouns & Basics
  es('yo', 'I', '/ˈʝo/', 'yoh', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Yo soy ingeniero.', 'I am an engineer.', 'Subject pronoun; often omitted', 11),
  es('tú', 'you (informal)', '/tu/', 'too', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], '¿Tú hablas inglés?', 'Do you speak English?', 'Informal; use usted for formal', 12),
  es('usted', 'you (formal)', '/us.ˈted/', 'oos-TED', 'other', 'A1', 'easy', 'universal', ['general', 'business'], ['pronouns'], '¿Cómo está usted?', 'How are you (formal)?', 'Formal address for strangers, elders, professionals', 13),
  es('él', 'he', '/ˈel/', 'ehl', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Él es mi jefe.', 'He is my boss.', 'Third-person masculine', 14),
  es('ella', 'she', '/ˈe.ʎa/', 'EH-yah', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Ella es doctora.', 'She is a doctor.', 'Third-person feminine', 15),
  es('nosotros', 'we', '/no.ˈso.tɾos/', 'noh-SOH-trohs', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Nosotros trabajamos juntos.', 'We work together.', 'First-person plural', 16),

  // Essential Verbs
  es('ser', 'to be (identity)', '/seɾ/', 'sehr', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Yo soy profesor.', 'I am a teacher.', 'Permanent characteristics or identity', 17),
  es('estar', 'to be (state/location)', '/es.ˈtaɾ/', 'es-TAR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Estoy en la oficina.', 'I am in the office.', 'Temporary state, location, condition', 18),
  es('tener', 'to have', '/te.ˈneɾ/', 'teh-NEHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Tengo dos hermanos.', 'I have two brothers.', 'Possession; also used for age', 19),
  es('ir', 'to go', '/iɾ/', 'eer', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Voy al trabajo.', 'I go to work.', 'Movement; highly irregular', 20),
  es('querer', 'to want', '/ke.ˈɾeɾ/', 'keh-REHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Quiero un café.', 'I want a coffee.', 'Desire or love depending on context', 21),
  es('poder', 'can / to be able', '/po.ˈdeɾ/', 'poh-DEHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], '¿Puedo hablar contigo?', 'Can I speak with you?', 'Ability or permission', 22),
  es('hacer', 'to do / to make', '/a.ˈseɾ/', 'ah-SEHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], '¿Qué haces?', 'What are you doing?', 'Most versatile verb', 23),
  es('hablar', 'to speak', '/a.ˈblaɾ/', 'ah-BLAR', 'verb', 'A1', 'easy', 'universal', ['general', 'education'], ['essential_verbs'], 'Hablo español e inglés.', 'I speak Spanish and English.', 'Communication verb', 24),
  es('entender', 'to understand', '/en.ten.ˈdeɾ/', 'en-ten-DEHR', 'verb', 'A1', 'easy', 'universal', ['general', 'education'], ['essential_verbs'], '¿Entiendes?', 'Do you understand?', 'Comprehension verb', 25),
  es('necesitar', 'to need', '/ne.se.si.ˈtaɾ/', 'neh-seh-see-TAR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Necesito ayuda.', 'I need help.', 'Expressing necessity', 26),
  es('comer', 'to eat', '/ko.ˈmeɾ/', 'koh-MEHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs', 'food'], 'Quiero comer algo.', 'I want to eat something.', 'Basic sustenance verb', 27),
  es('beber', 'to drink', '/be.ˈbeɾ/', 'beh-BEHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs', 'food'], 'Bebo agua todos los días.', 'I drink water every day.', 'Basic sustenance verb', 28),
  es('vivir', 'to live', '/bi.ˈbiɾ/', 'bee-BEER', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Vivo en Madrid.', 'I live in Madrid.', 'Residence or existence', 29),
  es('trabajar', 'to work', '/tɾa.ba.ˈxaɾ/', 'trah-bah-HAR', 'verb', 'A1', 'easy', 'universal', ['general', 'business'], ['essential_verbs', 'work'], 'Trabajo en un banco.', 'I work in a bank.', 'Employment activity', 30),

  // Numbers
  es('uno', 'one', '/ˈu.no/', 'OO-noh', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Tengo una manzana.', 'I have one apple.', 'Basic numeral; una for feminine', 31),
  es('dos', 'two', '/dos/', 'dohs', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Tengo dos hijos.', 'I have two children.', 'Basic numeral', 32),
  es('tres', 'three', '/tɾes/', 'trehs', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Trabajo tres días por semana.', 'I work three days per week.', 'Basic numeral', 33),
  es('cuatro', 'four', '/ˈkwa.tɾo/', 'KWAH-troh', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Son las cuatro de la tarde.', "It's four in the afternoon.", 'Basic numeral', 34),
  es('cinco', 'five', '/ˈsin.ko/', 'SEEN-koh', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Trabajo cinco horas diarias.', 'I work five hours daily.', 'Basic numeral', 35),
  es('diez', 'ten', '/ˈdjes/', 'dee-EHS', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Tengo diez dólares.', 'I have ten dollars.', 'Foundation numeral', 36),
  es('cien', 'one hundred', '/ˈsjen/', 'see-EHN', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Cuesta cien pesos.', 'It costs one hundred pesos.', 'Becomes ciento before other numbers', 37),

  // Family
  es('familia', 'family', '/fa.ˈmi.lja/', 'fah-MEE-lyah', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi familia es grande.', 'My family is big.', 'Fundamental social unit', 38),
  es('padre', 'father', '/ˈpa.dɾe/', 'PAH-dreh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi padre es ingeniero.', 'My father is an engineer.', 'Male parent', 39),
  es('madre', 'mother', '/ˈma.dɾe/', 'MAH-dreh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi madre es doctora.', 'My mother is a doctor.', 'Female parent', 40),
  es('hermano', 'brother', '/eɾ.ˈma.no/', 'ehr-MAH-noh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi hermano estudia medicina.', 'My brother studies medicine.', 'Male sibling', 41),
  es('hermana', 'sister', '/eɾ.ˈma.na/', 'ehr-MAH-nah', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi hermana trabaja en un banco.', 'My sister works in a bank.', 'Female sibling', 42),
  es('hijo', 'son', '/ˈi.xo/', 'EE-hoh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Tengo un hijo.', 'I have a son.', 'Male child', 43),
  es('hija', 'daughter', '/ˈi.xa/', 'EE-hah', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi hija es estudiante.', 'My daughter is a student.', 'Female child', 44),
  es('esposo', 'husband', '/es.ˈpo.so/', 'es-POH-soh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi esposo es ingeniero.', 'My husband is an engineer.', 'Male spouse', 45),
  es('esposa', 'wife', '/es.ˈpo.sa/', 'es-POH-sah', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mi esposa trabaja en medicina.', 'My wife works in medicine.', 'Female spouse', 46),
  es('amigo', 'friend', '/a.ˈmi.ɣo/', 'ah-MEE-goh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family', 'social'], 'Él es mi mejor amigo.', 'He is my best friend.', 'Male friend; amiga for female', 47),

  // Time
  es('hoy', 'today', '/ˈoi/', 'oy', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], '¿Qué haces hoy?', 'What are you doing today?', 'Present day reference', 48),
  es('mañana', 'tomorrow / morning', '/ma.ˈɲa.na/', 'mah-NYAH-nah', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Nos vemos mañana.', 'See you tomorrow.', 'Context-dependent: tomorrow or morning', 49),
  es('ayer', 'yesterday', '/a.ˈʝeɾ/', 'ah-YEHR', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], 'Ayer trabajé mucho.', 'Yesterday I worked a lot.', 'Past day reference', 50),
  es('ahora', 'now', '/a.ˈo.ɾa/', 'ah-OH-rah', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], 'Necesito hacerlo ahora.', 'I need to do it now.', 'Immediate present', 51),
  es('hora', 'hour / time', '/ˈo.ɾa/', 'OH-rah', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], '¿Qué hora es?', 'What time is it?', 'Temporal measurement', 52),
  es('semana', 'week', '/se.ˈma.na/', 'seh-MAH-nah', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'La próxima semana viajo.', 'Next week I travel.', 'Seven-day period', 53),
  es('mes', 'month', '/mes/', 'mehs', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Este mes es mi cumpleaños.', 'This month is my birthday.', 'Calendar month', 54),
  es('año', 'year', '/ˈa.ɲo/', 'AH-nyoh', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Tengo treinta años.', 'I am thirty years old.', 'Calendar year; also used for age', 55),

  // Colors
  es('rojo', 'red', '/ˈro.xo/', 'ROH-hoh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Mi coche es rojo.', 'My car is red.', 'Primary color', 56),
  es('azul', 'blue', '/a.ˈsul/', 'ah-SOOL', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'El cielo es azul.', 'The sky is blue.', 'Primary color', 57),
  es('verde', 'green', '/ˈbeɾ.de/', 'BEHR-deh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Las plantas son verdes.', 'Plants are green.', 'Does not change with gender', 58),
  es('blanco', 'white', '/ˈblaŋ.ko/', 'BLAHN-koh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'La nieve es blanca.', 'Snow is white.', 'Primary color', 59),
  es('negro', 'black', '/ˈne.ɣɾo/', 'NEH-groh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Mi teléfono es negro.', 'My phone is black.', 'Primary color', 60),
  es('amarillo', 'yellow', '/a.ma.ˈɾi.ʎo/', 'ah-mah-REE-yoh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'El sol es amarillo.', 'The sun is yellow.', 'Primary color', 61),

  // Food Basics
  es('agua', 'water', '/ˈa.ɣwa/', 'AH-gwah', 'noun', 'A1', 'easy', 'survival', ['general', 'hospitality'], ['food', 'basic_needs'], 'Quiero un vaso de agua.', 'I want a glass of water.', 'Essential sustenance; feminine despite el agua', 62),
  es('pan', 'bread', '/pan/', 'pahn', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'Compro pan en la panadería.', 'I buy bread at the bakery.', 'Staple food item', 63),
  es('café', 'coffee', '/ka.ˈfe/', 'kah-FEH', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'Tomo café por la mañana.', 'I drink coffee in the morning.', 'Common beverage', 64),
  es('leche', 'milk', '/ˈle.tʃe/', 'LEH-cheh', 'noun', 'A1', 'easy', 'universal', ['general'], ['food'], 'La leche es blanca.', 'Milk is white.', 'Dairy product', 65),
  es('comida', 'food / meal', '/ko.ˈmi.da/', 'koh-MEE-dah', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'La comida está lista.', 'The food is ready.', 'Both food in general and a meal', 66),
  es('carne', 'meat', '/ˈkaɾ.ne/', 'KAR-neh', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'No como carne.', "I don't eat meat.", 'General meat term', 67),
  es('fruta', 'fruit', '/ˈfɾu.ta/', 'FROO-tah', 'noun', 'A1', 'easy', 'universal', ['general'], ['food'], 'Me gusta la fruta fresca.', 'I like fresh fruit.', 'General fruit term', 68),
  es('arroz', 'rice', '/a.ˈros/', 'ah-ROHS', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'Arroz con pollo es delicioso.', 'Rice with chicken is delicious.', 'Staple food', 69),

  // Basic Needs & Survival
  es('sí', 'yes', '/si/', 'see', 'other', 'A1', 'easy', 'survival', ['general'], ['basic_needs'], 'Sí, entiendo.', 'Yes, I understand.', 'Affirmation', 70),
  es('no', 'no', '/no/', 'noh', 'other', 'A1', 'easy', 'survival', ['general'], ['basic_needs'], 'No, gracias.', 'No, thank you.', 'Negation', 71),
  es('nombre', 'name', '/ˈnom.bɾe/', 'NOHM-breh', 'noun', 'A1', 'easy', 'universal', ['general'], ['personal_info'], 'Mi nombre es Carlos.', 'My name is Carlos.', 'Personal identification', 72),
  es('casa', 'house / home', '/ˈka.sa/', 'KAH-sah', 'noun', 'A1', 'easy', 'universal', ['general'], ['home', 'basic_needs'], 'Mi casa es pequeña.', 'My house is small.', 'Residence', 73),
  es('baño', 'bathroom', '/ˈba.ɲo/', 'BAH-nyoh', 'noun', 'A1', 'easy', 'survival', ['general'], ['basic_needs', 'home'], '¿Dónde está el baño?', 'Where is the bathroom?', 'Essential survival word', 74),
  es('dinero', 'money', '/di.ˈne.ɾo/', 'dee-NEH-roh', 'noun', 'A1', 'easy', 'survival', ['general', 'business'], ['basic_needs', 'money'], 'Necesito dinero.', 'I need money.', 'Financial essential', 75),
  es('calle', 'street', '/ˈka.ʎe/', 'KAH-yeh', 'noun', 'A1', 'easy', 'universal', ['general'], ['directions', 'basic_needs'], 'Mi casa está en esta calle.', 'My house is on this street.', 'Basic navigation', 76),

  // Basic Question Words
  es('¿qué?', 'what?', '/ke/', 'keh', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], '¿Qué quieres?', 'What do you want?', 'Interrogative pronoun', 77),
  es('¿dónde?', 'where?', '/ˈdon.de/', 'DOHN-deh', 'other', 'A1', 'easy', 'universal', ['general'], ['questions', 'directions'], '¿Dónde vives?', 'Where do you live?', 'Location question', 78),
  es('¿cómo?', 'how?', '/ˈko.mo/', 'KOH-moh', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], '¿Cómo estás?', 'How are you?', 'Manner or state question', 79),
  es('¿cuánto?', 'how much?', '/ˈkwan.to/', 'KWAHN-toh', 'other', 'A1', 'easy', 'universal', ['general', 'business'], ['questions', 'money'], '¿Cuánto cuesta?', 'How much does it cost?', 'Quantity or price question', 80),
  es('¿cuándo?', 'when?', '/ˈkwan.do/', 'KWAHN-doh', 'other', 'A1', 'easy', 'universal', ['general'], ['questions', 'time'], '¿Cuándo llegas?', 'When do you arrive?', 'Time question', 81),
  es('¿quién?', 'who?', '/kjen/', 'kee-EHN', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], '¿Quién es?', 'Who is it?', 'Person question', 82),
  es('¿por qué?', 'why?', '/poɾ ˈke/', 'por KEH', 'phrase', 'A1', 'easy', 'universal', ['general'], ['questions'], '¿Por qué estudias español?', 'Why do you study Spanish?', 'Reason question', 83),

  // Common Phrases
  es('me llamo', 'my name is', '/me ˈʎa.mo/', 'meh YAH-moh', 'phrase', 'A1', 'easy', 'survival', ['general'], ['introductions'], 'Me llamo Ana.', 'My name is Ana.', 'Self-introduction', 84),
  es('mucho gusto', 'nice to meet you', '/ˈmu.tʃo ˈɡus.to/', 'MOO-choh GOOS-toh', 'phrase', 'A1', 'easy', 'universal', ['general', 'business'], ['introductions'], 'Mucho gusto, soy Carlos.', 'Nice to meet you, I\'m Carlos.', 'Greeting on first meeting', 85),
  es('no entiendo', "I don't understand", '/no en.ˈtjen.do/', 'noh en-tee-EHN-doh', 'phrase', 'A1', 'easy', 'survival', ['general'], ['communication'], 'Lo siento, no entiendo.', "I'm sorry, I don't understand.", 'Essential learner phrase', 86),
  es('más despacio', 'more slowly', '/mas des.ˈpa.sjo/', 'mahs des-PAH-see-oh', 'phrase', 'A1', 'easy', 'survival', ['general'], ['communication'], 'Más despacio, por favor.', 'More slowly, please.', 'Asking someone to slow down', 87),
  es('¿habla inglés?', 'do you speak English?', '/ˈa.bla iŋ.ˈɡles/', 'AH-blah een-GLEHS', 'phrase', 'A1', 'easy', 'survival', ['general'], ['communication'], '¿Habla inglés?', 'Do you speak English?', 'Survival phrase for beginners', 88),

  // Basic Adjectives
  es('bueno', 'good', '/ˈbwe.no/', 'BWEH-noh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'El café es bueno.', 'The coffee is good.', 'Positive quality; buen before masculine nouns', 89),
  es('malo', 'bad', '/ˈma.lo/', 'MAH-loh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'El clima es malo hoy.', 'The weather is bad today.', 'Negative quality; mal before masculine nouns', 90),
  es('grande', 'big', '/ˈɡɾan.de/', 'GRAHN-deh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'Mi casa es grande.', 'My house is big.', 'Size descriptor; gran before nouns', 91),
  es('pequeño', 'small', '/pe.ˈke.ɲo/', 'peh-KEH-nyoh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'Tengo un pequeño problema.', 'I have a small problem.', 'Size descriptor', 92),
  es('nuevo', 'new', '/ˈnwe.βo/', 'NWEH-boh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'Tengo un teléfono nuevo.', 'I have a new phone.', 'Novelty descriptor', 93),
  es('mucho', 'much / a lot', '/ˈmu.tʃo/', 'MOO-choh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['quantity'], 'Tengo mucho trabajo.', 'I have a lot of work.', 'Quantity; agrees in gender', 94),
  es('poco', 'little / few', '/ˈpo.ko/', 'POH-koh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['quantity'], 'Tengo poco tiempo.', 'I have little time.', 'Small quantity', 95),

  // Places
  es('restaurante', 'restaurant', '/res.tau.ˈɾan.te/', 'res-tow-RAHN-teh', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food', 'places'], 'Cenamos en un restaurante.', 'We dine in a restaurant.', 'Dining establishment', 96),
  es('hospital', 'hospital', '/os.pi.ˈtal/', 'ohs-pee-TAHL', 'noun', 'A1', 'easy', 'survival', ['general', 'healthcare'], ['healthcare', 'places'], 'El hospital está cerca.', 'The hospital is near.', 'Medical facility', 97),
  es('escuela', 'school', '/es.ˈkwe.la/', 'es-KWEH-lah', 'noun', 'A1', 'easy', 'universal', ['general', 'education'], ['education', 'places'], 'Mis hijos van a la escuela.', 'My children go to school.', 'Educational institution', 98),
  es('tienda', 'store / shop', '/ti.ˈen.da/', 'tee-EHN-dah', 'noun', 'A1', 'easy', 'universal', ['general'], ['shopping', 'places'], 'La tienda está cerca.', 'The store is nearby.', 'Commercial establishment', 99),
  es('oficina', 'office', '/o.fi.ˈsi.na/', 'oh-fee-SEE-nah', 'noun', 'A1', 'easy', 'universal', ['general', 'business'], ['work', 'places'], 'Trabajo en una oficina.', 'I work in an office.', 'Workplace location', 100),
];

// ============================================================================
// EN-ES VOCABULARY — A2 (~150 words)
// ============================================================================

const ES_A2: VoxVocabularySeed[] = [
  // Daily Routines
  es('despertarse', 'to wake up', '/des.peɾ.ˈtaɾ.se/', 'des-pehr-TAR-seh', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines'], 'Me despierto a las siete.', 'I wake up at seven.', 'Reflexive verb; daily routine', 101),
  es('ducharse', 'to shower', '/du.ˈtʃaɾ.se/', 'doo-CHAR-seh', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines'], 'Me ducho por la mañana.', 'I shower in the morning.', 'Reflexive verb', 102),
  es('desayunar', 'to have breakfast', '/de.sa.ʝu.ˈnaɾ/', 'deh-sah-yoo-NAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'food'], 'Desayuno a las ocho.', 'I have breakfast at eight.', 'Morning meal', 103),
  es('almorzar', 'to have lunch', '/al.moɾ.ˈsaɾ/', 'ahl-mor-SAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'food'], 'Almuerzo con mis colegas.', 'I have lunch with my colleagues.', 'Midday meal; stem-changing', 104),
  es('cenar', 'to have dinner', '/se.ˈnaɾ/', 'seh-NAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'food'], 'Cenamos a las nueve.', 'We have dinner at nine.', 'Evening meal', 105),
  es('acostarse', 'to go to bed', '/a.kos.ˈtaɾ.se/', 'ah-kohs-TAR-seh', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines'], 'Me acuesto a las once.', 'I go to bed at eleven.', 'Reflexive; stem-changing', 106),
  es('vestirse', 'to get dressed', '/bes.ˈtiɾ.se/', 'bes-TEER-seh', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines'], 'Me visto rápido.', 'I get dressed quickly.', 'Reflexive verb', 107),
  es('cocinar', 'to cook', '/ko.si.ˈnaɾ/', 'koh-see-NAR', 'verb', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['daily_routines', 'food'], 'Me encanta cocinar.', 'I love cooking.', 'Food preparation', 108),
  es('limpiar', 'to clean', '/lim.pi.ˈaɾ/', 'leem-pee-AR', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'home'], 'Limpio la casa los sábados.', 'I clean the house on Saturdays.', 'Cleaning activity', 109),
  es('conducir', 'to drive', '/kon.du.ˈsiɾ/', 'kohn-doo-SEER', 'verb', 'A2', 'medium', 'universal', ['general'], ['daily_routines', 'transportation'], 'Conduzco al trabajo.', 'I drive to work.', 'Irregular verb', 110),

  // Shopping
  es('comprar', 'to buy', '/kom.ˈpɾaɾ/', 'kohm-PRAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['shopping'], 'Compro ropa en la tienda.', 'I buy clothes in the store.', 'Purchase verb', 111),
  es('vender', 'to sell', '/ben.ˈdeɾ/', 'behn-DEHR', 'verb', 'A2', 'easy', 'universal', ['general', 'business'], ['shopping'], 'La tienda vende zapatos.', 'The store sells shoes.', 'Commerce verb', 112),
  es('precio', 'price', '/ˈpɾe.sjo/', 'PREH-see-oh', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['shopping', 'money'], '¿Cuál es el precio?', 'What is the price?', 'Cost of goods', 113),
  es('caro', 'expensive', '/ˈka.ɾo/', 'KAH-roh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['shopping', 'money'], 'Este vestido es muy caro.', 'This dress is very expensive.', 'High price descriptor', 114),
  es('barato', 'cheap', '/ba.ˈɾa.to/', 'bah-RAH-toh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['shopping', 'money'], 'El mercado tiene precios baratos.', 'The market has cheap prices.', 'Low price descriptor', 115),
  es('ropa', 'clothing', '/ˈro.pa/', 'ROH-pah', 'noun', 'A2', 'easy', 'universal', ['general'], ['shopping'], 'Necesito comprar ropa nueva.', 'I need to buy new clothes.', 'General clothing term', 116),
  es('zapatos', 'shoes', '/sa.ˈpa.tos/', 'sah-PAH-tohs', 'noun', 'A2', 'easy', 'universal', ['general'], ['shopping'], 'Estos zapatos son cómodos.', 'These shoes are comfortable.', 'Footwear', 117),
  es('talla', 'size (clothing)', '/ˈta.ʎa/', 'TAH-yah', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['shopping'], '¿Tiene esta talla?', 'Do you have this size?', 'Clothing size', 118),
  es('efectivo', 'cash', '/e.fek.ˈti.βo/', 'eh-fek-TEE-boh', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['shopping', 'money'], 'Pago en efectivo.', 'I pay in cash.', 'Physical money', 119),
  es('tarjeta', 'card', '/taɾ.ˈxe.ta/', 'tar-HEH-tah', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['shopping', 'money'], 'Pago con tarjeta.', 'I pay by card.', 'Payment card', 120),

  // Directions
  es('izquierda', 'left', '/is.ˈkjeɾ.da/', 'ees-kee-EHR-dah', 'noun', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Gira a la izquierda.', 'Turn left.', 'Directional', 121),
  es('derecha', 'right', '/de.ˈɾe.tʃa/', 'deh-REH-chah', 'noun', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Gira a la derecha.', 'Turn right.', 'Directional', 122),
  es('recto', 'straight', '/ˈrek.to/', 'REHK-toh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Sigue recto por esta calle.', 'Go straight on this street.', 'Directional', 123),
  es('cerca', 'near', '/ˈseɾ.ka/', 'SEHR-kah', 'adverb', 'A2', 'easy', 'universal', ['general'], ['directions'], 'El banco está cerca.', 'The bank is near.', 'Proximity', 124),
  es('lejos', 'far', '/ˈle.xos/', 'LEH-hos', 'adverb', 'A2', 'easy', 'universal', ['general'], ['directions'], 'El aeropuerto está lejos.', 'The airport is far.', 'Distance', 125),
  es('esquina', 'corner', '/es.ˈki.na/', 'es-KEE-nah', 'noun', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Dobla en la esquina.', 'Turn at the corner.', 'Street intersection', 126),
  es('cruzar', 'to cross', '/kɾu.ˈsaɾ/', 'kroo-SAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Cruza la calle con cuidado.', 'Cross the street carefully.', 'Movement across', 127),

  // Weather
  es('clima', 'weather', '/ˈkli.ma/', 'KLEE-mah', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'El clima es agradable hoy.', 'The weather is pleasant today.', 'Atmospheric conditions', 128),
  es('lluvia', 'rain', '/ˈʎu.βja/', 'YOO-bee-ah', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Hay lluvia esta tarde.', 'There is rain this afternoon.', 'Precipitation', 129),
  es('sol', 'sun', '/sol/', 'sohl', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Hace sol hoy.', "It's sunny today.", 'Celestial body / weather', 130),
  es('frío', 'cold', '/ˈfɾi.o/', 'FREE-oh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Hace mucho frío.', "It's very cold.", 'Temperature descriptor', 131),
  es('calor', 'heat / hot', '/ka.ˈloɾ/', 'kah-LOR', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Hace mucho calor en verano.', "It's very hot in summer.", 'Temperature descriptor', 132),
  es('nieve', 'snow', '/ˈnje.βe/', 'nee-EH-beh', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'La nieve cubre las montañas.', 'Snow covers the mountains.', 'Winter precipitation', 133),
  es('viento', 'wind', '/ˈbjen.to/', 'bee-EHN-toh', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Hay mucho viento hoy.', 'There is a lot of wind today.', 'Air movement', 134),
  es('nublado', 'cloudy', '/nu.ˈbla.do/', 'noo-BLAH-doh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['weather'], 'El cielo está nublado.', 'The sky is cloudy.', 'Cloud cover', 135),

  // Hobbies
  es('leer', 'to read', '/le.ˈeɾ/', 'leh-EHR', 'verb', 'A2', 'easy', 'universal', ['general', 'education'], ['hobbies'], 'Me gusta leer novelas.', 'I like to read novels.', 'Reading activity', 136),
  es('escribir', 'to write', '/es.kɾi.ˈbiɾ/', 'es-kree-BEER', 'verb', 'A2', 'easy', 'universal', ['general', 'education'], ['hobbies', 'work'], 'Escribo correos electrónicos.', 'I write emails.', 'Writing activity', 137),
  es('cantar', 'to sing', '/kan.ˈtaɾ/', 'kahn-TAR', 'verb', 'A2', 'easy', 'universal', ['general', 'creative'], ['hobbies'], 'Me gusta cantar en la ducha.', 'I like to sing in the shower.', 'Musical activity', 138),
  es('bailar', 'to dance', '/bai.ˈlaɾ/', 'bye-LAR', 'verb', 'A2', 'easy', 'universal', ['general', 'creative'], ['hobbies'], 'Bailamos salsa los viernes.', 'We dance salsa on Fridays.', 'Physical activity', 139),
  es('nadar', 'to swim', '/na.ˈdaɾ/', 'nah-DAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['hobbies', 'sports'], 'Nado en la piscina.', 'I swim in the pool.', 'Water sport', 140),
  es('correr', 'to run', '/ko.ˈreɾ/', 'koh-REHR', 'verb', 'A2', 'easy', 'universal', ['general'], ['hobbies', 'sports'], 'Corro todos los días.', 'I run every day.', 'Physical exercise', 141),
  es('película', 'movie', '/pe.ˈli.ku.la/', 'peh-LEE-koo-lah', 'noun', 'A2', 'easy', 'universal', ['general', 'creative'], ['hobbies', 'entertainment'], 'Vamos a ver una película.', "Let's go watch a movie.", 'Entertainment', 142),
  es('música', 'music', '/ˈmu.si.ka/', 'MOO-see-kah', 'noun', 'A2', 'easy', 'universal', ['general', 'creative'], ['hobbies', 'entertainment'], 'Escucho música clásica.', 'I listen to classical music.', 'Art form', 143),
  es('deporte', 'sport', '/de.ˈpoɾ.te/', 'deh-POR-teh', 'noun', 'A2', 'easy', 'universal', ['general'], ['hobbies', 'sports'], 'El fútbol es mi deporte favorito.', 'Soccer is my favorite sport.', 'Athletic activity', 144),
  es('viajar', 'to travel', '/bja.ˈxaɾ/', 'bee-ah-HAR', 'verb', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['hobbies', 'travel'], 'Me encanta viajar.', 'I love to travel.', 'Leisure activity', 145),

  // Emotions
  es('feliz', 'happy', '/fe.ˈlis/', 'feh-LEES', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Estoy muy feliz hoy.', 'I am very happy today.', 'Positive emotion', 146),
  es('triste', 'sad', '/ˈtɾis.te/', 'TREES-teh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Se siente triste hoy.', 'He/she feels sad today.', 'Negative emotion', 147),
  es('enojado', 'angry', '/e.no.ˈxa.do/', 'eh-noh-HAH-doh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Está enojado conmigo.', 'He is angry with me.', 'Negative emotion', 148),
  es('cansado', 'tired', '/kan.ˈsa.do/', 'kahn-SAH-doh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Estoy cansado después del trabajo.', "I'm tired after work.", 'Physical/mental state', 149),
  es('preocupado', 'worried', '/pɾe.o.ku.ˈpa.do/', 'preh-oh-koo-PAH-doh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Estoy preocupado por el examen.', 'I am worried about the exam.', 'Anxious state', 150),
  es('contento', 'content / pleased', '/kon.ˈten.to/', 'kohn-TEN-toh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Estoy contento con mi trabajo.', 'I am pleased with my work.', 'Satisfied state', 151),
  es('nervioso', 'nervous', '/neɾ.ˈbjo.so/', 'nehr-bee-OH-soh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Estoy nervioso por la entrevista.', "I'm nervous about the interview.", 'Anxious anticipation', 152),
  es('sorprendido', 'surprised', '/soɾ.pɾen.ˈdi.do/', 'sor-prehn-DEE-doh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Estoy sorprendido por la noticia.', "I'm surprised by the news.", 'Unexpected reaction', 153),

  // Transportation
  es('coche', 'car', '/ˈko.tʃe/', 'KOH-cheh', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'Mi coche es azul.', 'My car is blue.', 'Personal vehicle', 154),
  es('autobús', 'bus', '/au.to.ˈbus/', 'ow-toh-BOOS', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'Tomo el autobús al trabajo.', 'I take the bus to work.', 'Public transport', 155),
  es('tren', 'train', '/tɾen/', 'trehn', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'El tren sale a las ocho.', 'The train leaves at eight.', 'Rail transport', 156),
  es('avión', 'airplane', '/a.ˈbjon/', 'ah-bee-OHN', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['transportation', 'travel'], 'El avión llega a las tres.', 'The airplane arrives at three.', 'Air transport', 157),
  es('aeropuerto', 'airport', '/ae.ɾo.ˈpweɾ.to/', 'ah-eh-roh-PWEHR-toh', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['transportation', 'travel'], 'El aeropuerto está lejos.', 'The airport is far.', 'Travel hub', 158),
  es('estación', 'station', '/es.ta.ˈsjon/', 'es-tah-see-OHN', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'La estación de tren está cerca.', 'The train station is near.', 'Transport hub', 159),
  es('taxi', 'taxi', '/ˈtak.si/', 'TAHK-see', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['transportation'], 'Llamo un taxi.', 'I call a taxi.', 'Hired transport', 160),
  es('billete', 'ticket', '/bi.ˈʎe.te/', 'bee-YEH-teh', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation', 'travel'], 'Compro un billete de tren.', 'I buy a train ticket.', 'Travel ticket', 161),

  // Body Parts
  es('cabeza', 'head', '/ka.ˈbe.sa/', 'kah-BEH-sah', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Me duele la cabeza.', 'My head hurts.', 'Body part', 162),
  es('mano', 'hand', '/ˈma.no/', 'MAH-noh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Me lavo las manos.', 'I wash my hands.', 'Body part', 163),
  es('brazo', 'arm', '/ˈbɾa.so/', 'BRAH-soh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Me duele el brazo.', 'My arm hurts.', 'Body part', 164),
  es('pierna', 'leg', '/ˈpjeɾ.na/', 'pee-EHR-nah', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Tengo las piernas cansadas.', 'My legs are tired.', 'Body part', 165),
  es('espalda', 'back', '/es.ˈpal.da/', 'es-PAHL-dah', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Me duele la espalda.', 'My back hurts.', 'Body part', 166),
  es('estómago', 'stomach', '/es.ˈto.ma.ɣo/', 'es-TOH-mah-goh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Tengo dolor de estómago.', 'I have a stomachache.', 'Internal organ', 167),
  es('ojo', 'eye', '/ˈo.xo/', 'OH-hoh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Mis ojos son marrones.', 'My eyes are brown.', 'Sensory organ', 168),
  es('boca', 'mouth', '/ˈbo.ka/', 'BOH-kah', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Abre la boca.', 'Open your mouth.', 'Body part', 169),
  es('corazón', 'heart', '/ko.ɾa.ˈson/', 'koh-rah-SOHN', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Mi corazón late rápido.', 'My heart beats fast.', 'Internal organ', 170),
  es('diente', 'tooth', '/ˈdjen.te/', 'dee-EHN-teh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Me duele un diente.', 'A tooth hurts.', 'Dental', 171),

  // Household
  es('cocina', 'kitchen', '/ko.ˈsi.na/', 'koh-SEE-nah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Cocinamos en la cocina.', 'We cook in the kitchen.', 'Room in house', 172),
  es('dormitorio', 'bedroom', '/doɾ.mi.ˈto.ɾjo/', 'dor-mee-TOH-ree-oh', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Mi dormitorio es tranquilo.', 'My bedroom is quiet.', 'Sleeping room', 173),
  es('sala', 'living room', '/ˈsa.la/', 'SAH-lah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Vemos televisión en la sala.', 'We watch TV in the living room.', 'Common room', 174),
  es('mesa', 'table', '/ˈme.sa/', 'MEH-sah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home', 'furniture'], 'La mesa es de madera.', 'The table is made of wood.', 'Furniture', 175),
  es('silla', 'chair', '/ˈsi.ʎa/', 'SEE-yah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home', 'furniture'], 'Necesito una silla.', 'I need a chair.', 'Furniture', 176),
  es('cama', 'bed', '/ˈka.ma/', 'KAH-mah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home', 'furniture'], 'Mi cama es cómoda.', 'My bed is comfortable.', 'Furniture', 177),
  es('ventana', 'window', '/ben.ˈta.na/', 'behn-TAH-nah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Abre la ventana.', 'Open the window.', 'House feature', 178),
  es('puerta', 'door', '/ˈpweɾ.ta/', 'PWEHR-tah', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'La puerta está cerrada.', 'The door is closed.', 'House feature', 179),

  // Health Basics
  es('médico', 'doctor', '/ˈme.di.ko/', 'MEH-dee-koh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], 'El médico me recomienda descansar.', 'The doctor recommends I rest.', 'Health professional', 180),
  es('enfermo', 'sick', '/en.ˈfeɾ.mo/', 'en-FEHR-moh', 'adjective', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], 'Estoy enfermo hoy.', 'I am sick today.', 'Health condition', 181),
  es('dolor', 'pain', '/do.ˈloɾ/', 'doh-LOR', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], 'Tengo dolor de cabeza.', 'I have a headache.', 'Physical discomfort', 182),
  es('medicina', 'medicine', '/me.di.ˈsi.na/', 'meh-dee-SEE-nah', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], 'Tomo mi medicina.', 'I take my medicine.', 'Pharmaceutical', 183),
  es('farmacia', 'pharmacy', '/faɾ.ˈma.sja/', 'far-MAH-see-ah', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare', 'places'], '¿Hay una farmacia cerca?', 'Is there a pharmacy nearby?', 'Drug store', 184),
  es('fiebre', 'fever', '/ˈfje.bɾe/', 'fee-EH-breh', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], 'Tengo fiebre.', 'I have a fever.', 'Elevated temperature', 185),

  // More Adjectives
  es('largo', 'long', '/ˈlaɾ.ɣo/', 'LAR-goh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'El camino es largo.', 'The road is long.', 'Length descriptor', 186),
  es('corto', 'short', '/ˈkoɾ.to/', 'KOR-toh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'El viaje fue corto.', 'The trip was short.', 'Length descriptor', 187),
  es('joven', 'young', '/ˈxo.βen/', 'HOH-behn', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'Es un hombre joven.', 'He is a young man.', 'Age descriptor', 188),
  es('viejo', 'old', '/ˈbje.xo/', 'bee-EH-hoh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'El edificio es viejo.', 'The building is old.', 'Age descriptor', 189),
  es('rápido', 'fast', '/ˈra.pi.do/', 'RAH-pee-doh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'El tren es muy rápido.', 'The train is very fast.', 'Speed descriptor', 190),
  es('lento', 'slow', '/ˈlen.to/', 'LEHN-toh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'El autobús es lento.', 'The bus is slow.', 'Speed descriptor', 191),
  es('fácil', 'easy', '/ˈfa.sil/', 'FAH-seel', 'adjective', 'A2', 'easy', 'universal', ['general', 'education'], ['description'], 'El examen fue fácil.', 'The exam was easy.', 'Difficulty descriptor', 192),
  es('difícil', 'difficult', '/di.ˈfi.sil/', 'dee-FEE-seel', 'adjective', 'A2', 'easy', 'universal', ['general', 'education'], ['description'], 'La gramática es difícil.', 'The grammar is difficult.', 'Difficulty descriptor', 193),
  es('importante', 'important', '/im.poɾ.ˈtan.te/', 'eem-por-TAHN-teh', 'adjective', 'A2', 'easy', 'universal', ['general', 'business'], ['description'], 'Es una reunión importante.', 'It is an important meeting.', 'Significance descriptor', 194),
  es('necesario', 'necessary', '/ne.se.ˈsa.ɾjo/', 'neh-seh-SAH-ree-oh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'Es necesario estudiar.', 'It is necessary to study.', 'Requirement descriptor', 195),

  // Prepositions & Connectors
  es('pero', 'but', '/ˈpe.ɾo/', 'PEH-roh', 'other', 'A2', 'easy', 'universal', ['general'], ['connectors'], 'Quiero ir, pero no puedo.', "I want to go, but I can't.", 'Contrast connector', 196),
  es('porque', 'because', '/ˈpoɾ.ke/', 'POR-keh', 'other', 'A2', 'easy', 'universal', ['general'], ['connectors'], 'Estudio porque quiero aprender.', 'I study because I want to learn.', 'Causal connector', 197),
  es('también', 'also / too', '/tam.ˈbjen/', 'tahm-bee-EHN', 'adverb', 'A2', 'easy', 'universal', ['general'], ['connectors'], 'Yo también quiero ir.', 'I also want to go.', 'Addition', 198),
  es('siempre', 'always', '/ˈsjem.pɾe/', 'see-EHM-preh', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time', 'frequency'], 'Siempre llego temprano.', 'I always arrive early.', 'Frequency adverb', 199),
  es('nunca', 'never', '/ˈnun.ka/', 'NOON-kah', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time', 'frequency'], 'Nunca llego tarde.', 'I never arrive late.', 'Frequency adverb', 200),
  es('a veces', 'sometimes', '/a ˈbe.ses/', 'ah BEH-sehs', 'phrase', 'A2', 'easy', 'universal', ['general'], ['time', 'frequency'], 'A veces como fuera.', 'Sometimes I eat out.', 'Frequency expression', 201),
  es('después', 'after / later', '/des.ˈpwes/', 'des-PWEHS', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time'], 'Después voy al gimnasio.', 'After, I go to the gym.', 'Temporal sequence', 202),
  es('antes', 'before', '/ˈan.tes/', 'AHN-tehs', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time'], 'Antes de salir, como algo.', 'Before leaving, I eat something.', 'Temporal sequence', 203),
  es('todavía', 'still / yet', '/to.da.ˈbi.a/', 'toh-dah-BEE-ah', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time'], 'Todavía estoy trabajando.', 'I am still working.', 'Continuation', 204),
  es('ya', 'already', '/ʝa/', 'yah', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time'], 'Ya terminé mi trabajo.', 'I already finished my work.', 'Completion marker', 205),

  // More Verbs
  es('saber', 'to know (facts)', '/sa.ˈbeɾ/', 'sah-BEHR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], '¿Sabes dónde está el banco?', 'Do you know where the bank is?', 'Factual knowledge', 206),
  es('conocer', 'to know (people/places)', '/ko.no.ˈseɾ/', 'koh-noh-SEHR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], '¿Conoces a mi hermana?', 'Do you know my sister?', 'Familiarity; people and places', 207),
  es('pensar', 'to think', '/pen.ˈsaɾ/', 'pehn-SAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs', 'communication'], 'Pienso que es buena idea.', 'I think it is a good idea.', 'Cognitive verb', 208),
  es('creer', 'to believe', '/kɾe.ˈeɾ/', 'kreh-EHR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs', 'communication'], 'Creo que sí.', 'I believe so.', 'Belief verb', 209),
  es('encontrar', 'to find', '/en.kon.ˈtɾaɾ/', 'en-kohn-TRAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'No puedo encontrar mis llaves.', 'I cannot find my keys.', 'Discovery verb', 210),
  es('esperar', 'to wait / to hope', '/es.pe.ˈɾaɾ/', 'es-peh-RAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Espero que llegues pronto.', 'I hope you arrive soon.', 'Dual meaning: wait or hope', 211),
  es('llegar', 'to arrive', '/ʎe.ˈɣaɾ/', 'yeh-GAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs', 'travel'], 'Llego a las nueve.', 'I arrive at nine.', 'Arrival verb', 212),
  es('salir', 'to leave / go out', '/sa.ˈliɾ/', 'sah-LEER', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Salgo de casa a las ocho.', 'I leave home at eight.', 'Exit verb; irregular', 213),
  es('pagar', 'to pay', '/pa.ˈɣaɾ/', 'pah-GAR', 'verb', 'A2', 'easy', 'universal', ['general', 'business'], ['essential_verbs', 'money'], '¿Puedo pagar con tarjeta?', 'Can I pay by card?', 'Financial transaction', 214),
  es('ayudar', 'to help', '/a.ʝu.ˈdaɾ/', 'ah-yoo-DAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], '¿Puedes ayudarme?', 'Can you help me?', 'Assistance verb', 215),
  es('gustar', 'to like', '/ɡus.ˈtaɾ/', 'goos-TAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Me gusta la música.', 'I like music.', 'Inverted subject verb; me gusta = I like', 216),
  es('aprender', 'to learn', '/a.pɾen.ˈdeɾ/', 'ah-prehn-DEHR', 'verb', 'A2', 'easy', 'universal', ['general', 'education'], ['essential_verbs', 'education'], 'Quiero aprender español.', 'I want to learn Spanish.', 'Educational verb', 217),
  es('estudiar', 'to study', '/es.tu.ˈdjaɾ/', 'es-too-dee-AR', 'verb', 'A2', 'easy', 'universal', ['general', 'education', 'student'], ['essential_verbs', 'education'], 'Estudio español todos los días.', 'I study Spanish every day.', 'Academic verb', 218),
  es('recordar', 'to remember', '/re.koɾ.ˈdaɾ/', 'reh-kor-DAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'No recuerdo su nombre.', "I don't remember his name.", 'Memory verb; stem-changing', 219),
  es('olvidar', 'to forget', '/ol.bi.ˈdaɾ/', 'ohl-bee-DAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Olvidé mi contraseña.', 'I forgot my password.', 'Memory verb', 220),
  es('llevar', 'to carry / to wear', '/ʎe.ˈβaɾ/', 'yeh-BAR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Llevo una camisa azul.', 'I wear a blue shirt.', 'Dual meaning: carry or wear', 221),

  // Technology Basics
  es('teléfono', 'telephone', '/te.ˈle.fo.no/', 'teh-LEH-foh-noh', 'noun', 'A2', 'easy', 'universal', ['general', 'tech'], ['technology'], 'Mi teléfono no funciona.', "My phone doesn't work.", 'Communication device', 222),
  es('computadora', 'computer', '/kom.pu.ta.ˈdo.ɾa/', 'kohm-poo-tah-DOH-rah', 'noun', 'A2', 'easy', 'universal', ['general', 'tech'], ['technology'], 'Mi computadora es nueva.', 'My computer is new.', 'Computing device; ordenador in Spain', 223),
  es('televisión', 'television', '/te.le.βi.ˈsjon/', 'teh-leh-bee-see-OHN', 'noun', 'A2', 'easy', 'universal', ['general'], ['technology', 'entertainment'], 'Veo la televisión por la noche.', 'I watch television at night.', 'Entertainment device', 224),

  // Misc A2
  es('periódico', 'newspaper', '/pe.ɾi.ˈo.di.ko/', 'peh-ree-OH-dee-koh', 'noun', 'A2', 'easy', 'universal', ['general'], ['media'], 'Leo el periódico cada mañana.', 'I read the newspaper every morning.', 'News media', 225),
  es('carta', 'letter', '/ˈkaɾ.ta/', 'KAR-tah', 'noun', 'A2', 'easy', 'universal', ['general'], ['communication'], 'Escribo una carta a mi abuela.', 'I write a letter to my grandmother.', 'Written correspondence', 226),
  es('problema', 'problem', '/pɾo.ˈble.ma/', 'proh-BLEH-mah', 'noun', 'A2', 'easy', 'universal', ['general'], ['communication'], 'Tengo un problema.', 'I have a problem.', 'Issue; masculine despite -a ending', 227),
  es('respuesta', 'answer', '/res.ˈpwes.ta/', 'res-PWES-tah', 'noun', 'A2', 'easy', 'universal', ['general', 'education'], ['communication'], 'No tengo la respuesta.', "I don't have the answer.", 'Reply', 228),
  es('pregunta', 'question', '/pɾe.ˈɡun.ta/', 'preh-GOON-tah', 'noun', 'A2', 'easy', 'universal', ['general', 'education'], ['communication'], 'Tengo una pregunta.', 'I have a question.', 'Inquiry', 229),
  es('ejemplo', 'example', '/e.ˈxem.plo/', 'eh-HEM-ploh', 'noun', 'A2', 'easy', 'universal', ['general', 'education'], ['communication'], 'Dame un ejemplo.', 'Give me an example.', 'Illustration', 230),
  es('cambio', 'change', '/ˈkam.bjo/', 'KAHM-bee-oh', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['communication'], 'Necesito un cambio.', 'I need a change.', 'Also means coin change', 231),
  es('lugar', 'place', '/lu.ˈɣaɾ/', 'loo-GAR', 'noun', 'A2', 'easy', 'universal', ['general'], ['places'], 'Este es un buen lugar.', 'This is a good place.', 'Location noun', 232),
  es('mundo', 'world', '/ˈmun.do/', 'MOON-doh', 'noun', 'A2', 'easy', 'universal', ['general'], ['general'], 'El mundo es grande.', 'The world is big.', 'Global reference', 233),
  es('país', 'country', '/pa.ˈis/', 'pah-EES', 'noun', 'A2', 'easy', 'universal', ['general', 'government'], ['travel', 'geography'], '¿De qué país eres?', 'What country are you from?', 'National entity', 234),
  es('ciudad', 'city', '/sju.ˈdad/', 'see-oo-DAHD', 'noun', 'A2', 'easy', 'universal', ['general'], ['travel', 'geography'], 'Madrid es una ciudad grande.', 'Madrid is a big city.', 'Urban area', 235),
  es('iglesia', 'church', '/i.ˈɡle.sja/', 'ee-GLEH-see-ah', 'noun', 'A2', 'easy', 'universal', ['general'], ['places', 'culture'], 'La iglesia es muy antigua.', 'The church is very old.', 'Religious building', 236),
  es('playa', 'beach', '/ˈpla.ʝa/', 'PLAH-yah', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['travel', 'hobbies'], 'Vamos a la playa.', "Let's go to the beach.", 'Coastal area', 237),
  es('montaña', 'mountain', '/mon.ˈta.ɲa/', 'mohn-TAH-nyah', 'noun', 'A2', 'easy', 'universal', ['general'], ['travel', 'geography'], 'Las montañas son hermosas.', 'The mountains are beautiful.', 'Geographic feature', 238),
  es('cumpleaños', 'birthday', '/kum.ple.ˈa.ɲos/', 'koom-pleh-AH-nyos', 'noun', 'A2', 'easy', 'universal', ['general'], ['celebrations'], 'Mi cumpleaños es en marzo.', 'My birthday is in March.', 'Annual celebration', 239),
  es('fiesta', 'party', '/ˈfjes.ta/', 'fee-EHS-tah', 'noun', 'A2', 'easy', 'universal', ['general'], ['celebrations', 'social'], 'Hay una fiesta esta noche.', 'There is a party tonight.', 'Social gathering', 240),
  es('regalo', 'gift', '/re.ˈɣa.lo/', 'reh-GAH-loh', 'noun', 'A2', 'easy', 'universal', ['general'], ['celebrations', 'shopping'], 'Compré un regalo para ti.', 'I bought a gift for you.', 'Present', 241),
  es('vacaciones', 'vacation', '/ba.ka.ˈsjo.nes/', 'bah-kah-see-OH-nehs', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['travel', 'time'], 'Estoy de vacaciones.', 'I am on vacation.', 'Time off; always plural in Spanish', 242),
  es('trabajo', 'work / job', '/tɾa.ˈba.xo/', 'trah-BAH-hoh', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['work'], 'Mi trabajo es interesante.', 'My work is interesting.', 'Employment', 243),
  es('llave', 'key', '/ˈʎa.βe/', 'YAH-beh', 'noun', 'A2', 'easy', 'universal', ['general'], ['home', 'daily_routines'], 'No encuentro mis llaves.', "I can't find my keys.", 'Door key', 244),
  es('piso', 'floor / apartment', '/ˈpi.so/', 'PEE-soh', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Vivo en el tercer piso.', 'I live on the third floor.', 'Ground surface or flat (Spain)', 245),
  es('jardín', 'garden', '/xaɾ.ˈdin/', 'har-DEEN', 'noun', 'A2', 'easy', 'universal', ['general'], ['home', 'nature'], 'Mi jardín tiene flores.', 'My garden has flowers.', 'Outdoor space', 246),
  es('banco', 'bank / bench', '/ˈbaŋ.ko/', 'BAHN-koh', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['money', 'places'], 'Voy al banco a sacar dinero.', 'I go to the bank to withdraw money.', 'Financial institution or seating', 247),
  es('correo', 'mail / post office', '/ko.ˈre.o/', 'koh-REH-oh', 'noun', 'A2', 'easy', 'universal', ['general'], ['communication', 'places'], 'Envío una carta por correo.', 'I send a letter by mail.', 'Postal service', 248),
  es('supermercado', 'supermarket', '/su.peɾ.meɾ.ˈka.do/', 'soo-per-mehr-KAH-doh', 'noun', 'A2', 'easy', 'universal', ['general'], ['shopping', 'places'], 'Compro comida en el supermercado.', 'I buy food at the supermarket.', 'Grocery store', 249),
  es('parque', 'park', '/ˈpaɾ.ke/', 'PAR-keh', 'noun', 'A2', 'easy', 'universal', ['general'], ['places', 'hobbies'], 'Vamos al parque a caminar.', "Let's go to the park to walk.", 'Recreation area', 250),
];

// ============================================================================
// EN-ES VOCABULARY — B1 (~150 words)
// ============================================================================

const ES_B1: VoxVocabularySeed[] = [
  // Work & Business
  es('reunión', 'meeting', '/re.u.ˈnjon/', 'reh-oo-nee-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work', 'business'], 'La reunión comienza a las tres.', 'The meeting begins at three.', 'Professional gathering', 251),
  es('proyecto', 'project', '/pɾo.ˈʝek.to/', 'proh-YEHK-toh', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'tech'], ['work', 'business'], 'Estamos trabajando en un proyecto importante.', 'We are working on an important project.', 'Professional assignment', 252),
  es('cliente', 'client', '/kli.ˈen.te/', 'klee-EHN-teh', 'noun', 'B1', 'medium', 'universal', ['business', 'legal', 'creative'], ['work', 'business'], 'Nuestros clientes están satisfechos.', 'Our clients are satisfied.', 'Business relationship', 253),
  es('empresa', 'company', '/em.ˈpɾe.sa/', 'em-PREH-sah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work', 'business'], 'Trabajo para una empresa multinacional.', 'I work for a multinational company.', 'Business organization', 254),
  es('jefe', 'boss', '/ˈxe.fe/', 'HEH-feh', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Mi jefe es muy exigente.', 'My boss is very demanding.', 'Workplace superior', 255),
  es('empleado', 'employee', '/em.ple.ˈa.do/', 'em-pleh-AH-doh', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Los empleados trabajan ocho horas.', 'The employees work eight hours.', 'Worker', 256),
  es('salario', 'salary', '/sa.ˈla.ɾjo/', 'sah-LAH-ree-oh', 'noun', 'B1', 'medium', 'universal', ['business', 'general'], ['work', 'money'], 'Mi salario es competitivo.', 'My salary is competitive.', 'Compensation', 257),
  es('contrato', 'contract', '/kon.ˈtɾa.to/', 'kohn-TRAH-toh', 'noun', 'B1', 'medium', 'universal', ['business', 'legal'], ['work', 'legal'], 'Firmé un contrato de dos años.', 'I signed a two-year contract.', 'Legal agreement', 258),
  es('experiencia', 'experience', '/eks.pe.ɾi.ˈen.sja/', 'eks-peh-ree-EHN-see-ah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work', 'education'], 'Tengo diez años de experiencia.', 'I have ten years of experience.', 'Professional background', 259),
  es('entrevista', 'interview', '/en.tɾe.ˈβis.ta/', 'en-treh-BEES-tah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Tengo una entrevista mañana.', 'I have an interview tomorrow.', 'Job interview', 260),
  es('currículum', 'resume/CV', '/ku.ˈri.ku.lum/', 'koo-REE-koo-loom', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Envié mi currículum a la empresa.', 'I sent my resume to the company.', 'Career document', 261),
  es('negocio', 'business', '/ne.ˈɡo.sjo/', 'neh-GOH-see-oh', 'noun', 'B1', 'medium', 'universal', ['business', 'general'], ['work', 'business'], 'Mi negocio crece cada año.', 'My business grows every year.', 'Commercial enterprise', 262),
  es('presupuesto', 'budget', '/pɾe.su.ˈpwes.to/', 'preh-soo-PWEHS-toh', 'noun', 'B1', 'medium', 'field-specific', ['business', 'government'], ['work', 'money'], 'El presupuesto es limitado.', 'The budget is limited.', 'Financial plan', 263),
  es('responsabilidad', 'responsibility', '/res.pon.sa.bi.li.ˈdad/', 'res-pohn-sah-bee-lee-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Tengo mucha responsabilidad.', 'I have a lot of responsibility.', 'Professional duty', 264),

  // Travel
  es('pasaporte', 'passport', '/pa.sa.ˈpoɾ.te/', 'pah-sah-POR-teh', 'noun', 'B1', 'medium', 'universal', ['general', 'government'], ['travel', 'documents'], 'Necesito renovar mi pasaporte.', 'I need to renew my passport.', 'Travel document', 265),
  es('equipaje', 'luggage', '/e.ki.ˈpa.xe/', 'eh-kee-PAH-heh', 'noun', 'B1', 'medium', 'universal', ['general', 'hospitality'], ['travel'], 'Mi equipaje no ha llegado.', 'My luggage has not arrived.', 'Travel bags', 266),
  es('hotel', 'hotel', '/o.ˈtel/', 'oh-TEHL', 'noun', 'B1', 'easy', 'universal', ['general', 'hospitality'], ['travel', 'accommodation'], 'Reservé un hotel cerca del centro.', 'I booked a hotel near downtown.', 'Accommodation', 267),
  es('habitación', 'room', '/a.bi.ta.ˈsjon/', 'ah-bee-tah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'hospitality'], ['travel', 'accommodation'], 'Mi habitación tiene vista al mar.', 'My room has a sea view.', 'Hotel room', 268),
  es('reserva', 'reservation', '/re.ˈseɾ.βa/', 'reh-SEHR-bah', 'noun', 'B1', 'medium', 'universal', ['general', 'hospitality'], ['travel'], 'Hice una reserva para dos noches.', 'I made a reservation for two nights.', 'Booking', 269),
  es('turista', 'tourist', '/tu.ˈɾis.ta/', 'too-REES-tah', 'noun', 'B1', 'easy', 'universal', ['general', 'hospitality'], ['travel'], 'Hay muchos turistas en verano.', 'There are many tourists in summer.', 'Traveler', 270),
  es('vuelo', 'flight', '/ˈbwe.lo/', 'BWEH-loh', 'noun', 'B1', 'medium', 'universal', ['general', 'hospitality'], ['travel'], 'Mi vuelo sale a las seis.', 'My flight departs at six.', 'Air travel', 271),
  es('mapa', 'map', '/ˈma.pa/', 'MAH-pah', 'noun', 'B1', 'easy', 'universal', ['general'], ['travel', 'directions'], 'Necesito un mapa de la ciudad.', 'I need a map of the city.', 'Navigation aid', 272),
  es('moneda', 'currency/coin', '/mo.ˈne.da/', 'moh-NEH-dah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['travel', 'money'], '¿Cuál es la moneda local?', 'What is the local currency?', 'Money unit', 273),
  es('aduana', 'customs', '/a.ˈdwa.na/', 'ah-DWAH-nah', 'noun', 'B1', 'medium', 'field-specific', ['general', 'government'], ['travel'], 'Pasamos por la aduana sin problemas.', 'We went through customs without problems.', 'Border control', 274),

  // Health
  es('salud', 'health', '/sa.ˈlud/', 'sah-LOOD', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health'], 'La salud es lo más importante.', 'Health is the most important thing.', 'Wellbeing', 275),
  es('enfermedad', 'illness/disease', '/en.feɾ.me.ˈdad/', 'en-fer-meh-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health'], 'Es una enfermedad crónica.', 'It is a chronic illness.', 'Medical condition', 276),
  es('cita', 'appointment', '/ˈsi.ta/', 'SEE-tah', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health', 'work'], 'Tengo una cita con el médico.', 'I have an appointment with the doctor.', 'Scheduled meeting', 277),
  es('síntoma', 'symptom', '/ˈsin.to.ma/', 'SEEN-toh-mah', 'noun', 'B1', 'medium', 'field-specific', ['healthcare', 'general'], ['health'], 'Tengo síntomas de gripe.', 'I have flu symptoms.', 'Disease indication', 278),
  es('tratamiento', 'treatment', '/tɾa.ta.ˈmjen.to/', 'trah-tah-mee-EHN-toh', 'noun', 'B1', 'medium', 'field-specific', ['healthcare', 'general'], ['health'], 'El tratamiento dura tres meses.', 'The treatment lasts three months.', 'Medical care', 279),
  es('receta', 'prescription', '/re.ˈse.ta/', 'reh-SEH-tah', 'noun', 'B1', 'medium', 'field-specific', ['healthcare', 'general'], ['health'], 'El médico me dio una receta.', 'The doctor gave me a prescription.', 'Medical order', 280),
  es('emergencia', 'emergency', '/e.meɾ.ˈxen.sja/', 'eh-mer-HEN-see-ah', 'noun', 'B1', 'medium', 'survival', ['healthcare', 'general'], ['health', 'emergency'], 'Es una emergencia médica.', 'It is a medical emergency.', 'Urgent situation', 281),
  es('alergia', 'allergy', '/a.ˈleɾ.xja/', 'ah-LEHR-hee-ah', 'noun', 'B1', 'medium', 'field-specific', ['healthcare', 'general'], ['health'], 'Tengo alergia al polen.', 'I am allergic to pollen.', 'Immune reaction', 282),
  es('dieta', 'diet', '/ˈdje.ta/', 'dee-EH-tah', 'noun', 'B1', 'medium', 'universal', ['healthcare', 'general'], ['health', 'food'], 'Sigo una dieta equilibrada.', 'I follow a balanced diet.', 'Nutritional plan', 283),
  es('ejercicio', 'exercise', '/e.xeɾ.ˈsi.sjo/', 'eh-her-SEE-see-oh', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health', 'sports'], 'El ejercicio es beneficioso.', 'Exercise is beneficial.', 'Physical activity', 284),

  // Opinions & Communication
  es('opinión', 'opinion', '/o.pi.ˈnjon/', 'oh-pee-nee-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'En mi opinión, es correcto.', 'In my opinion, it is correct.', 'Point of view', 285),
  es('acuerdo', 'agreement', '/a.ˈkweɾ.do/', 'ah-KWEHR-doh', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'legal'], ['communication', 'business'], 'Llegamos a un acuerdo.', 'We reached an agreement.', 'Consensus', 286),
  es('discusión', 'discussion', '/dis.ku.ˈsjon/', 'dees-koo-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Tuvimos una discusión productiva.', 'We had a productive discussion.', 'Debate; can also mean argument', 287),
  es('explicar', 'to explain', '/eks.pli.ˈkaɾ/', 'eks-plee-KAR', 'verb', 'B1', 'medium', 'universal', ['general', 'education'], ['communication'], '¿Puedes explicar otra vez?', 'Can you explain again?', 'Clarification verb', 288),
  es('proponer', 'to propose', '/pɾo.po.ˈneɾ/', 'proh-poh-NEHR', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Propongo una nueva estrategia.', 'I propose a new strategy.', 'Suggestion verb', 289),
  es('sugerir', 'to suggest', '/su.xe.ˈɾiɾ/', 'soo-heh-REER', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Sugiero que lo reconsideres.', 'I suggest you reconsider.', 'Recommendation verb', 290),
  es('estar de acuerdo', 'to agree', '/es.ˈtaɾ de a.ˈkweɾ.do/', 'es-TAR deh ah-KWEHR-doh', 'phrase', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Estoy de acuerdo contigo.', 'I agree with you.', 'Agreement expression', 291),
  es('sin embargo', 'however', '/sin em.ˈbaɾ.ɡo/', 'seen em-BAR-goh', 'phrase', 'B1', 'medium', 'universal', ['general'], ['connectors'], 'Sin embargo, hay un problema.', 'However, there is a problem.', 'Contrast connector', 292),
  es('además', 'moreover/besides', '/a.de.ˈmas/', 'ah-deh-MAHS', 'adverb', 'B1', 'medium', 'universal', ['general'], ['connectors'], 'Además, tenemos otra opción.', 'Moreover, we have another option.', 'Addition connector', 293),
  es('por lo tanto', 'therefore', '/poɾ lo ˈtan.to/', 'por loh TAHN-toh', 'phrase', 'B1', 'medium', 'universal', ['general', 'education'], ['connectors'], 'Por lo tanto, debemos actuar.', 'Therefore, we must act.', 'Conclusion connector', 294),

  // Plans & Future
  es('plan', 'plan', '/plan/', 'plahn', 'noun', 'B1', 'easy', 'universal', ['general', 'business'], ['plans'], '¿Cuál es el plan para mañana?', 'What is the plan for tomorrow?', 'Future intention', 295),
  es('meta', 'goal', '/ˈme.ta/', 'MEH-tah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['plans', 'work'], 'Mi meta es hablar español con fluidez.', 'My goal is to speak Spanish fluently.', 'Objective', 296),
  es('oportunidad', 'opportunity', '/o.poɾ.tu.ni.ˈdad/', 'oh-por-too-nee-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work', 'plans'], 'Es una gran oportunidad.', 'It is a great opportunity.', 'Favorable circumstance', 297),
  es('decisión', 'decision', '/de.si.ˈsjon/', 'deh-see-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['plans', 'communication'], 'Tomé una decisión difícil.', 'I made a difficult decision.', 'Choice', 298),
  es('éxito', 'success', '/ˈek.si.to/', 'EHK-see-toh', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['plans', 'work'], 'El proyecto fue un éxito.', 'The project was a success.', 'Achievement', 299),
  es('fracaso', 'failure', '/fɾa.ˈka.so/', 'frah-KAH-soh', 'noun', 'B1', 'medium', 'universal', ['general'], ['plans'], 'Aprendemos del fracaso.', 'We learn from failure.', 'Lack of success', 300),

  // Relationships
  es('relación', 'relationship', '/re.la.ˈsjon/', 'reh-lah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general'], ['relationships'], 'Tenemos una buena relación.', 'We have a good relationship.', 'Connection', 301),
  es('amistad', 'friendship', '/a.mis.ˈtad/', 'ah-mees-TAHD', 'noun', 'B1', 'medium', 'universal', ['general'], ['relationships'], 'Nuestra amistad es fuerte.', 'Our friendship is strong.', 'Friendly bond', 302),
  es('confianza', 'trust/confidence', '/kon.fi.ˈan.sa/', 'kohn-fee-AHN-sah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['relationships', 'emotions'], 'La confianza se gana con el tiempo.', 'Trust is earned over time.', 'Reliance', 303),
  es('respeto', 'respect', '/res.ˈpe.to/', 'res-PEH-toh', 'noun', 'B1', 'medium', 'universal', ['general'], ['relationships'], 'El respeto mutuo es esencial.', 'Mutual respect is essential.', 'Regard', 304),
  es('pareja', 'partner/couple', '/pa.ˈɾe.xa/', 'pah-REH-hah', 'noun', 'B1', 'medium', 'universal', ['general'], ['relationships'], 'Mi pareja y yo viajamos juntos.', 'My partner and I travel together.', 'Romantic partner', 305),
  es('vecino', 'neighbor', '/be.ˈsi.no/', 'beh-SEE-noh', 'noun', 'B1', 'easy', 'universal', ['general'], ['relationships', 'home'], 'Mis vecinos son muy amables.', 'My neighbors are very kind.', 'Person living nearby', 306),

  // Culture
  es('cultura', 'culture', '/kul.ˈtu.ɾa/', 'kool-TOO-rah', 'noun', 'B1', 'medium', 'universal', ['general', 'education', 'creative'], ['culture'], 'La cultura española es fascinante.', 'Spanish culture is fascinating.', 'Societal practices', 307),
  es('tradición', 'tradition', '/tɾa.di.ˈsjon/', 'trah-dee-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture'], 'Es una tradición familiar.', 'It is a family tradition.', 'Custom', 308),
  es('costumbre', 'custom/habit', '/kos.ˈtum.bɾe/', 'kohs-TOOM-breh', 'noun', 'B1', 'medium', 'universal', ['general'], ['culture'], 'Es mi costumbre tomar café.', 'It is my habit to drink coffee.', 'Regular practice', 309),
  es('arte', 'art', '/ˈaɾ.te/', 'AHR-teh', 'noun', 'B1', 'medium', 'universal', ['general', 'creative', 'education'], ['culture', 'hobbies'], 'Me interesa el arte moderno.', 'I am interested in modern art.', 'Creative expression', 310),
  es('museo', 'museum', '/mu.ˈse.o/', 'moo-SEH-oh', 'noun', 'B1', 'easy', 'universal', ['general', 'creative', 'hospitality'], ['culture', 'places'], 'Visitamos el museo de arte.', 'We visited the art museum.', 'Cultural institution', 311),
  es('historia', 'history/story', '/is.ˈto.ɾja/', 'ees-TOH-ree-ah', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture', 'education'], 'La historia de España es rica.', 'The history of Spain is rich.', 'Past events or narrative', 312),
  es('idioma', 'language', '/i.ˈdjo.ma/', 'ee-dee-OH-mah', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture', 'education'], '¿Cuántos idiomas hablas?', 'How many languages do you speak?', 'Spoken language', 313),
  es('fiesta', 'festival/party', '/ˈfjes.ta/', 'fee-EHS-tah', 'noun', 'B1', 'easy', 'universal', ['general', 'hospitality'], ['culture', 'social'], 'La fiesta fue increíble.', 'The party was incredible.', 'Celebration', 314),

  // Technology
  es('internet', 'internet', '/in.teɾ.ˈnet/', 'een-ter-NEHT', 'noun', 'B1', 'easy', 'universal', ['general', 'tech'], ['technology'], 'Uso internet para trabajar.', 'I use the internet for work.', 'Global network', 315),
  es('correo electrónico', 'email', '/ko.ˈre.o e.lek.ˈtɾo.ni.ko/', 'koh-REH-oh eh-lek-TROH-nee-koh', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'tech'], ['technology', 'communication'], 'Envié un correo electrónico.', 'I sent an email.', 'Digital mail', 316),
  es('contraseña', 'password', '/kon.tɾa.ˈse.ɲa/', 'kohn-trah-SEH-nyah', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology'], 'Olvidé mi contraseña.', 'I forgot my password.', 'Access code', 317),
  es('aplicación', 'app/application', '/a.pli.ka.ˈsjon/', 'ah-plee-kah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology'], 'Descargué una nueva aplicación.', 'I downloaded a new app.', 'Software', 318),
  es('archivo', 'file', '/aɾ.ˈtʃi.βo/', 'ar-CHEE-boh', 'noun', 'B1', 'medium', 'universal', ['general', 'tech', 'business'], ['technology'], 'Guarda el archivo.', 'Save the file.', 'Digital document', 319),
  es('pantalla', 'screen', '/pan.ˈta.ʎa/', 'pahn-TAH-yah', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology'], 'La pantalla es muy grande.', 'The screen is very big.', 'Display', 320),
  es('red', 'network', '/red/', 'rehd', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology'], 'La red está lenta hoy.', 'The network is slow today.', 'Communication system', 321),
  es('descargar', 'to download', '/des.kaɾ.ˈɡaɾ/', 'des-kar-GAR', 'verb', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology'], 'Descargo la actualización.', 'I download the update.', 'File transfer', 322),

  // More B1 Verbs
  es('desarrollar', 'to develop', '/de.sa.ro.ˈʎaɾ/', 'deh-sah-roh-YAR', 'verb', 'B1', 'medium', 'universal', ['business', 'tech', 'general'], ['work'], 'Desarrollamos nuevos productos.', 'We develop new products.', 'Growth/creation verb', 323),
  es('organizar', 'to organize', '/oɾ.ɡa.ni.ˈsaɾ/', 'or-gah-nee-SAR', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Necesito organizar mi agenda.', 'I need to organize my schedule.', 'Planning verb', 324),
  es('mejorar', 'to improve', '/me.xo.ˈɾaɾ/', 'meh-hoh-RAR', 'verb', 'B1', 'medium', 'universal', ['general', 'education'], ['work', 'education'], 'Quiero mejorar mi español.', 'I want to improve my Spanish.', 'Enhancement verb', 325),
  es('comparar', 'to compare', '/kom.pa.ˈɾaɾ/', 'kohm-pah-RAR', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Vamos a comparar precios.', "Let's compare prices.", 'Evaluation verb', 326),
  es('demostrar', 'to demonstrate', '/de.mos.ˈtɾaɾ/', 'deh-mohs-TRAR', 'verb', 'B1', 'medium', 'universal', ['general', 'education', 'tech'], ['communication'], 'Voy a demostrar cómo funciona.', "I'll demonstrate how it works.", 'Showing verb', 327),
  es('conseguir', 'to get/obtain', '/kon.se.ˈɣiɾ/', 'kohn-seh-GEER', 'verb', 'B1', 'medium', 'universal', ['general'], ['essential_verbs'], 'Conseguí el trabajo.', 'I got the job.', 'Achievement verb', 328),
  es('preocuparse', 'to worry', '/pɾe.o.ku.ˈpaɾ.se/', 'preh-oh-koo-PAR-seh', 'verb', 'B1', 'medium', 'universal', ['general'], ['emotions'], 'No te preocupes por eso.', "Don't worry about that.", 'Reflexive anxiety verb', 329),
  es('disfrutar', 'to enjoy', '/dis.fɾu.ˈtaɾ/', 'dees-froo-TAR', 'verb', 'B1', 'medium', 'universal', ['general'], ['emotions', 'hobbies'], 'Disfruto de la música.', 'I enjoy music.', 'Pleasure verb', 330),
  es('compartir', 'to share', '/kom.paɾ.ˈtiɾ/', 'kohm-par-TEER', 'verb', 'B1', 'medium', 'universal', ['general'], ['communication', 'social'], 'Comparto mi experiencia.', 'I share my experience.', 'Distribution verb', 331),
  es('depender', 'to depend', '/de.pen.ˈdeɾ/', 'deh-pehn-DEHR', 'verb', 'B1', 'medium', 'universal', ['general'], ['communication'], 'Depende de la situación.', 'It depends on the situation.', 'Conditional verb', 332),
  es('pertenecer', 'to belong', '/peɾ.te.ne.ˈseɾ/', 'pehr-teh-neh-SEHR', 'verb', 'B1', 'medium', 'universal', ['general'], ['relationships'], 'Pertenezco a un equipo.', 'I belong to a team.', 'Membership verb', 333),
  es('lograr', 'to achieve', '/lo.ˈɣɾaɾ/', 'loh-GRAR', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['work', 'plans'], 'Logramos nuestras metas.', 'We achieved our goals.', 'Achievement verb', 334),

  // B1 Adjectives & Descriptors
  es('disponible', 'available', '/dis.po.ˈni.ble/', 'dees-poh-NEE-bleh', 'adjective', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], '¿Estás disponible mañana?', 'Are you available tomorrow?', 'Accessibility descriptor', 335),
  es('seguro', 'safe/sure', '/se.ˈɣu.ɾo/', 'seh-GOO-roh', 'adjective', 'B1', 'medium', 'universal', ['general'], ['description'], 'Estoy seguro de que es correcto.', "I'm sure it's correct.", 'Confidence/safety', 336),
  es('posible', 'possible', '/po.ˈsi.ble/', 'poh-SEE-bleh', 'adjective', 'B1', 'easy', 'universal', ['general'], ['description'], '¿Es posible cambiar la fecha?', 'Is it possible to change the date?', 'Possibility descriptor', 337),
  es('imposible', 'impossible', '/im.po.ˈsi.ble/', 'eem-poh-SEE-bleh', 'adjective', 'B1', 'easy', 'universal', ['general'], ['description'], 'Es imposible terminar hoy.', 'It is impossible to finish today.', 'Impossibility', 338),
  es('suficiente', 'enough/sufficient', '/su.fi.ˈsjen.te/', 'soo-fee-see-EHN-teh', 'adjective', 'B1', 'medium', 'universal', ['general'], ['quantity'], 'No hay tiempo suficiente.', 'There is not enough time.', 'Adequacy descriptor', 339),
  es('increíble', 'incredible', '/in.kɾe.ˈi.ble/', 'een-kreh-EE-bleh', 'adjective', 'B1', 'medium', 'universal', ['general'], ['description'], 'Fue una experiencia increíble.', 'It was an incredible experience.', 'Amazement', 340),
  es('útil', 'useful', '/ˈu.til/', 'OO-teel', 'adjective', 'B1', 'medium', 'universal', ['general'], ['description'], 'Esta herramienta es muy útil.', 'This tool is very useful.', 'Utility descriptor', 341),
  es('actual', 'current/present', '/ak.ˈtwal/', 'ahk-TWAHL', 'adjective', 'B1', 'medium', 'universal', ['general', 'business'], ['time'], 'La situación actual es compleja.', 'The current situation is complex.', 'Not "actual" in English!', 342),
  es('siguiente', 'next/following', '/si.ˈɣjen.te/', 'see-gee-EHN-teh', 'adjective', 'B1', 'medium', 'universal', ['general'], ['time'], 'La siguiente reunión es el lunes.', 'The next meeting is on Monday.', 'Sequence descriptor', 343),
  es('anterior', 'previous', '/an.te.ˈɾjoɾ/', 'ahn-teh-ree-OR', 'adjective', 'B1', 'medium', 'universal', ['general'], ['time'], 'El mes anterior fue mejor.', 'The previous month was better.', 'Sequence descriptor', 344),

  // Abstract Nouns
  es('problema', 'problem', '/pɾo.ˈble.ma/', 'proh-BLEH-mah', 'noun', 'B1', 'easy', 'universal', ['general'], ['communication'], 'El problema principal es el tiempo.', 'The main problem is time.', 'Difficulty', 345),
  es('solución', 'solution', '/so.lu.ˈsjon/', 'soh-loo-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['communication'], 'Encontramos una solución.', 'We found a solution.', 'Resolution', 346),
  es('razón', 'reason', '/ra.ˈson/', 'rah-SOHN', 'noun', 'B1', 'medium', 'universal', ['general'], ['communication'], 'La razón principal es el costo.', 'The main reason is the cost.', 'Justification', 347),
  es('resultado', 'result', '/re.sul.ˈta.do/', 'reh-sool-TAH-doh', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Los resultados son positivos.', 'The results are positive.', 'Outcome', 348),
  es('situación', 'situation', '/si.twa.ˈsjon/', 'see-twah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general'], ['communication'], 'La situación es complicada.', 'The situation is complicated.', 'Circumstance', 349),
  es('diferencia', 'difference', '/di.fe.ˈɾen.sja/', 'dee-feh-REN-see-ah', 'noun', 'B1', 'medium', 'universal', ['general'], ['communication'], '¿Cuál es la diferencia?', 'What is the difference?', 'Distinction', 350),
  es('ventaja', 'advantage', '/ben.ˈta.xa/', 'behn-TAH-hah', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Hablar dos idiomas es una ventaja.', 'Speaking two languages is an advantage.', 'Benefit', 351),
  es('desventaja', 'disadvantage', '/des.ben.ˈta.xa/', 'des-behn-TAH-hah', 'noun', 'B1', 'medium', 'universal', ['general'], ['communication'], 'La distancia es una desventaja.', 'The distance is a disadvantage.', 'Drawback', 352),
  es('proceso', 'process', '/pɾo.ˈse.so/', 'proh-SEH-soh', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'tech'], ['work'], 'El proceso es muy largo.', 'The process is very long.', 'Procedure', 353),
  es('información', 'information', '/in.foɾ.ma.ˈsjon/', 'een-for-mah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['communication'], 'Necesito más información.', 'I need more information.', 'Data', 354),
  es('servicio', 'service', '/seɾ.ˈbi.sjo/', 'ser-BEE-see-oh', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'hospitality'], ['work', 'business'], 'El servicio al cliente es excelente.', 'The customer service is excellent.', 'Assistance', 355),
  es('calidad', 'quality', '/ka.li.ˈdad/', 'kah-lee-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'La calidad del producto es alta.', 'The product quality is high.', 'Standard', 356),
  es('cantidad', 'quantity', '/kan.ti.ˈdad/', 'kahn-tee-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['quantity'], 'La cantidad es suficiente.', 'The quantity is sufficient.', 'Amount', 357),
  es('ambiente', 'environment/atmosphere', '/am.ˈbjen.te/', 'ahm-bee-EHN-teh', 'noun', 'B1', 'medium', 'universal', ['general'], ['culture', 'work'], 'El ambiente de trabajo es bueno.', 'The work environment is good.', 'Surroundings', 358),
  es('gobierno', 'government', '/ɡo.ˈbjeɾ.no/', 'goh-bee-EHR-noh', 'noun', 'B1', 'medium', 'universal', ['general', 'government'], ['politics'], 'El gobierno aprobó la ley.', 'The government approved the law.', 'State administration', 359),
  es('sociedad', 'society', '/so.sje.ˈdad/', 'soh-see-eh-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture'], 'La sociedad está cambiando.', 'Society is changing.', 'Human community', 360),
  es('educación', 'education', '/e.du.ka.ˈsjon/', 'eh-doo-kah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['education'], 'La educación es fundamental.', 'Education is fundamental.', 'Learning system', 361),
  es('investigación', 'research', '/in.bes.ti.ɡa.ˈsjon/', 'een-bes-tee-gah-see-OHN', 'noun', 'B1', 'medium', 'field-specific', ['education', 'tech', 'healthcare'], ['education', 'work'], 'La investigación es importante.', 'Research is important.', 'Systematic inquiry', 362),
  es('seguridad', 'security/safety', '/se.ɡu.ɾi.ˈdad/', 'seh-goo-ree-DAHD', 'noun', 'B1', 'medium', 'universal', ['general', 'tech', 'government'], ['work'], 'La seguridad es una prioridad.', 'Security is a priority.', 'Protection', 363),
  es('derecho', 'right/law', '/de.ˈɾe.tʃo/', 'deh-REH-choh', 'noun', 'B1', 'medium', 'universal', ['general', 'legal', 'government'], ['legal', 'politics'], 'Todos tienen derechos.', 'Everyone has rights.', 'Legal entitlement', 364),
  es('ley', 'law', '/lei/', 'ley', 'noun', 'B1', 'medium', 'universal', ['general', 'legal', 'government'], ['legal', 'politics'], 'La ley protege a los ciudadanos.', 'The law protects citizens.', 'Legal statute', 365),
  es('desarrollo', 'development', '/de.sa.ˈro.ʎo/', 'deh-sah-ROH-yoh', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'tech'], ['work', 'business'], 'El desarrollo del proyecto va bien.', 'The project development is going well.', 'Growth/progress', 366),
  es('comercio', 'commerce/trade', '/ko.ˈmeɾ.sjo/', 'koh-MEHR-see-oh', 'noun', 'B1', 'medium', 'universal', ['business', 'general'], ['business'], 'El comercio internacional crece.', 'International trade grows.', 'Business activity', 367),
  es('mercado', 'market', '/meɾ.ˈka.do/', 'mehr-KAH-doh', 'noun', 'B1', 'medium', 'universal', ['business', 'general'], ['business', 'shopping'], 'El mercado está muy competitivo.', 'The market is very competitive.', 'Commercial space', 368),
  es('importar', 'to matter/to import', '/im.poɾ.ˈtaɾ/', 'eem-por-TAR', 'verb', 'B1', 'medium', 'universal', ['general'], ['communication'], 'No importa, no te preocupes.', "It doesn't matter, don't worry.", 'Significance or trade verb', 369),
  es('mayoría', 'majority', '/ma.ʝo.ˈɾi.a/', 'mah-yoh-REE-ah', 'noun', 'B1', 'medium', 'universal', ['general'], ['quantity'], 'La mayoría está de acuerdo.', 'The majority agrees.', 'Greater part', 370),

  // Misc B1
  es('medio', 'means/medium/half', '/ˈme.djo/', 'MEH-dee-oh', 'noun', 'B1', 'medium', 'universal', ['general'], ['communication'], 'Los medios de comunicación.', 'The media.', 'Communication channel or half', 371),
  es('sistema', 'system', '/sis.ˈte.ma/', 'sees-TEH-mah', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology', 'work'], 'El sistema funciona bien.', 'The system works well.', 'Organized structure', 372),
  es('programa', 'program', '/pɾo.ˈɡɾa.ma/', 'proh-GRAH-mah', 'noun', 'B1', 'medium', 'universal', ['general', 'tech', 'education'], ['technology', 'education'], 'El programa educativo es excelente.', 'The educational program is excellent.', 'Organized plan or software', 373),
  es('nivel', 'level', '/ni.ˈbel/', 'nee-BEHL', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['education', 'work'], 'Mi nivel de español es intermedio.', 'My Spanish level is intermediate.', 'Degree or rank', 374),
  es('valor', 'value', '/ba.ˈloɾ/', 'bah-LOR', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['business', 'communication'], 'El valor de la honestidad.', 'The value of honesty.', 'Worth', 375),
  es('esfuerzo', 'effort', '/es.ˈfweɾ.so/', 'es-FWEHR-soh', 'noun', 'B1', 'medium', 'universal', ['general'], ['work'], 'Requiere mucho esfuerzo.', 'It requires a lot of effort.', 'Exertion', 376),
  es('conocimiento', 'knowledge', '/ko.no.si.ˈmjen.to/', 'koh-noh-see-mee-EHN-toh', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['education'], 'El conocimiento es poder.', 'Knowledge is power.', 'Understanding', 377),
  es('herramienta', 'tool', '/e.ra.ˈmjen.ta/', 'eh-rah-mee-EHN-tah', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['work', 'technology'], 'Esta herramienta es muy útil.', 'This tool is very useful.', 'Instrument', 378),
  es('mensaje', 'message', '/men.ˈsa.xe/', 'mehn-SAH-heh', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['communication', 'technology'], 'Te envié un mensaje.', 'I sent you a message.', 'Communication unit', 379),
  es('dato', 'data/fact', '/ˈda.to/', 'DAH-toh', 'noun', 'B1', 'medium', 'universal', ['general', 'tech', 'business'], ['technology', 'work'], 'Los datos confirman la tendencia.', 'The data confirms the trend.', 'Information unit', 380),
];

// ============================================================================
// EN-ES VOCABULARY — B2 (~100 words)
// ============================================================================

const ES_B2: VoxVocabularySeed[] = [
  // Politics & News
  es('elección', 'election', '/e.lek.ˈsjon/', 'eh-lek-see-OHN', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics', 'news'], 'Las elecciones son en noviembre.', 'The elections are in November.', 'Political vote', 381),
  es('democracia', 'democracy', '/de.mo.ˈkɾa.sja/', 'deh-moh-KRAH-see-ah', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics'], 'La democracia requiere participación.', 'Democracy requires participation.', 'Political system', 382),
  es('ciudadano', 'citizen', '/sju.da.ˈda.no/', 'see-oo-dah-DAH-noh', 'noun', 'B2', 'medium', 'universal', ['general', 'government', 'legal'], ['politics'], 'Los ciudadanos tienen derechos.', 'Citizens have rights.', 'Member of a state', 383),
  es('política', 'politics/policy', '/po.ˈli.ti.ka/', 'poh-LEE-tee-kah', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics'], 'La política económica cambió.', 'The economic policy changed.', 'Governance domain', 384),
  es('impuesto', 'tax', '/im.ˈpwes.to/', 'eem-PWES-toh', 'noun', 'B2', 'medium', 'field-specific', ['business', 'government', 'legal'], ['politics', 'money'], 'Los impuestos subieron este año.', 'Taxes went up this year.', 'Government revenue', 385),
  es('economía', 'economy', '/e.ko.no.ˈmi.a/', 'eh-koh-noh-MEE-ah', 'noun', 'B2', 'medium', 'universal', ['business', 'government', 'general'], ['politics', 'business'], 'La economía está en crecimiento.', 'The economy is growing.', 'Financial system', 386),
  es('crisis', 'crisis', '/ˈkɾi.sis/', 'KREE-sees', 'noun', 'B2', 'medium', 'universal', ['general', 'business', 'government'], ['politics', 'news'], 'La crisis afectó a todos.', 'The crisis affected everyone.', 'Critical situation', 387),
  es('corrupción', 'corruption', '/ko.rup.ˈsjon/', 'koh-roop-see-OHN', 'noun', 'B2', 'hard', 'universal', ['general', 'government', 'legal'], ['politics'], 'La corrupción es un problema grave.', 'Corruption is a serious problem.', 'Dishonest behavior', 388),
  es('protesta', 'protest', '/pɾo.ˈtes.ta/', 'proh-TES-tah', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics', 'news'], 'Hubo una protesta pacífica.', 'There was a peaceful protest.', 'Public demonstration', 389),
  es('reforma', 'reform', '/re.ˈfoɾ.ma/', 'reh-FOR-mah', 'noun', 'B2', 'medium', 'field-specific', ['government', 'legal', 'general'], ['politics'], 'La reforma educativa fue aprobada.', 'The education reform was approved.', 'Systematic change', 390),

  // Environment
  es('medio ambiente', 'environment', '/ˈme.djo am.ˈbjen.te/', 'MEH-dee-oh ahm-bee-EHN-teh', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['environment'], 'Debemos proteger el medio ambiente.', 'We must protect the environment.', 'Natural world', 391),
  es('contaminación', 'pollution', '/kon.ta.mi.na.ˈsjon/', 'kohn-tah-mee-nah-see-OHN', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['environment'], 'La contaminación del aire es grave.', 'Air pollution is serious.', 'Environmental damage', 392),
  es('cambio climático', 'climate change', '/ˈkam.bjo kli.ˈma.ti.ko/', 'KAHM-bee-oh klee-MAH-tee-koh', 'phrase', 'B2', 'medium', 'universal', ['general', 'government'], ['environment'], 'El cambio climático es una crisis.', 'Climate change is a crisis.', 'Global warming', 393),
  es('sostenible', 'sustainable', '/sos.te.ˈni.ble/', 'sohs-teh-NEE-bleh', 'adjective', 'B2', 'medium', 'universal', ['general', 'business', 'government'], ['environment'], 'Buscamos prácticas sostenibles.', 'We seek sustainable practices.', 'Environmentally responsible', 394),
  es('reciclaje', 'recycling', '/re.si.ˈkla.xe/', 'reh-see-KLAH-heh', 'noun', 'B2', 'medium', 'universal', ['general'], ['environment'], 'El reciclaje es importante.', 'Recycling is important.', 'Waste management', 395),
  es('energía', 'energy', '/e.neɾ.ˈxi.a/', 'eh-nehr-HEE-ah', 'noun', 'B2', 'medium', 'universal', ['general', 'tech'], ['environment', 'technology'], 'La energía renovable crece.', 'Renewable energy grows.', 'Power source', 396),
  es('recurso', 'resource', '/re.ˈkuɾ.so/', 'reh-KOOR-soh', 'noun', 'B2', 'medium', 'universal', ['general', 'business'], ['environment', 'business'], 'Los recursos naturales son limitados.', 'Natural resources are limited.', 'Available asset', 397),

  // Professional — Business
  es('estrategia', 'strategy', '/es.tɾa.ˈte.xja/', 'es-trah-TEH-hee-ah', 'noun', 'B2', 'medium', 'field-specific', ['business', 'general'], ['business'], 'La estrategia es efectiva.', 'The strategy is effective.', 'Planned approach', 398),
  es('inversión', 'investment', '/in.beɾ.ˈsjon/', 'een-behr-see-OHN', 'noun', 'B2', 'medium', 'field-specific', ['business', 'general'], ['business', 'money'], 'Mi inversión fue exitosa.', 'My investment was successful.', 'Financial commitment', 399),
  es('rentabilidad', 'profitability', '/ren.ta.bi.li.ˈdad/', 'ren-tah-bee-lee-DAHD', 'noun', 'B2', 'hard', 'field-specific', ['business'], ['business', 'money'], 'La rentabilidad es la prioridad.', 'Profitability is the priority.', 'Profit potential', 400),
  es('competencia', 'competition/competence', '/kom.pe.ˈten.sja/', 'kohm-peh-TEN-see-ah', 'noun', 'B2', 'medium', 'universal', ['business', 'general'], ['business'], 'La competencia es feroz.', 'The competition is fierce.', 'Rivalry or skill', 401),
  es('logística', 'logistics', '/lo.ˈxis.ti.ka/', 'loh-HEES-tee-kah', 'noun', 'B2', 'hard', 'field-specific', ['business', 'general'], ['business'], 'La logística es compleja.', 'Logistics is complex.', 'Supply chain', 402),
  es('liderazgo', 'leadership', '/li.de.ˈɾas.ɡo/', 'lee-deh-RAHS-goh', 'noun', 'B2', 'medium', 'field-specific', ['business', 'government'], ['work'], 'Su liderazgo es inspirador.', 'His leadership is inspiring.', 'Guiding ability', 403),
  es('innovación', 'innovation', '/in.no.ba.ˈsjon/', 'een-noh-bah-see-OHN', 'noun', 'B2', 'medium', 'field-specific', ['business', 'tech'], ['business', 'technology'], 'La innovación impulsa el progreso.', 'Innovation drives progress.', 'New method/idea', 404),
  es('productividad', 'productivity', '/pɾo.duk.ti.βi.ˈdad/', 'proh-dook-tee-bee-DAHD', 'noun', 'B2', 'hard', 'field-specific', ['business', 'general'], ['work'], 'La productividad mejoró.', 'Productivity improved.', 'Output efficiency', 405),

  // Professional — Healthcare
  es('diagnóstico', 'diagnosis', '/djaɡ.ˈnos.ti.ko/', 'dee-ahg-NOS-tee-koh', 'noun', 'B2', 'hard', 'field-specific', ['healthcare'], ['health'], 'El diagnóstico fue temprano.', 'The diagnosis was early.', 'Medical identification', 406),
  es('cirugía', 'surgery', '/si.ɾu.ˈxi.a/', 'see-roo-HEE-ah', 'noun', 'B2', 'hard', 'field-specific', ['healthcare'], ['health'], 'La cirugía fue exitosa.', 'The surgery was successful.', 'Surgical procedure', 407),
  es('paciente', 'patient', '/pa.ˈsjen.te/', 'pah-see-EHN-teh', 'noun', 'B2', 'medium', 'field-specific', ['healthcare'], ['health', 'work'], 'El paciente se recupera bien.', 'The patient is recovering well.', 'Healthcare recipient', 408),
  es('enfermero', 'nurse', '/en.feɾ.ˈme.ɾo/', 'en-fer-MEH-roh', 'noun', 'B2', 'medium', 'field-specific', ['healthcare'], ['health', 'work'], 'La enfermera me tomó la presión.', 'The nurse took my blood pressure.', 'Healthcare professional', 409),
  es('vacuna', 'vaccine', '/ba.ˈku.na/', 'bah-KOO-nah', 'noun', 'B2', 'medium', 'field-specific', ['healthcare', 'general'], ['health'], 'La vacuna es segura y efectiva.', 'The vaccine is safe and effective.', 'Preventive medicine', 410),
  es('análisis', 'analysis/test', '/a.ˈna.li.sis/', 'ah-NAH-lee-sees', 'noun', 'B2', 'medium', 'field-specific', ['healthcare', 'business', 'tech'], ['health', 'work'], 'Los análisis de sangre son normales.', 'The blood tests are normal.', 'Examination', 411),

  // Professional — Legal
  es('abogado', 'lawyer', '/a.βo.ˈɣa.do/', 'ah-boh-GAH-doh', 'noun', 'B2', 'medium', 'field-specific', ['legal', 'general'], ['legal', 'work'], 'Consulté con un abogado.', 'I consulted with a lawyer.', 'Legal professional', 412),
  es('juicio', 'trial/judgment', '/ˈxwi.sjo/', 'HWEE-see-oh', 'noun', 'B2', 'hard', 'field-specific', ['legal', 'government'], ['legal'], 'El juicio comienza el lunes.', 'The trial begins on Monday.', 'Legal proceeding', 413),
  es('demanda', 'lawsuit/demand', '/de.ˈman.da/', 'deh-MAHN-dah', 'noun', 'B2', 'hard', 'field-specific', ['legal', 'business'], ['legal'], 'Presentaron una demanda.', 'They filed a lawsuit.', 'Legal action', 414),
  es('testigo', 'witness', '/tes.ˈti.ɣo/', 'tes-TEE-goh', 'noun', 'B2', 'hard', 'field-specific', ['legal'], ['legal'], 'El testigo declaró ante el juez.', 'The witness testified before the judge.', 'Legal witness', 415),
  es('culpable', 'guilty', '/kul.ˈpa.ble/', 'kool-PAH-bleh', 'adjective', 'B2', 'medium', 'field-specific', ['legal'], ['legal'], 'El acusado es culpable.', 'The defendant is guilty.', 'Legal verdict', 416),

  // Professional — Tech
  es('base de datos', 'database', '/ˈba.se de ˈda.tos/', 'BAH-seh deh DAH-tohs', 'phrase', 'B2', 'medium', 'field-specific', ['tech', 'business'], ['technology'], 'La base de datos está actualizada.', 'The database is up to date.', 'Data storage system', 417),
  es('algoritmo', 'algorithm', '/al.ɡo.ˈɾit.mo/', 'ahl-goh-REET-moh', 'noun', 'B2', 'hard', 'field-specific', ['tech'], ['technology'], 'El algoritmo es eficiente.', 'The algorithm is efficient.', 'Computational procedure', 418),
  es('inteligencia artificial', 'artificial intelligence', '/in.te.li.ˈxen.sja aɾ.ti.fi.ˈsjal/', 'een-teh-lee-HEN-see-ah ar-tee-fee-see-AHL', 'phrase', 'B2', 'hard', 'field-specific', ['tech'], ['technology'], 'La inteligencia artificial avanza rápido.', 'Artificial intelligence advances quickly.', 'AI', 419),
  es('ciberseguridad', 'cybersecurity', '/si.beɾ.se.ɣu.ɾi.ˈdad/', 'see-behr-seh-goo-ree-DAHD', 'noun', 'B2', 'hard', 'field-specific', ['tech', 'business'], ['technology'], 'La ciberseguridad es prioritaria.', 'Cybersecurity is a priority.', 'Digital security', 420),

  // Abstract Concepts
  es('igualdad', 'equality', '/i.ɣwal.ˈdad/', 'ee-gwahl-DAHD', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics', 'culture'], 'La igualdad es un derecho fundamental.', 'Equality is a fundamental right.', 'Fairness concept', 421),
  es('libertad', 'freedom', '/li.beɾ.ˈtad/', 'lee-behr-TAHD', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics', 'culture'], 'La libertad de expresión es esencial.', 'Freedom of speech is essential.', 'Independence', 422),
  es('justicia', 'justice', '/xus.ˈti.sja/', 'hoos-TEE-see-ah', 'noun', 'B2', 'medium', 'universal', ['general', 'legal', 'government'], ['legal', 'politics'], 'La justicia debe ser equitativa.', 'Justice must be fair.', 'Fairness', 423),
  es('responsable', 'responsible', '/res.pon.ˈsa.ble/', 'res-pohn-SAH-bleh', 'adjective', 'B2', 'medium', 'universal', ['general', 'business'], ['work', 'description'], 'Eres responsable de este proyecto.', 'You are responsible for this project.', 'Accountable', 424),
  es('eficiente', 'efficient', '/e.fi.ˈsjen.te/', 'eh-fee-see-EHN-teh', 'adjective', 'B2', 'medium', 'universal', ['general', 'business', 'tech'], ['work', 'description'], 'El proceso es más eficiente ahora.', 'The process is more efficient now.', 'Productive with minimal waste', 425),
  es('complejo', 'complex', '/kom.ˈple.xo/', 'kohm-PLEH-hoh', 'adjective', 'B2', 'medium', 'universal', ['general'], ['description'], 'Es un problema complejo.', 'It is a complex problem.', 'Multi-layered', 426),
  es('significativo', 'significant', '/siɡ.ni.fi.ka.ˈti.βo/', 'seeg-nee-fee-kah-TEE-boh', 'adjective', 'B2', 'medium', 'universal', ['general', 'business'], ['description'], 'Hubo un cambio significativo.', 'There was a significant change.', 'Noteworthy', 427),
  es('fundamental', 'fundamental', '/fun.da.men.ˈtal/', 'foon-dah-men-TAHL', 'adjective', 'B2', 'medium', 'universal', ['general'], ['description'], 'Es un principio fundamental.', 'It is a fundamental principle.', 'Essential', 428),

  // B2 Verbs
  es('analizar', 'to analyze', '/a.na.li.ˈsaɾ/', 'ah-nah-lee-SAR', 'verb', 'B2', 'medium', 'universal', ['general', 'business', 'tech'], ['work'], 'Necesitamos analizar los datos.', 'We need to analyze the data.', 'Examination verb', 429),
  es('influir', 'to influence', '/in.flu.ˈiɾ/', 'een-floo-EER', 'verb', 'B2', 'medium', 'universal', ['general', 'business'], ['communication'], 'Las redes sociales influyen mucho.', 'Social media influences a lot.', 'Impact verb', 430),
  es('contribuir', 'to contribute', '/kon.tɾi.bu.ˈiɾ/', 'kohn-tree-boo-EER', 'verb', 'B2', 'medium', 'universal', ['general'], ['communication'], 'Todos contribuyen al proyecto.', 'Everyone contributes to the project.', 'Participation verb', 431),
  es('establecer', 'to establish', '/es.ta.ble.ˈseɾ/', 'es-tah-bleh-SEHR', 'verb', 'B2', 'medium', 'universal', ['general', 'business'], ['work'], 'Establecemos nuevas normas.', 'We establish new rules.', 'Foundation verb', 432),
  es('implementar', 'to implement', '/im.ple.men.ˈtaɾ/', 'eem-pleh-men-TAR', 'verb', 'B2', 'medium', 'field-specific', ['business', 'tech', 'government'], ['work', 'technology'], 'Implementamos el nuevo sistema.', 'We implement the new system.', 'Execution verb', 433),
  es('gestionar', 'to manage', '/xes.tjo.ˈnaɾ/', 'hes-tee-oh-NAR', 'verb', 'B2', 'medium', 'field-specific', ['business', 'general'], ['work'], 'Gestiono un equipo de diez personas.', 'I manage a team of ten people.', 'Administration verb', 434),
  es('evaluar', 'to evaluate', '/e.ba.lu.ˈaɾ/', 'eh-bah-loo-AR', 'verb', 'B2', 'medium', 'universal', ['general', 'business', 'education'], ['work'], 'Vamos a evaluar los resultados.', "Let's evaluate the results.", 'Assessment verb', 435),
  es('negociar', 'to negotiate', '/ne.ɣo.ˈsjaɾ/', 'neh-goh-see-AR', 'verb', 'B2', 'medium', 'field-specific', ['business', 'legal'], ['business'], 'Negociamos el contrato.', 'We negotiate the contract.', 'Bargaining verb', 436),
  es('garantizar', 'to guarantee', '/ɡa.ɾan.ti.ˈsaɾ/', 'gah-rahn-tee-SAR', 'verb', 'B2', 'medium', 'universal', ['general', 'business', 'legal'], ['business', 'legal'], 'Garantizamos la calidad.', 'We guarantee the quality.', 'Assurance verb', 437),
  es('asumir', 'to assume/take on', '/a.su.ˈmiɾ/', 'ah-soo-MEER', 'verb', 'B2', 'medium', 'universal', ['general', 'business'], ['work'], 'Asumo la responsabilidad.', 'I take on the responsibility.', 'Acceptance verb', 438),

  // B2 Education
  es('aprendizaje', 'learning', '/a.pɾen.di.ˈsa.xe/', 'ah-prehn-dee-SAH-heh', 'noun', 'B2', 'medium', 'universal', ['education', 'general'], ['education'], 'El aprendizaje es continuo.', 'Learning is continuous.', 'Knowledge acquisition', 439),
  es('hipótesis', 'hypothesis', '/i.ˈpo.te.sis/', 'ee-POH-teh-sees', 'noun', 'B2', 'hard', 'field-specific', ['education', 'tech'], ['education'], 'Nuestra hipótesis fue correcta.', 'Our hypothesis was correct.', 'Proposed explanation', 440),
  es('conclusión', 'conclusion', '/kon.klu.ˈsjon/', 'kohn-kloo-see-OHN', 'noun', 'B2', 'medium', 'universal', ['general', 'education'], ['communication', 'education'], 'En conclusión, fue un éxito.', 'In conclusion, it was a success.', 'Final judgment', 441),
  es('perspectiva', 'perspective', '/peɾs.pek.ˈti.βa/', 'pers-pek-TEE-bah', 'noun', 'B2', 'medium', 'universal', ['general', 'education'], ['communication'], 'Desde mi perspectiva, es viable.', 'From my perspective, it is viable.', 'Point of view', 442),
  es('tendencia', 'trend', '/ten.ˈden.sja/', 'ten-DEN-see-ah', 'noun', 'B2', 'medium', 'universal', ['general', 'business', 'tech'], ['business', 'technology'], 'Es una tendencia global.', 'It is a global trend.', 'Direction of change', 443),

  // B2 Misc
  es('compromiso', 'commitment/compromise', '/kom.pɾo.ˈmi.so/', 'kohm-proh-MEE-soh', 'noun', 'B2', 'medium', 'universal', ['general', 'business'], ['work', 'relationships'], 'Nuestro compromiso es firme.', 'Our commitment is firm.', 'Dedication or agreement', 444),
  es('desafío', 'challenge', '/de.sa.ˈfi.o/', 'deh-sah-FEE-oh', 'noun', 'B2', 'medium', 'universal', ['general', 'business'], ['work'], 'Cada desafío es una oportunidad.', 'Every challenge is an opportunity.', 'Difficulty to overcome', 445),
  es('impacto', 'impact', '/im.ˈpak.to/', 'eem-PAHK-toh', 'noun', 'B2', 'medium', 'universal', ['general', 'business'], ['communication'], 'El impacto fue enorme.', 'The impact was enormous.', 'Effect', 446),
  es('alcance', 'scope/reach', '/al.ˈkan.se/', 'ahl-KAHN-seh', 'noun', 'B2', 'medium', 'field-specific', ['business', 'tech'], ['work'], 'El alcance del proyecto es amplio.', 'The scope of the project is broad.', 'Extent', 447),
  es('presupuesto', 'budget', '/pɾe.su.ˈpwes.to/', 'preh-soo-PWES-toh', 'noun', 'B2', 'medium', 'field-specific', ['business', 'government'], ['money', 'work'], 'El presupuesto fue aprobado.', 'The budget was approved.', 'Financial plan', 448),
  es('plazo', 'deadline/term', '/ˈpla.so/', 'PLAH-soh', 'noun', 'B2', 'medium', 'field-specific', ['business', 'legal'], ['work', 'time'], 'El plazo vence el viernes.', 'The deadline is Friday.', 'Time limit', 449),
  es('rendimiento', 'performance/yield', '/ren.di.ˈmjen.to/', 'ren-dee-mee-EHN-toh', 'noun', 'B2', 'hard', 'field-specific', ['business', 'tech'], ['work'], 'El rendimiento del equipo mejoró.', 'The team performance improved.', 'Output quality', 450),
  es('bienestar', 'wellbeing', '/bjen.es.ˈtaɾ/', 'bee-ehn-es-TAR', 'noun', 'B2', 'medium', 'universal', ['general', 'healthcare'], ['health', 'emotions'], 'El bienestar de los empleados importa.', 'Employee wellbeing matters.', 'State of comfort', 451),
  es('conciencia', 'awareness/conscience', '/kon.ˈsjen.sja/', 'kohn-see-EHN-see-ah', 'noun', 'B2', 'medium', 'universal', ['general'], ['culture', 'environment'], 'Hay mayor conciencia ambiental.', 'There is greater environmental awareness.', 'State of knowing', 452),
  es('diversidad', 'diversity', '/di.beɾ.si.ˈdad/', 'dee-behr-see-DAHD', 'noun', 'B2', 'medium', 'universal', ['general', 'business', 'education'], ['culture'], 'La diversidad enriquece al equipo.', 'Diversity enriches the team.', 'Variety', 453),
  es('globalización', 'globalization', '/ɡlo.ba.li.sa.ˈsjon/', 'gloh-bah-lee-sah-see-OHN', 'noun', 'B2', 'hard', 'universal', ['business', 'government', 'general'], ['politics', 'business'], 'La globalización conecta mercados.', 'Globalization connects markets.', 'International integration', 454),
  es('emprendedor', 'entrepreneur', '/em.pɾen.de.ˈdoɾ/', 'em-prehn-deh-DOR', 'noun', 'B2', 'medium', 'field-specific', ['business'], ['work', 'business'], 'Es un emprendedor exitoso.', 'He is a successful entrepreneur.', 'Business founder', 455),
  es('sostenibilidad', 'sustainability', '/sos.te.ni.bi.li.ˈdad/', 'sohs-teh-nee-bee-lee-DAHD', 'noun', 'B2', 'hard', 'field-specific', ['business', 'government'], ['environment', 'business'], 'La sostenibilidad es clave.', 'Sustainability is key.', 'Long-term viability', 456),
  es('desigualdad', 'inequality', '/de.si.ɣwal.ˈdad/', 'deh-see-gwahl-DAHD', 'noun', 'B2', 'hard', 'universal', ['general', 'government'], ['politics', 'culture'], 'La desigualdad es un reto.', 'Inequality is a challenge.', 'Disparity', 457),
  es('migración', 'migration', '/mi.ɣɾa.ˈsjon/', 'mee-grah-see-OHN', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics', 'culture'], 'La migración es un tema global.', 'Migration is a global issue.', 'Population movement', 458),
  es('infraestructura', 'infrastructure', '/in.fɾa.es.tɾuk.ˈtu.ɾa/', 'een-frah-es-trook-TOO-rah', 'noun', 'B2', 'hard', 'field-specific', ['government', 'tech', 'business'], ['politics', 'technology'], 'La infraestructura necesita mejoras.', 'Infrastructure needs improvements.', 'Basic systems', 459),
  es('regulación', 'regulation', '/re.ɣu.la.ˈsjon/', 'reh-goo-lah-see-OHN', 'noun', 'B2', 'hard', 'field-specific', ['government', 'legal', 'business'], ['legal', 'politics'], 'La regulación protege al consumidor.', 'Regulation protects the consumer.', 'Official rule', 460),
];

// ============================================================================
// EN-ES VOCABULARY — C1 (~75 words)
// ============================================================================

const ES_C1: VoxVocabularySeed[] = [
  // Idioms & Advanced Expressions
  es('dar en el clavo', 'to hit the nail on the head', '/daɾ en el ˈkla.βo/', 'dar en el KLAH-boh', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Diste en el clavo con tu análisis.', 'You hit the nail on the head with your analysis.', 'Idiomatic: to be exactly right', 461),
  es('estar en las nubes', 'to have one\'s head in the clouds', '/es.ˈtaɾ en las ˈnu.bes/', 'es-TAR en lahs NOO-behs', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Hoy estás en las nubes.', "You have your head in the clouds today.", 'Idiomatic: distracted, daydreaming', 462),
  es('no tener pelos en la lengua', 'to not mince words', '/no te.ˈneɾ ˈpe.los en la ˈlen.ɡwa/', 'noh teh-NEHR PEH-lohs en lah LEN-gwah', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Ella no tiene pelos en la lengua.', 'She does not mince words.', 'Idiomatic: to speak bluntly', 463),
  es('meter la pata', 'to put one\'s foot in it', '/me.ˈteɾ la ˈpa.ta/', 'meh-TEHR lah PAH-tah', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Metí la pata en la reunión.', 'I put my foot in it at the meeting.', 'Idiomatic: to make a blunder', 464),
  es('tomar el pelo', 'to pull someone\'s leg', '/to.ˈmaɾ el ˈpe.lo/', 'toh-MAR el PEH-loh', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], '¿Me estás tomando el pelo?', 'Are you pulling my leg?', 'Idiomatic: to joke or deceive', 465),
  es('echar una mano', 'to lend a hand', '/e.ˈtʃaɾ ˈu.na ˈma.no/', 'eh-CHAR OO-nah MAH-noh', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], '¿Puedes echarme una mano?', 'Can you lend me a hand?', 'Idiomatic: to help someone', 466),
  es('hacer de tripas corazón', 'to pluck up courage', '/a.ˈseɾ de ˈtɾi.pas ko.ɾa.ˈson/', 'ah-SEHR deh TREE-pahs koh-rah-SOHN', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Hice de tripas corazón y hablé.', 'I plucked up courage and spoke.', 'Idiomatic: to force oneself to be brave', 467),
  es('ponerse las pilas', 'to get one\'s act together', '/po.ˈneɾ.se las ˈpi.las/', 'poh-NEHR-seh lahs PEE-lahs', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Es hora de ponerse las pilas.', "It's time to get your act together.", 'Idiomatic: to start working hard', 468),
  es('ir al grano', 'to get to the point', '/iɾ al ˈɡɾa.no/', 'eer ahl GRAH-noh', 'phrase', 'C1', 'hard', 'universal', ['general', 'business'], ['idioms', 'communication'], 'Vamos al grano.', "Let's get to the point.", 'Idiomatic: to be direct', 469),
  es('estar hasta las narices', 'to be fed up', '/es.ˈtaɾ ˈas.ta las na.ˈɾi.ses/', 'es-TAR AHS-tah lahs nah-REE-sehs', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms', 'emotions'], 'Estoy hasta las narices del tráfico.', "I'm fed up with the traffic.", 'Idiomatic: extreme frustration', 470),

  // Formal Register
  es('asimismo', 'likewise/also', '/a.si.ˈmis.mo/', 'ah-see-MEES-moh', 'adverb', 'C1', 'hard', 'universal', ['general', 'business', 'legal'], ['formal_register', 'connectors'], 'Asimismo, debemos considerar los costos.', 'Likewise, we must consider the costs.', 'Formal connector', 471),
  es('no obstante', 'nevertheless', '/no obs.ˈtan.te/', 'noh obs-TAHN-teh', 'phrase', 'C1', 'hard', 'universal', ['general', 'business', 'legal'], ['formal_register', 'connectors'], 'No obstante, hay riesgos.', 'Nevertheless, there are risks.', 'Formal contrast connector', 472),
  es('cabe destacar', 'it is worth noting', '/ˈka.be des.ta.ˈkaɾ/', 'KAH-beh des-tah-KAR', 'phrase', 'C1', 'hard', 'universal', ['general', 'business', 'education'], ['formal_register'], 'Cabe destacar que las cifras mejoraron.', 'It is worth noting that the figures improved.', 'Formal emphasis phrase', 473),
  es('en lo que respecta a', 'with regard to', '/en lo ke res.ˈpek.ta a/', 'en loh keh res-PEK-tah ah', 'phrase', 'C1', 'hard', 'universal', ['general', 'business', 'legal'], ['formal_register'], 'En lo que respecta al presupuesto...', 'With regard to the budget...', 'Formal topic introduction', 474),
  es('en virtud de', 'by virtue of', '/en biɾ.ˈtud de/', 'en beer-TOOD deh', 'phrase', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['formal_register', 'legal'], 'En virtud de la ley vigente...', 'By virtue of the current law...', 'Legal/formal expression', 475),
  es('a pesar de', 'in spite of', '/a pe.ˈsaɾ de/', 'ah peh-SAR deh', 'phrase', 'C1', 'medium', 'universal', ['general'], ['formal_register', 'connectors'], 'A pesar de las dificultades, avanzamos.', 'In spite of the difficulties, we advanced.', 'Concessive connector', 476),
  es('dicho de otro modo', 'in other words', '/ˈdi.tʃo de ˈo.tɾo ˈmo.do/', 'DEE-choh deh OH-troh MOH-doh', 'phrase', 'C1', 'hard', 'universal', ['general', 'education'], ['formal_register'], 'Dicho de otro modo, no es viable.', 'In other words, it is not viable.', 'Rephrasing connector', 477),

  // Academic Language
  es('ámbito', 'scope/field', '/ˈam.bi.to/', 'AHM-bee-toh', 'noun', 'C1', 'hard', 'field-specific', ['education', 'legal', 'business'], ['academic'], 'En el ámbito de la tecnología...', 'In the field of technology...', 'Domain or area', 478),
  es('paradigma', 'paradigm', '/pa.ɾa.ˈdiɣ.ma/', 'pah-rah-DEEG-mah', 'noun', 'C1', 'hard', 'field-specific', ['education', 'tech'], ['academic'], 'Necesitamos un cambio de paradigma.', 'We need a paradigm shift.', 'Model or pattern', 479),
  es('metodología', 'methodology', '/me.to.do.lo.ˈxi.a/', 'meh-toh-doh-loh-HEE-ah', 'noun', 'C1', 'hard', 'field-specific', ['education', 'tech'], ['academic'], 'La metodología es rigurosa.', 'The methodology is rigorous.', 'Systematic approach', 480),
  es('matiz', 'nuance', '/ma.ˈtis/', 'mah-TEES', 'noun', 'C1', 'hard', 'universal', ['general', 'education'], ['academic', 'communication'], 'Hay un matiz importante aquí.', 'There is an important nuance here.', 'Subtle distinction', 481),
  es('premisa', 'premise', '/pɾe.ˈmi.sa/', 'preh-MEE-sah', 'noun', 'C1', 'hard', 'field-specific', ['education', 'legal'], ['academic'], 'La premisa del argumento es incorrecta.', 'The premise of the argument is incorrect.', 'Starting assumption', 482),
  es('dilema', 'dilemma', '/di.ˈle.ma/', 'dee-LEH-mah', 'noun', 'C1', 'hard', 'universal', ['general', 'education'], ['academic'], 'Enfrentamos un dilema ético.', 'We face an ethical dilemma.', 'Difficult choice', 483),
  es('inferir', 'to infer', '/in.fe.ˈɾiɾ/', 'een-feh-REER', 'verb', 'C1', 'hard', 'field-specific', ['education', 'legal'], ['academic'], 'Podemos inferir la conclusión.', 'We can infer the conclusion.', 'Deduction verb', 484),
  es('discernir', 'to discern', '/dis.seɾ.ˈniɾ/', 'dees-sehr-NEER', 'verb', 'C1', 'hard', 'universal', ['general', 'education'], ['academic'], 'Es difícil discernir la verdad.', 'It is difficult to discern the truth.', 'Distinguishing verb', 485),
  es('abarcar', 'to encompass', '/a.baɾ.ˈkaɾ/', 'ah-bar-KAR', 'verb', 'C1', 'hard', 'universal', ['general', 'education', 'business'], ['academic'], 'El proyecto abarca tres áreas.', 'The project encompasses three areas.', 'To include broadly', 486),
  es('conllevar', 'to entail', '/kon.ʎe.ˈβaɾ/', 'kohn-yeh-BAR', 'verb', 'C1', 'hard', 'universal', ['general', 'legal', 'business'], ['academic', 'formal_register'], 'La decisión conlleva riesgos.', 'The decision entails risks.', 'To involve as consequence', 487),

  // Nuanced Expression
  es('matizar', 'to qualify/nuance', '/ma.ti.ˈsaɾ/', 'mah-tee-SAR', 'verb', 'C1', 'hard', 'universal', ['general', 'education'], ['communication'], 'Permítame matizar mi declaración.', 'Allow me to qualify my statement.', 'Adding subtlety', 488),
  es('prescindir', 'to do without', '/pɾes.sin.ˈdiɾ/', 'pres-seen-DEER', 'verb', 'C1', 'hard', 'universal', ['general'], ['communication'], 'No podemos prescindir de su experiencia.', "We cannot do without your experience.", 'To dispense with', 489),
  es('soslayar', 'to sidestep/evade', '/sos.la.ˈʝaɾ/', 'sohs-lah-YAR', 'verb', 'C1', 'hard', 'field-specific', ['legal', 'government', 'business'], ['formal_register'], 'No debemos soslayar el problema.', 'We must not sidestep the problem.', 'To avoid dealing with', 490),
  es('abordar', 'to address/tackle', '/a.boɾ.ˈdaɾ/', 'ah-bor-DAR', 'verb', 'C1', 'hard', 'universal', ['general', 'business'], ['communication', 'work'], 'Debemos abordar este tema con cuidado.', 'We must address this topic carefully.', 'To deal with directly', 491),
  es('promulgar', 'to enact/promulgate', '/pɾo.mul.ˈɡaɾ/', 'proh-mool-GAR', 'verb', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['legal', 'politics'], 'El gobierno promulgó la nueva ley.', 'The government enacted the new law.', 'To officially decree', 492),
  es('subsanar', 'to rectify', '/sub.sa.ˈnaɾ/', 'soob-sah-NAR', 'verb', 'C1', 'hard', 'field-specific', ['legal', 'business'], ['formal_register'], 'Debemos subsanar el error.', 'We must rectify the error.', 'To correct a deficiency', 493),
  es('velar', 'to watch over/ensure', '/be.ˈlaɾ/', 'beh-LAR', 'verb', 'C1', 'hard', 'field-specific', ['legal', 'government', 'healthcare'], ['formal_register'], 'Velamos por la seguridad de todos.', 'We watch over the safety of all.', 'To safeguard', 494),

  // Specialized Professional
  es('jurisprudencia', 'jurisprudence', '/xu.ɾis.pɾu.ˈden.sja/', 'hoo-rees-proo-DEN-see-ah', 'noun', 'C1', 'hard', 'field-specific', ['legal'], ['legal', 'academic'], 'La jurisprudencia establece el precedente.', 'Jurisprudence establishes the precedent.', 'Body of legal decisions', 495),
  es('escalabilidad', 'scalability', '/es.ka.la.bi.li.ˈdad/', 'es-kah-lah-bee-lee-DAHD', 'noun', 'C1', 'hard', 'field-specific', ['tech'], ['technology'], 'La escalabilidad del sistema es clave.', 'System scalability is key.', 'Ability to grow', 496),
  es('epidemiología', 'epidemiology', '/e.pi.de.mjo.lo.ˈxi.a/', 'eh-pee-deh-mee-oh-loh-HEE-ah', 'noun', 'C1', 'hard', 'field-specific', ['healthcare'], ['health', 'academic'], 'La epidemiología estudia patrones de enfermedad.', 'Epidemiology studies disease patterns.', 'Disease study discipline', 497),
  es('coyuntura', 'juncture/situation', '/ko.ʝun.ˈtu.ɾa/', 'koh-yoon-TOO-rah', 'noun', 'C1', 'hard', 'field-specific', ['business', 'government'], ['business', 'politics'], 'La coyuntura económica es favorable.', 'The economic situation is favorable.', 'Current state of affairs', 498),
  es('rendición de cuentas', 'accountability', '/ren.di.ˈsjon de ˈkwen.tas/', 'ren-dee-see-OHN deh KWEN-tahs', 'phrase', 'C1', 'hard', 'field-specific', ['government', 'business'], ['politics', 'work'], 'La rendición de cuentas es esencial.', 'Accountability is essential.', 'Obligation to explain actions', 499),
  es('deontología', 'deontology/ethics', '/de.on.to.lo.ˈxi.a/', 'deh-ohn-toh-loh-HEE-ah', 'noun', 'C1', 'hard', 'field-specific', ['legal', 'healthcare'], ['academic', 'legal'], 'La deontología médica guía la práctica.', 'Medical deontology guides practice.', 'Professional ethics', 500),

  // C1 Adjectives
  es('fehaciente', 'irrefutable/authentic', '/fe.a.ˈsjen.te/', 'feh-ah-see-EHN-teh', 'adjective', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['formal_register', 'legal'], 'Necesitamos pruebas fehacientes.', 'We need irrefutable evidence.', 'Undeniable', 501),
  es('perentorio', 'peremptory/urgent', '/pe.ɾen.ˈto.ɾjo/', 'peh-rehn-TOH-ree-oh', 'adjective', 'C1', 'hard', 'field-specific', ['legal', 'business'], ['formal_register'], 'El plazo es perentorio.', 'The deadline is peremptory.', 'Admitting no delay', 502),
  es('taxativo', 'strict/categorical', '/tak.sa.ˈti.βo/', 'tahk-sah-TEE-boh', 'adjective', 'C1', 'hard', 'field-specific', ['legal'], ['formal_register', 'legal'], 'La ley es taxativa en este punto.', 'The law is strict on this point.', 'Leaving no room for interpretation', 503),
  es('incipiente', 'incipient/nascent', '/in.si.ˈpjen.te/', 'een-see-pee-EHN-teh', 'adjective', 'C1', 'hard', 'universal', ['general', 'business'], ['academic'], 'Es un mercado incipiente.', 'It is a nascent market.', 'Just beginning', 504),
  es('paulatino', 'gradual', '/pau.la.ˈti.no/', 'pow-lah-TEE-noh', 'adjective', 'C1', 'hard', 'universal', ['general'], ['academic'], 'El cambio fue paulatino.', 'The change was gradual.', 'Slow and steady', 505),
  es('subyacente', 'underlying', '/sub.ʝa.ˈsen.te/', 'soob-yah-SEN-teh', 'adjective', 'C1', 'hard', 'universal', ['general', 'business', 'education'], ['academic'], 'La causa subyacente es la pobreza.', 'The underlying cause is poverty.', 'Beneath the surface', 506),
  es('contundente', 'forceful/overwhelming', '/kon.tun.ˈden.te/', 'kohn-toon-DEN-teh', 'adjective', 'C1', 'hard', 'universal', ['general', 'legal'], ['communication'], 'La evidencia es contundente.', 'The evidence is overwhelming.', 'Decisive and strong', 507),
  es('escueto', 'brief/concise', '/es.ˈkwe.to/', 'es-KWEH-toh', 'adjective', 'C1', 'hard', 'universal', ['general'], ['communication'], 'Fue una respuesta escueta.', 'It was a brief response.', 'Short and to the point', 508),
  es('pertinente', 'pertinent/relevant', '/peɾ.ti.ˈnen.te/', 'pehr-tee-NEN-teh', 'adjective', 'C1', 'hard', 'universal', ['general', 'legal', 'education'], ['formal_register'], 'La pregunta es muy pertinente.', 'The question is very pertinent.', 'Directly relevant', 509),
  es('vigente', 'current/in force', '/bi.ˈxen.te/', 'bee-HEN-teh', 'adjective', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['legal', 'formal_register'], 'La ley vigente lo prohíbe.', 'The current law prohibits it.', 'Currently applicable', 510),
];

// ============================================================================
// EN-ES VOCABULARY — C2 (~50 words)
// ============================================================================

const ES_C2: VoxVocabularySeed[] = [
  // Literary & Rare
  es('recóndito', 'recondite/hidden', '/re.ˈkon.di.to/', 'reh-KOHN-dee-toh', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['literary'], 'Exploró los recónditos rincones del alma.', 'He explored the hidden corners of the soul.', 'Literary: deeply hidden', 511),
  es('perspicaz', 'perspicacious/shrewd', '/peɾs.pi.ˈkas/', 'pers-pee-KAHS', 'adjective', 'C2', 'hard', 'universal', ['general', 'business'], ['literary', 'description'], 'Es una observadora perspicaz.', 'She is a shrewd observer.', 'Keen insight', 512),
  es('elocuente', 'eloquent', '/e.lo.ˈkwen.te/', 'eh-loh-KWEN-teh', 'adjective', 'C2', 'hard', 'universal', ['general', 'education', 'government'], ['literary', 'communication'], 'Dio un discurso elocuente.', 'He gave an eloquent speech.', 'Powerfully expressive', 513),
  es('efímero', 'ephemeral', '/e.ˈfi.me.ɾo/', 'eh-FEE-meh-roh', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['literary'], 'La fama es efímera.', 'Fame is ephemeral.', 'Short-lived', 514),
  es('inverosímil', 'implausible', '/in.be.ɾo.ˈsi.mil/', 'een-beh-roh-SEE-meel', 'adjective', 'C2', 'hard', 'universal', ['general', 'legal'], ['literary'], 'Su excusa era inverosímil.', 'His excuse was implausible.', 'Hard to believe', 515),
  es('acérrimo', 'staunch/fierce', '/a.ˈse.ri.mo/', 'ah-SEH-ree-moh', 'adjective', 'C2', 'hard', 'universal', ['general'], ['literary'], 'Es un acérrimo defensor de la justicia.', 'He is a staunch defender of justice.', 'Fiercely loyal or opposed', 516),
  es('desgarrador', 'heartbreaking', '/des.ɡa.ra.ˈdoɾ/', 'des-gah-rah-DOR', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['literary', 'emotions'], 'Fue un testimonio desgarrador.', 'It was a heartbreaking testimony.', 'Deeply moving', 517),
  es('deslumbrante', 'dazzling', '/des.lum.ˈbɾan.te/', 'des-loom-BRAHN-teh', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['literary', 'description'], 'La actuación fue deslumbrante.', 'The performance was dazzling.', 'Impressively brilliant', 518),

  // Specialized Professional C2
  es('hermenéutica', 'hermeneutics', '/eɾ.me.ˈneu.ti.ka/', 'ehr-meh-NEH-oo-tee-kah', 'noun', 'C2', 'hard', 'field-specific', ['legal', 'education'], ['academic', 'legal'], 'La hermenéutica jurídica es compleja.', 'Legal hermeneutics is complex.', 'Theory of interpretation', 519),
  es('epistemología', 'epistemology', '/e.pis.te.mo.lo.ˈxi.a/', 'eh-pees-teh-moh-loh-HEE-ah', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'La epistemología cuestiona el conocimiento.', 'Epistemology questions knowledge.', 'Study of knowledge', 520),
  es('reificación', 'reification', '/re.i.fi.ka.ˈsjon/', 'reh-ee-fee-kah-see-OHN', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'La reificación de conceptos abstractos.', 'The reification of abstract concepts.', 'Treating abstract as concrete', 521),
  es('ambigüedad', 'ambiguity', '/am.bi.ɡwe.ˈdad/', 'ahm-bee-gweh-DAHD', 'noun', 'C2', 'hard', 'universal', ['general', 'legal'], ['academic', 'communication'], 'La ambigüedad del contrato causa problemas.', 'The ambiguity of the contract causes problems.', 'Multiple interpretations', 522),
  es('idiosincrasia', 'idiosyncrasy', '/i.djo.sin.ˈkɾa.sja/', 'ee-dee-oh-seen-KRAH-see-ah', 'noun', 'C2', 'hard', 'universal', ['general', 'education'], ['culture', 'academic'], 'La idiosincrasia de cada pueblo es única.', "Each people's idiosyncrasy is unique.", 'Distinctive character', 523),
  es('dicotomía', 'dichotomy', '/di.ko.to.ˈmi.a/', 'dee-koh-toh-MEE-ah', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'Existe una dicotomía entre teoría y práctica.', 'There is a dichotomy between theory and practice.', 'Division into two', 524),
  es('praxis', 'praxis', '/ˈpɾak.sis/', 'PRAHK-sees', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'La praxis es inseparable de la teoría.', 'Praxis is inseparable from theory.', 'Practical application of theory', 525),

  // Advanced Verbs
  es('dirimir', 'to settle/resolve', '/di.ɾi.ˈmiɾ/', 'dee-ree-MEER', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['legal', 'formal_register'], 'El tribunal dirimió la disputa.', 'The court settled the dispute.', 'To resolve authoritatively', 526),
  es('esgrimir', 'to wield/brandish', '/es.ɣɾi.ˈmiɾ/', 'es-gree-MEER', 'verb', 'C2', 'hard', 'universal', ['general', 'legal'], ['literary', 'formal_register'], 'Esgrimió argumentos convincentes.', 'He wielded convincing arguments.', 'To present forcefully', 527),
  es('dilucidar', 'to elucidate', '/di.lu.si.ˈdaɾ/', 'dee-loo-see-DAR', 'verb', 'C2', 'hard', 'field-specific', ['education', 'legal'], ['academic'], 'Intentamos dilucidar los hechos.', 'We try to elucidate the facts.', 'To clarify thoroughly', 528),
  es('acotar', 'to delimit/annotate', '/a.ko.ˈtaɾ/', 'ah-koh-TAR', 'verb', 'C2', 'hard', 'field-specific', ['education', 'legal', 'tech'], ['academic'], 'Debemos acotar el alcance del estudio.', 'We must delimit the scope of the study.', 'To set boundaries', 529),
  es('vertebrar', 'to structure/form backbone', '/beɾ.te.ˈbɾaɾ/', 'behr-teh-BRAR', 'verb', 'C2', 'hard', 'field-specific', ['education', 'government'], ['academic'], 'La educación vertebra la sociedad.', 'Education forms the backbone of society.', 'To give structure to', 530),
  es('concatenar', 'to concatenate/link', '/kon.ka.te.ˈnaɾ/', 'kohn-kah-teh-NAR', 'verb', 'C2', 'hard', 'field-specific', ['tech', 'education'], ['academic', 'technology'], 'Los eventos se concatenan lógicamente.', 'The events are logically linked.', 'To chain together', 531),
  es('descollar', 'to stand out/excel', '/des.ko.ˈʎaɾ/', 'des-koh-YAR', 'verb', 'C2', 'hard', 'universal', ['general'], ['literary'], 'Descuella por su talento excepcional.', 'She stands out for her exceptional talent.', 'To surpass others noticeably', 532),
  es('pugnar', 'to fight/strive', '/puɣ.ˈnaɾ/', 'poog-NAR', 'verb', 'C2', 'hard', 'universal', ['general', 'legal'], ['literary'], 'Pugnan por sus derechos.', 'They fight for their rights.', 'To struggle determinedly', 533),

  // Cultural References
  es('quijotesco', 'quixotic', '/ki.xo.ˈtes.ko/', 'kee-hoh-TES-koh', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['culture', 'literary'], 'Su empresa tiene un espíritu quijotesco.', 'His venture has a quixotic spirit.', 'From Don Quijote: idealistic, impractical', 534),
  es('picaresco', 'picaresque', '/pi.ka.ˈɾes.ko/', 'pee-kah-RES-koh', 'adjective', 'C2', 'hard', 'field-specific', ['creative', 'education'], ['culture', 'literary'], 'La novela picaresca retrata la sociedad.', 'The picaresque novel portrays society.', 'Genre of Spanish literature', 535),
  es('tertulia', 'literary gathering/discussion', '/teɾ.ˈtu.lja/', 'tehr-TOO-lee-ah', 'noun', 'C2', 'hard', 'universal', ['general', 'creative', 'education'], ['culture'], 'Participamos en una tertulia literaria.', 'We participated in a literary discussion group.', 'Spanish cultural tradition', 536),
  es('sobremesa', 'after-meal conversation', '/so.bɾe.ˈme.sa/', 'soh-breh-MEH-sah', 'noun', 'C2', 'hard', 'universal', ['general', 'hospitality'], ['culture'], 'Disfrutamos de una larga sobremesa.', 'We enjoyed a long after-meal conversation.', 'Untranslatable cultural concept', 537),

  // Diplomatic/Political C2
  es('aquiescencia', 'acquiescence', '/a.kjes.ˈsen.sja/', 'ah-kee-es-SEN-see-ah', 'noun', 'C2', 'hard', 'field-specific', ['government', 'legal'], ['politics', 'formal_register'], 'Se logró la aquiescencia de todos los miembros.', 'The acquiescence of all members was achieved.', 'Tacit consent', 538),
  es('coadyuvar', 'to contribute jointly', '/ko.ad.ʝu.ˈβaɾ/', 'koh-ahd-yoo-BAR', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['formal_register'], 'Las ONG coadyuvan al desarrollo.', 'NGOs contribute jointly to development.', 'Formal: to help jointly', 539),
  es('coadyuvante', 'contributing/adjuvant', '/ko.ad.ʝu.ˈβan.te/', 'koh-ahd-yoo-BAHN-teh', 'adjective', 'C2', 'hard', 'field-specific', ['legal', 'healthcare'], ['formal_register', 'legal'], 'Es un factor coadyuvante.', 'It is a contributing factor.', 'Helping or supplementary', 540),
  es('dilación', 'delay/procrastination', '/di.la.ˈsjon/', 'dee-lah-see-OHN', 'noun', 'C2', 'hard', 'field-specific', ['legal', 'business'], ['formal_register'], 'Sin dilación, procedamos.', 'Without delay, let us proceed.', 'Formal: postponement', 541),
  es('exhortar', 'to exhort', '/ek.soɾ.ˈtaɾ/', 'ek-sor-TAR', 'verb', 'C2', 'hard', 'field-specific', ['government', 'legal'], ['formal_register'], 'Exhortamos a la cooperación.', 'We exhort cooperation.', 'To strongly urge', 542),
  es('preceptivo', 'mandatory/prescriptive', '/pɾe.sep.ˈti.βo/', 'preh-sep-TEE-boh', 'adjective', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['legal', 'formal_register'], 'El informe preceptivo fue favorable.', 'The mandatory report was favorable.', 'Required by rule', 543),
  es('supeditado', 'subject to/dependent on', '/su.pe.di.ˈta.do/', 'soo-peh-dee-TAH-doh', 'adjective', 'C2', 'hard', 'field-specific', ['legal', 'business'], ['formal_register'], 'Está supeditado a la aprobación.', 'It is subject to approval.', 'Conditionally dependent', 544),
  es('menoscabar', 'to diminish/undermine', '/me.nos.ka.ˈβaɾ/', 'meh-nohs-kah-BAR', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['formal_register'], 'No debemos menoscabar sus derechos.', 'We must not diminish their rights.', 'To impair or reduce', 545),

  // More C2
  es('atisbar', 'to glimpse/perceive', '/a.tis.ˈbaɾ/', 'ah-tees-BAR', 'verb', 'C2', 'hard', 'universal', ['general', 'creative'], ['literary'], 'Se atisba un cambio en la sociedad.', 'A change is glimpsed in society.', 'To barely perceive', 546),
  es('resquicio', 'loophole/crack', '/res.ˈki.sjo/', 'res-KEE-see-oh', 'noun', 'C2', 'hard', 'field-specific', ['legal', 'general'], ['legal', 'literary'], 'Encontraron un resquicio legal.', 'They found a legal loophole.', 'Small opening or opportunity', 547),
  es('solventar', 'to resolve/settle', '/sol.ben.ˈtaɾ/', 'sol-ben-TAR', 'verb', 'C2', 'hard', 'field-specific', ['business', 'legal'], ['formal_register'], 'Logramos solventar las diferencias.', 'We managed to settle the differences.', 'To resolve definitively', 548),
  es('salvaguardar', 'to safeguard', '/sal.ba.ɡwaɾ.ˈdaɾ/', 'sahl-bah-gwar-DAR', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government', 'tech'], ['formal_register'], 'Debemos salvaguardar los datos.', 'We must safeguard the data.', 'To protect from harm', 549),
  es('acuñar', 'to coin/mint', '/a.ku.ˈɲaɾ/', 'ah-koo-NYAR', 'verb', 'C2', 'hard', 'universal', ['general', 'creative', 'education'], ['literary', 'culture'], 'Acuñó un nuevo término.', 'He coined a new term.', 'To create or mint', 550),
  es('subsumido', 'subsumed', '/sub.su.ˈmi.do/', 'soob-soo-MEE-doh', 'adjective', 'C2', 'hard', 'field-specific', ['education', 'legal'], ['academic'], 'El concepto está subsumido en la teoría.', 'The concept is subsumed in the theory.', 'Included within a larger category', 551),
  es('inmanente', 'immanent', '/in.ma.ˈnen.te/', 'een-mah-NEN-teh', 'adjective', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'Es un valor inmanente al ser humano.', 'It is an immanent value of the human being.', 'Inherent, existing within', 552),
  es('exacerbar', 'to exacerbate', '/ek.sa.seɾ.ˈβaɾ/', 'ek-sah-ser-BAR', 'verb', 'C2', 'hard', 'universal', ['general', 'healthcare'], ['formal_register'], 'La crisis exacerbó las tensiones.', 'The crisis exacerbated tensions.', 'To make worse', 553),
  es('imbricar', 'to interweave/overlap', '/im.bɾi.ˈkaɾ/', 'eem-bree-KAR', 'verb', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'Los temas se imbrican entre sí.', 'The themes overlap with each other.', 'To interleave or overlap', 554),
  es('concomitante', 'concomitant', '/kon.ko.mi.ˈtan.te/', 'kohn-koh-mee-TAHN-teh', 'adjective', 'C2', 'hard', 'field-specific', ['healthcare', 'education'], ['academic', 'health'], 'Hay factores concomitantes.', 'There are concomitant factors.', 'Accompanying', 555),
];

// ============================================================================
// EN-FR VOCABULARY — A1 (~100 words)
// ============================================================================

const FR_A1: VoxVocabularySeed[] = [
  // Greetings & Politeness
  fr('bonjour', 'hello / good morning', '/bɔ̃.ʒuʁ/', 'bohn-ZHOOR', 'other', 'A1', 'easy', 'universal', ['general'], ['greetings'], 'Bonjour, comment allez-vous?', 'Hello, how are you?', 'Standard greeting; used until evening', 1),
  fr('bonsoir', 'good evening', '/bɔ̃.swaʁ/', 'bohn-SWAHR', 'other', 'A1', 'easy', 'universal', ['general'], ['greetings', 'time'], 'Bonsoir, madame.', 'Good evening, madam.', 'Evening greeting', 2),
  fr('au revoir', 'goodbye', '/o ʁə.vwaʁ/', 'oh reh-VWAHR', 'phrase', 'A1', 'easy', 'universal', ['general'], ['greetings'], 'Au revoir, à bientôt!', 'Goodbye, see you soon!', 'Standard farewell', 3),
  fr('merci', 'thank you', '/mɛʁ.si/', 'mehr-SEE', 'other', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Merci beaucoup!', 'Thank you very much!', 'Essential politeness', 4),
  fr('de rien', "you're welcome", '/də ʁjɛ̃/', 'duh ree-EHN', 'phrase', 'A1', 'easy', 'universal', ['general'], ['politeness'], '—Merci. —De rien.', "—Thank you. —You're welcome.", 'Response to thanks', 5),
  fr("s'il vous plaît", 'please (formal)', '/sil vu plɛ/', 'seel voo PLEH', 'phrase', 'A1', 'easy', 'universal', ['general', 'business'], ['politeness'], "Un café, s'il vous plaît.", 'A coffee, please.', 'Formal please', 6),
  fr('excusez-moi', 'excuse me', '/ɛk.sky.ze mwa/', 'ek-skoo-ZAY mwah', 'phrase', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Excusez-moi, où est la gare?', 'Excuse me, where is the station?', 'Polite attention-getter', 7),
  fr('pardon', 'sorry / pardon', '/paʁ.dɔ̃/', 'par-DOHN', 'other', 'A1', 'easy', 'universal', ['general'], ['politeness'], 'Pardon, je ne comprends pas.', "Sorry, I don't understand.", 'Light apology', 8),
  fr('oui', 'yes', '/wi/', 'wee', 'other', 'A1', 'easy', 'survival', ['general'], ['basic_needs'], 'Oui, je comprends.', 'Yes, I understand.', 'Affirmation', 9),
  fr('non', 'no', '/nɔ̃/', 'nohn', 'other', 'A1', 'easy', 'survival', ['general'], ['basic_needs'], 'Non, merci.', 'No, thank you.', 'Negation', 10),

  // Pronouns
  fr('je', 'I', '/ʒə/', 'zhuh', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Je suis étudiant.', 'I am a student.', 'First-person subject', 11),
  fr('tu', 'you (informal)', '/ty/', 'too', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Tu parles français?', 'Do you speak French?', 'Informal you', 12),
  fr('vous', 'you (formal/plural)', '/vu/', 'voo', 'other', 'A1', 'easy', 'universal', ['general', 'business'], ['pronouns'], 'Comment allez-vous?', 'How are you?', 'Formal/plural you', 13),
  fr('il', 'he', '/il/', 'eel', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Il est médecin.', 'He is a doctor.', 'Third-person masculine', 14),
  fr('elle', 'she', '/ɛl/', 'ehl', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Elle est professeure.', 'She is a teacher.', 'Third-person feminine', 15),
  fr('nous', 'we', '/nu/', 'noo', 'other', 'A1', 'easy', 'universal', ['general'], ['pronouns'], 'Nous travaillons ensemble.', 'We work together.', 'First-person plural', 16),

  // Essential Verbs
  fr('être', 'to be', '/ɛtʁ/', 'eht-ruh', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je suis français.', 'I am French.', 'Most essential verb', 17),
  fr('avoir', 'to have', '/a.vwaʁ/', 'ah-VWAHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], "J'ai deux frères.", 'I have two brothers.', 'Possession; auxiliary verb', 18),
  fr('aller', 'to go', '/a.le/', 'ah-LAY', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je vais au travail.', 'I go to work.', 'Movement verb; irregular', 19),
  fr('faire', 'to do / to make', '/fɛʁ/', 'fehr', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Que fais-tu?', 'What are you doing?', 'Versatile verb', 20),
  fr('vouloir', 'to want', '/vu.lwaʁ/', 'voo-LWAHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je veux un café.', 'I want a coffee.', 'Desire verb', 21),
  fr('pouvoir', 'can / to be able', '/pu.vwaʁ/', 'poo-VWAHR', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je peux vous aider?', 'Can I help you?', 'Ability/permission', 22),
  fr('parler', 'to speak', '/paʁ.le/', 'par-LAY', 'verb', 'A1', 'easy', 'universal', ['general', 'education'], ['essential_verbs'], 'Je parle français et anglais.', 'I speak French and English.', 'Communication verb', 23),
  fr('comprendre', 'to understand', '/kɔ̃.pʁɑ̃dʁ/', 'kohn-PRAHN-druh', 'verb', 'A1', 'easy', 'universal', ['general', 'education'], ['essential_verbs'], 'Je comprends un peu.', 'I understand a little.', 'Comprehension verb', 24),
  fr('manger', 'to eat', '/mɑ̃.ʒe/', 'mahn-ZHAY', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs', 'food'], 'Je mange une pomme.', 'I eat an apple.', 'Sustenance verb', 25),
  fr('boire', 'to drink', '/bwaʁ/', 'bwahr', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs', 'food'], "Je bois de l'eau.", 'I drink water.', 'Sustenance verb', 26),
  fr('habiter', 'to live (reside)', '/a.bi.te/', 'ah-bee-TAY', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], "J'habite à Paris.", 'I live in Paris.', 'Residence verb', 27),
  fr('travailler', 'to work', '/tʁa.va.je/', 'trah-vah-YAY', 'verb', 'A1', 'easy', 'universal', ['general', 'business'], ['essential_verbs', 'work'], 'Je travaille dans un bureau.', 'I work in an office.', 'Employment verb', 28),
  fr('aimer', 'to like / to love', '/ɛ.me/', 'eh-MAY', 'verb', 'A1', 'easy', 'universal', ['general'], ['essential_verbs'], "J'aime la musique.", 'I like music.', 'Preference/love verb', 29),

  // Numbers
  fr('un', 'one', '/œ̃/', 'uhn', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], "J'ai un frère.", 'I have one brother.', 'Basic numeral; une for feminine', 30),
  fr('deux', 'two', '/dø/', 'duh', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], "J'ai deux enfants.", 'I have two children.', 'Basic numeral', 31),
  fr('trois', 'three', '/tʁwa/', 'twah', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Il y a trois chambres.', 'There are three bedrooms.', 'Basic numeral', 32),
  fr('dix', 'ten', '/dis/', 'dees', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], "J'ai dix euros.", 'I have ten euros.', 'Foundation numeral', 33),
  fr('cent', 'one hundred', '/sɑ̃/', 'sahn', 'other', 'A1', 'easy', 'universal', ['general'], ['numbers'], 'Ça coûte cent euros.', 'It costs one hundred euros.', 'Foundation numeral', 34),

  // Family
  fr('famille', 'family', '/fa.mij/', 'fah-MEE-yuh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Ma famille est grande.', 'My family is big.', 'Family unit', 35),
  fr('père', 'father', '/pɛʁ/', 'pehr', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mon père est ingénieur.', 'My father is an engineer.', 'Male parent', 36),
  fr('mère', 'mother', '/mɛʁ/', 'mehr', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Ma mère est médecin.', 'My mother is a doctor.', 'Female parent', 37),
  fr('frère', 'brother', '/fʁɛʁ/', 'frehr', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mon frère étudie la médecine.', 'My brother studies medicine.', 'Male sibling', 38),
  fr('sœur', 'sister', '/sœʁ/', 'suhr', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Ma sœur travaille dans une banque.', 'My sister works in a bank.', 'Female sibling', 39),
  fr('fils', 'son', '/fis/', 'fees', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], "J'ai un fils.", 'I have a son.', 'Male child', 40),
  fr('fille', 'daughter / girl', '/fij/', 'fee-yuh', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Ma fille est étudiante.', 'My daughter is a student.', 'Female child or girl', 41),
  fr('mari', 'husband', '/ma.ʁi/', 'mah-REE', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Mon mari est architecte.', 'My husband is an architect.', 'Male spouse', 42),
  fr('femme', 'wife / woman', '/fam/', 'fahm', 'noun', 'A1', 'easy', 'universal', ['general'], ['family'], 'Ma femme travaille à la maison.', 'My wife works from home.', 'Female spouse or woman', 43),
  fr('ami', 'friend', '/a.mi/', 'ah-MEE', 'noun', 'A1', 'easy', 'universal', ['general'], ['family', 'social'], "C'est mon meilleur ami.", 'He is my best friend.', 'Male friend; amie for female', 44),

  // Time
  fr("aujourd'hui", 'today', '/o.ʒuʁ.dɥi/', 'oh-zhoor-DWEE', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], "Qu'est-ce que tu fais aujourd'hui?", 'What are you doing today?', 'Current day', 45),
  fr('demain', 'tomorrow', '/də.mɛ̃/', 'duh-MEHN', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], 'À demain!', 'See you tomorrow!', 'Next day', 46),
  fr('hier', 'yesterday', '/jɛʁ/', 'ee-EHR', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], "Hier, j'ai travaillé tard.", 'Yesterday, I worked late.', 'Previous day', 47),
  fr('maintenant', 'now', '/mɛ̃.tə.nɑ̃/', 'mehn-tuh-NAHN', 'adverb', 'A1', 'easy', 'universal', ['general'], ['time'], 'Je dois partir maintenant.', 'I must leave now.', 'Immediate present', 48),
  fr('heure', 'hour / time', '/œʁ/', 'uhr', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Quelle heure est-il?', 'What time is it?', 'Time measurement', 49),
  fr('semaine', 'week', '/sə.mɛn/', 'suh-MEHN', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'La semaine prochaine je voyage.', 'Next week I travel.', 'Seven-day period', 50),
  fr('mois', 'month', '/mwa/', 'mwah', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Ce mois-ci est mon anniversaire.', 'This month is my birthday.', 'Calendar month', 51),
  fr('année', 'year', '/a.ne/', 'ah-NAY', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], "J'ai trente ans.", 'I am thirty years old.', 'Calendar year; an for age', 52),

  // Colors
  fr('rouge', 'red', '/ʁuʒ/', 'roozh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Ma voiture est rouge.', 'My car is red.', 'Primary color', 53),
  fr('bleu', 'blue', '/blø/', 'bluh', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Le ciel est bleu.', 'The sky is blue.', 'Primary color', 54),
  fr('vert', 'green', '/vɛʁ/', 'vehr', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Les arbres sont verts.', 'The trees are green.', 'Primary color', 55),
  fr('blanc', 'white', '/blɑ̃/', 'blahn', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'La neige est blanche.', 'Snow is white.', 'Primary color; blanche (f)', 56),
  fr('noir', 'black', '/nwaʁ/', 'nwahr', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Mon téléphone est noir.', 'My phone is black.', 'Primary color', 57),
  fr('jaune', 'yellow', '/ʒon/', 'zhohn', 'adjective', 'A1', 'easy', 'universal', ['general'], ['colors'], 'Le soleil est jaune.', 'The sun is yellow.', 'Primary color', 58),

  // Food Basics
  fr('eau', 'water', '/o/', 'oh', 'noun', 'A1', 'easy', 'survival', ['general', 'hospitality'], ['food', 'basic_needs'], "Je voudrais un verre d'eau.", 'I would like a glass of water.', 'Essential sustenance', 59),
  fr('pain', 'bread', '/pɛ̃/', 'pehn', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], "J'achète du pain à la boulangerie.", 'I buy bread at the bakery.', 'Staple food; French culture icon', 60),
  fr('café', 'coffee', '/ka.fe/', 'kah-FAY', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'Je prends un café le matin.', 'I have a coffee in the morning.', 'Common beverage', 61),
  fr('lait', 'milk', '/lɛ/', 'leh', 'noun', 'A1', 'easy', 'universal', ['general'], ['food'], 'Le lait est blanc.', 'Milk is white.', 'Dairy product', 62),
  fr('fromage', 'cheese', '/fʁɔ.maʒ/', 'froh-MAHZH', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'La France a beaucoup de fromages.', 'France has many cheeses.', 'Iconic French food', 63),
  fr('viande', 'meat', '/vjɑ̃d/', 'vee-AHND', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'Je ne mange pas de viande.', "I don't eat meat.", 'General meat', 64),
  fr('fruit', 'fruit', '/fʁɥi/', 'frwee', 'noun', 'A1', 'easy', 'universal', ['general'], ['food'], "J'aime les fruits frais.", 'I like fresh fruits.', 'General fruit', 65),
  fr('repas', 'meal', '/ʁə.pa/', 'ruh-PAH', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food'], 'Le repas est prêt.', 'The meal is ready.', 'Mealtime', 66),

  // Basic Needs & Survival
  fr('nom', 'name', '/nɔ̃/', 'nohn', 'noun', 'A1', 'easy', 'universal', ['general'], ['personal_info'], 'Mon nom est Pierre.', 'My name is Pierre.', 'Personal identification', 67),
  fr('maison', 'house / home', '/mɛ.zɔ̃/', 'meh-ZOHN', 'noun', 'A1', 'easy', 'universal', ['general'], ['home', 'basic_needs'], 'Ma maison est petite.', 'My house is small.', 'Residence', 68),
  fr('toilettes', 'bathroom/toilet', '/twa.lɛt/', 'twah-LEHT', 'noun', 'A1', 'easy', 'survival', ['general'], ['basic_needs'], 'Où sont les toilettes?', 'Where is the bathroom?', 'Essential survival word', 69),
  fr('argent', 'money', '/aʁ.ʒɑ̃/', 'ar-ZHAHN', 'noun', 'A1', 'easy', 'survival', ['general', 'business'], ['basic_needs', 'money'], "J'ai besoin d'argent.", 'I need money.', 'Financial essential', 70),
  fr('rue', 'street', '/ʁy/', 'roo', 'noun', 'A1', 'easy', 'universal', ['general'], ['directions'], 'Ma maison est dans cette rue.', 'My house is on this street.', 'Basic navigation', 71),

  // Question Words
  fr('quoi', 'what', '/kwa/', 'kwah', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], 'Quoi de neuf?', "What's new?", 'Interrogative', 72),
  fr('où', 'where', '/u/', 'oo', 'other', 'A1', 'easy', 'universal', ['general'], ['questions', 'directions'], 'Où habites-tu?', 'Where do you live?', 'Location question', 73),
  fr('comment', 'how', '/kɔ.mɑ̃/', 'koh-MAHN', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], 'Comment allez-vous?', 'How are you?', 'Manner question', 74),
  fr('combien', 'how much/many', '/kɔ̃.bjɛ̃/', 'kohn-bee-EHN', 'other', 'A1', 'easy', 'universal', ['general', 'business'], ['questions', 'money'], 'Combien ça coûte?', 'How much does it cost?', 'Quantity question', 75),
  fr('quand', 'when', '/kɑ̃/', 'kahn', 'other', 'A1', 'easy', 'universal', ['general'], ['questions', 'time'], 'Quand arrives-tu?', 'When do you arrive?', 'Time question', 76),
  fr('qui', 'who', '/ki/', 'kee', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], 'Qui est-ce?', 'Who is it?', 'Person question', 77),
  fr('pourquoi', 'why', '/puʁ.kwa/', 'poor-KWAH', 'other', 'A1', 'easy', 'universal', ['general'], ['questions'], 'Pourquoi études-tu le français?', 'Why do you study French?', 'Reason question', 78),

  // Common Phrases
  fr('je m\'appelle', 'my name is', '/ʒə ma.pɛl/', 'zhuh mah-PEHL', 'phrase', 'A1', 'easy', 'survival', ['general'], ['introductions'], 'Je m\'appelle Marie.', 'My name is Marie.', 'Self-introduction', 79),
  fr('enchanté', 'nice to meet you', '/ɑ̃.ʃɑ̃.te/', 'ahn-shahn-TAY', 'other', 'A1', 'easy', 'universal', ['general', 'business'], ['introductions'], 'Enchanté, je suis Paul.', 'Nice to meet you, I am Paul.', 'Greeting on first meeting', 80),
  fr('je ne comprends pas', "I don't understand", '/ʒə nə kɔ̃.pʁɑ̃ pa/', 'zhuh nuh kohn-PRAHN pah', 'phrase', 'A1', 'easy', 'survival', ['general'], ['communication'], 'Désolé, je ne comprends pas.', "Sorry, I don't understand.", 'Essential learner phrase', 81),
  fr('plus lentement', 'more slowly', '/ply lɑ̃t.mɑ̃/', 'ploo lahnt-MAHN', 'phrase', 'A1', 'easy', 'survival', ['general'], ['communication'], "Plus lentement, s'il vous plaît.", 'More slowly, please.', 'Asking to slow down', 82),
  fr('parlez-vous anglais?', 'do you speak English?', '/paʁ.le vu ɑ̃.ɡlɛ/', 'par-LAY voo ahn-GLEH', 'phrase', 'A1', 'easy', 'survival', ['general'], ['communication'], 'Parlez-vous anglais?', 'Do you speak English?', 'Survival phrase', 83),

  // Basic Adjectives
  fr('bon', 'good', '/bɔ̃/', 'bohn', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'Le café est bon.', 'The coffee is good.', 'Positive quality; bonne (f)', 84),
  fr('mauvais', 'bad', '/mo.vɛ/', 'moh-VEH', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'Le temps est mauvais.', 'The weather is bad.', 'Negative quality', 85),
  fr('grand', 'big / tall', '/ɡʁɑ̃/', 'grahn', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], 'Ma maison est grande.', 'My house is big.', 'Size or height', 86),
  fr('petit', 'small', '/pə.ti/', 'puh-TEE', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], "J'ai un petit problème.", 'I have a small problem.', 'Size descriptor', 87),
  fr('nouveau', 'new', '/nu.vo/', 'noo-VOH', 'adjective', 'A1', 'easy', 'universal', ['general'], ['description'], "J'ai un nouveau téléphone.", 'I have a new phone.', 'Novelty; nouvelle (f)', 88),
  fr('beaucoup', 'a lot / much', '/bo.ku/', 'boh-KOO', 'adverb', 'A1', 'easy', 'universal', ['general'], ['quantity'], "J'ai beaucoup de travail.", 'I have a lot of work.', 'Quantity adverb', 89),
  fr('peu', 'little / few', '/pø/', 'puh', 'adverb', 'A1', 'easy', 'universal', ['general'], ['quantity'], "J'ai peu de temps.", 'I have little time.', 'Small quantity', 90),

  // Places
  fr('restaurant', 'restaurant', '/ʁɛs.to.ʁɑ̃/', 'res-toh-RAHN', 'noun', 'A1', 'easy', 'universal', ['general', 'hospitality'], ['food', 'places'], 'Nous dînons au restaurant.', 'We dine at the restaurant.', 'Dining establishment', 91),
  fr('hôpital', 'hospital', '/o.pi.tal/', 'oh-pee-TAHL', 'noun', 'A1', 'easy', 'survival', ['general', 'healthcare'], ['healthcare', 'places'], "L'hôpital est près d'ici.", 'The hospital is near here.', 'Medical facility', 92),
  fr('école', 'school', '/e.kɔl/', 'ay-KOHL', 'noun', 'A1', 'easy', 'universal', ['general', 'education'], ['education', 'places'], "Mes enfants vont à l'école.", 'My children go to school.', 'Educational institution', 93),
  fr('magasin', 'store / shop', '/ma.ɡa.zɛ̃/', 'mah-gah-ZEHN', 'noun', 'A1', 'easy', 'universal', ['general'], ['shopping', 'places'], 'Le magasin est ouvert.', 'The store is open.', 'Commercial establishment', 94),
  fr('bureau', 'office / desk', '/by.ʁo/', 'boo-ROH', 'noun', 'A1', 'easy', 'universal', ['general', 'business'], ['work', 'places'], 'Je travaille dans un bureau.', 'I work in an office.', 'Workplace', 95),
  fr('gare', 'train station', '/ɡaʁ/', 'gahr', 'noun', 'A1', 'easy', 'universal', ['general'], ['transportation', 'places'], 'La gare est au centre-ville.', 'The train station is downtown.', 'Transport hub', 96),

  // More Basics
  fr('chose', 'thing', '/ʃoz/', 'shohz', 'noun', 'A1', 'easy', 'universal', ['general'], ['general'], "C'est une bonne chose.", 'It is a good thing.', 'General noun', 97),
  fr('jour', 'day', '/ʒuʁ/', 'zhoor', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Quel jour sommes-nous?', 'What day is it?', 'Day of week', 98),
  fr('nuit', 'night', '/nɥi/', 'nwee', 'noun', 'A1', 'easy', 'universal', ['general'], ['time'], 'Bonne nuit!', 'Good night!', 'Nighttime', 99),
  fr('pays', 'country', '/pe.i/', 'pay-EE', 'noun', 'A1', 'easy', 'universal', ['general', 'government'], ['travel', 'geography'], 'De quel pays venez-vous?', 'What country are you from?', 'Nation', 100),
];

// ============================================================================
// EN-FR VOCABULARY — A2 (~75 words — representative set)
// ============================================================================

const FR_A2: VoxVocabularySeed[] = [
  fr('se réveiller', 'to wake up', '/sə ʁe.ve.je/', 'suh ray-vay-YAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['daily_routines'], 'Je me réveille à sept heures.', 'I wake up at seven.', 'Reflexive daily routine', 101),
  fr('prendre une douche', 'to take a shower', '/pʁɑ̃dʁ yn duʃ/', 'prahn-druh oon DOOSH', 'phrase', 'A2', 'easy', 'universal', ['general'], ['daily_routines'], 'Je prends une douche le matin.', 'I take a shower in the morning.', 'Daily hygiene', 102),
  fr('petit-déjeuner', 'breakfast', '/pə.ti de.ʒø.ne/', 'puh-TEE day-zhuh-NAY', 'noun', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'food'], 'Je prends le petit-déjeuner à huit heures.', 'I have breakfast at eight.', 'Morning meal', 103),
  fr('déjeuner', 'lunch', '/de.ʒø.ne/', 'day-zhuh-NAY', 'noun', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'food'], 'Nous déjeunons à midi.', 'We have lunch at noon.', 'Midday meal', 104),
  fr('dîner', 'dinner', '/di.ne/', 'dee-NAY', 'noun', 'A2', 'easy', 'universal', ['general'], ['daily_routines', 'food'], 'Nous dînons à vingt heures.', 'We dine at eight PM.', 'Evening meal', 105),
  fr('acheter', 'to buy', '/aʃ.te/', 'ahsh-TAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['shopping'], "J'achète des vêtements.", 'I buy clothes.', 'Purchase verb', 106),
  fr('vendre', 'to sell', '/vɑ̃dʁ/', 'vahn-druh', 'verb', 'A2', 'easy', 'universal', ['general', 'business'], ['shopping'], 'Le magasin vend des chaussures.', 'The store sells shoes.', 'Commerce verb', 107),
  fr('prix', 'price', '/pʁi/', 'pree', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['shopping', 'money'], 'Quel est le prix?', 'What is the price?', 'Cost', 108),
  fr('cher', 'expensive', '/ʃɛʁ/', 'shehr', 'adjective', 'A2', 'easy', 'universal', ['general'], ['shopping', 'money'], 'Cette robe est très chère.', 'This dress is very expensive.', 'High price', 109),
  fr('bon marché', 'cheap', '/bɔ̃ maʁ.ʃe/', 'bohn mar-SHAY', 'phrase', 'A2', 'easy', 'universal', ['general'], ['shopping', 'money'], 'Ce marché est bon marché.', 'This market is cheap.', 'Low price', 110),
  fr('gauche', 'left', '/ɡoʃ/', 'gohsh', 'noun', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Tournez à gauche.', 'Turn left.', 'Directional', 111),
  fr('droite', 'right', '/dʁwat/', 'drwaht', 'noun', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Tournez à droite.', 'Turn right.', 'Directional', 112),
  fr('tout droit', 'straight ahead', '/tu dʁwa/', 'too DRWAH', 'phrase', 'A2', 'easy', 'universal', ['general'], ['directions'], 'Continuez tout droit.', 'Continue straight ahead.', 'Directional', 113),
  fr('près', 'near', '/pʁɛ/', 'preh', 'adverb', 'A2', 'easy', 'universal', ['general'], ['directions'], "La banque est près d'ici.", 'The bank is near here.', 'Proximity', 114),
  fr('loin', 'far', '/lwɛ̃/', 'lwehn', 'adverb', 'A2', 'easy', 'universal', ['general'], ['directions'], "L'aéroport est loin.", 'The airport is far.', 'Distance', 115),
  fr('temps', 'weather / time', '/tɑ̃/', 'tahn', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather', 'time'], 'Quel temps fait-il?', 'How is the weather?', 'Weather or time', 116),
  fr('pluie', 'rain', '/plɥi/', 'plwee', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Il y a de la pluie.', 'There is rain.', 'Precipitation', 117),
  fr('soleil', 'sun', '/sɔ.lɛj/', 'soh-LAY', 'noun', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Il fait soleil.', "It's sunny.", 'Celestial body', 118),
  fr('froid', 'cold', '/fʁwa/', 'frwah', 'adjective', 'A2', 'easy', 'universal', ['general'], ['weather'], 'Il fait très froid.', "It's very cold.", 'Temperature', 119),
  fr('chaud', 'hot', '/ʃo/', 'shoh', 'adjective', 'A2', 'easy', 'universal', ['general'], ['weather'], "Il fait chaud en été.", "It's hot in summer.", 'Temperature', 120),
  fr('lire', 'to read', '/liʁ/', 'leer', 'verb', 'A2', 'easy', 'universal', ['general', 'education'], ['hobbies'], "J'aime lire des romans.", 'I like to read novels.', 'Reading', 121),
  fr('écrire', 'to write', '/e.kʁiʁ/', 'ay-KREER', 'verb', 'A2', 'easy', 'universal', ['general', 'education'], ['hobbies', 'work'], "J'écris des emails.", 'I write emails.', 'Writing', 122),
  fr('nager', 'to swim', '/na.ʒe/', 'nah-ZHAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['hobbies', 'sports'], 'Je nage dans la piscine.', 'I swim in the pool.', 'Water sport', 123),
  fr('courir', 'to run', '/ku.ʁiʁ/', 'koo-REER', 'verb', 'A2', 'easy', 'universal', ['general'], ['hobbies', 'sports'], 'Je cours tous les jours.', 'I run every day.', 'Exercise', 124),
  fr('film', 'movie', '/film/', 'feelm', 'noun', 'A2', 'easy', 'universal', ['general', 'creative'], ['hobbies', 'entertainment'], 'Nous allons voir un film.', "We're going to see a movie.", 'Entertainment', 125),
  fr('musique', 'music', '/my.zik/', 'moo-ZEEK', 'noun', 'A2', 'easy', 'universal', ['general', 'creative'], ['hobbies'], "J'écoute de la musique classique.", 'I listen to classical music.', 'Art form', 126),
  fr('heureux', 'happy', '/ø.ʁø/', 'uh-RUH', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], "Je suis très heureux aujourd'hui.", 'I am very happy today.', 'Positive emotion; heureuse (f)', 127),
  fr('triste', 'sad', '/tʁist/', 'treest', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Il se sent triste.', 'He feels sad.', 'Negative emotion', 128),
  fr('fatigué', 'tired', '/fa.ti.ɡe/', 'fah-tee-GAY', 'adjective', 'A2', 'easy', 'universal', ['general'], ['emotions'], 'Je suis fatigué après le travail.', "I'm tired after work.", 'Physical state', 129),
  fr('voiture', 'car', '/vwa.tyʁ/', 'vwah-TOOR', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'Ma voiture est bleue.', 'My car is blue.', 'Vehicle', 130),
  fr('bus', 'bus', '/bys/', 'boos', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'Je prends le bus.', 'I take the bus.', 'Public transport', 131),
  fr('train', 'train', '/tʁɛ̃/', 'trehn', 'noun', 'A2', 'easy', 'universal', ['general'], ['transportation'], 'Le train part à huit heures.', 'The train leaves at eight.', 'Rail transport', 132),
  fr('avion', 'airplane', '/a.vjɔ̃/', 'ah-vee-OHN', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['transportation', 'travel'], "L'avion arrive à trois heures.", 'The airplane arrives at three.', 'Air transport', 133),
  fr('tête', 'head', '/tɛt/', 'teht', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], "J'ai mal à la tête.", 'I have a headache.', 'Body part', 134),
  fr('main', 'hand', '/mɛ̃/', 'mehn', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Je me lave les mains.', 'I wash my hands.', 'Body part', 135),
  fr('cœur', 'heart', '/kœʁ/', 'kuhr', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['body_parts'], 'Mon cœur bat vite.', 'My heart beats fast.', 'Organ', 136),
  fr('cuisine', 'kitchen', '/kɥi.zin/', 'kwee-ZEEN', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Je cuisine dans la cuisine.', 'I cook in the kitchen.', 'Room', 137),
  fr('chambre', 'bedroom', '/ʃɑ̃bʁ/', 'shahm-bruh', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Ma chambre est calme.', 'My bedroom is quiet.', 'Room', 138),
  fr('médecin', 'doctor', '/med.sɛ̃/', 'med-SEHN', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], 'Le médecin me recommande du repos.', 'The doctor recommends rest.', 'Health professional', 139),
  fr('malade', 'sick', '/ma.lad/', 'mah-LAHD', 'adjective', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], "Je suis malade aujourd'hui.", 'I am sick today.', 'Health condition', 140),
  fr('douleur', 'pain', '/du.lœʁ/', 'doo-LUHR', 'noun', 'A2', 'easy', 'universal', ['general', 'healthcare'], ['healthcare'], "J'ai une douleur au dos.", 'I have back pain.', 'Physical discomfort', 141),
  fr('mais', 'but', '/mɛ/', 'meh', 'other', 'A2', 'easy', 'universal', ['general'], ['connectors'], 'Je veux venir, mais je ne peux pas.', "I want to come, but I can't.", 'Contrast connector', 142),
  fr('parce que', 'because', '/paʁs kə/', 'pahrs kuh', 'phrase', 'A2', 'easy', 'universal', ['general'], ['connectors'], "J'étudie parce que je veux apprendre.", 'I study because I want to learn.', 'Causal connector', 143),
  fr('aussi', 'also', '/o.si/', 'oh-SEE', 'adverb', 'A2', 'easy', 'universal', ['general'], ['connectors'], 'Je veux aussi venir.', 'I also want to come.', 'Addition', 144),
  fr('toujours', 'always', '/tu.ʒuʁ/', 'too-ZHOOR', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time', 'frequency'], "J'arrive toujours tôt.", 'I always arrive early.', 'Frequency', 145),
  fr('jamais', 'never', '/ʒa.mɛ/', 'zhah-MEH', 'adverb', 'A2', 'easy', 'universal', ['general'], ['time', 'frequency'], "Je n'arrive jamais en retard.", "I'm never late.", 'Frequency', 146),
  fr('savoir', 'to know (facts)', '/sa.vwaʁ/', 'sah-VWAHR', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Savez-vous où est la gare?', 'Do you know where the station is?', 'Factual knowledge', 147),
  fr('connaître', 'to know (people)', '/kɔ.nɛtʁ/', 'koh-NEH-truh', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Connaissez-vous ma sœur?', 'Do you know my sister?', 'Familiarity', 148),
  fr('penser', 'to think', '/pɑ̃.se/', 'pahn-SAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], "Je pense que c'est une bonne idée.", 'I think it is a good idea.', 'Cognitive verb', 149),
  fr('trouver', 'to find', '/tʁu.ve/', 'troo-VAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je ne peux pas trouver mes clés.', "I can't find my keys.", 'Discovery', 150),
  fr('attendre', 'to wait', '/a.tɑ̃dʁ/', 'ah-TAHN-druh', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], "J'attends le bus.", 'I wait for the bus.', 'Waiting verb', 151),
  fr('arriver', 'to arrive', '/a.ʁi.ve/', 'ah-ree-VAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs', 'travel'], "J'arrive à neuf heures.", 'I arrive at nine.', 'Arrival', 152),
  fr('partir', 'to leave', '/paʁ.tiʁ/', 'par-TEER', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je pars à huit heures.', 'I leave at eight.', 'Departure', 153),
  fr('payer', 'to pay', '/pe.je/', 'pay-YAY', 'verb', 'A2', 'easy', 'universal', ['general', 'business'], ['essential_verbs', 'money'], 'Je peux payer par carte?', 'Can I pay by card?', 'Financial transaction', 154),
  fr('aider', 'to help', '/ɛ.de/', 'ay-DAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Pouvez-vous m\'aider?', 'Can you help me?', 'Assistance', 155),
  fr('apprendre', 'to learn', '/a.pʁɑ̃dʁ/', 'ah-PRAHN-druh', 'verb', 'A2', 'easy', 'universal', ['general', 'education'], ['essential_verbs', 'education'], 'Je veux apprendre le français.', 'I want to learn French.', 'Educational verb', 156),
  fr('rappeler', 'to remember / to call back', '/ʁa.ple/', 'rah-PLAY', 'verb', 'A2', 'easy', 'universal', ['general'], ['essential_verbs'], 'Je ne me rappelle pas son nom.', "I don't remember his name.", 'Memory verb', 157),
  fr('important', 'important', '/ɛ̃.pɔʁ.tɑ̃/', 'ehn-por-TAHN', 'adjective', 'A2', 'easy', 'universal', ['general', 'business'], ['description'], "C'est une réunion importante.", 'It is an important meeting.', 'Significance', 158),
  fr('facile', 'easy', '/fa.sil/', 'fah-SEEL', 'adjective', 'A2', 'easy', 'universal', ['general', 'education'], ['description'], "L'examen était facile.", 'The exam was easy.', 'Difficulty descriptor', 159),
  fr('difficile', 'difficult', '/di.fi.sil/', 'dee-fee-SEEL', 'adjective', 'A2', 'easy', 'universal', ['general', 'education'], ['description'], 'La grammaire est difficile.', 'Grammar is difficult.', 'Difficulty descriptor', 160),
  fr('rapide', 'fast', '/ʁa.pid/', 'rah-PEED', 'adjective', 'A2', 'easy', 'universal', ['general'], ['description'], 'Le train est très rapide.', 'The train is very fast.', 'Speed', 161),
  fr('ville', 'city', '/vil/', 'veel', 'noun', 'A2', 'easy', 'universal', ['general'], ['travel', 'geography'], 'Paris est une grande ville.', 'Paris is a big city.', 'Urban area', 162),
  fr('plage', 'beach', '/plaʒ/', 'plahzh', 'noun', 'A2', 'easy', 'universal', ['general', 'hospitality'], ['travel', 'hobbies'], 'Nous allons à la plage.', "We're going to the beach.", 'Coastal area', 163),
  fr('vacances', 'vacation', '/va.kɑ̃s/', 'vah-KAHNS', 'noun', 'A2', 'easy', 'universal', ['general'], ['travel', 'time'], 'Je suis en vacances.', 'I am on vacation.', 'Time off', 164),
  fr('cadeau', 'gift', '/ka.do/', 'kah-DOH', 'noun', 'A2', 'easy', 'universal', ['general'], ['celebrations', 'shopping'], "J'ai acheté un cadeau pour toi.", 'I bought a gift for you.', 'Present', 165),
  fr('anniversaire', 'birthday', '/a.ni.vɛʁ.sɛʁ/', 'ah-nee-vehr-SEHR', 'noun', 'A2', 'easy', 'universal', ['general'], ['celebrations'], 'Mon anniversaire est en mars.', 'My birthday is in March.', 'Annual celebration', 166),
  fr('clé', 'key', '/kle/', 'klay', 'noun', 'A2', 'easy', 'universal', ['general'], ['home'], 'Je ne trouve pas mes clés.', "I can't find my keys.", 'Door key', 167),
  fr('banque', 'bank', '/bɑ̃k/', 'bahnk', 'noun', 'A2', 'easy', 'universal', ['general', 'business'], ['money', 'places'], "Je vais à la banque retirer de l'argent.", "I go to the bank to withdraw money.", 'Financial institution', 168),
  fr('supermarché', 'supermarket', '/sy.pɛʁ.maʁ.ʃe/', 'soo-pehr-mar-SHAY', 'noun', 'A2', 'easy', 'universal', ['general'], ['shopping', 'places'], "J'achète de la nourriture au supermarché.", 'I buy food at the supermarket.', 'Grocery store', 169),
  fr('jardin', 'garden', '/ʒaʁ.dɛ̃/', 'zhar-DEHN', 'noun', 'A2', 'easy', 'universal', ['general'], ['home', 'nature'], 'Mon jardin a des fleurs.', 'My garden has flowers.', 'Outdoor space', 170),
  fr('parc', 'park', '/paʁk/', 'park', 'noun', 'A2', 'easy', 'universal', ['general'], ['places', 'hobbies'], 'Nous allons au parc.', "Let's go to the park.", 'Recreation area', 171),
  fr('problème', 'problem', '/pʁɔ.blɛm/', 'proh-BLEHM', 'noun', 'A2', 'easy', 'universal', ['general'], ['communication'], "J'ai un problème.", 'I have a problem.', 'Difficulty', 172),
  fr('question', 'question', '/kɛs.tjɔ̃/', 'kes-tee-OHN', 'noun', 'A2', 'easy', 'universal', ['general', 'education'], ['communication'], "J'ai une question.", 'I have a question.', 'Inquiry', 173),
  fr('réponse', 'answer', '/ʁe.pɔ̃s/', 'ray-POHNS', 'noun', 'A2', 'easy', 'universal', ['general', 'education'], ['communication'], "Je n'ai pas la réponse.", "I don't have the answer.", 'Reply', 174),
  fr('téléphone', 'telephone', '/te.le.fɔn/', 'tay-lay-FOHN', 'noun', 'A2', 'easy', 'universal', ['general', 'tech'], ['technology'], 'Mon téléphone ne marche pas.', "My phone doesn't work.", 'Device', 175),
];

// ============================================================================
// EN-FR VOCABULARY — B1 (~75 words — representative set)
// ============================================================================

const FR_B1: VoxVocabularySeed[] = [
  fr('réunion', 'meeting', '/ʁe.y.njɔ̃/', 'ray-oo-nee-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work', 'business'], 'La réunion commence à trois heures.', 'The meeting starts at three.', 'Professional gathering', 176),
  fr('projet', 'project', '/pʁɔ.ʒɛ/', 'proh-ZHEH', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'tech'], ['work'], 'Nous travaillons sur un projet important.', 'We are working on an important project.', 'Assignment', 177),
  fr('client', 'client', '/kli.jɑ̃/', 'klee-YAHN', 'noun', 'B1', 'medium', 'universal', ['business', 'legal'], ['work', 'business'], 'Nos clients sont satisfaits.', 'Our clients are satisfied.', 'Business relationship', 178),
  fr('entreprise', 'company', '/ɑ̃.tʁə.pʁiz/', 'ahn-truh-PREEZ', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Je travaille pour une grande entreprise.', 'I work for a large company.', 'Business organization', 179),
  fr('patron', 'boss', '/pa.tʁɔ̃/', 'pah-TROHN', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Mon patron est exigeant.', 'My boss is demanding.', 'Superior', 180),
  fr('salaire', 'salary', '/sa.lɛʁ/', 'sah-LEHR', 'noun', 'B1', 'medium', 'universal', ['business', 'general'], ['work', 'money'], 'Mon salaire est compétitif.', 'My salary is competitive.', 'Compensation', 181),
  fr('contrat', 'contract', '/kɔ̃.tʁa/', 'kohn-TRAH', 'noun', 'B1', 'medium', 'universal', ['business', 'legal'], ['work', 'legal'], "J'ai signé un contrat de deux ans.", 'I signed a two-year contract.', 'Legal agreement', 182),
  fr('expérience', 'experience', '/ɛk.spe.ʁjɑ̃s/', 'ek-spay-ree-AHNS', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], "J'ai dix ans d'expérience.", 'I have ten years of experience.', 'Professional background', 183),
  fr('passeport', 'passport', '/pas.pɔʁ/', 'pahs-POR', 'noun', 'B1', 'medium', 'universal', ['general', 'government'], ['travel', 'documents'], 'Je dois renouveler mon passeport.', 'I need to renew my passport.', 'Travel document', 184),
  fr('vol', 'flight', '/vɔl/', 'vohl', 'noun', 'B1', 'medium', 'universal', ['general', 'hospitality'], ['travel'], 'Mon vol part à six heures.', 'My flight departs at six.', 'Air travel', 185),
  fr('réservation', 'reservation', '/ʁe.zɛʁ.va.sjɔ̃/', 'ray-zehr-vah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'hospitality'], ['travel'], "J'ai fait une réservation.", 'I made a reservation.', 'Booking', 186),
  fr('santé', 'health', '/sɑ̃.te/', 'sahn-TAY', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health'], 'La santé est primordiale.', 'Health is paramount.', 'Wellbeing', 187),
  fr('maladie', 'illness', '/ma.la.di/', 'mah-lah-DEE', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health'], "C'est une maladie chronique.", 'It is a chronic illness.', 'Medical condition', 188),
  fr('rendez-vous', 'appointment', '/ʁɑ̃.de.vu/', 'rahn-day-VOO', 'noun', 'B1', 'medium', 'universal', ['general', 'healthcare'], ['health', 'work'], "J'ai un rendez-vous chez le médecin.", 'I have a doctor appointment.', 'Scheduled meeting', 189),
  fr('traitement', 'treatment', '/tʁɛt.mɑ̃/', 'treht-MAHN', 'noun', 'B1', 'medium', 'field-specific', ['healthcare', 'general'], ['health'], 'Le traitement dure trois mois.', 'The treatment lasts three months.', 'Medical care', 190),
  fr('urgence', 'emergency', '/yʁ.ʒɑ̃s/', 'oor-ZHAHNS', 'noun', 'B1', 'medium', 'survival', ['healthcare', 'general'], ['health', 'emergency'], "C'est une urgence médicale.", 'It is a medical emergency.', 'Urgent situation', 191),
  fr('avis', 'opinion', '/a.vi/', 'ah-VEE', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'À mon avis, c\'est correct.', 'In my opinion, it is correct.', 'Point of view', 192),
  fr('accord', 'agreement', '/a.kɔʁ/', 'ah-KOR', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], "Nous sommes d'accord.", 'We agree.', 'Consensus', 193),
  fr('expliquer', 'to explain', '/ɛk.spli.ke/', 'ek-splee-KAY', 'verb', 'B1', 'medium', 'universal', ['general', 'education'], ['communication'], 'Pouvez-vous expliquer encore?', 'Can you explain again?', 'Clarification', 194),
  fr('proposer', 'to propose', '/pʁɔ.po.ze/', 'proh-poh-ZAY', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Je propose une nouvelle stratégie.', 'I propose a new strategy.', 'Suggestion', 195),
  fr('cependant', 'however', '/sə.pɑ̃.dɑ̃/', 'suh-pahn-DAHN', 'adverb', 'B1', 'medium', 'universal', ['general'], ['connectors'], 'Cependant, il y a un problème.', 'However, there is a problem.', 'Contrast connector', 196),
  fr('de plus', 'moreover', '/də ply/', 'duh PLOO', 'phrase', 'B1', 'medium', 'universal', ['general'], ['connectors'], 'De plus, nous avons une autre option.', 'Moreover, we have another option.', 'Addition', 197),
  fr('objectif', 'objective/goal', '/ɔb.ʒɛk.tif/', 'ob-zhek-TEEF', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['plans', 'work'], 'Notre objectif est clair.', 'Our objective is clear.', 'Target aim', 198),
  fr('succès', 'success', '/syk.sɛ/', 'sook-SEH', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['plans'], 'Le projet fut un succès.', 'The project was a success.', 'Achievement', 199),
  fr('relation', 'relationship', '/ʁə.la.sjɔ̃/', 'ruh-lah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general'], ['relationships'], 'Nous avons une bonne relation.', 'We have a good relationship.', 'Connection', 200),
  fr('confiance', 'trust', '/kɔ̃.fjɑ̃s/', 'kohn-fee-AHNS', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['relationships'], 'La confiance se gagne avec le temps.', 'Trust is earned over time.', 'Reliance', 201),
  fr('culture', 'culture', '/kyl.tyʁ/', 'kool-TOOR', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture'], 'La culture française est fascinante.', 'French culture is fascinating.', 'Societal practices', 202),
  fr('histoire', 'history/story', '/is.twaʁ/', 'ees-TWAHR', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture'], "L'histoire de France est riche.", 'The history of France is rich.', 'Past events', 203),
  fr('langue', 'language', '/lɑ̃ɡ/', 'lahnɡ', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['culture', 'education'], 'Combien de langues parlez-vous?', 'How many languages do you speak?', 'Spoken language', 204),
  fr('internet', 'internet', '/ɛ̃.tɛʁ.nɛt/', 'ehn-tehr-NEHT', 'noun', 'B1', 'easy', 'universal', ['general', 'tech'], ['technology'], "J'utilise internet pour travailler.", 'I use the internet for work.', 'Global network', 205),
  fr('courriel', 'email', '/ku.ʁjɛl/', 'koo-ree-EHL', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'tech'], ['technology', 'communication'], "J'ai envoyé un courriel.", 'I sent an email.', 'Digital mail; Quebec prefers courriel', 206),
  fr('mot de passe', 'password', '/mo də pas/', 'moh duh PAHS', 'phrase', 'B1', 'medium', 'universal', ['general', 'tech'], ['technology'], "J'ai oublié mon mot de passe.", 'I forgot my password.', 'Access code', 207),
  fr('améliorer', 'to improve', '/a.me.ljɔ.ʁe/', 'ah-may-lee-oh-RAY', 'verb', 'B1', 'medium', 'universal', ['general', 'education'], ['work'], 'Je veux améliorer mon français.', 'I want to improve my French.', 'Enhancement', 208),
  fr('développer', 'to develop', '/de.vlɔ.pe/', 'day-vloh-PAY', 'verb', 'B1', 'medium', 'universal', ['business', 'tech', 'general'], ['work'], 'Nous développons de nouveaux produits.', 'We develop new products.', 'Growth verb', 209),
  fr('organiser', 'to organize', '/ɔʁ.ɡa.ni.ze/', 'or-gah-nee-ZAY', 'verb', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], "Je dois organiser mon emploi du temps.", 'I need to organize my schedule.', 'Planning', 210),
  fr('réussir', 'to succeed', '/ʁe.y.siʁ/', 'ray-oo-SEER', 'verb', 'B1', 'medium', 'universal', ['general'], ['work', 'plans'], "J'ai réussi l'examen.", 'I passed the exam.', 'Achievement verb', 211),
  fr('partager', 'to share', '/paʁ.ta.ʒe/', 'par-tah-ZHAY', 'verb', 'B1', 'medium', 'universal', ['general'], ['communication'], 'Je partage mon expérience.', 'I share my experience.', 'Distribution', 212),
  fr('disponible', 'available', '/dis.pɔ.nibl/', 'dees-poh-NEE-bluh', 'adjective', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Êtes-vous disponible demain?', 'Are you available tomorrow?', 'Accessibility', 213),
  fr('possible', 'possible', '/pɔ.sibl/', 'poh-SEE-bluh', 'adjective', 'B1', 'easy', 'universal', ['general'], ['description'], 'Est-ce possible de changer la date?', 'Is it possible to change the date?', 'Possibility', 214),
  fr('nécessaire', 'necessary', '/ne.se.sɛʁ/', 'nay-seh-SEHR', 'adjective', 'B1', 'medium', 'universal', ['general'], ['description'], "C'est nécessaire d'étudier.", 'It is necessary to study.', 'Requirement', 215),
  fr('solution', 'solution', '/sɔ.ly.sjɔ̃/', 'soh-loo-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'tech'], ['communication'], 'Nous avons trouvé une solution.', 'We found a solution.', 'Resolution', 216),
  fr('résultat', 'result', '/ʁe.zyl.ta/', 'ray-zool-TAH', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'Les résultats sont positifs.', 'The results are positive.', 'Outcome', 217),
  fr('situation', 'situation', '/si.ty.a.sjɔ̃/', 'see-too-ah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general'], ['communication'], 'La situation est compliquée.', 'The situation is complicated.', 'Circumstance', 218),
  fr('avantage', 'advantage', '/a.vɑ̃.taʒ/', 'ah-vahn-TAHZH', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['communication'], 'Parler deux langues est un avantage.', 'Speaking two languages is an advantage.', 'Benefit', 219),
  fr('service', 'service', '/sɛʁ.vis/', 'sehr-VEES', 'noun', 'B1', 'medium', 'universal', ['general', 'business', 'hospitality'], ['work'], 'Le service client est excellent.', 'Customer service is excellent.', 'Assistance', 220),
  fr('qualité', 'quality', '/ka.li.te/', 'kah-lee-TAY', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['work'], 'La qualité du produit est haute.', 'The product quality is high.', 'Standard', 221),
  fr('gouvernement', 'government', '/ɡu.vɛʁ.nə.mɑ̃/', 'goo-vehr-nuh-MAHN', 'noun', 'B1', 'medium', 'universal', ['general', 'government'], ['politics'], 'Le gouvernement a approuvé la loi.', 'The government approved the law.', 'State administration', 222),
  fr('société', 'society/company', '/sɔ.sje.te/', 'soh-see-ay-TAY', 'noun', 'B1', 'medium', 'universal', ['general', 'business'], ['culture', 'business'], 'La société évolue.', 'Society is evolving.', 'Community or company', 223),
  fr('éducation', 'education', '/e.dy.ka.sjɔ̃/', 'ay-doo-kah-see-OHN', 'noun', 'B1', 'medium', 'universal', ['general', 'education'], ['education'], "L'éducation est fondamentale.", 'Education is fundamental.', 'Learning system', 224),
  fr('sécurité', 'security', '/se.ky.ʁi.te/', 'say-koo-ree-TAY', 'noun', 'B1', 'medium', 'universal', ['general', 'tech', 'government'], ['work'], 'La sécurité est une priorité.', 'Security is a priority.', 'Protection', 225),
];

// ============================================================================
// EN-FR VOCABULARY — B2 (~50 words)
// ============================================================================

const FR_B2: VoxVocabularySeed[] = [
  fr('élection', 'election', '/e.lɛk.sjɔ̃/', 'ay-lek-see-OHN', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics'], 'Les élections sont en novembre.', 'Elections are in November.', 'Political vote', 226),
  fr('démocratie', 'democracy', '/de.mɔ.kʁa.si/', 'day-moh-krah-SEE', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics'], 'La démocratie exige la participation.', 'Democracy requires participation.', 'Political system', 227),
  fr('environnement', 'environment', '/ɑ̃.vi.ʁɔn.mɑ̃/', 'ahn-vee-rohn-MAHN', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['environment'], "Nous devons protéger l'environnement.", 'We must protect the environment.', 'Natural world', 228),
  fr('pollution', 'pollution', '/pɔ.ly.sjɔ̃/', 'poh-loo-see-OHN', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['environment'], "La pollution de l'air est grave.", 'Air pollution is serious.', 'Environmental damage', 229),
  fr('durable', 'sustainable', '/dy.ʁabl/', 'doo-RAH-bluh', 'adjective', 'B2', 'medium', 'universal', ['general', 'business'], ['environment'], 'Le développement durable est essentiel.', 'Sustainable development is essential.', 'Environmentally responsible', 230),
  fr('stratégie', 'strategy', '/stʁa.te.ʒi/', 'strah-tay-ZHEE', 'noun', 'B2', 'medium', 'field-specific', ['business', 'general'], ['business'], 'La stratégie est efficace.', 'The strategy is effective.', 'Planned approach', 231),
  fr('investissement', 'investment', '/ɛ̃.vɛs.tis.mɑ̃/', 'ehn-ves-tees-MAHN', 'noun', 'B2', 'medium', 'field-specific', ['business', 'general'], ['business', 'money'], 'Mon investissement a été rentable.', 'My investment was profitable.', 'Financial commitment', 232),
  fr('concurrence', 'competition', '/kɔ̃.ky.ʁɑ̃s/', 'kohn-koo-RAHNS', 'noun', 'B2', 'medium', 'field-specific', ['business', 'general'], ['business'], 'La concurrence est féroce.', 'Competition is fierce.', 'Rivalry', 233),
  fr('innovation', 'innovation', '/i.nɔ.va.sjɔ̃/', 'ee-noh-vah-see-OHN', 'noun', 'B2', 'medium', 'field-specific', ['business', 'tech'], ['business', 'technology'], "L'innovation stimule le progrès.", 'Innovation drives progress.', 'New idea', 234),
  fr('diagnostic', 'diagnosis', '/djaɡ.nɔs.tik/', 'dee-ag-nos-TEEK', 'noun', 'B2', 'hard', 'field-specific', ['healthcare'], ['health'], 'Le diagnostic a été précoce.', 'The diagnosis was early.', 'Medical identification', 235),
  fr('chirurgie', 'surgery', '/ʃi.ʁyʁ.ʒi/', 'shee-roor-ZHEE', 'noun', 'B2', 'hard', 'field-specific', ['healthcare'], ['health'], 'La chirurgie a été réussie.', 'The surgery was successful.', 'Surgical procedure', 236),
  fr('avocat', 'lawyer', '/a.vɔ.ka/', 'ah-voh-KAH', 'noun', 'B2', 'medium', 'field-specific', ['legal', 'general'], ['legal', 'work'], "J'ai consulté un avocat.", 'I consulted a lawyer.', 'Legal professional', 237),
  fr('procès', 'trial', '/pʁɔ.sɛ/', 'proh-SEH', 'noun', 'B2', 'hard', 'field-specific', ['legal'], ['legal'], 'Le procès commence lundi.', 'The trial begins Monday.', 'Legal proceeding', 238),
  fr('base de données', 'database', '/baz də dɔ.ne/', 'bahz duh doh-NAY', 'phrase', 'B2', 'medium', 'field-specific', ['tech', 'business'], ['technology'], 'La base de données est à jour.', 'The database is up to date.', 'Data system', 239),
  fr('intelligence artificielle', 'artificial intelligence', '/ɛ̃.tɛ.li.ʒɑ̃s aʁ.ti.fi.sjɛl/', 'ehn-teh-lee-ZHAHNS ar-tee-fee-see-EHL', 'phrase', 'B2', 'hard', 'field-specific', ['tech'], ['technology'], "L'intelligence artificielle progresse vite.", 'AI advances quickly.', 'AI', 240),
  fr('égalité', 'equality', '/e.ɡa.li.te/', 'ay-gah-lee-TAY', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics', 'culture'], "L'égalité est un droit fondamental.", 'Equality is a fundamental right.', 'Fairness', 241),
  fr('liberté', 'freedom', '/li.bɛʁ.te/', 'lee-behr-TAY', 'noun', 'B2', 'medium', 'universal', ['general', 'government'], ['politics'], "La liberté d'expression est essentielle.", 'Freedom of speech is essential.', 'Independence', 242),
  fr('justice', 'justice', '/ʒys.tis/', 'zhoos-TEES', 'noun', 'B2', 'medium', 'universal', ['general', 'legal'], ['legal', 'politics'], 'La justice doit être équitable.', 'Justice must be fair.', 'Fairness', 243),
  fr('analyser', 'to analyze', '/a.na.li.ze/', 'ah-nah-lee-ZAY', 'verb', 'B2', 'medium', 'universal', ['general', 'business', 'tech'], ['work'], 'Nous devons analyser les données.', 'We need to analyze the data.', 'Examination', 244),
  fr('négocier', 'to negotiate', '/ne.ɡɔ.sje/', 'nay-goh-see-AY', 'verb', 'B2', 'medium', 'field-specific', ['business', 'legal'], ['business'], 'Nous négocions le contrat.', 'We negotiate the contract.', 'Bargaining', 245),
  fr('évaluer', 'to evaluate', '/e.va.ly.e/', 'ay-vah-loo-AY', 'verb', 'B2', 'medium', 'universal', ['general', 'business', 'education'], ['work'], 'Nous allons évaluer les résultats.', "Let's evaluate the results.", 'Assessment', 246),
  fr('mettre en œuvre', 'to implement', '/mɛtʁ ɑ̃ œvʁ/', 'meh-truh ahn UH-vruh', 'phrase', 'B2', 'medium', 'field-specific', ['business', 'tech', 'government'], ['work'], 'Nous mettons en œuvre le nouveau système.', 'We implement the new system.', 'Execution', 247),
  fr('complexe', 'complex', '/kɔ̃.plɛks/', 'kohn-PLEKS', 'adjective', 'B2', 'medium', 'universal', ['general'], ['description'], "C'est un problème complexe.", 'It is a complex problem.', 'Multi-layered', 248),
  fr('efficace', 'efficient', '/e.fi.kas/', 'ay-fee-KAHS', 'adjective', 'B2', 'medium', 'universal', ['general', 'business'], ['work'], 'Le processus est plus efficace.', 'The process is more efficient.', 'Productive', 249),
  fr('significatif', 'significant', '/si.ɲi.fi.ka.tif/', 'see-nyee-fee-kah-TEEF', 'adjective', 'B2', 'medium', 'universal', ['general', 'business'], ['description'], 'Il y a eu un changement significatif.', 'There was a significant change.', 'Noteworthy', 250),
];

// ============================================================================
// EN-FR VOCABULARY — C1 (~40 words)
// ============================================================================

const FR_C1: VoxVocabularySeed[] = [
  fr('mettre le doigt sur', 'to put one\'s finger on', '/mɛtʁ lə dwa syʁ/', 'meh-truh luh dwah SOOR', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], "J'ai mis le doigt sur le problème.", "I put my finger on the problem.", 'Idiomatic: to identify precisely', 251),
  fr('avoir le cafard', 'to feel down/blue', '/a.vwaʁ lə ka.faʁ/', 'ah-VWAHR luh kah-FAR', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms', 'emotions'], "J'ai le cafard aujourd'hui.", 'I feel down today.', 'Idiomatic: to feel depressed', 252),
  fr('couper les cheveux en quatre', 'to split hairs', '/ku.pe le ʃə.vø ɑ̃ katʁ/', 'koo-PAY leh shuh-VUH ahn KAH-truh', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms'], 'Arrête de couper les cheveux en quatre.', 'Stop splitting hairs.', 'Idiomatic: to overanalyze', 253),
  fr('en avoir ras le bol', 'to be fed up', '/ɑ̃ a.vwaʁ ʁa lə bɔl/', 'ahn ah-VWAHR rah luh BOHL', 'phrase', 'C1', 'hard', 'universal', ['general'], ['idioms', 'emotions'], "J'en ai ras le bol du trafic.", "I'm fed up with the traffic.", 'Idiomatic: extreme frustration', 254),
  fr('aller droit au but', 'to get straight to the point', '/a.le dʁwa o by/', 'ah-LAY drwah oh BOO', 'phrase', 'C1', 'hard', 'universal', ['general', 'business'], ['idioms', 'communication'], 'Allons droit au but.', "Let's get straight to the point.", 'Idiomatic: directness', 255),
  fr('néanmoins', 'nevertheless', '/ne.ɑ̃.mwɛ̃/', 'nay-ahn-MWEHN', 'adverb', 'C1', 'hard', 'universal', ['general', 'business', 'legal'], ['formal_register', 'connectors'], 'Néanmoins, il y a des risques.', 'Nevertheless, there are risks.', 'Formal contrast', 256),
  fr('en ce qui concerne', 'with regard to', '/ɑ̃ sə ki kɔ̃.sɛʁn/', 'ahn suh kee kohn-SEHRN', 'phrase', 'C1', 'hard', 'universal', ['general', 'business'], ['formal_register'], 'En ce qui concerne le budget...', 'With regard to the budget...', 'Formal topic intro', 257),
  fr('il convient de', 'it is appropriate to', '/il kɔ̃.vjɛ̃ də/', 'eel kohn-vee-EHN duh', 'phrase', 'C1', 'hard', 'universal', ['general', 'business', 'legal'], ['formal_register'], 'Il convient de noter que...', 'It is appropriate to note that...', 'Formal emphasis', 258),
  fr('en vertu de', 'by virtue of', '/ɑ̃ vɛʁ.ty də/', 'ahn vehr-TOO duh', 'phrase', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['formal_register', 'legal'], 'En vertu de la loi en vigueur...', 'By virtue of the current law...', 'Legal expression', 259),
  fr('paradigme', 'paradigm', '/pa.ʁa.diɡm/', 'pah-rah-DEEGM', 'noun', 'C1', 'hard', 'field-specific', ['education', 'tech'], ['academic'], 'Un changement de paradigme est nécessaire.', 'A paradigm shift is necessary.', 'Model or pattern', 260),
  fr('méthodologie', 'methodology', '/me.tɔ.dɔ.lɔ.ʒi/', 'may-toh-doh-loh-ZHEE', 'noun', 'C1', 'hard', 'field-specific', ['education', 'tech'], ['academic'], 'La méthodologie est rigoureuse.', 'The methodology is rigorous.', 'Systematic approach', 261),
  fr('nuance', 'nuance', '/ny.ɑ̃s/', 'noo-AHNS', 'noun', 'C1', 'hard', 'universal', ['general', 'education'], ['academic', 'communication'], 'Il y a une nuance importante.', 'There is an important nuance.', 'Subtle distinction', 262),
  fr('dilemme', 'dilemma', '/di.lɛm/', 'dee-LEHM', 'noun', 'C1', 'hard', 'universal', ['general', 'education'], ['academic'], 'Nous faisons face à un dilemme éthique.', 'We face an ethical dilemma.', 'Difficult choice', 263),
  fr('inférer', 'to infer', '/ɛ̃.fe.ʁe/', 'ehn-fay-RAY', 'verb', 'C1', 'hard', 'field-specific', ['education', 'legal'], ['academic'], 'On peut inférer la conclusion.', 'One can infer the conclusion.', 'Deduction', 264),
  fr('discerner', 'to discern', '/di.sɛʁ.ne/', 'dee-sehr-NAY', 'verb', 'C1', 'hard', 'universal', ['general', 'education'], ['academic'], 'Il est difficile de discerner la vérité.', 'It is difficult to discern the truth.', 'Distinguishing', 265),
  fr('englober', 'to encompass', '/ɑ̃.ɡlɔ.be/', 'ahn-gloh-BAY', 'verb', 'C1', 'hard', 'universal', ['general', 'education'], ['academic'], 'Le projet englobe trois domaines.', 'The project encompasses three areas.', 'To include broadly', 266),
  fr('impliquer', 'to imply/involve', '/ɛ̃.pli.ke/', 'ehn-plee-KAY', 'verb', 'C1', 'hard', 'universal', ['general', 'legal'], ['academic'], 'La décision implique des risques.', 'The decision involves risks.', 'Consequence verb', 267),
  fr('jurisprudence', 'jurisprudence', '/ʒy.ʁis.pʁy.dɑ̃s/', 'zhoo-rees-proo-DAHNS', 'noun', 'C1', 'hard', 'field-specific', ['legal'], ['legal', 'academic'], 'La jurisprudence établit le précédent.', 'Jurisprudence establishes precedent.', 'Legal decisions', 268),
  fr('évolutivité', 'scalability', '/e.vɔ.ly.ti.vi.te/', 'ay-voh-loo-tee-vee-TAY', 'noun', 'C1', 'hard', 'field-specific', ['tech'], ['technology'], "L'évolutivité du système est clé.", 'System scalability is key.', 'Ability to scale', 269),
  fr('sous-jacent', 'underlying', '/su.ʒa.sɑ̃/', 'soo-zhah-SAHN', 'adjective', 'C1', 'hard', 'universal', ['general', 'business'], ['academic'], 'La cause sous-jacente est la pauvreté.', 'The underlying cause is poverty.', 'Beneath the surface', 270),
  fr('pertinent', 'pertinent', '/pɛʁ.ti.nɑ̃/', 'pehr-tee-NAHN', 'adjective', 'C1', 'hard', 'universal', ['general', 'legal', 'education'], ['formal_register'], 'La question est très pertinente.', 'The question is very pertinent.', 'Directly relevant', 271),
  fr('en vigueur', 'in force/current', '/ɑ̃ vi.ɡœʁ/', 'ahn vee-GUHR', 'phrase', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['legal', 'formal_register'], 'La loi en vigueur le prohibe.', 'The current law prohibits it.', 'Currently applicable', 272),
  fr('aborder', 'to address/tackle', '/a.bɔʁ.de/', 'ah-bor-DAY', 'verb', 'C1', 'hard', 'universal', ['general', 'business'], ['communication'], 'Nous devons aborder ce sujet.', 'We must address this topic.', 'To deal with directly', 273),
  fr('remédier', 'to remedy', '/ʁə.me.dje/', 'ruh-may-dee-AY', 'verb', 'C1', 'hard', 'field-specific', ['legal', 'business'], ['formal_register'], "Nous devons remédier à l'erreur.", 'We must remedy the error.', 'To correct', 274),
  fr('veiller', 'to watch over/ensure', '/vɛ.je/', 'veh-YAY', 'verb', 'C1', 'hard', 'field-specific', ['legal', 'government'], ['formal_register'], 'Nous veillons à la sécurité de tous.', 'We ensure the safety of all.', 'To safeguard', 275),
];

// ============================================================================
// EN-FR VOCABULARY — C2 (~25 words)
// ============================================================================

const FR_C2: VoxVocabularySeed[] = [
  fr('perspicace', 'perspicacious', '/pɛʁ.spi.kas/', 'pehr-spee-KAHS', 'adjective', 'C2', 'hard', 'universal', ['general', 'business'], ['literary'], "C'est une observatrice perspicace.", 'She is a keen observer.', 'Sharp insight', 276),
  fr('éloquent', 'eloquent', '/e.lɔ.kɑ̃/', 'ay-loh-KAHN', 'adjective', 'C2', 'hard', 'universal', ['general', 'government'], ['literary', 'communication'], 'Il a prononcé un discours éloquent.', 'He delivered an eloquent speech.', 'Powerfully expressive', 277),
  fr('éphémère', 'ephemeral', '/e.fe.mɛʁ/', 'ay-fay-MEHR', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['literary'], 'La gloire est éphémère.', 'Glory is ephemeral.', 'Short-lived', 278),
  fr('invraisemblable', 'implausible', '/ɛ̃.vʁɛ.sɑ̃.blabl/', 'ehn-vreh-sahm-BLAH-bluh', 'adjective', 'C2', 'hard', 'universal', ['general', 'legal'], ['literary'], 'Son excuse était invraisemblable.', 'His excuse was implausible.', 'Hard to believe', 279),
  fr('herméneutique', 'hermeneutics', '/ɛʁ.me.nø.tik/', 'ehr-may-nuh-TEEK', 'noun', 'C2', 'hard', 'field-specific', ['legal', 'education'], ['academic'], "L'herméneutique juridique est complexe.", 'Legal hermeneutics is complex.', 'Interpretation theory', 280),
  fr('épistémologie', 'epistemology', '/e.pis.te.mɔ.lɔ.ʒi/', 'ay-pees-tay-moh-loh-ZHEE', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], "L'épistémologie questionne le savoir.", 'Epistemology questions knowledge.', 'Study of knowledge', 281),
  fr('dichotomie', 'dichotomy', '/di.kɔ.tɔ.mi/', 'dee-koh-toh-MEE', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'Il existe une dichotomie entre théorie et pratique.', 'There is a dichotomy between theory and practice.', 'Division into two', 282),
  fr('praxis', 'praxis', '/pʁak.sis/', 'PRAHK-sees', 'noun', 'C2', 'hard', 'field-specific', ['education'], ['academic'], 'La praxis est inséparable de la théorie.', 'Praxis is inseparable from theory.', 'Practical application', 283),
  fr('trancher', 'to settle/decide', '/tʁɑ̃.ʃe/', 'trahn-SHAY', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['legal'], 'Le tribunal a tranché le litige.', 'The court settled the dispute.', 'To resolve decisively', 284),
  fr('élucider', 'to elucidate', '/e.ly.si.de/', 'ay-loo-see-DAY', 'verb', 'C2', 'hard', 'field-specific', ['education', 'legal'], ['academic'], 'Nous tentons d\'élucider les faits.', 'We try to elucidate the facts.', 'To clarify thoroughly', 285),
  fr('quichottesque', 'quixotic', '/ki.ʃɔ.tɛsk/', 'kee-shoh-TESK', 'adjective', 'C2', 'hard', 'universal', ['general', 'creative'], ['culture', 'literary'], 'Son projet a un aspect quichottesque.', 'His project has a quixotic aspect.', 'Idealistic, impractical', 286),
  fr('acquiescement', 'acquiescence', '/a.kjɛs.mɑ̃/', 'ah-kee-es-MAHN', 'noun', 'C2', 'hard', 'field-specific', ['government', 'legal'], ['politics', 'formal_register'], "L'acquiescement de tous a été obtenu.", 'The acquiescence of all was obtained.', 'Tacit consent', 287),
  fr('exacerber', 'to exacerbate', '/ɛɡ.za.sɛʁ.be/', 'eg-zah-sehr-BAY', 'verb', 'C2', 'hard', 'universal', ['general', 'healthcare'], ['formal_register'], 'La crise a exacerbé les tensions.', 'The crisis exacerbated tensions.', 'To make worse', 288),
  fr('sauvegarder', 'to safeguard', '/sov.ɡaʁ.de/', 'sohv-gar-DAY', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government', 'tech'], ['formal_register'], 'Nous devons sauvegarder les données.', 'We must safeguard the data.', 'To protect', 289),
  fr('amoindrir', 'to diminish', '/a.mwɛ̃.dʁiʁ/', 'ah-mwehn-DREER', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['formal_register'], 'Nous ne devons pas amoindrir leurs droits.', 'We must not diminish their rights.', 'To reduce', 290),
  fr('concomitant', 'concomitant', '/kɔ̃.kɔ.mi.tɑ̃/', 'kohn-koh-mee-TAHN', 'adjective', 'C2', 'hard', 'field-specific', ['healthcare', 'education'], ['academic', 'health'], 'Il y a des facteurs concomitants.', 'There are concomitant factors.', 'Accompanying', 291),
  fr('atermoyer', 'to procrastinate', '/a.tɛʁ.mwa.je/', 'ah-tehr-mwah-YAY', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'business'], ['formal_register'], 'Il ne faut pas atermoyer.', 'We must not procrastinate.', 'To delay or postpone', 292),
  fr('corroborer', 'to corroborate', '/kɔ.ʁɔ.bɔ.ʁe/', 'koh-roh-boh-RAY', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'education'], ['academic', 'legal'], 'Les preuves corroborent la théorie.', 'The evidence corroborates the theory.', 'To confirm', 293),
  fr('idiosyncrasie', 'idiosyncrasy', '/i.djɔ.sɛ̃.kʁa.zi/', 'ee-dee-oh-sehn-krah-ZEE', 'noun', 'C2', 'hard', 'universal', ['general', 'education'], ['culture', 'academic'], "L'idiosyncrasie de chaque peuple est unique.", 'Each people\'s idiosyncrasy is unique.', 'Distinctive character', 294),
  fr('résilience', 'resilience', '/ʁe.zi.ljɑ̃s/', 'ray-zee-lee-AHNS', 'noun', 'C2', 'hard', 'universal', ['general', 'healthcare'], ['academic', 'health'], 'La résilience est une qualité essentielle.', 'Resilience is an essential quality.', 'Ability to recover', 295),
  fr('subsidiaire', 'subsidiary/secondary', '/syb.si.djɛʁ/', 'soob-see-dee-EHR', 'adjective', 'C2', 'hard', 'field-specific', ['legal', 'business'], ['legal', 'formal_register'], "C'est une question subsidiaire.", 'It is a subsidiary question.', 'Secondary importance', 296),
  fr('prépondérant', 'predominant', '/pʁe.pɔ̃.de.ʁɑ̃/', 'pray-pohn-day-RAHN', 'adjective', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['formal_register'], 'Son rôle est prépondérant.', 'His role is predominant.', 'Having greater weight', 297),
  fr('pérenne', 'perennial/lasting', '/pe.ʁɛn/', 'pay-REHN', 'adjective', 'C2', 'hard', 'universal', ['general', 'business'], ['literary'], 'Nous cherchons une solution pérenne.', 'We seek a lasting solution.', 'Enduring', 298),
  fr('afférent', 'pertaining to', '/a.fe.ʁɑ̃/', 'ah-fay-RAHN', 'adjective', 'C2', 'hard', 'field-specific', ['legal', 'healthcare'], ['formal_register', 'academic'], 'Les documents afférents au dossier.', 'The documents pertaining to the case.', 'Related to', 299),
  fr('obvier', 'to obviate', '/ɔb.vje/', 'ob-vee-AY', 'verb', 'C2', 'hard', 'field-specific', ['legal', 'government'], ['formal_register'], 'Il faut obvier à ce risque.', 'We must obviate this risk.', 'To prevent or avoid', 300),
];

// ============================================================================
// SCENARIO SEED DATA
// ============================================================================

export const VOX_SCENARIO_SEED: VoxScenarioSeed[] = [
  // ── BUSINESS (6 scenarios) ──────────────────────────────────────────────
  {
    slug: 'pitching_ideas',
    title: 'Pitching Ideas',
    description: 'Present proposals to stakeholders with clarity and persuasion.',
    profession_tags: ['business'],
    context_type: 'business',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Me gustaría presentar una propuesta', translation: 'I would like to present a proposal', language_pair: 'en-es', when_to_use: 'Opening a pitch' },
      { phrase: 'El retorno de inversión sería...', translation: 'The return on investment would be...', language_pair: 'en-es', when_to_use: 'Discussing ROI' },
      { phrase: 'Je voudrais vous présenter un projet', translation: 'I would like to present a project to you', language_pair: 'en-fr', when_to_use: 'Opening a pitch' },
    ],
    ai_persona: { role: 'Senior VP of Operations', personality: 'Skeptical but fair, asks probing questions', background: '15 years in the industry, values data-driven arguments', speaking_style: 'Direct and professional, expects concise answers' },
    objectives: ['Present a business idea clearly', 'Handle objections professionally', 'Use persuasive language and data'],
    estimated_minutes: 15,
    difficulty_weight: 1.2,
  },
  {
    slug: 'negotiating_deals',
    title: 'Negotiating Deals',
    description: 'Close deals and reach agreements in a second language.',
    profession_tags: ['business'],
    context_type: 'business',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Podemos llegar a un acuerdo', translation: 'We can reach an agreement', language_pair: 'en-es', when_to_use: 'Proposing compromise' },
      { phrase: 'Nuestra mejor oferta es...', translation: 'Our best offer is...', language_pair: 'en-es', when_to_use: 'Making a final offer' },
      { phrase: 'Nous pouvons trouver un terrain d\'entente', translation: 'We can find common ground', language_pair: 'en-fr', when_to_use: 'Seeking compromise' },
    ],
    ai_persona: { role: 'Procurement Director', personality: 'Tough but reasonable negotiator', background: 'Manages supplier contracts for a multinational', speaking_style: 'Formal, uses conditional tense frequently' },
    objectives: ['Negotiate terms and conditions', 'Use conditional and subjunctive moods', 'Close a deal with mutual agreement'],
    estimated_minutes: 20,
    difficulty_weight: 1.5,
  },
  {
    slug: 'leading_meetings',
    title: 'Leading Meetings',
    description: 'Run meetings with confidence in a multilingual setting.',
    profession_tags: ['business'],
    context_type: 'business',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Comencemos con el primer punto de la agenda', translation: 'Let\'s start with the first item on the agenda', language_pair: 'en-es', when_to_use: 'Opening a meeting' },
      { phrase: 'Passons au point suivant', translation: 'Let\'s move to the next point', language_pair: 'en-fr', when_to_use: 'Transitioning topics' },
    ],
    ai_persona: { role: 'Team member', personality: 'Engaged, asks clarifying questions', background: 'Mid-level manager attending cross-department meetings', speaking_style: 'Professional but relaxed' },
    objectives: ['Set and follow an agenda', 'Facilitate discussion and manage time', 'Summarize action items'],
    estimated_minutes: 15,
    difficulty_weight: 1.1,
  },
  {
    slug: 'networking',
    title: 'Networking Events',
    description: 'Build professional relationships at industry events.',
    profession_tags: ['business'],
    context_type: 'social',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿A qué se dedica usted?', translation: 'What do you do for a living?', language_pair: 'en-es', when_to_use: 'Starting a conversation' },
      { phrase: 'Dans quel domaine travaillez-vous?', translation: 'What field do you work in?', language_pair: 'en-fr', when_to_use: 'Starting a conversation' },
    ],
    ai_persona: { role: 'Fellow attendee', personality: 'Friendly, open to new connections', background: 'Works in a related industry, looking for partnerships', speaking_style: 'Semi-formal, friendly' },
    objectives: ['Introduce yourself professionally', 'Ask about others\' work', 'Exchange contact information'],
    estimated_minutes: 10,
    difficulty_weight: 0.9,
  },
  {
    slug: 'client_calls',
    title: 'Client Calls',
    description: 'Handle calls with international clients professionally.',
    profession_tags: ['business'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Le llamo para dar seguimiento a...', translation: 'I\'m calling to follow up on...', language_pair: 'en-es', when_to_use: 'Opening a follow-up call' },
      { phrase: 'Je vous appelle au sujet de...', translation: 'I\'m calling about...', language_pair: 'en-fr', when_to_use: 'Opening a call' },
    ],
    ai_persona: { role: 'International client', personality: 'Professional, somewhat impatient', background: 'CEO of a mid-size company, tight schedule', speaking_style: 'Formal, expects efficiency' },
    objectives: ['Handle phone etiquette', 'Discuss project status', 'Schedule next steps'],
    estimated_minutes: 10,
    difficulty_weight: 1.1,
  },
  {
    slug: 'email_writing',
    title: 'Professional Emails',
    description: 'Write clear business communication in the target language.',
    profession_tags: ['business'],
    context_type: 'professional',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Estimado/a señor/a', translation: 'Dear Sir/Madam', language_pair: 'en-es', when_to_use: 'Formal email greeting' },
      { phrase: 'Veuillez agréer mes salutations distinguées', translation: 'Please accept my distinguished greetings', language_pair: 'en-fr', when_to_use: 'Formal email closing' },
    ],
    ai_persona: null,
    objectives: ['Write formal and semi-formal emails', 'Use appropriate register', 'Structure requests and follow-ups'],
    estimated_minutes: 10,
    difficulty_weight: 0.8,
  },

  // ── TECH (6 scenarios) ──────────────────────────────────────────────────
  {
    slug: 'code_reviews',
    title: 'Code Reviews',
    description: 'Discuss technical decisions with international teams.',
    profession_tags: ['tech'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Sugiero refactorizar este método', translation: 'I suggest refactoring this method', language_pair: 'en-es', when_to_use: 'Suggesting improvements' },
      { phrase: 'Je pense qu\'on devrait optimiser cette fonction', translation: 'I think we should optimize this function', language_pair: 'en-fr', when_to_use: 'Suggesting improvements' },
    ],
    ai_persona: { role: 'Senior developer', personality: 'Thorough, values clean code', background: '10 years of full-stack experience', speaking_style: 'Technical but approachable' },
    objectives: ['Explain code decisions', 'Give constructive feedback', 'Use technical vocabulary accurately'],
    estimated_minutes: 15,
    difficulty_weight: 1.2,
  },
  {
    slug: 'standups',
    title: 'Daily Standups',
    description: 'Share progress and blockers in short team syncs.',
    profession_tags: ['tech'],
    context_type: 'professional',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Ayer terminé la tarea de...', translation: 'Yesterday I finished the task of...', language_pair: 'en-es', when_to_use: 'Reporting progress' },
      { phrase: 'Estoy bloqueado por...', translation: 'I\'m blocked by...', language_pair: 'en-es', when_to_use: 'Reporting blockers' },
      { phrase: 'Aujourd\'hui je vais travailler sur...', translation: 'Today I will work on...', language_pair: 'en-fr', when_to_use: 'Sharing plans' },
    ],
    ai_persona: { role: 'Scrum master', personality: 'Organized, keeps things moving', background: 'Manages a distributed team across 3 time zones', speaking_style: 'Concise, asks follow-up questions' },
    objectives: ['Report yesterday\'s work', 'Share today\'s plan', 'Communicate blockers clearly'],
    estimated_minutes: 5,
    difficulty_weight: 0.7,
  },
  {
    slug: 'tech_presentations',
    title: 'Tech Presentations',
    description: 'Present technical topics clearly to mixed audiences.',
    profession_tags: ['tech'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Esta arquitectura nos permite escalar', translation: 'This architecture allows us to scale', language_pair: 'en-es', when_to_use: 'Explaining technical benefits' },
      { phrase: 'Cette solution résout le problème de...', translation: 'This solution solves the problem of...', language_pair: 'en-fr', when_to_use: 'Explaining a solution' },
    ],
    ai_persona: { role: 'CTO', personality: 'Strategic thinker, asks about trade-offs', background: 'Technical leader evaluating proposals', speaking_style: 'High-level, focused on business impact' },
    objectives: ['Explain technical concepts to non-technical people', 'Handle Q&A', 'Use visual aids vocabulary'],
    estimated_minutes: 20,
    difficulty_weight: 1.4,
  },
  {
    slug: 'interviews',
    title: 'Tech Interviews',
    description: 'Ace technical interviews in a second language.',
    profession_tags: ['tech'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Mi experiencia incluye...', translation: 'My experience includes...', language_pair: 'en-es', when_to_use: 'Describing background' },
      { phrase: 'J\'ai travaillé sur des projets de...', translation: 'I have worked on projects of...', language_pair: 'en-fr', when_to_use: 'Describing experience' },
    ],
    ai_persona: { role: 'Hiring manager', personality: 'Evaluative, friendly', background: 'Engineering director hiring for a growing team', speaking_style: 'Professional, mixes behavioral and technical questions' },
    objectives: ['Describe your experience', 'Explain technical decisions', 'Ask smart questions about the role'],
    estimated_minutes: 20,
    difficulty_weight: 1.3,
  },
  {
    slug: 'client_demos',
    title: 'Client Demos',
    description: 'Demo products to international stakeholders.',
    profession_tags: ['tech'],
    context_type: 'business',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Permítame mostrarle cómo funciona', translation: 'Allow me to show you how it works', language_pair: 'en-es', when_to_use: 'Starting a demo' },
      { phrase: 'Laissez-moi vous montrer cette fonctionnalité', translation: 'Let me show you this feature', language_pair: 'en-fr', when_to_use: 'Highlighting a feature' },
    ],
    ai_persona: { role: 'Potential client', personality: 'Curious, detail-oriented', background: 'IT director evaluating solutions', speaking_style: 'Asks specific questions about implementation' },
    objectives: ['Walk through product features', 'Handle questions and objections', 'Link features to business needs'],
    estimated_minutes: 15,
    difficulty_weight: 1.2,
  },
  {
    slug: 'documentation',
    title: 'Documentation',
    description: 'Write clear technical documentation.',
    profession_tags: ['tech'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Este endpoint devuelve...', translation: 'This endpoint returns...', language_pair: 'en-es', when_to_use: 'Documenting APIs' },
      { phrase: 'Ce module gère...', translation: 'This module handles...', language_pair: 'en-fr', when_to_use: 'Describing components' },
    ],
    ai_persona: null,
    objectives: ['Write clear API documentation', 'Describe system architecture', 'Use precise technical language'],
    estimated_minutes: 10,
    difficulty_weight: 0.9,
  },

  // ── HEALTHCARE (6 scenarios) ────────────────────────────────────────────
  {
    slug: 'patient_consultations',
    title: 'Patient Consultations',
    description: 'Communicate diagnoses clearly and empathetically.',
    profession_tags: ['healthcare'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Dónde le duele?', translation: 'Where does it hurt?', language_pair: 'en-es', when_to_use: 'Asking about symptoms' },
      { phrase: 'Les résultats montrent que...', translation: 'The results show that...', language_pair: 'en-fr', when_to_use: 'Sharing test results' },
    ],
    ai_persona: { role: 'Patient', personality: 'Anxious, needs reassurance', background: 'Non-native speaker with limited medical vocabulary', speaking_style: 'Simple language, may struggle to describe symptoms precisely' },
    objectives: ['Ask about symptoms clearly', 'Explain diagnosis in simple terms', 'Show empathy and reassurance'],
    estimated_minutes: 15,
    difficulty_weight: 1.3,
  },
  {
    slug: 'medical_history',
    title: 'Taking Medical History',
    description: 'Gather comprehensive patient information.',
    profession_tags: ['healthcare'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Tiene alergias a algún medicamento?', translation: 'Are you allergic to any medication?', language_pair: 'en-es', when_to_use: 'Checking allergies' },
      { phrase: 'Avez-vous des antécédents familiaux de...?', translation: 'Do you have a family history of...?', language_pair: 'en-fr', when_to_use: 'Asking about family history' },
    ],
    ai_persona: { role: 'Patient', personality: 'Cooperative, provides detailed answers', background: 'First visit to this clinic', speaking_style: 'Conversational, uses colloquial terms for medical conditions' },
    objectives: ['Gather complete medical history', 'Ask about allergies and medications', 'Use medical terminology appropriately'],
    estimated_minutes: 15,
    difficulty_weight: 1.1,
  },
  {
    slug: 'colleague_handoffs',
    title: 'Colleague Handoffs',
    description: 'Transfer patient care effectively between shifts.',
    profession_tags: ['healthcare'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'El paciente presenta...', translation: 'The patient presents with...', language_pair: 'en-es', when_to_use: 'Describing patient condition' },
      { phrase: 'Le traitement en cours est...', translation: 'The current treatment is...', language_pair: 'en-fr', when_to_use: 'Describing treatment' },
    ],
    ai_persona: { role: 'Colleague nurse/doctor', personality: 'Efficient, detail-oriented', background: 'Incoming shift needing complete handoff', speaking_style: 'Medical shorthand, fast-paced' },
    objectives: ['Summarize patient status', 'Communicate treatment plans', 'Flag urgent concerns'],
    estimated_minutes: 10,
    difficulty_weight: 1.3,
  },
  {
    slug: 'medical_conferences',
    title: 'Medical Conferences',
    description: 'Present research findings to medical peers.',
    profession_tags: ['healthcare'],
    context_type: 'professional',
    cefr_levels: ['C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Nuestro estudio demuestra que...', translation: 'Our study demonstrates that...', language_pair: 'en-es', when_to_use: 'Presenting findings' },
      { phrase: 'Les données suggèrent une corrélation entre...', translation: 'The data suggest a correlation between...', language_pair: 'en-fr', when_to_use: 'Discussing results' },
    ],
    ai_persona: { role: 'Fellow researcher', personality: 'Inquisitive, challenges methodology', background: 'Expert in a related field', speaking_style: 'Academic, uses precise terminology' },
    objectives: ['Present research methodology', 'Discuss results with nuance', 'Handle critical questions'],
    estimated_minutes: 20,
    difficulty_weight: 1.6,
  },
  {
    slug: 'emergency_communication',
    title: 'Emergency Situations',
    description: 'Communicate under pressure in medical emergencies.',
    profession_tags: ['healthcare'],
    context_type: 'emergency',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¡Necesitamos ayuda inmediata!', translation: 'We need immediate help!', language_pair: 'en-es', when_to_use: 'Calling for help' },
      { phrase: 'Appelez une ambulance!', translation: 'Call an ambulance!', language_pair: 'en-fr', when_to_use: 'Requesting emergency services' },
    ],
    ai_persona: { role: 'First responder', personality: 'Calm under pressure, directive', background: 'Paramedic arriving at the scene', speaking_style: 'Short commands, urgent tone' },
    objectives: ['Use emergency vocabulary', 'Give and follow urgent instructions', 'Communicate patient status rapidly'],
    estimated_minutes: 10,
    difficulty_weight: 1.4,
  },
  {
    slug: 'patient_education',
    title: 'Patient Education',
    description: 'Explain treatments and care instructions simply.',
    profession_tags: ['healthcare'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Tome este medicamento dos veces al día', translation: 'Take this medication twice a day', language_pair: 'en-es', when_to_use: 'Giving medication instructions' },
      { phrase: 'Il est important de suivre ces instructions', translation: 'It is important to follow these instructions', language_pair: 'en-fr', when_to_use: 'Emphasizing compliance' },
    ],
    ai_persona: { role: 'Patient', personality: 'Confused, asks many questions', background: 'Elderly patient managing a chronic condition', speaking_style: 'Simple vocabulary, needs repetition' },
    objectives: ['Explain medical instructions clearly', 'Check patient understanding', 'Use simple language for complex concepts'],
    estimated_minutes: 10,
    difficulty_weight: 1.0,
  },

  // ── LEGAL (6 scenarios) ─────────────────────────────────────────────────
  {
    slug: 'client_intake',
    title: 'Client Intake',
    description: 'Gather case details from clients in their language.',
    profession_tags: ['legal'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Cuénteme los hechos del caso', translation: 'Tell me the facts of the case', language_pair: 'en-es', when_to_use: 'Opening intake' },
      { phrase: 'Pouvez-vous me décrire la situation?', translation: 'Can you describe the situation to me?', language_pair: 'en-fr', when_to_use: 'Gathering information' },
    ],
    ai_persona: { role: 'Client', personality: 'Stressed, sometimes vague', background: 'Facing a legal issue for the first time', speaking_style: 'Emotional, mixes chronological order' },
    objectives: ['Gather case facts systematically', 'Ask clarifying questions', 'Use appropriate legal terminology'],
    estimated_minutes: 15,
    difficulty_weight: 1.2,
  },
  {
    slug: 'courtroom',
    title: 'Courtroom Language',
    description: 'Argue cases with precision in formal proceedings.',
    profession_tags: ['legal'],
    context_type: 'professional',
    cefr_levels: ['C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Con el debido respeto, su señoría', translation: 'With all due respect, Your Honor', language_pair: 'en-es', when_to_use: 'Addressing the judge' },
      { phrase: 'La défense fait valoir que...', translation: 'The defense argues that...', language_pair: 'en-fr', when_to_use: 'Presenting argument' },
    ],
    ai_persona: { role: 'Opposing counsel', personality: 'Sharp, challenges every point', background: 'Experienced litigator', speaking_style: 'Formal, uses legal register exclusively' },
    objectives: ['Use formal courtroom language', 'Present arguments logically', 'Object and respond to objections'],
    estimated_minutes: 20,
    difficulty_weight: 1.8,
  },
  {
    slug: 'contract_review',
    title: 'Contract Discussion',
    description: 'Negotiate contract terms with precision.',
    profession_tags: ['legal', 'business'],
    context_type: 'business',
    cefr_levels: ['B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Esta cláusula establece que...', translation: 'This clause states that...', language_pair: 'en-es', when_to_use: 'Reviewing clauses' },
      { phrase: 'Les termes de cet accord prévoient...', translation: 'The terms of this agreement provide for...', language_pair: 'en-fr', when_to_use: 'Explaining contract terms' },
    ],
    ai_persona: { role: 'Client\'s counsel', personality: 'Cautious, protective of client interests', background: 'Corporate attorney reviewing a partnership agreement', speaking_style: 'Formal, precise, references specific articles' },
    objectives: ['Review and discuss contract clauses', 'Propose amendments', 'Use legal terminology accurately'],
    estimated_minutes: 15,
    difficulty_weight: 1.5,
  },
  {
    slug: 'depositions',
    title: 'Depositions',
    description: 'Conduct formal questioning under oath.',
    profession_tags: ['legal'],
    context_type: 'professional',
    cefr_levels: ['C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Puede describir lo que vio ese día?', translation: 'Can you describe what you saw that day?', language_pair: 'en-es', when_to_use: 'Questioning a witness' },
      { phrase: 'Pour le compte rendu, veuillez préciser...', translation: 'For the record, please clarify...', language_pair: 'en-fr', when_to_use: 'Requesting clarification' },
    ],
    ai_persona: { role: 'Witness', personality: 'Nervous, sometimes evasive', background: 'Key witness in a civil dispute', speaking_style: 'Hesitant, provides fragmented answers' },
    objectives: ['Ask precise questions', 'Follow up on inconsistencies', 'Maintain professional tone under pressure'],
    estimated_minutes: 20,
    difficulty_weight: 1.7,
  },
  {
    slug: 'legal_writing',
    title: 'Legal Writing',
    description: 'Draft legal documents in the target language.',
    profession_tags: ['legal'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Por la presente se notifica que...', translation: 'Notice is hereby given that...', language_pair: 'en-es', when_to_use: 'Formal notifications' },
      { phrase: 'En vertu de l\'article...', translation: 'By virtue of article...', language_pair: 'en-fr', when_to_use: 'Referencing law' },
    ],
    ai_persona: null,
    objectives: ['Draft legal documents', 'Use formal legal register', 'Structure arguments in writing'],
    estimated_minutes: 15,
    difficulty_weight: 1.5,
  },
  {
    slug: 'mediation',
    title: 'Mediation',
    description: 'Facilitate dispute resolution between parties.',
    profession_tags: ['legal'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Ambas partes necesitan ceder un poco', translation: 'Both parties need to compromise a little', language_pair: 'en-es', when_to_use: 'Encouraging compromise' },
      { phrase: 'Essayons de trouver une solution acceptable pour tous', translation: 'Let\'s try to find a solution acceptable to all', language_pair: 'en-fr', when_to_use: 'Seeking resolution' },
    ],
    ai_persona: { role: 'Disputing party', personality: 'Frustrated but willing to negotiate', background: 'Business owner in a contract dispute', speaking_style: 'Emotional at times, needs to be redirected' },
    objectives: ['Facilitate dialogue between parties', 'Use neutral, diplomatic language', 'Guide toward compromise'],
    estimated_minutes: 20,
    difficulty_weight: 1.4,
  },

  // ── EDUCATION (6 scenarios) ─────────────────────────────────────────────
  {
    slug: 'lecturing',
    title: 'Giving Lectures',
    description: 'Teach with clarity and engagement in a second language.',
    profession_tags: ['education'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Como vimos en la clase anterior...', translation: 'As we saw in the previous class...', language_pair: 'en-es', when_to_use: 'Connecting to prior material' },
      { phrase: 'Est-ce que tout le monde a compris?', translation: 'Did everyone understand?', language_pair: 'en-fr', when_to_use: 'Checking comprehension' },
    ],
    ai_persona: { role: 'Student', personality: 'Engaged, asks challenging questions', background: 'Undergraduate student passionate about the subject', speaking_style: 'Curious, sometimes tangential' },
    objectives: ['Explain concepts clearly', 'Engage students with questions', 'Manage classroom discussion'],
    estimated_minutes: 20,
    difficulty_weight: 1.3,
  },
  {
    slug: 'student_feedback',
    title: 'Student Feedback',
    description: 'Give constructive feedback on student work.',
    profession_tags: ['education'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Tu trabajo muestra mejora en...', translation: 'Your work shows improvement in...', language_pair: 'en-es', when_to_use: 'Giving positive feedback' },
      { phrase: 'Je te suggère de revoir la partie sur...', translation: 'I suggest you review the part about...', language_pair: 'en-fr', when_to_use: 'Suggesting improvements' },
    ],
    ai_persona: { role: 'Student', personality: 'Receptive but sensitive', background: 'Graduate student revising their thesis', speaking_style: 'Formal with their professor' },
    objectives: ['Give balanced feedback', 'Suggest specific improvements', 'Encourage continued effort'],
    estimated_minutes: 10,
    difficulty_weight: 1.0,
  },
  {
    slug: 'academic_writing',
    title: 'Academic Writing',
    description: 'Write papers and proposals in the target language.',
    profession_tags: ['education'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Esta investigación tiene como objetivo...', translation: 'This research aims to...', language_pair: 'en-es', when_to_use: 'Stating research purpose' },
      { phrase: 'Les résultats corroborent l\'hypothèse selon laquelle...', translation: 'The results corroborate the hypothesis that...', language_pair: 'en-fr', when_to_use: 'Discussing findings' },
    ],
    ai_persona: null,
    objectives: ['Write academic introductions', 'Present methodology', 'Discuss results using hedging language'],
    estimated_minutes: 15,
    difficulty_weight: 1.4,
  },
  {
    slug: 'conference_talks',
    title: 'Conference Talks',
    description: 'Present at academic events and conferences.',
    profession_tags: ['education'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Los hallazgos principales de nuestra investigación son...', translation: 'The main findings of our research are...', language_pair: 'en-es', when_to_use: 'Presenting key findings' },
      { phrase: 'Je voudrais attirer votre attention sur...', translation: 'I would like to draw your attention to...', language_pair: 'en-fr', when_to_use: 'Highlighting important points' },
    ],
    ai_persona: { role: 'Conference attendee', personality: 'Expert in the field, asks probing questions', background: 'Professor at a competing university', speaking_style: 'Academic, formal' },
    objectives: ['Present research concisely', 'Use appropriate academic register', 'Handle critical Q&A'],
    estimated_minutes: 20,
    difficulty_weight: 1.5,
  },
  {
    slug: 'parent_meetings',
    title: 'Parent Meetings',
    description: 'Discuss student progress with parents.',
    profession_tags: ['education'],
    context_type: 'social',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Su hijo/a ha mejorado mucho en...', translation: 'Your child has improved a lot in...', language_pair: 'en-es', when_to_use: 'Sharing positive progress' },
      { phrase: 'Nous devrions travailler ensemble pour aider...', translation: 'We should work together to help...', language_pair: 'en-fr', when_to_use: 'Collaborating on solutions' },
    ],
    ai_persona: { role: 'Parent', personality: 'Concerned, protective', background: 'Parent of a struggling student', speaking_style: 'Emotional, asks for specifics' },
    objectives: ['Share student progress diplomatically', 'Discuss concerns sensitively', 'Propose action plans'],
    estimated_minutes: 15,
    difficulty_weight: 1.0,
  },
  {
    slug: 'collaboration',
    title: 'Research Collaboration',
    description: 'Work with international research teams.',
    profession_tags: ['education'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Propongo que dividamos el trabajo de la siguiente manera', translation: 'I propose we divide the work as follows', language_pair: 'en-es', when_to_use: 'Organizing collaboration' },
      { phrase: 'Quel est l\'état d\'avancement de votre partie?', translation: 'What is the progress status of your part?', language_pair: 'en-fr', when_to_use: 'Checking team progress' },
    ],
    ai_persona: { role: 'Research partner', personality: 'Collaborative, sometimes disorganized', background: 'Professor at a partner university in another country', speaking_style: 'Informal among peers, switches topics frequently' },
    objectives: ['Coordinate research tasks', 'Discuss methodology', 'Manage timelines across teams'],
    estimated_minutes: 15,
    difficulty_weight: 1.2,
  },

  // ── CREATIVE (6 scenarios) ──────────────────────────────────────────────
  {
    slug: 'client_briefs',
    title: 'Client Briefs',
    description: 'Understand and discuss creative direction with clients.',
    profession_tags: ['creative'],
    context_type: 'business',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Cuál es la visión para este proyecto?', translation: 'What is the vision for this project?', language_pair: 'en-es', when_to_use: 'Understanding client needs' },
      { phrase: 'Quel est le public cible?', translation: 'What is the target audience?', language_pair: 'en-fr', when_to_use: 'Defining audience' },
    ],
    ai_persona: { role: 'Creative director at client company', personality: 'Has strong opinions, open to new ideas', background: 'Rebranding a major product line', speaking_style: 'Passionate about aesthetics, uses visual language' },
    objectives: ['Understand creative requirements', 'Ask clarifying questions', 'Confirm deliverables'],
    estimated_minutes: 15,
    difficulty_weight: 1.1,
  },
  {
    slug: 'pitch_presentations',
    title: 'Creative Pitches',
    description: 'Sell your creative vision to clients.',
    profession_tags: ['creative'],
    context_type: 'business',
    cefr_levels: ['B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Nuestra propuesta creativa se basa en...', translation: 'Our creative proposal is based on...', language_pair: 'en-es', when_to_use: 'Presenting concept' },
      { phrase: 'L\'idée directrice est de...', translation: 'The guiding idea is to...', language_pair: 'en-fr', when_to_use: 'Explaining creative direction' },
    ],
    ai_persona: { role: 'Client panel', personality: 'Evaluative, comparing multiple agencies', background: 'Marketing team selecting a creative partner', speaking_style: 'Formal, budget-conscious' },
    objectives: ['Present creative concepts persuasively', 'Justify creative decisions', 'Handle creative criticism'],
    estimated_minutes: 20,
    difficulty_weight: 1.3,
  },
  {
    slug: 'feedback_sessions',
    title: 'Feedback Sessions',
    description: 'Give and receive creative critique.',
    profession_tags: ['creative'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Me gusta la dirección, pero sugiero...', translation: 'I like the direction, but I suggest...', language_pair: 'en-es', when_to_use: 'Giving constructive feedback' },
      { phrase: 'Ce qui fonctionne bien, c\'est...', translation: 'What works well is...', language_pair: 'en-fr', when_to_use: 'Positive feedback' },
    ],
    ai_persona: { role: 'Creative peer', personality: 'Honest, supportive', background: 'Senior designer reviewing junior work', speaking_style: 'Uses creative industry jargon' },
    objectives: ['Give constructive creative feedback', 'Receive criticism gracefully', 'Propose alternatives'],
    estimated_minutes: 10,
    difficulty_weight: 1.0,
  },
  {
    slug: 'content_creation',
    title: 'Content Creation',
    description: 'Create multilingual content for digital platforms.',
    profession_tags: ['creative'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'El tono de la marca debe ser...', translation: 'The brand tone should be...', language_pair: 'en-es', when_to_use: 'Discussing brand voice' },
      { phrase: 'Le contenu doit être adapté pour...', translation: 'The content must be adapted for...', language_pair: 'en-fr', when_to_use: 'Discussing localization' },
    ],
    ai_persona: null,
    objectives: ['Write brand-consistent content', 'Adapt content for different markets', 'Use culturally appropriate language'],
    estimated_minutes: 10,
    difficulty_weight: 1.0,
  },
  {
    slug: 'interviews_media',
    title: 'Media Interviews',
    description: 'Handle press and media interviews confidently.',
    profession_tags: ['creative'],
    context_type: 'social',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Lo que me inspiró fue...', translation: 'What inspired me was...', language_pair: 'en-es', when_to_use: 'Discussing inspiration' },
      { phrase: 'Mon travail explore les thèmes de...', translation: 'My work explores the themes of...', language_pair: 'en-fr', when_to_use: 'Describing creative work' },
    ],
    ai_persona: { role: 'Journalist', personality: 'Curious, sometimes provocative', background: 'Arts and culture reporter', speaking_style: 'Conversational but probing' },
    objectives: ['Articulate creative vision', 'Handle unexpected questions', 'Stay on message'],
    estimated_minutes: 15,
    difficulty_weight: 1.3,
  },
  {
    slug: 'collaboration_creative',
    title: 'Creative Collaboration',
    description: 'Work with international creatives on projects.',
    profession_tags: ['creative'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Qué opinas de esta dirección visual?', translation: 'What do you think of this visual direction?', language_pair: 'en-es', when_to_use: 'Seeking creative input' },
      { phrase: 'Travaillons ensemble sur le concept', translation: 'Let\'s work together on the concept', language_pair: 'en-fr', when_to_use: 'Initiating collaboration' },
    ],
    ai_persona: { role: 'International collaborator', personality: 'Creative, brings different cultural perspective', background: 'Freelance designer from another country', speaking_style: 'Informal, uses visual references' },
    objectives: ['Share creative ideas across cultures', 'Negotiate creative decisions', 'Manage remote collaboration'],
    estimated_minutes: 15,
    difficulty_weight: 1.1,
  },

  // ── HOSPITALITY (6 scenarios) ───────────────────────────────────────────
  {
    slug: 'guest_reception',
    title: 'Guest Reception',
    description: 'Welcome and assist guests professionally.',
    profession_tags: ['hospitality'],
    context_type: 'professional',
    cefr_levels: ['A1', 'A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Bienvenido, ¿tiene reservación?', translation: 'Welcome, do you have a reservation?', language_pair: 'en-es', when_to_use: 'Greeting guests' },
      { phrase: 'Bienvenue, votre chambre est prête', translation: 'Welcome, your room is ready', language_pair: 'en-fr', when_to_use: 'Check-in' },
    ],
    ai_persona: { role: 'Hotel guest', personality: 'Tired from travel, expects efficiency', background: 'Business traveler arriving late', speaking_style: 'Direct, wants quick service' },
    objectives: ['Welcome guests warmly', 'Process check-in/check-out', 'Handle special requests'],
    estimated_minutes: 10,
    difficulty_weight: 0.6,
  },
  {
    slug: 'complaint_handling',
    title: 'Complaint Handling',
    description: 'Resolve guest issues with empathy and professionalism.',
    profession_tags: ['hospitality'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Lamento mucho la inconveniencia', translation: 'I\'m very sorry for the inconvenience', language_pair: 'en-es', when_to_use: 'Acknowledging a complaint' },
      { phrase: 'Nous allons résoudre ce problème immédiatement', translation: 'We will resolve this problem immediately', language_pair: 'en-fr', when_to_use: 'Promising resolution' },
    ],
    ai_persona: { role: 'Unhappy guest', personality: 'Frustrated, escalating', background: 'Found issues with their room', speaking_style: 'Emotional, may raise voice' },
    objectives: ['Acknowledge the problem', 'Offer solutions', 'De-escalate tension'],
    estimated_minutes: 10,
    difficulty_weight: 1.1,
  },
  {
    slug: 'tour_guiding',
    title: 'Tour Guiding',
    description: 'Lead tours in another language with engaging commentary.',
    profession_tags: ['hospitality'],
    context_type: 'social',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'A su izquierda pueden ver...', translation: 'On your left you can see...', language_pair: 'en-es', when_to_use: 'Pointing out landmarks' },
      { phrase: 'Ce bâtiment date du XVIIIe siècle', translation: 'This building dates from the 18th century', language_pair: 'en-fr', when_to_use: 'Providing historical context' },
    ],
    ai_persona: { role: 'Tourist', personality: 'Curious, asks many questions', background: 'First-time visitor from abroad', speaking_style: 'Enthusiastic, takes photos constantly' },
    objectives: ['Describe landmarks engagingly', 'Answer tourist questions', 'Share cultural context'],
    estimated_minutes: 15,
    difficulty_weight: 1.0,
  },
  {
    slug: 'restaurant_service',
    title: 'Restaurant Service',
    description: 'Explain menus and provide excellent service.',
    profession_tags: ['hospitality'],
    context_type: 'daily_life',
    cefr_levels: ['A1', 'A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Le recomiendo el plato del día', translation: 'I recommend the dish of the day', language_pair: 'en-es', when_to_use: 'Making recommendations' },
      { phrase: 'Avez-vous des allergies alimentaires?', translation: 'Do you have any food allergies?', language_pair: 'en-fr', when_to_use: 'Checking dietary needs' },
    ],
    ai_persona: { role: 'Restaurant guest', personality: 'Indecisive, asks for recommendations', background: 'Couple celebrating an anniversary', speaking_style: 'Conversational, appreciative' },
    objectives: ['Describe menu items', 'Handle dietary restrictions', 'Provide attentive service'],
    estimated_minutes: 10,
    difficulty_weight: 0.7,
  },
  {
    slug: 'event_coordination',
    title: 'Event Coordination',
    description: 'Organize multilingual events and conferences.',
    profession_tags: ['hospitality'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'El evento comenzará a las...', translation: 'The event will start at...', language_pair: 'en-es', when_to_use: 'Communicating schedules' },
      { phrase: 'Nous avons besoin de...pour la salle', translation: 'We need...for the room', language_pair: 'en-fr', when_to_use: 'Requesting equipment' },
    ],
    ai_persona: { role: 'Event planner', personality: 'Detail-oriented, perfectionist', background: 'Organizing a corporate retreat', speaking_style: 'Professional, uses checklists' },
    objectives: ['Coordinate event logistics', 'Communicate with vendors', 'Handle last-minute changes'],
    estimated_minutes: 15,
    difficulty_weight: 1.1,
  },
  {
    slug: 'travel_advice',
    title: 'Travel Advice',
    description: 'Give local recommendations to visitors.',
    profession_tags: ['hospitality'],
    context_type: 'travel',
    cefr_levels: ['A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Le recomiendo visitar...', translation: 'I recommend visiting...', language_pair: 'en-es', when_to_use: 'Suggesting attractions' },
      { phrase: 'Pour aller là-bas, prenez le métro ligne...', translation: 'To get there, take metro line...', language_pair: 'en-fr', when_to_use: 'Giving directions' },
    ],
    ai_persona: { role: 'Tourist', personality: 'Excited, open to suggestions', background: 'Has 3 days in the city', speaking_style: 'Informal, appreciative' },
    objectives: ['Recommend local attractions', 'Give clear directions', 'Share cultural tips'],
    estimated_minutes: 10,
    difficulty_weight: 0.7,
  },

  // ── GOVERNMENT (6 scenarios) ────────────────────────────────────────────
  {
    slug: 'diplomatic_meetings',
    title: 'Diplomatic Meetings',
    description: 'Conduct formal diplomatic discussions.',
    profession_tags: ['government'],
    context_type: 'professional',
    cefr_levels: ['C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Nuestro gobierno propone...', translation: 'Our government proposes...', language_pair: 'en-es', when_to_use: 'Making a diplomatic proposal' },
      { phrase: 'Nous souhaitons exprimer notre position sur...', translation: 'We wish to express our position on...', language_pair: 'en-fr', when_to_use: 'Stating official position' },
    ],
    ai_persona: { role: 'Foreign diplomat', personality: 'Measured, strategic', background: 'Ambassador from a neighboring country', speaking_style: 'Extremely formal, uses diplomatic hedging' },
    objectives: ['Use diplomatic register', 'Express positions with nuance', 'Negotiate international agreements'],
    estimated_minutes: 20,
    difficulty_weight: 1.8,
  },
  {
    slug: 'public_speaking',
    title: 'Public Speaking',
    description: 'Address diverse audiences with confidence.',
    profession_tags: ['government'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Estimados ciudadanos...', translation: 'Dear citizens...', language_pair: 'en-es', when_to_use: 'Opening a public address' },
      { phrase: 'Chers concitoyens, je m\'adresse à vous pour...', translation: 'Dear fellow citizens, I address you to...', language_pair: 'en-fr', when_to_use: 'Opening a public address' },
    ],
    ai_persona: { role: 'Audience member', personality: 'Critical, politically informed', background: 'Citizen attending a town hall', speaking_style: 'Direct questions, demands accountability' },
    objectives: ['Deliver speeches clearly', 'Engage diverse audiences', 'Handle public questions'],
    estimated_minutes: 20,
    difficulty_weight: 1.5,
  },
  {
    slug: 'policy_discussion',
    title: 'Policy Discussion',
    description: 'Debate policy in committees and working groups.',
    profession_tags: ['government'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Esta política beneficiaría a...', translation: 'This policy would benefit...', language_pair: 'en-es', when_to_use: 'Advocating for a policy' },
      { phrase: 'Les implications de cette mesure sont...', translation: 'The implications of this measure are...', language_pair: 'en-fr', when_to_use: 'Analyzing policy impact' },
    ],
    ai_persona: { role: 'Committee member', personality: 'Analytical, challenges proposals', background: 'Policy analyst with opposing viewpoint', speaking_style: 'Data-driven, references studies and precedents' },
    objectives: ['Debate policy proposals', 'Present evidence-based arguments', 'Find bipartisan solutions'],
    estimated_minutes: 20,
    difficulty_weight: 1.5,
  },
  {
    slug: 'constituent_services',
    title: 'Constituent Services',
    description: 'Help multilingual communities access services.',
    profession_tags: ['government'],
    context_type: 'social',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿En qué puedo ayudarle hoy?', translation: 'How can I help you today?', language_pair: 'en-es', when_to_use: 'Greeting constituents' },
      { phrase: 'Pour cette demande, vous aurez besoin de...', translation: 'For this request, you will need...', language_pair: 'en-fr', when_to_use: 'Explaining requirements' },
    ],
    ai_persona: { role: 'Constituent', personality: 'Confused by bureaucracy, needs guidance', background: 'Immigrant navigating government services for the first time', speaking_style: 'Simple language, may have limited vocabulary' },
    objectives: ['Explain government processes clearly', 'Help with forms and applications', 'Show patience and empathy'],
    estimated_minutes: 15,
    difficulty_weight: 0.9,
  },
  {
    slug: 'international_relations',
    title: 'International Relations',
    description: 'Cross-border communication and cooperation.',
    profession_tags: ['government'],
    context_type: 'professional',
    cefr_levels: ['C1', 'C2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'El acuerdo bilateral contempla...', translation: 'The bilateral agreement contemplates...', language_pair: 'en-es', when_to_use: 'Discussing agreements' },
      { phrase: 'La coopération entre nos deux pays...', translation: 'The cooperation between our two countries...', language_pair: 'en-fr', when_to_use: 'Discussing bilateral relations' },
    ],
    ai_persona: { role: 'Foreign ministry official', personality: 'Cautious, protocol-conscious', background: 'Senior diplomat specializing in bilateral relations', speaking_style: 'Extremely formal, precise language' },
    objectives: ['Discuss international agreements', 'Navigate cultural protocol', 'Use formal diplomatic language'],
    estimated_minutes: 20,
    difficulty_weight: 1.7,
  },
  {
    slug: 'report_writing',
    title: 'Report Writing',
    description: 'Write official government documents.',
    profession_tags: ['government'],
    context_type: 'professional',
    cefr_levels: ['B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'El presente informe tiene como objeto...', translation: 'The purpose of this report is...', language_pair: 'en-es', when_to_use: 'Opening a report' },
      { phrase: 'En conclusion, il est recommandé de...', translation: 'In conclusion, it is recommended to...', language_pair: 'en-fr', when_to_use: 'Closing with recommendations' },
    ],
    ai_persona: null,
    objectives: ['Structure official reports', 'Use formal government register', 'Present data and recommendations'],
    estimated_minutes: 15,
    difficulty_weight: 1.3,
  },

  // ── STUDENT (6 scenarios) ───────────────────────────────────────────────
  {
    slug: 'classroom_participation',
    title: 'Classroom Participation',
    description: 'Ask questions and join discussions in class.',
    profession_tags: ['student'],
    context_type: 'social',
    cefr_levels: ['A1', 'A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Podría repetir eso, por favor?', translation: 'Could you repeat that, please?', language_pair: 'en-es', when_to_use: 'Asking for clarification' },
      { phrase: 'Je ne comprends pas bien. Pouvez-vous expliquer?', translation: 'I don\'t understand well. Can you explain?', language_pair: 'en-fr', when_to_use: 'Asking for help' },
    ],
    ai_persona: { role: 'Professor', personality: 'Encouraging, patient', background: 'University lecturer who values participation', speaking_style: 'Clear, adjusts to student level' },
    objectives: ['Ask questions in class', 'Share opinions', 'Request clarification politely'],
    estimated_minutes: 10,
    difficulty_weight: 0.5,
  },
  {
    slug: 'study_groups',
    title: 'Study Groups',
    description: 'Collaborate with classmates on assignments.',
    profession_tags: ['student'],
    context_type: 'social',
    cefr_levels: ['A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Entendiste la tarea?', translation: 'Did you understand the assignment?', language_pair: 'en-es', when_to_use: 'Starting study session' },
      { phrase: 'On se partage le travail?', translation: 'Shall we split the work?', language_pair: 'en-fr', when_to_use: 'Organizing group work' },
    ],
    ai_persona: { role: 'Classmate', personality: 'Friendly, collaborative', background: 'Fellow international student', speaking_style: 'Informal, uses slang' },
    objectives: ['Collaborate on assignments', 'Explain concepts to peers', 'Divide work fairly'],
    estimated_minutes: 10,
    difficulty_weight: 0.6,
  },
  {
    slug: 'presentations',
    title: 'Class Presentations',
    description: 'Present projects and research in class.',
    profession_tags: ['student'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Mi presentación trata sobre...', translation: 'My presentation is about...', language_pair: 'en-es', when_to_use: 'Opening a presentation' },
      { phrase: 'Pour conclure, je dirais que...', translation: 'To conclude, I would say that...', language_pair: 'en-fr', when_to_use: 'Closing a presentation' },
    ],
    ai_persona: { role: 'Professor and classmates', personality: 'Attentive, will ask questions', background: 'Class of 25 students', speaking_style: 'Mixed — professor formal, students informal' },
    objectives: ['Structure a presentation', 'Present findings clearly', 'Handle audience questions'],
    estimated_minutes: 15,
    difficulty_weight: 1.0,
  },
  {
    slug: 'office_hours',
    title: 'Office Hours',
    description: 'Discuss coursework with professors.',
    profession_tags: ['student'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Tengo una duda sobre el examen', translation: 'I have a question about the exam', language_pair: 'en-es', when_to_use: 'Opening conversation' },
      { phrase: 'Pourriez-vous m\'expliquer ce concept?', translation: 'Could you explain this concept to me?', language_pair: 'en-fr', when_to_use: 'Requesting explanation' },
    ],
    ai_persona: { role: 'Professor', personality: 'Helpful but expects preparation', background: 'Subject matter expert who values student effort', speaking_style: 'Academic, uses field-specific terms' },
    objectives: ['Ask for help politely', 'Discuss academic concerns', 'Show preparation and effort'],
    estimated_minutes: 10,
    difficulty_weight: 0.8,
  },
  {
    slug: 'social_campus',
    title: 'Campus Social Life',
    description: 'Make friends and socialize at university.',
    profession_tags: ['student'],
    context_type: 'social',
    cefr_levels: ['A1', 'A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿De dónde eres?', translation: 'Where are you from?', language_pair: 'en-es', when_to_use: 'Meeting new people' },
      { phrase: 'Tu veux aller prendre un café?', translation: 'Want to go get a coffee?', language_pair: 'en-fr', when_to_use: 'Inviting someone out' },
    ],
    ai_persona: { role: 'Fellow student', personality: 'Outgoing, looking to make friends', background: 'Exchange student from the target language country', speaking_style: 'Very informal, uses slang and abbreviations' },
    objectives: ['Introduce yourself casually', 'Make plans with friends', 'Navigate social situations'],
    estimated_minutes: 10,
    difficulty_weight: 0.4,
  },
  {
    slug: 'job_interviews',
    title: 'Job Interviews',
    description: 'Land your first professional role.',
    profession_tags: ['student'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Estoy muy interesado/a en esta posición porque...', translation: 'I am very interested in this position because...', language_pair: 'en-es', when_to_use: 'Expressing interest' },
      { phrase: 'Mes points forts sont...', translation: 'My strengths are...', language_pair: 'en-fr', when_to_use: 'Discussing strengths' },
    ],
    ai_persona: { role: 'HR recruiter', personality: 'Professional, assessing cultural fit', background: 'Recruiting for an entry-level position', speaking_style: 'Friendly but evaluative, behavioral questions' },
    objectives: ['Present yourself professionally', 'Discuss experience and skills', 'Ask about the role and company'],
    estimated_minutes: 15,
    difficulty_weight: 1.1,
  },

  // ── DEFAULT (6 scenarios) ───────────────────────────────────────────────
  {
    slug: 'daily_conversations',
    title: 'Daily Conversations',
    description: 'Chat naturally with anyone in everyday situations.',
    profession_tags: ['general'],
    context_type: 'daily_life',
    cefr_levels: ['A1', 'A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Cómo te va?', translation: 'How\'s it going?', language_pair: 'en-es', when_to_use: 'Casual greeting' },
      { phrase: 'Quoi de neuf?', translation: 'What\'s new?', language_pair: 'en-fr', when_to_use: 'Casual greeting' },
    ],
    ai_persona: { role: 'Neighbor', personality: 'Friendly, talkative', background: 'Lives next door, likes to chat', speaking_style: 'Very casual, uses local expressions' },
    objectives: ['Hold casual conversations', 'Use everyday expressions', 'Talk about daily life'],
    estimated_minutes: 10,
    difficulty_weight: 0.5,
  },
  {
    slug: 'travel_situations',
    title: 'Travel Situations',
    description: 'Navigate airports, hotels, and restaurants.',
    profession_tags: ['general'],
    context_type: 'travel',
    cefr_levels: ['A1', 'A2', 'B1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Dónde está la salida?', translation: 'Where is the exit?', language_pair: 'en-es', when_to_use: 'Asking for directions' },
      { phrase: 'Je voudrais réserver une chambre', translation: 'I would like to book a room', language_pair: 'en-fr', when_to_use: 'Hotel booking' },
    ],
    ai_persona: { role: 'Hotel receptionist', personality: 'Helpful, speaks clearly', background: 'Works at a tourist-area hotel', speaking_style: 'Slow, clear, accommodating' },
    objectives: ['Navigate travel situations', 'Ask for directions', 'Book accommodations and transport'],
    estimated_minutes: 10,
    difficulty_weight: 0.5,
  },
  {
    slug: 'making_friends',
    title: 'Making Friends',
    description: 'Build real relationships in the target language.',
    profession_tags: ['general'],
    context_type: 'social',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Qué te gusta hacer en tu tiempo libre?', translation: 'What do you like to do in your free time?', language_pair: 'en-es', when_to_use: 'Getting to know someone' },
      { phrase: 'On devrait se voir plus souvent', translation: 'We should see each other more often', language_pair: 'en-fr', when_to_use: 'Deepening a friendship' },
    ],
    ai_persona: { role: 'New acquaintance', personality: 'Warm, shares interests', background: 'Met through a mutual friend', speaking_style: 'Friendly, open about personal life' },
    objectives: ['Build meaningful conversations', 'Share interests and opinions', 'Make plans together'],
    estimated_minutes: 10,
    difficulty_weight: 0.6,
  },
  {
    slug: 'professional_meetings',
    title: 'Professional Meetings',
    description: 'Attend meetings and presentations confidently.',
    profession_tags: ['general', 'business'],
    context_type: 'professional',
    cefr_levels: ['B1', 'B2', 'C1'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Tengo una propuesta que presentar', translation: 'I have a proposal to present', language_pair: 'en-es', when_to_use: 'Taking initiative in a meeting' },
      { phrase: 'Si je peux me permettre d\'ajouter...', translation: 'If I may add...', language_pair: 'en-fr', when_to_use: 'Contributing to discussion' },
    ],
    ai_persona: { role: 'Meeting chair', personality: 'Organized, inclusive', background: 'Senior manager running a team meeting', speaking_style: 'Professional, structured' },
    objectives: ['Participate in meetings', 'Share ideas professionally', 'Follow meeting protocols'],
    estimated_minutes: 15,
    difficulty_weight: 1.0,
  },
  {
    slug: 'phone_calls',
    title: 'Phone Calls',
    description: 'Handle phone calls with confidence.',
    profession_tags: ['general'],
    context_type: 'daily_life',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: 'Buenos días, ¿podría hablar con...?', translation: 'Good morning, could I speak with...?', language_pair: 'en-es', when_to_use: 'Opening a phone call' },
      { phrase: 'Allô, c\'est de la part de...', translation: 'Hello, this is...calling', language_pair: 'en-fr', when_to_use: 'Identifying yourself' },
    ],
    ai_persona: { role: 'Receptionist', personality: 'Professional, speaks quickly', background: 'Office receptionist handling calls', speaking_style: 'Phone etiquette, somewhat fast' },
    objectives: ['Make and receive phone calls', 'Leave messages', 'Handle phone-specific vocabulary'],
    estimated_minutes: 10,
    difficulty_weight: 0.8,
  },
  {
    slug: 'social_events',
    title: 'Social Events',
    description: 'Navigate small talk and networking at events.',
    profession_tags: ['general'],
    context_type: 'social',
    cefr_levels: ['A2', 'B1', 'B2'],
    language_pairs: ['en-es', 'en-fr'],
    key_phrases: [
      { phrase: '¿Conoces a alguien aquí?', translation: 'Do you know anyone here?', language_pair: 'en-es', when_to_use: 'Starting conversation at a party' },
      { phrase: 'C\'est la première fois que je viens ici', translation: 'It\'s my first time here', language_pair: 'en-fr', when_to_use: 'Making small talk' },
    ],
    ai_persona: { role: 'Fellow guest', personality: 'Social, introduces you to others', background: 'Knows the host, regular at these events', speaking_style: 'Casual, humorous' },
    objectives: ['Make small talk', 'Introduce yourself', 'Join and leave conversations gracefully'],
    estimated_minutes: 10,
    difficulty_weight: 0.7,
  },
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const VOX_VOCABULARY_SEED: VoxVocabularySeed[] = [
  ...ES_A1,
  ...ES_A2,
  ...ES_B1,
  ...ES_B2,
  ...ES_C1,
  ...ES_C2,
  ...FR_A1,
  ...FR_A2,
  ...FR_B1,
  ...FR_B2,
  ...FR_C1,
  ...FR_C2,
];

// ============================================================================
// STATS (for validation)
// ============================================================================

export function getVocabSeedStats() {
  const byLevel: Record<string, number> = {};
  const byLang: Record<string, number> = {};
  for (const v of VOX_VOCABULARY_SEED) {
    byLevel[v.cefr_level] = (byLevel[v.cefr_level] || 0) + 1;
    byLang[v.language_pair] = (byLang[v.language_pair] || 0) + 1;
  }
  return { total: VOX_VOCABULARY_SEED.length, byLevel, byLang, scenarios: VOX_SCENARIO_SEED.length };
}
