/**
 * Seed Vocabulary for TTS Cache
 *
 * Contains top 500 words per language + common phrases
 * Used to pre-populate the TTS cache to reduce API costs.
 *
 * Sources: Frequency dictionaries, common language learning curricula
 */

import { SupportedLanguage } from './types';

// =============================================================================
// Types
// =============================================================================

export interface SeedVocabulary {
  words: string[];
  phrases: string[];
}

// =============================================================================
// Spanish (es) - Top 500 Words + Common Phrases
// =============================================================================

const SPANISH_WORDS: string[] = [
  // Numbers 1-20
  'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
  // Common verbs
  'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber',
  'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'creer', 'hablar', 'llevar',
  'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar', 'salir', 'volver', 'tomar', 'conocer',
  'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar', 'buscar', 'existir', 'entrar',
  'trabajar', 'escribir', 'perder', 'producir', 'ocurrir', 'entender', 'pedir', 'recibir', 'recordar', 'terminar',
  'permitir', 'aparecer', 'conseguir', 'comenzar', 'servir', 'sacar', 'necesitar', 'mantener', 'resultar', 'leer',
  'caer', 'cambiar', 'presentar', 'crear', 'abrir', 'considerar', 'oír', 'acabar', 'convertir', 'ganar',
  'formar', 'traer', 'partir', 'morir', 'aceptar', 'realizar', 'suponer', 'comprender', 'lograr', 'explicar',
  // Common nouns
  'tiempo', 'año', 'día', 'vez', 'parte', 'mundo', 'casa', 'país', 'lugar', 'persona',
  'hora', 'trabajo', 'punto', 'mano', 'cosa', 'hombre', 'momento', 'caso', 'mujer', 'vida',
  'noche', 'agua', 'forma', 'pueblo', 'hijo', 'grupo', 'problema', 'medio', 'nombre', 'ejemplo',
  'ciudad', 'lado', 'padre', 'cuerpo', 'historia', 'guerra', 'familia', 'cabeza', 'palabra', 'madre',
  'número', 'tierra', 'ojo', 'cuenta', 'manera', 'idea', 'gobierno', 'poder', 'derecho', 'mesa',
  'libro', 'calle', 'puerta', 'amigo', 'dinero', 'orden', 'minuto', 'mes', 'semana', 'comida',
  'niño', 'hermano', 'hermana', 'cama', 'clase', 'escuela', 'coche', 'perro', 'gato', 'café',
  // Adjectives
  'bueno', 'nuevo', 'primero', 'último', 'largo', 'grande', 'pequeño', 'alto', 'bajo', 'joven',
  'viejo', 'malo', 'cierto', 'propio', 'siguiente', 'posible', 'mejor', 'peor', 'mayor', 'menor',
  'solo', 'mismo', 'otro', 'poco', 'mucho', 'tanto', 'todo', 'cada', 'ninguno', 'alguno',
  'varios', 'importante', 'necesario', 'difícil', 'fácil', 'libre', 'claro', 'seguro', 'fuerte', 'blanco',
  'negro', 'rojo', 'azul', 'verde', 'amarillo', 'bonito', 'feo', 'rico', 'pobre', 'feliz',
  'triste', 'cansado', 'enfermo', 'sano', 'lleno', 'vacío', 'caliente', 'frío', 'limpio', 'sucio',
  // Pronouns & articles
  'yo', 'tú', 'él', 'ella', 'nosotros', 'ustedes', 'ellos', 'ellas', 'usted', 'esto',
  'eso', 'aquello', 'este', 'ese', 'aquel', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
  // Prepositions & conjunctions
  'de', 'en', 'a', 'para', 'por', 'con', 'sin', 'sobre', 'entre', 'hasta',
  'desde', 'hacia', 'durante', 'según', 'contra', 'tras', 'mediante', 'ante', 'bajo', 'cabe',
  'y', 'o', 'pero', 'porque', 'aunque', 'si', 'cuando', 'como', 'donde', 'mientras',
  // Adverbs
  'no', 'sí', 'más', 'ya', 'también', 'muy', 'siempre', 'nunca', 'ahora', 'después',
  'antes', 'aquí', 'allí', 'bien', 'mal', 'casi', 'todavía', 'apenas', 'quizás', 'así',
  // Question words
  'qué', 'quién', 'cuál', 'cómo', 'cuándo', 'dónde', 'por qué', 'cuánto', 'cuánta', 'cuántos',
  // Days of the week
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
  // Months
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  // Time expressions
  'hoy', 'ayer', 'mañana', 'tarde', 'temprano', 'pronto', 'luego', 'entonces', 'anoche', 'pasado',
  // Food & drinks
  'pan', 'leche', 'carne', 'pescado', 'pollo', 'arroz', 'fruta', 'verdura', 'huevo', 'queso',
  'vino', 'cerveza', 'jugo', 'azúcar', 'sal', 'aceite', 'mantequilla', 'sopa', 'ensalada', 'postre',
  // Places
  'restaurante', 'hotel', 'tienda', 'banco', 'hospital', 'aeropuerto', 'estación', 'playa', 'montaña', 'parque',
  'museo', 'teatro', 'cine', 'iglesia', 'mercado', 'farmacia', 'biblioteca', 'oficina', 'plaza', 'centro',
  // Body parts
  'pie', 'pierna', 'brazo', 'dedo', 'cara', 'nariz', 'boca', 'oreja', 'pelo', 'corazón',
  // Family
  'abuelo', 'abuela', 'tío', 'tía', 'primo', 'prima', 'esposo', 'esposa', 'novio', 'novia',
  // Weather
  'sol', 'lluvia', 'nieve', 'viento', 'nube', 'tormenta', 'calor', 'fresco', 'clima', 'temperatura',
  // Professions
  'doctor', 'profesor', 'estudiante', 'ingeniero', 'abogado', 'policía', 'bombero', 'enfermero', 'arquitecto', 'cocinero',
  // More common words
  'gracias', 'favor', 'perdón', 'disculpa', 'ayuda', 'permiso', 'problema', 'solución', 'respuesta', 'pregunta',
  'verdad', 'mentira', 'secreto', 'sorpresa', 'regalo', 'fiesta', 'vacaciones', 'viaje', 'paseo', 'juego',
];

