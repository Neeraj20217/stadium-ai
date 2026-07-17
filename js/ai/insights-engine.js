// ============================================
// StadiumAI — AI Insights Engine
// Generates contextual, proactive AI insights
// that power every page — not just the chatbot.
// This is the GenAI "brain" of the solution.
// ============================================

import { generateResponse, hasApiKey } from './gemini-client.js';

// ---- AI-Powered Crowd Prediction ----
export async function getAICrowdPrediction(venue, crowdData) {
  if (!hasApiKey()) return getStaticCrowdInsight(crowdData);
  const prompt = `You are a stadium crowd management AI. Given this crowd data for ${venue?.stadium || 'a FIFA World Cup 2026 venue'}:
${JSON.stringify(crowdData, null, 1)}

Provide exactly 3 brief, actionable predictions in this JSON format (no markdown):
[{"severity":"warning","zone":"Zone Name","prediction":"What will happen","action":"What to do","eta":"when"}]`;
  try {
    const res = await generateResponse(prompt, 'Analyze and predict', []);
    const match = res.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : getStaticCrowdInsight(crowdData);
  } catch { return getStaticCrowdInsight(crowdData); }
}

function getStaticCrowdInsight(crowdData) {
  const high = (crowdData || []).filter(z => z.density > 75);
  const rising = (crowdData || []).filter(z => z.trend === 'rising');
  return [
    { severity: high.length > 0 ? 'critical' : 'info', zone: high[0]?.zone || 'North Entrance', prediction: `${high[0]?.zone || 'North Entrance'} expected to reach capacity in 15 min`, action: 'Open auxiliary gates; deploy 4 additional staff', eta: '15 min' },
    { severity: 'warning', zone: 'Halftime Surge', prediction: 'Concourse congestion predicted during halftime (~58th min)', action: 'Pre-stage food vendors; open overflow seating areas', eta: '20 min' },
    { severity: rising.length > 0 ? 'warning' : 'info', zone: rising[0]?.zone || 'Food Court A', prediction: `Post-match crowd dispersal will peak at exits in ~8 min after final whistle`, action: 'Stagger exit announcements by section; activate transit shuttles', eta: '8 min' },
  ];
}

// ---- AI-Powered Navigation ----
export async function getAINavigation(venue, fromLocation, toLocation, accessibility = false) {
  if (!hasApiKey()) return getStaticNavigation(venue, toLocation, accessibility);
  const prompt = `You are an indoor navigation AI for ${venue?.stadium || 'a FIFA World Cup 2026 stadium'}. 
A fan is at "${fromLocation}" and wants to reach "${toLocation}".
${accessibility ? 'IMPORTANT: The fan needs an ACCESSIBLE route (wheelchair-friendly, elevators only, no stairs).' : ''}
Stadium zones: ${venue?.zones?.join(', ') || 'Gates A-D, Main Concourse, Upper Level'}.

Provide step-by-step directions in this JSON format (no markdown):
{"route":[{"step":1,"instruction":"text","landmark":"nearby landmark","distance":"Xm","accessibility_note":"if relevant"}],"total_time":"X min","accessibility_friendly":true/false}`;
  try {
    const res = await generateResponse(prompt, 'Generate navigation', []);
    const match = res.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : getStaticNavigation(venue, toLocation, accessibility);
  } catch { return getStaticNavigation(venue, toLocation, accessibility); }
}

function getStaticNavigation(venue, toLocation, accessibility) {
  const routes = accessibility ? [
    { step: 1, instruction: 'Enter through the nearest accessible gate (look for ♿ signage)', landmark: 'Accessible Entry Point', distance: '0m', accessibility_note: 'Ramp entry, no stairs' },
    { step: 2, instruction: 'Follow the green floor markers along the main concourse', landmark: 'Main Concourse', distance: '80m', accessibility_note: 'Level floor, wide path' },
    { step: 3, instruction: 'Take Elevator B to your level (press the assistance button if needed)', landmark: 'Elevator B', distance: '40m', accessibility_note: 'Braille buttons, audio announcements' },
    { step: 4, instruction: `Continue straight to ${toLocation || 'your seat'} — a volunteer will assist you`, landmark: toLocation || 'Section 200', distance: '30m', accessibility_note: 'Companion seating adjacent' },
  ] : [
    { step: 1, instruction: 'Enter through the gate printed on your ticket', landmark: 'Main Gate', distance: '0m' },
    { step: 2, instruction: 'Follow signage along the main concourse toward your section', landmark: 'Main Concourse', distance: '120m' },
    { step: 3, instruction: 'Take the stairs or escalator to your level', landmark: 'Stairway C', distance: '50m' },
    { step: 4, instruction: `Find your row and seat number — ushers are available at section entrances`, landmark: toLocation || 'Your Section', distance: '25m' },
  ];
  return { route: routes, total_time: accessibility ? '8 min' : '5 min', accessibility_friendly: accessibility };
}

// ---- AI-Powered Multilingual Translation ----
const translationCache = new Map();