const SPANISH_PHRASES: string[] = [
  // Greetings
  'Buenos días', 'Buenas tardes', 'Buenas noches', 'Hola, ¿cómo estás?', '¿Qué tal?',
  'Mucho gusto', 'Encantado de conocerte', 'Bienvenido', 'Adiós', 'Hasta luego',
  'Hasta mañana', 'Nos vemos', 'Que te vaya bien', 'Cuídate',
  // Polite expressions
  'Por favor', 'Muchas gracias', 'De nada', 'Con permiso', 'Perdón', 'Lo siento',
  'Disculpe', 'No hay problema', 'Está bien', 'Claro que sí',
  // Basic questions
  '¿Cómo te llamas?', '¿De dónde eres?', '¿Hablas español?', '¿Hablas inglés?',
  '¿Cuánto cuesta?', '¿Dónde está el baño?', '¿Qué hora es?', '¿Puedes ayudarme?',
  '¿Puedes repetir?', '¿Qué significa esto?',
  // Basic responses
  'Me llamo', 'Soy de', 'No entiendo', 'No sé', 'Creo que sí', 'Creo que no',
  'Tal vez', 'Por supuesto', 'Desde luego', 'Exactamente',
  // Restaurant
  'Una mesa para dos', 'El menú, por favor', 'La cuenta, por favor', 'Quiero pedir',
  'Me gustaría', 'Está delicioso', '¿Qué me recomienda?',
  // Directions
  'A la izquierda', 'A la derecha', 'Todo recto', 'En la esquina',
  'Al lado de', 'Enfrente de', 'Cerca de aquí', 'Lejos de aquí',
  // Shopping
  '¿Cuánto cuesta esto?', 'Es muy caro', '¿Tiene descuento?', 'Voy a llevarlo',
  '¿Puedo pagar con tarjeta?', 'Solo estoy mirando',
  // Common expressions
  'Tengo hambre', 'Tengo sed', 'Estoy cansado', 'Estoy ocupado', 'Tengo prisa',
  'No me siento bien', 'Necesito ayuda', 'Es importante', 'No te preocupes',
  'Todo está bien', 'Qué bueno', 'Qué lástima', 'Qué sorpresa',
];

// =============================================================================
// French (fr) - Top 500 Words + Common Phrases
// =============================================================================

const FRENCH_WORDS: string[] = [
  // Numbers
  'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt',
  // Common verbs
  'être', 'avoir', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'savoir', 'vouloir', 'venir',
  'falloir', 'devoir', 'croire', 'trouver', 'donner', 'prendre', 'parler', 'aimer', 'passer', 'mettre',
  'demander', 'tenir', 'sembler', 'laisser', 'rester', 'penser', 'entendre', 'regarder', 'répondre', 'rendre',
  'connaître', 'paraître', 'partir', 'sortir', 'attendre', 'vivre', 'chercher', 'porter', 'sentir', 'écrire',
  'comprendre', 'jouer', 'montrer', 'tomber', 'arriver', 'commencer', 'suivre', 'perdre', 'entrer', 'ouvrir',
  'manger', 'boire', 'dormir', 'courir', 'apprendre', 'lire', 'finir', 'choisir', 'essayer', 'appeler',
  // Common nouns
  'homme', 'femme', 'jour', 'fois', 'temps', 'vie', 'main', 'chose', 'part', 'après',
  'pays', 'moment', 'enfant', 'monde', 'heure', 'cas', 'travail', 'point', 'maison', 'tête',
  'année', 'mot', 'façon', 'nuit', 'eau', 'place', 'père', 'mère', 'fille', 'fils',
  'oeil', 'yeux', 'corps', 'coeur', 'ville', 'rue', 'porte', 'ami', 'amie', 'famille',
  'livre', 'classe', 'école', 'bureau', 'table', 'chaise', 'lit', 'chambre', 'cuisine', 'jardin',
  'voiture', 'train', 'avion', 'bateau', 'bus', 'vélo', 'chat', 'chien', 'oiseau', 'arbre',
  'fleur', 'soleil', 'lune', 'étoile', 'mer', 'plage', 'montagne', 'forêt', 'rivière', 'lac',
  // Adjectives
  'grand', 'petit', 'bon', 'mauvais', 'beau', 'belle', 'nouveau', 'vieux', 'jeune', 'long',
  'premier', 'dernier', 'autre', 'même', 'tout', 'seul', 'cher', 'haut', 'bas', 'fort',
  'blanc', 'noir', 'rouge', 'bleu', 'vert', 'jaune', 'gris', 'rose', 'orange', 'violet',
  'chaud', 'froid', 'propre', 'sale', 'facile', 'difficile', 'possible', 'impossible', 'important', 'intéressant',
  'content', 'triste', 'fatigué', 'malade', 'heureux', 'malheureux', 'gentil', 'méchant', 'joli', 'laid',
  // Pronouns
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'ce',
  'cela', 'ceci', 'qui', 'que', 'quoi', 'lequel', 'dont', 'où', 'moi', 'toi',
  // Prepositions
  'de', 'à', 'en', 'dans', 'par', 'pour', 'sur', 'avec', 'sans', 'sous',
  'entre', 'vers', 'chez', 'devant', 'derrière', 'avant', 'après', 'depuis', 'pendant', 'contre',
  // Adverbs
  'ne', 'pas', 'plus', 'bien', 'mal', 'très', 'trop', 'aussi', 'encore', 'toujours',
  'jamais', 'déjà', 'souvent', 'parfois', 'maintenant', 'hier', 'demain', 'aujourd\'hui', 'ici', 'là',
  // Days
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
  // Months
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  // Food
  'pain', 'fromage', 'vin', 'bière', 'café', 'thé', 'lait', 'eau', 'viande', 'poisson',
  'poulet', 'riz', 'pâtes', 'légume', 'fruit', 'pomme', 'orange', 'banane', 'fraise', 'raisin',
  'oeuf', 'beurre', 'sel', 'poivre', 'sucre', 'huile', 'soupe', 'salade', 'dessert', 'gâteau',
  // Places
  'restaurant', 'hôtel', 'magasin', 'banque', 'hôpital', 'aéroport', 'gare', 'musée', 'théâtre', 'cinéma',
  'église', 'marché', 'pharmacie', 'bibliothèque', 'parc', 'centre',
  // More common words
  'merci', 'pardon', 'excusez', 'aide', 'problème', 'solution', 'question', 'réponse', 'idée', 'raison',
  'sens', 'force', 'suite', 'service', 'groupe', 'effet', 'milieu', 'nombre', 'ordre', 'centre',
];

const FRENCH_PHRASES: string[] = [
  // Greetings
  'Bonjour', 'Bonsoir', 'Bonne nuit', 'Salut', 'Comment allez-vous?', 'Comment ça va?',
  'Ça va bien', 'Ça va mal', 'Enchanté', 'Au revoir', 'À bientôt', 'À demain',
  // Polite expressions
  'S\'il vous plaît', 'Merci beaucoup', 'De rien', 'Je vous en prie', 'Excusez-moi', 'Pardon',
  'Je suis désolé', 'Pas de problème', 'D\'accord', 'Bien sûr',
  // Basic questions
  'Comment vous appelez-vous?', 'D\'où venez-vous?', 'Parlez-vous français?', 'Parlez-vous anglais?',
  'Combien ça coûte?', 'Où sont les toilettes?', 'Quelle heure est-il?', 'Pouvez-vous m\'aider?',
  'Pouvez-vous répéter?', 'Qu\'est-ce que ça veut dire?',
  // Basic responses
  'Je m\'appelle', 'Je suis de', 'Je ne comprends pas', 'Je ne sais pas', 'Je pense que oui',
  'Je pense que non', 'Peut-être', 'Certainement', 'Exactement',
  // Restaurant
  'Une table pour deux', 'Le menu, s\'il vous plaît', 'L\'addition, s\'il vous plaît',
  'Je voudrais commander', 'C\'est délicieux', 'Qu\'est-ce que vous recommandez?',
  // Directions
  'À gauche', 'À droite', 'Tout droit', 'Au coin', 'À côté de', 'En face de',
  'Près d\'ici', 'Loin d\'ici',
  // Shopping
  'Combien coûte ceci?', 'C\'est trop cher', 'Avez-vous une réduction?', 'Je vais le prendre',
  'Puis-je payer par carte?', 'Je regarde seulement',
  // Common expressions
  'J\'ai faim', 'J\'ai soif', 'Je suis fatigué', 'Je suis occupé', 'Je suis pressé',
  'Je ne me sens pas bien', 'J\'ai besoin d\'aide', 'C\'est important', 'Ne vous inquiétez pas',
  'Tout va bien', 'C\'est génial', 'Quel dommage', 'Quelle surprise',
];

// =============================================================================
// German (de) - Top 500 Words + Common Phrases
// =============================================================================