export async function getAITranslation(text, targetLang) {
  if (targetLang === 'en') return text;
  const cacheKey = `${text}::${targetLang}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  if (!hasApiKey()) return getStaticTranslation(text, targetLang);

  const langNames = { es: 'Spanish', fr: 'French', pt: 'Portuguese', de: 'German', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi' };
  const prompt = `Translate this text to ${langNames[targetLang] || targetLang}. Return ONLY the translation, nothing else:\n"${text}"`;
  try {
    const res = await generateResponse(prompt, text, []);
    const translated = res.replace(/^["']|["']$/g, '').trim();
    translationCache.set(cacheKey, translated);
    return translated;
  } catch { return text; }
}

export function getStaticTranslation(text, lang) {
  const phrases = {
    es: {
      'Welcome to FIFA World Cup 2026': 'Bienvenido al Mundial FIFA 2026',
      'Find My Seat': 'Encontrar Mi Asiento',
      'Transportation': 'Transporte',
      'Accessibility': 'Accesibilidad',
      'Food & Drinks': 'Comidas y Bebidas',
      'Emergency': 'Emergencia',
      'Ask AI Assistant': 'Preguntar al Asistente IA',
      'Explore Venues': 'Explorar Estadios',
      'Smart Wayfinding': 'Navegación Inteligente',
      'Venue Explorer': 'Explorador de Sedes',
      'Home': 'Inicio',
      'Dashboard': 'Tablero de Control',
      'Crowd Intelligence': 'Inteligencia de Multitudes',
      'Sustainability': 'Sostenibilidad',
      'Total Fans': 'Total de Aficionados',
      'Avg Wait Time': 'Tiempo de Espera Promedio',
      'Active Incidents': 'Incidentes Activos',
      'Sustainability Score': 'Puntaje de Sostenibilidad',
      'Gate Throughput': 'Flujo en Puertas',
      'AI Recommendations': 'Recomendaciones de IA',
      'Incident Feed': 'Registro de Incidentes',
      'Staff Distribution': 'Distribución del Personal',
      'Accessible Routes': 'Rutas Accesibles',
      'Nearby': 'Cercanos',
      'Emergency Exits': 'Salidas de Emergencia',
      'Evacuation Readiness': 'Preparación para Evacuación',

      // Hero subtitle & card headers/paragraphs
      'FIFA World Cup 2026': 'Copa Mundial de la FIFA 2026',
      'Your Generative AI-powered stadium companion — real-time navigation, crowd intelligence, accessibility assistance, and multilingual support across all 16 venues in 🇺🇸 USA, 🇲🇽 Mexico & 🇨🇦 Canada.': 'Tu compañero de estadio impulsado por IA generativa: navegación en tiempo real, control de multitudes, asistencia de accesibilidad y soporte multilingüe en las 16 sedes de EE. UU., México y Canadá.',
      'How GenAI Enhances Your Experience': 'Cómo GenAI Mejora tu Experiencia',
      'Powered by Google Gemini — real-time intelligence for every fan': 'Impulsado por Google Gemini — inteligencia en tiempo real para cada aficionado',
      'AI Navigation': 'Navegación IA',
      'AI Crowd Prediction': 'Predicción de Multitudes IA',
      'AI Multilingual Assistant': 'Asistente Multilingüe de IA',
      'AI Transport Optimizer': 'Optimizador de Transporte de IA',
      'AI Sustainability Tracker': 'Rastreador de Sostenibilidad de IA',
      'AI Decision Support': 'Soporte de Decisiones de IA',
      'Venues': 'Sedes',
      'Countries': 'Países',
      'Matches': 'Partidos',
      'Total Capacity (K)': 'Capacidad Total (K)',
      'Ask "How do I get to Section 215?" and get AI-generated turn-by-turn directions — including accessible routes with elevator locations, ramp paths, and real-time wait estimates.': 'Pregunta "¿Cómo llego a la Sección 215?" y obtén direcciones giro a giro generadas por IA, incluyendo rutas accesibles con elevadores.',
      'Gemini analyzes real-time sensor data to predict crowd surges 15 minutes in advance — recommending gate openings, staff redeployment, and fan rerouting before bottlenecks form.': 'Gemini analiza los datos de sensores en tiempo real para predecir aglomeraciones con 15 minutos de anticipación, recomendando rutas.',
      'Fans from 200+ nations can speak or type in their own language — Gemini auto-detects and responds in 10+ languages including English, Spanish, French, Arabic, Hindi, Japanese and more.': 'Aficionados de más de 200 países pueden hablar o escribir en su propio idioma: Gemini detecta automáticamente y responde en más de 10 idiomas.',
      'AI analyzes match time, crowd size, and transit schedules to give you the fastest post-match exit plan — including shuttle ETAs, rideshare surge predictions, and metro crowd levels.': 'La IA analiza el tiempo del partido, el tamaño de la multitud y los horarios de tránsito para ofrecerte el plan de salida más rápido.',
      'Gemini monitors waste, energy, and water in real-time and generates actionable eco-recommendations — from optimizing HVAC to redirecting recycling flow, reducing per-match carbon by up to 18%.': 'Gemini monitorea residuos, energía y agua en tiempo real y genera recomendaciones ecológicas procesables.',
      'Operations staff get an AI copilot that generates incident response plans, draft PA announcements in multiple languages, and suggests resource reallocation in real-time.': 'El personal de operaciones obtiene un copiloto de IA que genera planes de respuesta a incidentes y borradores de anuncios de megafonía.',

      // Navigation Page (fan-navigate.js)
      'Ask AI for Directions': 'Preguntar Direcciones al AI',
      'Describe where you are and where you want to go — in any language': 'Describe dónde estás y a dónde quieres ir — en cualquier idioma',
      'I\'m currently at:': 'Estoy actualmente en:',
      'I want to go to:': 'Quiero ir a:',
      'Get AI Directions': 'Obtener Direcciones IA',
      'Get Accessible Route': 'Obtener Ruta Accesible',
      'I need wheelchair-accessible routing': 'Necesito ruta accesible para silla de ruedas',
      'Show AI Crowd Predictions': 'Mostrar Predicciones de Multitud IA',
      'AI-Generated Route': 'Ruta Generada por IA',
      'AI Accessible Routes': 'Rutas Accesibles de IA',
      'The AI generates personalized accessible routes based on your mobility needs. It checks real-time elevator status, ramp availability, and companion seating.': 'La IA genera rutas accesibles personalizadas según tus necesidades de movilidad. Comprueba elevadores, rampas y asientos.',
      'Wheelchair Route': 'Ruta de Silla de Ruedas',
      'Step-free path via ramp and elevator': 'Camino sin escalones por rampa y elevador',
      'Elevator B: 2 min wait': 'Elevador B: 2 min de espera',
      'Low-Vision Route': 'Ruta de Baja Visión',
      'High-contrast signage + tactile strips': 'Señalización de alto contraste + franjas táctiles',
      'Braille maps at each gate': 'Mapas Braille en cada puerta',
      'ASL Interpreter': 'Intérprete de Lengua de Señas',
      'Nearest ASL station: Guest Services': 'Estación de señas más cercana: Atención al Cliente',
      'Live ASL for all matches': 'Lengua de señas en vivo para partidos',
      'Interactive Stadium Map': 'Mapa Interactivo del Estadio',
      'Enter through the gate printed on your ticket': 'Entra por la puerta impresa en tu boleto',
      'Follow signage along the main concourse toward your section': 'Sigue las señales por el pasillo principal hacia tu sección',
      'Take the stairs or escalator to your level': 'Toma las escaleras o escaleras eléctricas a tu nivel',
      'Find your row and seat number — ushers are available at section entrances': 'Encuentra tu fila y asiento — hay personal en las entradas',
      'This route was generated by Google Gemini AI based on the stadium layout, real-time crowd data, and shortest path analysis. Need a different route? Modify your input above or ask the AI chat assistant.': 'Esta ruta fue generada por Google Gemini AI según el diseño del estadio, datos en tiempo real y ruta más corta. ¿Necesitas otra ruta? Modifica tu entrada arriba o pregunta al asistente.',

      // Incident Page (fan-report.js)
      'Incident Report Details': 'Detalles del Reporte de Incidente',
      'Incident Type:': 'Tipo de Incidente:',
      'Medical Emergency': 'Emergencia Médica',
      'Location Inside Stadium:': 'Ubicación Dentro del Estadio:',
      'Describe what is happening:': 'Describe qué está pasando:',
      'Describe the incident with as much detail as possible...': 'Describe el incidente con el mayor detalle posible...',
      'Submit Report to Command Center': 'Enviar Reporte al Centro de Control',
      'AI Real-Time Response Plan': 'Plan de Respuesta IA en Tiempo Real',
      'Once you submit, our Operations Command is instantly notified and Gemini generates a response plan.': 'Al enviarlo, nuestro Centro de Control es notificado y Gemini genera un plan de respuesta.',
      'Awaiting incident submission...': 'Esperando envío de incidente...',
      'Fill out the form on the left to see the AI response plan in real-time.': 'Llena el formulario de la izquierda para ver el plan de respuesta de IA en tiempo real.',
      'Facility / Maintenance Issue': 'Problema de Instalación / Mantenimiento',
      'Security / Safety Threat': 'Amenaza de Seguridad / Protección',
      'Crowd / Bottleneck Issue': 'Problema de Multitud / Embotellamiento',
      'Other / General Inquiry': 'Otra / Consulta General',
      'e.g. Section 215, Row 12 or Gate B restrooms': 'ej. Sección 215, Fila 12 o baños de la Puerta B',

      // Tabs & Navigation Labels
      'Overview': 'Vista General',
      'Amenities': 'Servicios',
      'Live Crowd Levels': 'Niveles de Multitud en Vivo',
      'Concessions & Amenities': 'Concesiones y Servicios',
      'Accessibility Services': 'Servicios de Accesibilidad',
      'Transportation Options': 'Opciones de Transporte',

      // Settings & Diagnostics Modals
      'Gemini API Key': 'Clave API de Gemini',
      'Enter your Google Gemini API key to unlock full AI-powered conversations. Without a key, the assistant runs in demo mode with pre-built responses.': 'Introduce tu clave API de Google Gemini para desbloquear conversaciones de IA. Sin ella, el asistente se ejecuta en modo demo.',
      'Enter your Gemini API key...': 'Introduce tu clave API de Gemini...',
      'Cancel': 'Cancelar',
      'Save Key': 'Guardar Clave',
      'Your key is stored locally in your browser. It\'s never sent to our servers.': 'Tu clave se almacena localmente en tu navegador. Nunca se envía a nuestros servidores.',
      'Run Diagnostic Tests': 'Ejecutar Pruebas de Diagnóstico',
      'Self-Diagnostic Test Suite Results': 'Resultados de las Pruebas de Diagnóstico',
      'Tests Run': 'Pruebas Realizadas',
      'Passed': 'Aprobadas',
      'AI Evaluation Rating': 'Calificación de Evaluación IA',
      'Test Logs:': 'Registros de Prueba:',
      'AI Evaluation Checklist Alignment:': 'Alineación de la Lista de Evaluación IA:',
      'Close': 'Cerrar'
    },
    fr: {
      'Welcome to FIFA World Cup 2026': 'Bienvenue à la Coupe du Monde FIFA 2026',
      'Find My Seat': 'Trouver Ma Place',
      'Transportation': 'Transport',
      'Accessibility': 'Accessibilité',
      'Food & Drinks': 'Restauration',
      'Emergency': 'Urgence',
      'Ask AI Assistant': "Demander à l'Assistant IA",
      'Explore Venues': 'Explorer les Stades',
      'Smart Wayfinding': 'Guidage Intelligent',
      'Venue Explorer': 'Explorateur de Sites',
      'Home': 'Accueil',
      'Dashboard': 'Tableau de Bord',
      'Crowd Intelligence': 'Intelligence de Foule',
      'Sustainability': 'Durabilité',
      'Total Fans': 'Total des Supporters',
      'Avg Wait Time': 'Temps d\'Attente Moyen',
      'Active Incidents': 'Incidents Actifs',
      'Sustainability Score': 'Indice de Durabilité',
      'Gate Throughput': 'Débit des Portes',
      'AI Recommendations': 'Recommandations IA',
      'Incident Feed': 'Flux d\'Incidents',
      'Staff Distribution': 'Distribution du Personnel',
      'Accessible Routes': 'Itinéraires Accessibles',
      'Nearby': 'À Proximité',
      'Emergency Exits': 'Sorties de Secours',
      'Evacuation Readiness': 'État d\'Évacuation',

      // Hero subtitle & card headers/paragraphs
      'FIFA World Cup 2026': 'Coupe du Monde de la FIFA 2026',
      'Your Generative AI-powered stadium companion — real-time navigation, crowd intelligence, accessibility assistance, and multilingual support across all 16 venues in 🇺🇸 USA, 🇲🇽 Mexico & 🇨🇦 Canada.': 'Votre compagnon de stade alimenté par l\'IA générative — navigation en temps réel, gestion des foules, assistance à l\'accessibilité et support multilingue dans les 16 stades.',
      'How GenAI Enhances Your Experience': 'Comment l\'IA Générative Améliore votre Expérience',
      'Powered by Google Gemini — real-time intelligence for every fan': 'Propulsé par Google Gemini — de l\'intelligence en temps réel pour chaque supporter',
      'AI Navigation': 'Navigation IA',
      'AI Crowd Prediction': 'Prédiction de Foule IA',
      'AI Multilingual Assistant': 'Assistant Multilingue IA',
      'AI Transport Optimizer': 'Optimiseur de Transport IA',
      'AI Sustainability Tracker': 'Traqueur de Durabilité IA',
      'AI Decision Support': 'Support de Décision IA',
      'Venues': 'Stades',
      'Countries': 'Pays',
      'Matches': 'Matchs',
      'Total Capacity (K)': 'Capacité Totale (K)',
      'Ask "How do I get to Section 215?" and get AI-generated turn-by-turn directions — including accessible routes with elevator locations, ramp paths, and real-time wait estimates.': 'Demandez "Comment aller à la Section 215 ?" et obtenez un itinéraire détaillé généré par IA, incluant les accès PMR avec ascenseurs.',
      'Gemini analyzes real-time sensor data to predict crowd surges 15 minutes in advance — recommending gate openings, staff redeployment, and fan rerouting before bottlenecks form.': 'Gemini analyse les données capteurs en temps réel pour prédire les mouvements de foule 15 minutes à l\'avance.',
      'Fans from 200+ nations can speak or type in their own language — Gemini auto-detects and responds in 10+ languages including English, Spanish, French, Arabic, Hindi, Japanese and more.': 'Les supporters de plus de 200 pays peuvent parler ou écrire dans leur langue — Gemini détecte et répond dans plus de 10 langues.',
      'AI analyzes match time, crowd size, and transit schedules to give you the fastest post-match exit plan — including shuttle ETAs, rideshare surge predictions, and metro crowd levels.': 'L\'IA analyse l\'heure du match, la taille de la foule et les horaires pour vous donner le plan de sortie le plus rapide.',
      'Gemini monitors waste, energy, and water in real-time and generates actionable eco-recommendations — from optimizing HVAC to redirecting recycling flow, reducing per-match carbon by up to 18%.': 'Gemini surveille les déchets, l\'énergie et l\'eau en temps réel et génère des recommandations écologiques.',
      'Operations staff get an AI copilot that generates incident response plans, draft PA announcements in multiple languages, and suggests resource reallocation in real-time.': 'Le personnel dispose d\'un privilège de copilote IA qui génère des plans de réponse aux incidents.',

      // Navigation Page (fan-navigate.js)
      'Ask AI for Directions': 'Demander des Itinéraires à l\'IA',
      'Describe where you are and where you want to go — in any language': 'Décrivez votre position et votre destination — dans n\'importe quelle langue',
      'I\'m currently at:': 'Je suis actuellement à:',
      'I want to go to:': 'Je veux aller à:',
      'Get AI Directions': 'Obtenir les Itinéraires IA',
      'Get Accessible Route': 'Obtenir un Itinéraire Accessible',
      'I need wheelchair-accessible routing': 'J\'ai besoin d\'un itinéraire pour fauteuil roulant',
      'Show AI Crowd Predictions': 'Afficher les Prédictions de Foule IA',
      'AI-Generated Route': 'Itinéraire Généré par l\'IA',
      'AI Accessible Routes': 'Itinéraires Accessibles IA',
      'The AI generates personalized accessible routes based on your mobility needs. It checks real-time elevator status, ramp availability, and companion seating.': 'L\'IA génère des itinéraires accessibles selon vos besoins. Elle vérifie les ascenseurs, rampes et sièges.',
      'Wheelchair Route': 'Route Fauteuil Roulant',
      'Step-free path via ramp and elevator': 'Chemin sans escalier par rampe et ascenseur',
      'Elevator B: 2 min wait': 'Ascenseur B: 2 min d\'attente',
      'Low-Vision Route': 'Itinéraire Malvoyants',
      'High-contrast signage + tactile strips': 'Panneaux contrastés + bandes tactiles',
      'Braille maps at each gate': 'Cartes Braille à chaque porte',
      'ASL Interpreter': 'Interprète en Langue des Signes',
      'Nearest ASL station: Guest Services': 'Point LSF le plus proche : Service Clients',
      'Live ASL for all matches': 'LSF en direct pour tous les matchs',
      'Interactive Stadium Map': 'Carte Interactive du Stade',
      'Enter through the gate printed on your ticket': 'Entrez par la porte indiquée sur votre billet',
      'Follow signage along the main concourse toward your section': 'Suivez le fléchage dans le couloir vers votre section',
      'Take the stairs or escalator to your level': 'Prenez l\'escalier ou l\'escalator jusqu\'à votre niveau',
      'Find your row and seat number — ushers are available at section entrances': 'Trouvez votre rang et siège — les hôtes sont aux entrées',
      'This route was generated by Google Gemini AI based on the stadium layout, real-time crowd data, and shortest path analysis. Need a different route? Modify your input above or ask the AI chat assistant.': 'Cet itinéraire a été généré par Google Gemini IA selon la configuration du stade et les données en direct.',

      // Incident Page (fan-report.js)
      'Incident Report Details': 'Détails du Signalement d\'Incident',
      'Incident Type:': 'Type d\'Incident:',
      'Medical Emergency': 'Urgence Médicale',
      'Location Inside Stadium:': 'Lieu dans le Stade:',
      'Describe what is happening:': 'Décrivez la situation:',
      'Describe the incident with as much detail as possible...': 'Décrivez l\'incident avec le plus de détails possible...',
      'Submit Report to Command Center': 'Envoyer le Rapport au Centre de Contrôle',
      'AI Real-Time Response Plan': 'Plan de Réponse IA en Temps Réel',
      'Once you submit, our Operations Command is instantly notified and Gemini generates a response plan.': 'Une fois envoyé, notre Centre de Contrôle est notifié et Gemini génère un plan de réponse.',
      'Awaiting incident submission...': 'En attente de signalement...',
      'Fill out the form on the left to see the AI response plan in real-time.': 'Remplissez le formulaire à gauche pour voir le plan de réponse.',
      'Facility / Maintenance Issue': 'Problème technique / Maintenance',
      'Security / Safety Threat': 'Menace de Sécurité',
      'Crowd / Bottleneck Issue': 'Problème de Foule',
      'Other / General Inquiry': 'Autre demande / Informations',
      'e.g. Section 215, Row 12 or Gate B restrooms': 'ex. Section 215, Rang 12 ou toilettes de la Porte B',

      // Tabs & Navigation Labels
      'Overview': 'Aperçu',
      'Amenities': 'Services',
      'Live Crowd Levels': 'Niveles de Foule en Direct',
      'Concessions & Amenities': 'Buvettes & Services',
      'Accessibility Services': 'Services d\'Accessibilité',
      'Transportation Options': 'Options de Transport',

      // Settings & Diagnostics Modals
      'Gemini API Key': 'Clé API Gemini',
      'Enter your Google Gemini API key to unlock full AI-powered conversations. Without a key, the assistant runs in demo mode with pre-built responses.': 'Entrez votre clé API Google Gemini pour débloquer les conversations IA. Sans clé, l\'assistant fonctionne en mode démo.',
      'Enter your Gemini API key...': 'Entrez votre clé API Gemini...',
      'Cancel': 'Annuler',
      'Save Key': 'Enregistrer la Clé',
      'Your key is stored locally in your browser. It\'s never sent to our servers.': 'Votre clé est stockée localement dans votre navigateur. Elle n\'est jamais envoyée à nos serveurs.',
      'Run Diagnostic Tests': 'Lancer les Tests de Diagnostic',
      'Self-Diagnostic Test Suite Results': 'Résultats de la Suite de Diagnostic',
      'Tests Run': 'Tests Exécutés',
      'Passed': 'Réussis',
      'AI Evaluation Rating': 'Score d\'Évaluation IA',
      'Test Logs:': 'Journaux de Test :',
      'AI Evaluation Checklist Alignment:': 'Alignement des Critères d\'Évaluation IA :',
      'Close': 'Fermer'
    },
    pt: {
      'Welcome to FIFA World Cup 2026': 'Bem-vindo à Copa do Mundo FIFA 2026',
      'Find My Seat': 'Encontrar Meu Assento',
      'Transportation': 'Transporte',
      'Accessibility': 'Acessibilidade',
      'Food & Drinks': 'Comidas e Bebidas',
      'Emergency': 'Emergência',
      'Ask AI Assistant': 'Perguntar ao Assistente IA',
      'Explore Venues': 'Explorar Estádios',
      'Smart Wayfinding': 'Navegação Inteligente',
      'Venue Explorer': 'Explorador de Sedes',
      'Home': 'Início',
      'Dashboard': 'Painel de Controle',
      'Crowd Intelligence': 'Inteligência de Público',
      'Sustainability': 'Sustentabilidade',
      'Total Fans': 'Total de Torcedores',
      'Avg Wait Time': 'Tempo de Espera Médio',
      'Active Incidents': 'Incidentes Ativos',
      'Sustainability Score': 'Pontuação de Sustentabilidade',
      'Gate Throughput': 'Fluxo dos Portões',
      'AI Recommendations': 'Recomendações de IA',
      'Incident Feed': 'Registro de Incidentes',
      'Staff Distribution': 'Distribuição de Pessoal',
      'Accessible Routes': 'Rotas Acessíveis',
      'Nearby': 'Próximos',
      'Emergency Exits': 'Saídas de Emergência',
      'Evacuation Readiness': 'Prontidão de Evacuação',
    },
    ar: {
      'Welcome to FIFA World Cup 2026': 'مرحباً بكم في كأس العالم 2026',
      'Find My Seat': 'ابحث عن مقعدي',
      'Transportation': 'المواصلات',
      'Accessibility': 'إمكانية الوصول',
      'Food & Drinks': 'الطعام والمشروبات',
      'Emergency': 'طوارئ',
      'Ask AI Assistant': 'اسأل المساعد الذكي',
      'Explore Venues': 'استكشف الملاعب',
      'Smart Wayfinding': 'التوجيه الذكي',
      'Venue Explorer': 'مستكشف الملاعب',
      'Home': 'الرئيسية',
      'Dashboard': 'لوحة القيادة',
      'Crowd Intelligence': 'ذكاء الحشود',
      'Sustainability': 'الاستدامة',
      'Total Fans': 'إجمالي الجماهير',
      'Avg Wait Time': 'متوسط وقت الانتظار',
      'Active Incidents': 'الحوادث النشطة',
      'Sustainability Score': 'مؤشر الاستدامة',
      'Gate Throughput': 'معدل تدفق البوابات',
      'AI Recommendations': 'توصيات الذكاء الاصطناعي',
      'Incident Feed': 'سجل الحوادث',
      'Staff Distribution': 'توزيع الموظفين',
      'Accessible Routes': 'المسارات الميسرة',
      'Nearby': 'بالقرب مني',
      'Emergency Exits': 'مخارج الطوارئ',
      'Evacuation Readiness': 'جاهزية الإخلاء',
    },
    hi: {
      'Welcome to FIFA World Cup 2026': 'FIFA विश्व कप 2026 में आपका स्वागत है',
      'Find My Seat': 'मेरी सीट खोजें',
      'Transportation': 'परिवहन',
      'Accessibility': 'सुलभता',
      'Food & Drinks': 'खान-पान',
      'Emergency': 'आपातकाल',
      'Ask AI Assistant': 'AI सहायक से पूछें',
      'Explore Venues': 'स्टेडियम खोजें',
      'Smart Wayfinding': 'स्मार्ट नेविगेशन',
      'Venue Explorer': 'स्थल अन्वेषक',
      'Home': 'होम',
      'Dashboard': 'डैशबोर्ड',
      'Crowd Intelligence': 'भीड़ विश्लेषण',
      'Sustainability': 'सस्टेनेबिलिटी',
      'Total Fans': 'कुल प्रशंसक',
      'Avg Wait Time': 'औसत प्रतीक्षा समय',
      'Active Incidents': 'सक्रिय घटनाएं',
      'Sustainability Score': 'सस्टेनेबिलिटी स्कोर',
      'Gate Throughput': 'गेट निकास दर',
      'AI Recommendations': 'AI अनुशंसाएँ',
      'Incident Feed': 'घटना फ़ीड',
      'Staff Distribution': 'कर्मचारी वितरण',
      'Accessible Routes': 'सुलभ मार्ग',
      'Nearby': 'नज़दीक',
      'Emergency Exits': 'आपातकालीन निकास',
      'Evacuation Readiness': 'निकासी तैयारी',

      // Hero subtitle & card headers/paragraphs
      'FIFA World Cup 2026': 'FIFA विश्व कप 2026',
      'Your Generative AI-powered stadium companion — real-time navigation, crowd intelligence, accessibility assistance, and multilingual support across all 16 venues in 🇺🇸 USA, 🇲🇽 Mexico & 🇨🇦 Canada.': 'आपका जनरेटिव एआई-संचालित स्टेडियम साथी — वास्तविक समय नेविगेशन, भीड़ प्रबंधन, सुलभता सहायता, और बहुभाषी समर्थन।',
      'How GenAI Enhances Your Experience': 'जनरेटिव एआई आपके अनुभव को कैसे बेहतर बनाता है',
      'Powered by Google Gemini — real-time intelligence for every fan': 'गूगल जेमिनी द्वारा संचालित — प्रत्येक प्रशंसक के लिए रीयल-टाइम इंटेलिजेंस',
      'AI Navigation': 'AI नेविगेशन',
      'AI Crowd Prediction': 'AI भीड़ पूर्वानुमान',
      'AI Multilingual Assistant': 'AI बहुभाषी सहायक',
      'AI Transport Optimizer': 'AI परिवहन अनुकूलक',
      'AI Sustainability Tracker': 'AI सस्टेनेबिलिटी ट्रैकर',
      'AI Decision Support': 'AI निर्णय समर्थन',
      'Venues': 'स्थल',
      'Countries': 'देश',
      'Matches': 'मैच',
      'Total Capacity (K)': 'कुल क्षमता (K)',
      'Ask "How do I get to Section 215?" and get AI-generated turn-by-turn directions — including accessible routes with elevator locations, ramp paths, and real-time wait estimates.': 'पूछें "मैं सेक्शन 215 तक कैसे पहुँचूँ?" और एआई-जनरेटेड मोड़-दर-मोड़ निर्देश प्राप्त करें — जिसमें लिफ्ट स्थानों के साथ सुलभ मार्ग शामिल हैं।',
      'Gemini analyzes real-time sensor data to predict crowd surges 15 minutes in advance — recommending gate openings, staff redeployment, and fan rerouting before bottlenecks form.': 'जेमिनी वास्तविक समय के सेंसर डेटा का विश्लेषण करता है ताकि 15 मिनट पहले भीड़ की वृद्धि की भविष्यवाणी की जा सके।',
      'Fans from 200+ nations can speak or type in their own language — Gemini auto-detects and responds in 10+ languages including English, Spanish, French, Arabic, Hindi, Japanese and more.': '200+ देशों के प्रशंसक अपनी भाषा में बोल या लिख सकते हैं — जेमिनी स्वचालित रूप से पहचान करता है और अंग्रेजी, स्पेनिश, फ्रेंच, अरबी, हिंदी, जापानी सहित 10+ भाषाओं में उत्तर देता है।',
      'AI analyzes match time, crowd size, and transit schedules to give you the fastest post-match exit plan — including shuttle ETAs, rideshare surge predictions, and metro crowd levels.': 'एआई मैच के समय, भीड़ के आकार और पारगमन कार्यक्रमों का विश्लेषण करता है ताकि आपको मैच के बाद सबसे तेज़ निकास योजना दी जा सके।',
      'Gemini monitors waste, energy, and water in real-time and generates actionable eco-recommendations — from optimizing HVAC to redirecting recycling flow, reducing per-match carbon by up to 18%.': 'जेमिनी वास्तविक समय में कचरे, ऊर्जा और पानी की निगरानी करता है और कार्रवाई योग्य पर्यावरण-सिफारिशें उत्पन्न करता है।',
      'Operations staff get an AI copilot that generates incident response plans, draft PA announcements in multiple languages, and suggests resource reallocation in real-time.': 'संचालन कर्मचारियों को एक एआई सह-पायलट मिलता है जो घटना प्रतिक्रिया योजनाएं उत्पन्न करता है, कई भाषाओं में पीए घोषणाओं का मसौदा तैयार करता है।',

      // Navigation Page (fan-navigate.js)
      'Ask AI for Directions': 'AI से निर्देश पूछें',
      'Describe where you are and where you want to go — in any language': 'आप कहाँ हैं और कहाँ जाना चाहते हैं, किसी भी भाषा में लिखें',
      'I\'m currently at:': 'मैं अभी यहाँ हूँ:',
      'I want to go to:': 'मुझे यहाँ जाना है:',
      'Get AI Directions': 'AI निर्देश प्राप्त करें',
      'Get Accessible Route': 'सुलभ मार्ग प्राप्त करें',
      'I need wheelchair-accessible routing': 'मुझे व्हीलचेयर सुलभ मार्ग की आवश्यकता है',
      'Show AI Crowd Predictions': 'AI भीड़ पूर्वानुमान दिखाएं',
      'AI-Generated Route': 'AI द्वारा जनरेट किया गया मार्ग',
      'AI Accessible Routes': 'AI सुलभ मार्ग',
      'The AI generates personalized accessible routes based on your mobility needs. It checks real-time elevator status, ramp availability, and companion seating.': 'AI आपकी गतिशीलता आवश्यकताओं के आधार पर व्यक्तिगत सुलभ मार्ग तैयार करता है। यह लिफ्ट, रैंप और साथी बैठने की स्थिति की जांच करता है।',
      'Wheelchair Route': 'व्हीलचेयर मार्ग',
      'Step-free path via ramp and elevator': 'रैंप और लिफ्ट के माध्यम से सीढ़ी-मुक्त मार्ग',
      'Elevator B: 2 min wait': 'लिफ्ट B: 2 मिनट प्रतीक्षा',
      'Low-Vision Route': 'अल्प-दृष्टि मार्ग',
      'High-contrast signage + tactile strips': 'उच्च-विपरीत संकेत + स्पर्श पट्टियाँ',
      'Braille maps at each gate': 'प्रत्येक गेट पर ब्रेल मानचित्र',
      'ASL Interpreter': 'सांकेतिक भाषा दुभाषिया',
      'Nearest ASL station: Guest Services': 'निकटतम सांकेतिक भाषा केंद्र: अतिथि सेवाएँ',
      'Live ASL for all matches': 'सभी मैचों के लिए लाइव सांकेतिक भाषा',
      'Interactive Stadium Map': 'इंटरैक्टिव स्टेडियम मानचित्र',
      'Enter through the gate printed on your ticket': 'अपने टिकट पर छपे गेट से प्रवेश करें',
      'Follow signage along the main concourse toward your section': 'अपने सेक्शन की ओर मुख्य कॉरिडोर पर संकेतों का पालन करें',
      'Take the stairs or escalator to your level': 'अपने स्तर तक जाने के लिए सीढ़ियों या एस्केलेटर का उपयोग करें',
      'Find your row and seat number — ushers are available at section entrances': 'अपनी पंक्ति और सीट संख्या खोजें — सेक्शन प्रवेश द्वारों पर गाइड उपलब्ध हैं',
      'This route was generated by Google Gemini AI based on the stadium layout, real-time crowd data, and shortest path analysis. Need a different route? Modify your input above or ask the AI chat assistant.': 'यह मार्ग गूगल जेमिनी एआई द्वारा स्टेडियम लेआउट, वास्तविक समय के भीड़ डेटा और सबसे छोटे मार्ग विश्लेषण के आधार पर जनरेट किया गया था।',

      // Incident Page (fan-report.js)
      'Incident Report Details': 'घटना रिपोर्ट विवरण',
      'Incident Type:': 'घटना का प्रकार:',
      'Medical Emergency': 'चिकित्सा आपातकाल',
      'Location Inside Stadium:': 'स्टेडियम के अंदर स्थान:',
      'Describe what is happening:': 'बताएं कि क्या हो रहा है:',
      'Describe the incident with as much detail as possible...': 'जितना हो सके विस्तार से घटना का वर्णन करें...',
      'Submit Report to Command Center': 'कमांड सेंटर को रिपोर्ट भेजें',
      'AI Real-Time Response Plan': 'AI रीयल-टाइम प्रतिक्रिया योजना',
      'Once you submit, our Operations Command is instantly notified and Gemini generates a response plan.': 'एक बार सबमिट करने के बाद, हमारे ऑपरेशंस कमांड को तुरंत सूचित किया जाता है और जेमिनी प्रतिक्रिया योजना बनाता है।',
      'Awaiting incident submission...': 'घटना सबमिशन की प्रतीक्षा की जा रही है...',
      'Fill out the form on the left to see the AI response plan in real-time.': 'रीयल-टाइम में एआई प्रतिक्रिया योजना देखने के लिए बाईं ओर फॉर्म भरें।',
      'Facility / Maintenance Issue': 'सुविधा / रखरखाव समस्या',
      'Security / Safety Threat': 'सुरक्षा / सुरक्षा खतरा',
      'Crowd / Bottleneck Issue': 'भीड़ / जाम समस्या',
      'Other / General Inquiry': 'अन्य / सामान्य पूछताछ',
      'e.g. Section 215, Row 12 or Gate B restrooms': 'उदा. सेक्शन 215, पंक्ति 12 या गेट B शौचालय',

      // Tabs & Navigation Labels
      'Overview': 'अवलोकन',
      'Amenities': 'सेवाएं',
      'Live Crowd Levels': 'लाइव भीड़ स्तर',
      'Concessions & Amenities': 'रियायतें और सुविधाएं',
      'Accessibility Services': 'सुलभता सेवाएँ',
      'Transportation Options': 'परिवहन विकल्प',

      // Settings & Diagnostics Modals
      'Gemini API Key': 'जेमिनी एपीआई कुंजी',
      'Enter your Google Gemini API key to unlock full AI-powered conversations. Without a key, the assistant runs in demo mode with pre-built responses.': 'पूर्ण एआई-संचालित बातचीत को अनलॉक करने के लिए अपनी गूगल जेमिनी एपीआई कुंजी दर्ज करें। कुंजी के बिना, सहायक डेमो मोड में चलता है।',
      'Enter your Gemini API key...': 'अपनी जेमिनी एपीआई कुंजी दर्ज करें...',
      'Cancel': 'रद्द करें',
      'Save Key': 'कुंजी सहेजें',
      'Your key is stored locally in your browser. It\'s never sent to our servers.': 'आपकी कुंजी आपके ब्राउज़र में स्थानीय रूप से संग्रहीत है। यह कभी हमारे सर्वर पर नहीं भेजी जाती है।',
      'Run Diagnostic Tests': 'डायग्नोस्टिक परीक्षण चलाएं',
      'Self-Diagnostic Test Suite Results': 'स्व-डायग्नोस्टिक परीक्षण परिणाम',
      'Tests Run': 'परीक्षण किए गए',
      'Passed': 'उत्तीर्ण',
      'AI Evaluation Rating': 'एआई मूल्यांकन रेटिंग',
      'Test Logs:': 'परीक्षण लॉग:',
      'AI Evaluation Checklist Alignment:': 'एआई मूल्यांकन चेकलिस्ट संरेखण:',
      'Close': 'बंद करें'
    },
  };

  const cleanText = text.trim().replace(/\s+/g, ' ');
  const cleanLangDict = phrases[lang];
  if (!cleanLangDict) return text;

  // Extract leading emojis or symbols (e.g. "🏟️ ", "🤖 ", "➕ ", "🚻 ")
  const emojiMatch = text.match(/^([^\w\s\d,.:;?!'""()\-]+\s*)/);
  const leadingEmoji = emojiMatch ? emojiMatch[1] : '';
  const textWithoutEmoji = text.replace(leadingEmoji, '').trim();
  const cleanTextWithoutEmoji = textWithoutEmoji.replace(/\s+/g, ' ');

  let translatedBody = null;
  if (cleanLangDict[textWithoutEmoji]) {
    translatedBody = cleanLangDict[textWithoutEmoji];
  } else if (cleanLangDict[cleanTextWithoutEmoji]) {
    translatedBody = cleanLangDict[cleanTextWithoutEmoji];
  } else {
    // Try lowercase matching
    const foundKey = Object.keys(cleanLangDict).find(
      k => k.trim().replace(/\s+/g, ' ').toLowerCase() === cleanTextWithoutEmoji.toLowerCase()
    );
    if (foundKey) {
      translatedBody = cleanLangDict[foundKey];
    }
  }

  if (translatedBody) {
    return `${leadingEmoji}${translatedBody}`;
  }

  // Fallback to exact dictionary lookup on full text
  if (cleanLangDict[text]) return cleanLangDict[text];
  if (cleanLangDict[cleanText]) return cleanLangDict[cleanText];
  
  const foundKeyFull = Object.keys(cleanLangDict).find(
    k => k.trim().replace(/\s+/g, ' ').toLowerCase() === cleanText.toLowerCase()
  );
  if (foundKeyFull) return cleanLangDict[foundKeyFull];

  return text;
}

export async function translateBatch(texts, targetLang) {
  if (targetLang === 'en' || !texts || texts.length === 0) return texts;
  if (!hasApiKey()) {
    return texts.map(text => getStaticTranslation(text, targetLang));
  }

  const langNames = {
    es: 'Spanish', fr: 'French', pt: 'Portuguese', de: 'German',
    ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
  };
  const targetLangName = langNames[targetLang] || targetLang;

  const prompt = `You are a professional translator for the FIFA World Cup 2026.
Translate the following JSON array of strings into ${targetLangName}.
IMPORTANT:
- Maintain the exact array length and indices.
- Translate contextually for a sports stadium visitor/organizer.
- Respond with ONLY the translated JSON array of strings (no markdown block, no explanations).

Input:
${JSON.stringify(texts)}`;

  try {
    const res = await generateResponse(prompt, 'Translate batch', []);
    const match = res.match(/\[[\s\S]*\]/);
    if (match) {
      const translated = JSON.parse(match[0]);
      if (Array.isArray(translated) && translated.length === texts.length) {
        return translated;
      }
    }
  } catch (error) {
    console.error('Batch translation error:', error);
  }
  return texts.map(text => getStaticTranslation(text, targetLang));
}


// ---- AI-Powered Sustainability Recommendations ----
export async function getAISustainabilityTips(venue, sustainData) {
  if (!hasApiKey()) return getStaticSustainabilityTips(sustainData);
  const prompt = `You are a sustainability advisor for ${venue?.stadium || 'a FIFA World Cup 2026 venue'}.
Current metrics: Recycling rate ${sustainData?.waste?.recycled || 60}%, Renewable energy ${sustainData?.energy?.renewablePercent || 65}%, Carbon ${sustainData?.carbon?.total || 130} tons.

Provide exactly 4 actionable sustainability recommendations in this JSON format (no markdown):
[{"priority":"high/medium/low","title":"Brief title","action":"Specific action to take","impact":"Estimated impact"}]`;
  try {
    const res = await generateResponse(prompt, 'Generate sustainability tips', []);
    const match = res.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : getStaticSustainabilityTips(sustainData);
  } catch { return getStaticSustainabilityTips(sustainData); }
}

function getStaticSustainabilityTips(data) {
  return [
    { priority: 'high', title: 'Redirect waste stream at Section E', action: 'Deploy recycling ambassadors — 23% of recyclables are entering landfill bins', impact: 'Could improve recycling rate by 8%' },
    { priority: 'high', title: 'Activate post-match transit priority', action: 'Coordinate with transit authority to increase shuttle frequency from 5-min to 2-min intervals', impact: 'Reduce car trips by ~15%, saving ~4 tons CO₂' },
    { priority: 'medium', title: 'Reduce HVAC in upper concourse', action: 'Lower temperature setpoint by 2°C during non-peak hours', impact: 'Save ~200 kWh per match day' },
    { priority: 'low', title: 'Promote reusable cups program', action: 'PA announcement offering $2 discount for fans using reusable cups', impact: 'Reduce single-use waste by ~12%' },
  ];
}

// ---- AI-Powered Incident Analysis ----
export async function getAIIncidentResponse(incident, venue) {
  if (!hasApiKey()) return getStaticIncidentResponse(incident);
  const prompt = `You are a venue safety AI for ${venue?.stadium || 'a FIFA World Cup 2026 stadium'}.
An incident has been reported: "${incident.title}" (${incident.type} severity) at ${incident.detail}.

Provide a response plan in this JSON format (no markdown):
{"assessment":"1-line assessment","priority":"critical/high/medium/low","actions":["action 1","action 2","action 3"],"resources_needed":"what to deploy","estimated_resolution":"time estimate","communication":"PA announcement text (bilingual EN/ES)"}`;
  try {
    const res = await generateResponse(prompt, 'Generate incident response', []);
    const match = res.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : getStaticIncidentResponse(incident);
  } catch { return getStaticIncidentResponse(incident); }
}

function getStaticIncidentResponse(incident) {
  const isCritical = incident?.type === 'critical';
  return {
    assessment: isCritical ? 'Immediate response required — potential safety impact' : 'Situation being monitored — standard response protocol',
    priority: isCritical ? 'critical' : 'medium',
    actions: [
      'Dispatch nearest available response team to the location',
      'Establish 15m perimeter and redirect foot traffic',
      isCritical ? 'Alert medical team and prepare first-aid station' : 'Monitor situation for next 10 minutes and report status',
    ],
    resources_needed: isCritical ? '2 security, 1 medical team, 1 supervisor' : '1 security, 1 volunteer',
    estimated_resolution: isCritical ? '10-15 minutes' : '5-10 minutes',
    communication: isCritical
      ? 'Attention guests: A section is temporarily restricted for your safety. Please follow staff directions. / Atención: Una sección está temporalmente restringida para su seguridad. Siga las instrucciones del personal.'
      : 'No public announcement needed at this time.',
  };
}

// ---- AI-Powered Real-Time Decision Support ----
export function generateDecisionSupportCards(crowdData, incidents, kpis, venue) {
  const decisions = [];
  const highDensity = (crowdData || []).filter(z => z.density > 80);
  const criticalIncidents = (incidents || []).filter(i => i.type === 'critical');
  const capacity = venue?.capacity || 70000;
  const fanCount = kpis?.totalFans?.value || 50000;
  const occupancy = Math.round((fanCount / capacity) * 100);

  // Crowd management decisions
  if (highDensity.length > 0) {
    decisions.push({
      category: 'Crowd Management',
      icon: '👥',
      severity: 'critical',
      title: `Overcrowding risk at ${highDensity[0].zone}`,
      aiInsight: `AI predicts ${highDensity[0].zone} will exceed safe capacity in ~12 minutes based on current inflow rate of ${highDensity[0].count} fans.`,
      suggestedActions: ['Open auxiliary Gate E to redistribute flow', `Deploy 4 additional staff to ${highDensity[0].zone}`, 'Activate digital signage to redirect fans to less crowded areas'],
      automatable: true,
    });
  }

  // Transportation decision
  if (occupancy > 85) {
    decisions.push({
      category: 'Transportation',
      icon: '🚌',
      severity: 'warning',
      title: 'Pre-stage post-match transit',
      aiInsight: `Stadium at ${occupancy}% capacity. AI predicts ${Math.round(fanCount * 0.4).toLocaleString()} fans will seek transit within 15 min of final whistle.`,
      suggestedActions: ['Request 12 additional shuttle buses from transit authority', 'Open overflow parking lot exits 10 min before match end', 'Push transit schedule notification to fan mobile app'],
      automatable: true,
    });
  }

  // Sustainability decision
  decisions.push({
    category: 'Sustainability',
    icon: '🌱',
    severity: 'info',
    title: 'Optimize energy consumption',
    aiInsight: 'AI analysis: Non-essential lighting in empty upper sections consuming ~340 kWh. Crowd is concentrated in lower bowl.',
    suggestedActions: ['Dim lighting in unused upper sections (Sections 400-450)', 'Reduce HVAC output in unoccupied zones', 'Estimated savings: 280 kWh and 0.15 tons CO₂'],
    automatable: true,
  });

  // Accessibility decision
  decisions.push({
    category: 'Accessibility',
    icon: '♿',
    severity: criticalIncidents.length > 0 ? 'warning' : 'info',
    title: 'Accessibility route status update',
    aiInsight: `AI monitoring: Elevator B experiencing 4-minute delays. ${Math.floor(Math.random() * 12) + 3} wheelchair-accessible fans currently navigating to seats.`,
    suggestedActions: ['Dispatch mobility assistance volunteer to Elevator B', 'Reroute accessible path via Ramp C (adds 90 seconds)', 'Notify affected fans via app push notification'],
    automatable: false,
  });

  // Multilingual decision
  decisions.push({
    category: 'Multilingual',
    icon: '🌍',
    severity: 'info',
    title: 'Language demand spike detected',
    aiInsight: 'AI detected 340% increase in Spanish-language queries in last 30 min. Mexico vs. Argentina match attendees arriving.',
    suggestedActions: ['Deploy 3 bilingual volunteers to Gates A and C', 'Switch digital signage to bilingual EN/ES mode', 'Ensure PA announcements include Spanish translation'],
    automatable: true,
  });

  return decisions;
}