const GERMAN_WORDS: string[] = [
  // Numbers
  'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
  'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig',
  // Common verbs
  'sein', 'haben', 'werden', 'können', 'müssen', 'sagen', 'machen', 'geben', 'kommen', 'sollen',
  'wollen', 'gehen', 'wissen', 'sehen', 'lassen', 'stehen', 'finden', 'bleiben', 'liegen', 'heißen',
  'denken', 'nehmen', 'halten', 'bringen', 'leben', 'fahren', 'meinen', 'fragen', 'kennen', 'gelten',
  'stellen', 'spielen', 'arbeiten', 'brauchen', 'folgen', 'lernen', 'bestehen', 'verstehen', 'setzen', 'bekommen',
  'beginnen', 'erzählen', 'versuchen', 'schreiben', 'laufen', 'erklären', 'entsprechen', 'sitzen', 'ziehen', 'scheinen',
  'fallen', 'gehören', 'entstehen', 'erhalten', 'treffen', 'suchen', 'legen', 'vorstellen', 'handeln', 'erreichen',
  'tragen', 'schaffen', 'lesen', 'verlieren', 'darstellen', 'erkennen', 'entwickeln', 'reden', 'aussehen', 'erscheinen',
  'essen', 'trinken', 'schlafen', 'kaufen', 'verkaufen', 'öffnen', 'schließen', 'warten', 'helfen', 'lieben',
  // Common nouns
  'Jahr', 'Mal', 'Zeit', 'Mensch', 'Leben', 'Tag', 'Frau', 'Mann', 'Kind', 'Welt',
  'Hand', 'Teil', 'Platz', 'Fall', 'Land', 'Leute', 'Arbeit', 'Kopf', 'Weg', 'Auge',
  'Frage', 'Haus', 'Geld', 'Ende', 'Staat', 'Stadt', 'Bild', 'Wort', 'Buch', 'Seite',
  'Vater', 'Mutter', 'Bruder', 'Schwester', 'Familie', 'Freund', 'Freundin', 'Herr', 'Dame', 'Name',
  'Wasser', 'Tisch', 'Stuhl', 'Bett', 'Zimmer', 'Tür', 'Fenster', 'Auto', 'Straße', 'Schule',
  'Hund', 'Katze', 'Vogel', 'Baum', 'Blume', 'Sonne', 'Mond', 'Stern', 'Himmel', 'Erde',
  'Berg', 'Meer', 'Strand', 'Wald', 'Fluss', 'See', 'Morgen', 'Abend', 'Nacht', 'Woche',
  'Monat', 'Stunde', 'Minute', 'Sekunde', 'Uhr', 'Wetter', 'Regen', 'Schnee', 'Wind', 'Wolke',
  // Adjectives
  'gut', 'neu', 'groß', 'klein', 'alt', 'jung', 'lang', 'kurz', 'hoch', 'tief',
  'erst', 'letzt', 'ganz', 'eigen', 'einzig', 'wahr', 'möglich', 'nötig', 'wichtig', 'richtig',
  'falsch', 'schlecht', 'schön', 'hässlich', 'stark', 'schwach', 'schnell', 'langsam', 'leicht', 'schwer',
  'weiß', 'schwarz', 'rot', 'blau', 'grün', 'gelb', 'grau', 'braun', 'rosa', 'orange',
  'warm', 'kalt', 'heiß', 'kühl', 'sauber', 'schmutzig', 'nass', 'trocken', 'hell', 'dunkel',
  'müde', 'krank', 'gesund', 'glücklich', 'traurig', 'böse', 'freundlich', 'nett', 'lieb', 'frei',
  // Pronouns
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'mich', 'dich',
  'ihn', 'uns', 'euch', 'sich', 'mir', 'dir', 'ihm', 'ihr', 'mein', 'dein',
  'sein', 'unser', 'euer', 'dieser', 'jener', 'welcher', 'jeder', 'alle', 'beide', 'einige',
  // Prepositions
  'in', 'an', 'auf', 'für', 'mit', 'nach', 'bei', 'um', 'aus', 'von',
  'zu', 'vor', 'durch', 'über', 'unter', 'zwischen', 'neben', 'hinter', 'gegen', 'ohne',
  // Adverbs & particles
  'nicht', 'auch', 'so', 'nur', 'noch', 'dann', 'schon', 'immer', 'wieder', 'hier',
  'da', 'nun', 'sehr', 'doch', 'wohl', 'etwa', 'erst', 'eben', 'gerade', 'vielleicht',
  'heute', 'gestern', 'morgen', 'jetzt', 'bald', 'früh', 'spät', 'oft', 'manchmal', 'selten',
  // Days
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag',
  // Months
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  // Food
  'Brot', 'Käse', 'Wein', 'Bier', 'Kaffee', 'Tee', 'Milch', 'Fleisch', 'Fisch', 'Huhn',
  'Reis', 'Nudeln', 'Gemüse', 'Obst', 'Apfel', 'Banane', 'Ei', 'Butter', 'Salz', 'Zucker',
];

const GERMAN_PHRASES: string[] = [
  // Greetings
  'Guten Morgen', 'Guten Tag', 'Guten Abend', 'Gute Nacht', 'Hallo', 'Wie geht es Ihnen?',
  'Wie geht\'s?', 'Es geht mir gut', 'Freut mich', 'Auf Wiedersehen', 'Tschüss', 'Bis bald',
  // Polite expressions
  'Bitte', 'Vielen Dank', 'Danke schön', 'Bitte schön', 'Entschuldigung', 'Es tut mir leid',
  'Kein Problem', 'In Ordnung', 'Natürlich', 'Gern geschehen',
  // Basic questions
  'Wie heißen Sie?', 'Woher kommen Sie?', 'Sprechen Sie Deutsch?', 'Sprechen Sie Englisch?',
  'Wie viel kostet das?', 'Wo ist die Toilette?', 'Wie spät ist es?', 'Können Sie mir helfen?',
  'Können Sie das wiederholen?', 'Was bedeutet das?',
  // Basic responses
  'Ich heiße', 'Ich komme aus', 'Ich verstehe nicht', 'Ich weiß nicht', 'Ich glaube ja',
  'Ich glaube nein', 'Vielleicht', 'Bestimmt', 'Genau',
  // Restaurant
  'Einen Tisch für zwei', 'Die Speisekarte bitte', 'Die Rechnung bitte',
  'Ich möchte bestellen', 'Das ist lecker', 'Was empfehlen Sie?',
  // Directions
  'Nach links', 'Nach rechts', 'Geradeaus', 'An der Ecke', 'Neben', 'Gegenüber',
  'In der Nähe', 'Weit entfernt',
  // Shopping
  'Wie viel kostet das?', 'Das ist zu teuer', 'Gibt es einen Rabatt?', 'Ich nehme es',
  'Kann ich mit Karte zahlen?', 'Ich schaue nur',
  // Common expressions
  'Ich habe Hunger', 'Ich habe Durst', 'Ich bin müde', 'Ich bin beschäftigt', 'Ich habe es eilig',
  'Mir geht es nicht gut', 'Ich brauche Hilfe', 'Das ist wichtig', 'Keine Sorge',
  'Alles ist gut', 'Das ist toll', 'Wie schade', 'Was für eine Überraschung',
];

// =============================================================================
// Italian (it) - Top 500 Words + Common Phrases
// =============================================================================

const ITALIAN_WORDS: string[] = [
  // Numbers
  'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci',
  'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti',
  // Common verbs
  'essere', 'avere', 'fare', 'dire', 'potere', 'andare', 'vedere', 'sapere', 'volere', 'venire',
  'dovere', 'dare', 'stare', 'trovare', 'parlare', 'prendere', 'mettere', 'pensare', 'credere', 'sentire',
  'lasciare', 'tenere', 'portare', 'leggere', 'scrivere', 'capire', 'vivere', 'conoscere', 'chiamare', 'rimanere',
  'aspettare', 'chiedere', 'cercare', 'guardare', 'rispondere', 'arrivare', 'passare', 'partire', 'tornare', 'entrare',
  'cominciare', 'finire', 'mangiare', 'bere', 'dormire', 'amare', 'lavorare', 'giocare', 'studiare', 'imparare',
  // Common nouns
  'anno', 'volta', 'tempo', 'uomo', 'donna', 'giorno', 'vita', 'mondo', 'mano', 'cosa',
  'casa', 'parte', 'paese', 'occhio', 'lavoro', 'ora', 'modo', 'testa', 'parola', 'momento',
  'padre', 'madre', 'figlio', 'figlia', 'fratello', 'sorella', 'famiglia', 'amico', 'amica', 'nome',
  'acqua', 'strada', 'porta', 'tavolo', 'sedia', 'letto', 'camera', 'cucina', 'bagno', 'finestra',
  'macchina', 'treno', 'aereo', 'cane', 'gatto', 'albero', 'fiore', 'sole', 'luna', 'stella',
  'mare', 'montagna', 'spiaggia', 'città', 'centro', 'piazza', 'chiesa', 'museo', 'teatro', 'cinema',
  'libro', 'classe', 'scuola', 'università', 'ufficio', 'negozio', 'ristorante', 'bar', 'caffè', 'hotel',
  'mattina', 'pomeriggio', 'sera', 'notte', 'settimana', 'mese', 'minuto', 'secondo', 'pioggia', 'neve',
  // Adjectives
  'grande', 'piccolo', 'buono', 'cattivo', 'bello', 'brutto', 'nuovo', 'vecchio', 'giovane', 'lungo',
  'corto', 'alto', 'basso', 'primo', 'ultimo', 'altro', 'stesso', 'solo', 'tutto', 'ogni',
  'bianco', 'nero', 'rosso', 'blu', 'verde', 'giallo', 'grigio', 'marrone', 'rosa', 'arancione',
  'caldo', 'freddo', 'pulito', 'sporco', 'facile', 'difficile', 'possibile', 'impossibile', 'importante', 'interessante',
  'felice', 'triste', 'stanco', 'malato', 'sano', 'forte', 'debole', 'veloce', 'lento', 'gentile',
  // Pronouns
  'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'Lei', 'questo', 'quello',
  'chi', 'che', 'quale', 'quanto', 'dove', 'come', 'quando', 'perché', 'mio', 'tuo',
  'suo', 'nostro', 'vostro', 'loro',
  // Prepositions
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'senza',
  'sotto', 'sopra', 'dentro', 'fuori', 'davanti', 'dietro', 'vicino', 'lontano', 'verso', 'durante',
  // Adverbs
  'non', 'più', 'ancora', 'sempre', 'mai', 'già', 'anche', 'molto', 'poco', 'troppo',
  'bene', 'male', 'così', 'qui', 'qua', 'là', 'lì', 'oggi', 'ieri', 'domani',
  'adesso', 'ora', 'poi', 'prima', 'dopo', 'subito', 'presto', 'tardi', 'spesso', 'qualche',
  // Days
  'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica',
  // Months
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
  // Food
  'pane', 'formaggio', 'vino', 'birra', 'caffè', 'tè', 'latte', 'carne', 'pesce', 'pollo',
  'riso', 'pasta', 'pizza', 'verdura', 'frutta', 'mela', 'arancia', 'uovo', 'burro', 'sale',
  'zucchero', 'olio', 'minestra', 'insalata', 'dolce', 'gelato',
];

const ITALIAN_PHRASES: string[] = [
  // Greetings
  'Buongiorno', 'Buonasera', 'Buonanotte', 'Ciao', 'Come sta?', 'Come stai?',
  'Sto bene', 'Piacere', 'Arrivederci', 'A presto', 'A domani', 'Ci vediamo',
  // Polite expressions
  'Per favore', 'Grazie mille', 'Prego', 'Scusi', 'Mi scusi', 'Mi dispiace',
  'Non c\'è problema', 'Va bene', 'Certo', 'D\'accordo',
  // Basic questions
  'Come si chiama?', 'Di dove sei?', 'Parla italiano?', 'Parla inglese?',
  'Quanto costa?', 'Dov\'è il bagno?', 'Che ora è?', 'Può aiutarmi?',
  'Può ripetere?', 'Cosa significa?',
  // Basic responses
  'Mi chiamo', 'Sono di', 'Non capisco', 'Non lo so', 'Penso di sì',
  'Penso di no', 'Forse', 'Certamente', 'Esattamente',
  // Restaurant
  'Un tavolo per due', 'Il menu, per favore', 'Il conto, per favore',
  'Vorrei ordinare', 'È delizioso', 'Cosa mi consiglia?',
  // Directions
  'A sinistra', 'A destra', 'Sempre dritto', 'All\'angolo', 'Accanto a', 'Di fronte a',
  'Qui vicino', 'Lontano da qui',
  // Shopping
  'Quanto costa questo?', 'È troppo caro', 'C\'è uno sconto?', 'Lo prendo',
  'Posso pagare con carta?', 'Sto solo guardando',
  // Common expressions
  'Ho fame', 'Ho sete', 'Sono stanco', 'Sono occupato', 'Ho fretta',
  'Non mi sento bene', 'Ho bisogno di aiuto', 'È importante', 'Non ti preoccupare',
  'Tutto bene', 'Che bello', 'Che peccato', 'Che sorpresa',
];

// =============================================================================
// Portuguese (pt) - Top 500 Words + Common Phrases
// =============================================================================

const PORTUGUESE_WORDS: string[] = [
  // Numbers
  'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte',
  // Common verbs
  'ser', 'estar', 'ter', 'fazer', 'poder', 'dizer', 'ir', 'ver', 'dar', 'saber',
  'querer', 'chegar', 'passar', 'dever', 'ficar', 'parecer', 'crer', 'falar', 'levar', 'deixar',
  'seguir', 'encontrar', 'chamar', 'vir', 'pensar', 'sair', 'voltar', 'tomar', 'conhecer', 'viver',
  'sentir', 'tratar', 'olhar', 'contar', 'começar', 'esperar', 'buscar', 'existir', 'entrar', 'trabalhar',
  'escrever', 'perder', 'entender', 'pedir', 'receber', 'lembrar', 'terminar', 'acabar', 'ler', 'cair',
  'mudar', 'abrir', 'fechar', 'ouvir', 'correr', 'dormir', 'comer', 'beber', 'comprar', 'vender',
  // Common nouns
  'ano', 'vez', 'tempo', 'dia', 'vida', 'mundo', 'casa', 'país', 'lugar', 'pessoa',
  'hora', 'trabalho', 'mão', 'coisa', 'homem', 'momento', 'mulher', 'noite', 'água', 'forma',
  'filho', 'grupo', 'problema', 'nome', 'cidade', 'pai', 'corpo', 'história', 'família', 'mãe',
  'número', 'terra', 'olho', 'palavra', 'ideia', 'governo', 'direito', 'livro', 'rua', 'porta',
  'amigo', 'dinheiro', 'ordem', 'mês', 'semana', 'comida', 'criança', 'irmão', 'irmã', 'cama',
  'escola', 'carro', 'cão', 'gato', 'café', 'sol', 'lua', 'mar', 'praia', 'montanha',
  'árvore', 'flor', 'jardim', 'cozinha', 'quarto', 'janela', 'mesa', 'cadeira', 'telefone', 'computador',
  'manhã', 'tarde', 'minuto', 'segundo', 'chuva', 'vento', 'nuvem', 'estrela', 'céu', 'rio',
  // Adjectives
  'bom', 'novo', 'grande', 'pequeno', 'velho', 'jovem', 'longo', 'curto', 'alto', 'baixo',
  'primeiro', 'último', 'outro', 'mesmo', 'só', 'todo', 'cada', 'melhor', 'pior', 'maior',
  'menor', 'branco', 'preto', 'vermelho', 'azul', 'verde', 'amarelo', 'bonito', 'feio', 'rico',
  'pobre', 'feliz', 'triste', 'cansado', 'doente', 'cheio', 'vazio', 'quente', 'frio', 'limpo',
  'sujo', 'fácil', 'difícil', 'possível', 'impossível', 'importante', 'interessante', 'forte', 'fraco', 'rápido',
  'lento', 'certo', 'errado', 'livre', 'ocupado',
  // Pronouns
  'eu', 'tu', 'você', 'ele', 'ela', 'nós', 'vocês', 'eles', 'elas', 'isto',
  'isso', 'aquilo', 'este', 'esse', 'aquele', 'meu', 'teu', 'seu', 'nosso', 'vosso',
  // Prepositions
  'de', 'em', 'a', 'para', 'por', 'com', 'sem', 'sobre', 'entre', 'até',
  'desde', 'durante', 'contra', 'após', 'ante', 'sob', 'perante',
  // Adverbs
  'não', 'sim', 'mais', 'já', 'também', 'muito', 'sempre', 'nunca', 'agora', 'depois',
  'antes', 'aqui', 'ali', 'bem', 'mal', 'quase', 'ainda', 'talvez', 'assim', 'hoje',
  'ontem', 'amanhã', 'cedo', 'tarde', 'logo', 'então', 'perto', 'longe', 'dentro', 'fora',
  // Days
  'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo',
  // Months
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  // Food
  'pão', 'queijo', 'vinho', 'cerveja', 'café', 'chá', 'leite', 'carne', 'peixe', 'frango',
  'arroz', 'feijão', 'legume', 'fruta', 'maçã', 'laranja', 'banana', 'ovo', 'manteiga', 'sal',
  'açúcar', 'azeite', 'sopa', 'salada', 'sobremesa', 'bolo',
];

const PORTUGUESE_PHRASES: string[] = [
  // Greetings
  'Bom dia', 'Boa tarde', 'Boa noite', 'Olá', 'Como vai?', 'Tudo bem?',
  'Estou bem', 'Prazer em conhecê-lo', 'Adeus', 'Tchau', 'Até logo', 'Até amanhã',
  // Polite expressions
  'Por favor', 'Muito obrigado', 'Obrigada', 'De nada', 'Com licença', 'Desculpe',
  'Sinto muito', 'Sem problema', 'Está bem', 'Claro',
  // Basic questions
  'Como se chama?', 'De onde você é?', 'Fala português?', 'Fala inglês?',
  'Quanto custa?', 'Onde fica o banheiro?', 'Que horas são?', 'Pode me ajudar?',
  'Pode repetir?', 'O que significa isso?',
  // Basic responses
  'Meu nome é', 'Sou de', 'Não entendo', 'Não sei', 'Acho que sim',
  'Acho que não', 'Talvez', 'Com certeza', 'Exatamente',
  // Restaurant
  'Uma mesa para dois', 'O cardápio, por favor', 'A conta, por favor',
  'Quero pedir', 'Está delicioso', 'O que você recomenda?',
  // Directions
  'À esquerda', 'À direita', 'Em frente', 'Na esquina', 'Ao lado de', 'Em frente a',
  'Perto daqui', 'Longe daqui',
  // Shopping
  'Quanto custa isto?', 'É muito caro', 'Tem desconto?', 'Vou levar',
  'Posso pagar com cartão?', 'Estou só olhando',
  // Common expressions
  'Estou com fome', 'Estou com sede', 'Estou cansado', 'Estou ocupado', 'Estou com pressa',
  'Não me sinto bem', 'Preciso de ajuda', 'É importante', 'Não se preocupe',
  'Tudo bem', 'Que bom', 'Que pena', 'Que surpresa',
];

// =============================================================================
// English (en) - Top 500 Words + Common Phrases
// =============================================================================

const ENGLISH_WORDS: string[] = [
  // Numbers
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  // Common verbs
  'be', 'have', 'do', 'say', 'go', 'can', 'get', 'would', 'make', 'know',
  'will', 'think', 'take', 'see', 'come', 'could', 'want', 'look', 'use', 'find',
  'give', 'tell', 'work', 'may', 'should', 'call', 'try', 'ask', 'need', 'feel',
  'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help', 'show',
  'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'must',
  'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set',
  'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read',
  'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love',
  'eat', 'drink', 'sleep', 'buy', 'sell', 'close', 'wait', 'send', 'receive', 'build',
  // Common nouns
  'time', 'year', 'people', 'way', 'day', 'man', 'thing', 'woman', 'life', 'child',
  'world', 'school', 'state', 'family', 'student', 'group', 'country', 'problem', 'hand', 'part',
  'place', 'case', 'week', 'company', 'system', 'program', 'question', 'work', 'government', 'number',
  'night', 'point', 'home', 'water', 'room', 'mother', 'area', 'money', 'story', 'fact',
  'month', 'lot', 'right', 'study', 'book', 'eye', 'job', 'word', 'business', 'issue',
  'side', 'kind', 'head', 'house', 'service', 'friend', 'father', 'power', 'hour', 'game',
  'line', 'end', 'member', 'law', 'car', 'city', 'community', 'name', 'president', 'team',
  'minute', 'idea', 'body', 'information', 'back', 'parent', 'face', 'others', 'level', 'office',
  'door', 'health', 'person', 'art', 'war', 'history', 'party', 'result', 'change', 'morning',
  'reason', 'research', 'girl', 'guy', 'moment', 'air', 'teacher', 'force', 'education', 'food',
  // Adjectives
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old',
  'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important',
  'few', 'public', 'bad', 'same', 'able', 'best', 'better', 'sure', 'free', 'true',
  'white', 'black', 'red', 'blue', 'green', 'yellow', 'happy', 'sad', 'tired', 'sick',
  'healthy', 'strong', 'weak', 'fast', 'slow', 'easy', 'difficult', 'hard', 'soft', 'hot',
  'cold', 'warm', 'cool', 'clean', 'dirty', 'beautiful', 'ugly', 'rich', 'poor', 'full',
  'empty', 'open', 'closed', 'near', 'far', 'quiet', 'loud', 'light', 'dark', 'heavy',
  // Pronouns
  'I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
  'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that',
  'these', 'those', 'who', 'what', 'which', 'where', 'when', 'why', 'how', 'all',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  // Prepositions
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up',
  'about', 'into', 'over', 'after', 'beneath', 'under', 'above', 'between', 'through', 'during',
  'before', 'behind', 'beyond', 'without', 'within', 'along', 'among', 'around', 'against', 'toward',
  // Adverbs
  'not', 'also', 'very', 'just', 'now', 'then', 'more', 'only', 'so', 'well',
  'even', 'here', 'there', 'still', 'never', 'always', 'often', 'sometimes', 'usually', 'already',
  'today', 'yesterday', 'tomorrow', 'soon', 'later', 'again', 'too', 'really', 'almost', 'probably',
  // Days
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  // Months
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
  // Food
  'bread', 'cheese', 'wine', 'beer', 'coffee', 'tea', 'milk', 'meat', 'fish', 'chicken',
  'rice', 'pasta', 'vegetable', 'fruit', 'apple', 'orange', 'banana', 'egg', 'butter', 'salt',
  'sugar', 'oil', 'soup', 'salad', 'dessert', 'cake',
];

const ENGLISH_PHRASES: string[] = [
  // Greetings
  'Good morning', 'Good afternoon', 'Good evening', 'Good night', 'Hello', 'How are you?',
  'How\'s it going?', 'I\'m fine', 'Nice to meet you', 'Goodbye', 'See you later', 'See you tomorrow',
  // Polite expressions
  'Please', 'Thank you very much', 'You\'re welcome', 'Excuse me', 'I\'m sorry',
  'No problem', 'That\'s okay', 'Of course', 'Sure', 'No worries',
  // Basic questions
  'What\'s your name?', 'Where are you from?', 'Do you speak English?', 'Do you speak Spanish?',
  'How much does it cost?', 'Where is the bathroom?', 'What time is it?', 'Can you help me?',
  'Can you repeat that?', 'What does this mean?',
  // Basic responses
  'My name is', 'I\'m from', 'I don\'t understand', 'I don\'t know', 'I think so',
  'I don\'t think so', 'Maybe', 'Certainly', 'Exactly',
  // Restaurant
  'A table for two', 'The menu, please', 'The check, please',
  'I would like to order', 'It\'s delicious', 'What do you recommend?',
  // Directions
  'Turn left', 'Turn right', 'Go straight', 'On the corner', 'Next to', 'Across from',
  'Near here', 'Far from here',
  // Shopping
  'How much is this?', 'It\'s too expensive', 'Is there a discount?', 'I\'ll take it',
  'Can I pay by card?', 'I\'m just looking',
  // Common expressions
  'I\'m hungry', 'I\'m thirsty', 'I\'m tired', 'I\'m busy', 'I\'m in a hurry',
  'I don\'t feel well', 'I need help', 'It\'s important', 'Don\'t worry',
  'Everything is fine', 'That\'s great', 'What a shame', 'What a surprise',
];

// =============================================================================
// Export All Vocabularies
// =============================================================================

export const SEED_VOCABULARY: Record<SupportedLanguage, SeedVocabulary> = {
  es: { words: SPANISH_WORDS, phrases: SPANISH_PHRASES },
  fr: { words: FRENCH_WORDS, phrases: FRENCH_PHRASES },
  de: { words: GERMAN_WORDS, phrases: GERMAN_PHRASES },
  it: { words: ITALIAN_WORDS, phrases: ITALIAN_PHRASES },
  pt: { words: PORTUGUESE_WORDS, phrases: PORTUGUESE_PHRASES },
  en: { words: ENGLISH_WORDS, phrases: ENGLISH_PHRASES },
};

/**
 * Get all seed content for a language
 */
export function getSeedContent(language: SupportedLanguage): string[] {
  const vocab = SEED_VOCABULARY[language];
  if (!vocab) return [];
  return [...vocab.words, ...vocab.phrases];
}

/**
 * Get word count for a language
 */
export function getSeedWordCount(language: SupportedLanguage): number {
  return SEED_VOCABULARY[language]?.words.length ?? 0;
}

/**
 * Get phrase count for a language
 */
export function getSeedPhraseCount(language: SupportedLanguage): number {
  return SEED_VOCABULARY[language]?.phrases.length ?? 0;
}

/**
 * Get total seed content count across all languages
 */
export function getTotalSeedCount(): { words: number; phrases: number; total: number } {
  let words = 0;
  let phrases = 0;

  for (const vocab of Object.values(SEED_VOCABULARY)) {
    words += vocab.words.length;
    phrases += vocab.phrases.length;
  }

  return { words, phrases, total: words + phrases };
}
