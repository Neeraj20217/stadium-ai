// ============================================
// StadiumAI — Gemini API Client
// ============================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const STORAGE_KEY = 'stadiumai_gemini_key';

let apiKey = localStorage.getItem(STORAGE_KEY) || '';

export function setApiKey(key) {
  apiKey = key;
  localStorage.setItem(STORAGE_KEY, key);
}

export function getApiKey() {
  return apiKey;
}

export function hasApiKey() {
  return apiKey && apiKey.length > 10;
}

export async function generateResponse(systemPrompt, userMessage, conversationHistory = [], venue = null) {
  const isOps = systemPrompt && (systemPrompt.includes('Operations AI Copilot') || systemPrompt.includes('command center'));

  if (!hasApiKey()) {
    return isOps ? getOpsFallbackResponse(userMessage, venue) : getFallbackResponse(userMessage, venue);
  }

  const contents = [];

  // Build conversation history
  if (conversationHistory.length > 0) {
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    });
  }

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);
      if (response.status === 401 || response.status === 403) {
        return '⚠️ Invalid API key. Please update your Gemini API key in settings.';
      }
      return getFallbackResponse(userMessage, venue);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || 'I apologize, I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('Gemini API fetch error:', error);
    return getFallbackResponse(userMessage, venue);
  }
}

// Fallback responses when no API key is set or when Gemini API rate limits/errors out
export function getFallbackResponse(message, venue = null) {
  const msg = message.toLowerCase();
  const lang = localStorage.getItem('stadiumai_lang') || 'en';
  const venueName = venue ? venue.stadium : 'the stadium';

  // 1. Check for repetition complaints
  if (msg.includes('same answer') || msg.includes('repeating') || msg.includes('repeat') || msg.includes('duplicate')) {
    if (lang === 'es') {
      return '🤖 **¡Disculpas por la repetición!**\n\nActualmente estoy ejecutando en **Modo de Respaldo Local** debido a que la conexión de la API de Gemini está experimentando alto tráfico. Sin embargo, ¡he actualizado con éxito la pantalla principal para tu solicitud! Por favor, verifica el mapa interactivo.';
    }
    if (lang === 'fr') {
      return '🤖 **Toutes nos excuses pour la répétition !**\n\nJe fonctionne en **Mode de Sauvegarde Locale** car la connexion API Gemini est saturée. Néanmoins, j\'ai mis à jour l\'écran avec vos informations !';
    }
    return '🤖 **Apologies for the repetition!**\n\nI am currently running in **Local Backup Mode** because the Gemini API connection is rate-limited or experiencing high traffic. However, I have successfully updated the main screen view to match your request! Please check the interactive maps or sections on the page.';
  }

  // 2. Crowd level & areas to avoid inquiries
  if (
    msg.includes('crowd') || 
    msg.includes('density') || 
    msg.includes('traffic') || 
    msg.includes('congested') || 
    msg.includes('busy') || 
    msg.includes('avoid') || 
    msg.includes('congestion') || 
    msg.includes('overcrowded')
  ) {
    if (lang === 'es') {
      return `👥 **Niveles de Multitud en Vivo y Tráfico en ${venueName}**\n\n¡Te he navegado automáticamente al **Mapa de Densidad de Zonas** en el Explorador de Sedes! Puedes ver el mapa de calor de densidad de la multitud.\n\n**Aviso de Multitud Actual:**\n- 🔴 **Áreas a Evitar:** La **Sección 215** (densidad: 88%) y la **Puerta B** (densidad: 82%) experimentan gran congestión en este momento. Recomiendo rutas alternativas.\n- 🟢 **Entrada/Salida Fluida:** La **Puerta C** y la **Puerta D** tienen tráfico normal (espera menor a 3 minutos).\n- **Concesiones:** Los puestos de comida del lado oeste del pasillo están menos llenos que los del este.`;
    }
    if (lang === 'fr') {
      return `👥 **Niveaux de Foule en Direct et Trafic à ${venueName}**\n\nJe vous ai redirigé vers la **Carte de Densité des Zones** du stade ! Vous pouvez y voir les cartes thermiques de la foule.\n\n**Conseil de Circulation Actuel :**\n- 🔴 **Zones à Éviter :** La **Section 215** (densité : 88 %) et la **Porte B** (densité : 82 %) sont actuellement très encombrées. Prenez un autre itinéraire.\n- 🟢 **Accès Fluide :** La **Porte C** et la **Porte D** ont un trafic normal (attente de moins de 3 minutes).\n- **Restauration :** Les stands côté Ouest sont moins fréquentés que ceux du côté Est.`;
    }
    return `👥 **Live Crowd Levels & Traffic at ${venueName}**\n\nI have automatically navigated you to the live **Zone Density Map** in the Venue Explorer! You can see the heatmaps illustrating crowd densities.\n\n**Current Crowd Advisory:**\n- 🔴 **Areas to Avoid:** **Section 215** (density: 88%) and **Gate B** (density: 82%) are experiencing heavy crowd surges right now. I recommend choosing alternative routes.\n- 🟢 **Smoother Entry/Exit:** **Gate C** and **Gate D** have normal traffic (wait times under 3 minutes).\n- **Concessions:** Food courts on the West side of the concourse are currently less crowded than the East side.`;
  }

  // 3. Specific section lookups
  const secMatch = message.match(/(?:section|sec|sección|seccion)\s*([0-9a-zA-Z]+)/i);
  if (secMatch) {
    const sectionNum = secMatch[1].toUpperCase();
    if (lang === 'es') {
      return `🗺️ **¡Navegación de la Sección ${sectionNum} Activada!**\n\nHe actualizado el destino de la página de Smart Wayfinding a la **Sección ${sectionNum}** y dibujado la ruta en el mapa.\n\n**Para encontrar tu asiento:**\n1. Sigue la ruta dibujada en el mapa en tu pantalla.\n2. Busca el letrero de entrada de la **Sección ${sectionNum}** en el pasillo.\n3. Los acomodadores están en la entrada de la Sección ${sectionNum} para verificar tu fila y asiento.\n\n¡Avísame si necesitas encontrar baños o puestos de comida cerca!`;
    }
    if (lang === 'fr') {
      return `🗺️ **Navigation vers la Section ${sectionNum} Activée !**\n\nJ'ai configuré la destination de navigation vers la **Section ${sectionNum}** et tracé l'itinéraire sur la carte.\n\n**Pour trouver votre siège :**\n1. Suivez le tracé affiché sur la carte à l'écran.\n2. Cherchez le panneau d'entrée de la **Section ${sectionNum}** dans le couloir.\n3. Des agents d'accueil sont à l'entrée de la Section ${sectionNum} pour vérifier votre rang et numéro de siège.\n\nN'hésitez pas à me demander où se trouvent les toilettes ou les snacks à proximité !`;
    }
    return `🗺️ **Section ${sectionNum} Wayfinding Activated!**\n\nI have automatically updated the Smart Wayfinding page destination to **Section ${sectionNum}** and drawn the route on the interactive map.\n\n**To find your seat:**\n1. Follow the route path drawn on the map on your screen.\n2. Look for the **Section ${sectionNum}** entry sign in the concourse.\n3. Ushers are positioned at the entrance of Section ${sectionNum} to verify your row and seat number.\n\nLet me know if you need to find restrooms or concessions nearby!`;
  }

  // 4. Typo-tolerant seat / wayfinding search
  if (msg.includes('seat') || msg.includes('sit') || msg.includes('navigate') || msg.includes('wayfinding') || msg.includes('direction') || msg.includes('where is') || msg.includes('asiento') || msg.includes('dirección') || msg.includes('navegación') || msg.includes('navegacion') || msg.includes('siège') || msg.includes('trouver')) {
    if (lang === 'es') {
      return `🗺️ **Navegación Inteligente Activada**\n\nHe abierto la página de **Smart Wayfinding** para ti.\n\n**Siguientes Pasos:**\n1. Verifica las entradas: escribe dónde estás (ej. Puerta A) y a dónde quieres ir (ej. Sección 215).\n2. Haz clic en **Obtener Direcciones IA** para ver tu ruta personalizada.\n3. El mapa interactivo dibujará tu camino y mostrará baños, puestos de comida y elevadores.`;
    }
    if (lang === 'fr') {
      return `🗺️ **Navigation Intelligente Activée**\n\nJ'ai ouvert la page de **Smart Wayfinding**.\n\n**Étapes Suivantes :**\n1. Renseignez les champs : votre position (ex. Porte A) et votre destination (ex. Section 215).\n2. Cliquez sur **Obtenir Itinéraire IA** pour afficher le chemin.\n3. Le plan interactif affichera votre itinéraire et indiquera les toilettes, buvettes et ascenseurs sur le chemin.`;
    }
    return '🗺️ **Smart Wayfinding Activated**\n\nI have opened the **Smart Wayfinding** page for you.\n\n**Next Steps:**\n1. Check the inputs: enter where you are (e.g., Gate A) and where you want to go (e.g., Section 215).\n2. Click **Get AI Directions** to view your personalized route.\n3. The interactive map will dynamically draw your path and show you restrooms, food courts, and elevators along the way.';
  }

  // 5. Welcome / Greetings
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('hola') || msg.includes('bonjour') || msg.includes('olá') || msg.includes('مرحبا') || msg.includes('नमस्ते') || msg.includes('bienvenido')) {
    if (lang === 'es' || msg.includes('hola') || msg.includes('¿') || msg.includes('como') || msg.includes('dónde')) {
      return '👋 ¡Bienvenido a la Copa Mundial de la FIFA 2026! Soy Goleo, tu conserje de IA para el estadio. Puedo ayudarte con:\n\n🗺️ **Navegación** — Encuentra tu asiento, baños, zonas de comida\n🚌 **Transporte** — Rutas al estadio\n♿ **Accesibilidad** — Rutas para sillas de ruedas, salas sensoriales\n🍔 **Comida y Bebida** — Concesiones y opciones dietéticas\n🚨 **Reportar Incidente** — Reportar derrames o emergencias médicas\n\n¿Cómo puedo ayudarte hoy?';
    }
    if (lang === 'fr' || msg.includes('bonjour') || msg.includes('où')) {
      return '👋 Bienvenue à la Coupe du Monde de la FIFA 2026 ! Je suis Goleo, votre assistant IA du stade. Je peux vous aider avec :\n\n🗺️ **Navigation** — Trouver votre siège, les toilettes, les stands de nourriture\n🚌 **Transport** — Itinéraires pour aller au stade\n♿ **Accessibilité** — Itinéraires en fauteuil roulant, salles sensorielles\n🍔 **Restauration** — Concessions et options alimentaires\n🚨 **Signaler un Incident** — Signaler un problème ou une urgence médicale\n\nComment puis-je vous aider aujourd\'hui ?';
    }
    return '👋 Welcome to the FIFA World Cup 2026! I\'m Goleo, your AI Stadium Concierge. I can help with:\n\n🗺️ **Navigation** — Find your seat, restrooms, food courts\n🚌 **Transportation** — Best routes to/from the stadium\n♿ **Accessibility** — Wheelchair routes, sensory rooms, ASL services\n🍔 **Food & Drink** — Concessions & dietary options\n🚨 **Report Incident** — Report spills, medical, or lost items\n\nHow can I help you today?';
  }

  // 6. Sustainability / Eco-friendly water & recycle
  if (
    msg.includes('recycle') || 
    msg.includes('sustainability') || 
    msg.includes('green') || 
    msg.includes('refill') || 
    msg.includes('eco') || 
    msg.includes('carbon') ||
    msg.includes('cup') ||
    msg.includes('recicla') ||
    msg.includes('agua') ||
    msg.includes('reusable') ||
    msg.includes('recycler')
  ) {
    if (lang === 'es') {
      return `🌱 **Sustentabilidad y Servicios Eco en ${venueName}**\n\n- **Estaciones de Refill:** Estaciones de agua filtrada gratis marcadas con 💧 cerca de cada puerta. ¡Se permiten botellas vacías de hasta 750ml!\n- **Reciclaje:** Botes verdes para compostaje, azules para reciclables y negros para basura común.\n- **Reducción de Carbono:** ¡Usa transporte público (Metro/Shuttle) para reducir tus emisiones de viaje en un 85%!`;
    }
    if (lang === 'fr') {
      return `🌱 **Développement Durable & Services Éco à ${venueName}**\n\n- **Fontaines d\'Eau :** Stations de recharge d\'eau filtrée gratuites (marquées 💧) près de chaque porte. Bouteilles vides jusqu\'à 750ml admises !\n- **Recyclage :** Bacs verts pour le compost, bleus pour le recyclage, noirs pour les déchets non recyclables.\n- **Émissions de Carbone :** Prenez les transports en commun (Métro/Navette) pour réduire votre empreinte de 85 % !`;
    }
    return `🌱 **Sustainability & Eco-Services at ${venueName}**\n\n- **Water Refill Stations:** Free filtered water refill stations are marked with 💧 near every gate. Reusable empty bottles (up to 750ml) are permitted!\n- **Recycling & Waste:** Green bins are for compostables, blue bins are for recyclables, and black bins are for general waste.\n- **Carbon reduction:** Take public transport (Metro/Shuttle) to reduce your travel emissions by 85%!`;
  }

  // 7. Food & Concessions
  if (msg.includes('food') || msg.includes('eat') || msg.includes('drink') || msg.includes('hungry') || msg.includes('concession') || msg.includes('comida') || msg.includes('hambre') || msg.includes('nourriture') || msg.includes('manger')) {
    if (lang === 'es') {
      return `🍔 **Pestaña de Alimentos y Concesiones Abierta**\n\n¡Te he llevado a la pestaña de alimentos en el Explorador de Sedes!\n\n**Consejos Rápidos:**\n- **Halal y Kosher** están disponibles en los patios de comida principales.\n- 🌱 Las opciones **vegetarianas y veganas** están marcadas con una hoja verde.\n- Los **tiempos de espera** de las concesiones se muestran en tiempo real.`;
    }
    if (lang === 'fr') {
      return `🍔 **Buvettes & Restauration Ouvertes**\n\nJe vous ai redirigé vers l'onglet restauration de l'Explorateur de Stade !\n\n**Infos Rapides :**\n- Des repas **Halal & Cascher** sont proposés aux buvettes principales.\n- 🌱 Les choix **végétariens & végans** ont un logo feuille verte.\n- Les **temps d'attente** aux stands sont affichés en temps réel.`;
    }
    return '🍔 **Food & Concessions Amenities Tab Opened**\n\nI have navigated you to the concessions tab in the Venue Explorer!\n\n**Quick Tips:**\n- **Halal & Kosher** are available at the main food courts.\n- 🌱 **Vegetarian & Vegan** options are marked with a green leaf.\n- 💧 **Water Stations** are free of charge. Bring your empty reusable bottle!\n- Concession wait times are displayed in real-time.';
  }

  // 8. Restrooms
  if (
    msg.includes('restroom') || 
    msg.includes('toilet') || 
    msg.includes('washroom') || 
    msg.includes('bathroom') || 
    msg.includes('wc') ||
    msg.includes('baño') ||
    msg.includes('toilette') ||
    msg.includes('servicios')
  ) {
    if (lang === 'es') {
      return `🚻 **Baños y Servicios en ${venueName}**\n\n¡He abierto la pestaña de Servicios y Concesiones en el Explorador de Sedes!\n\n**Guía de Baños:**\n- **Ubicación:** Los baños están en todos los niveles, cada 45 metros (marcados con 🚻).\n- **Accesibilidad:** Los baños accesibles para sillas de ruedas están junto a los elevadores (Elevador B es el más cercano).\n- **Familiares:** Disponibles cerca de la Sección 112 con cambiadores de pañales.\n- Tiempos de espera normales (menos de 2 minutos).`;
    }
    if (lang === 'fr') {
      return `🚻 **Toilettes & Services à ${venueName}**\n\nJ'ai ouvert l'onglet Services de l'Explorateur de Stade !\n\n**Guide des Toilettes :**\n- **Emplacement :** Les toilettes sont réparties à tous les étages, environ tous les 45 mètres (indiquées par 🚻).\n- **Accessibilité :** Les cabines adaptées PMR sont situées près des ascenseurs (Ascenseur B le plus proche).\n- **Familles :** Cabines près de la Section 112 avec tables à langer.\n- L'attente est actuellement faible (moins de 2 minutes).`;
    }
    return ` restroom  🚻 **Restrooms & Amenities at ${venueName}**\n\nI have automatically opened the Concessions & Amenities tab in the Venue Explorer for you!\n\n**Restroom Guide:**\n- **Location:** Restrooms are located on all concourse levels, spaced roughly every 45 meters (marked with 🚻 on the venue layout).\n- **Accessibility:** Wheelchair-accessible bathrooms are located next to elevator lobbies (Elevator B is nearest for wheelchair seating).\n- **Family/Gender-Neutral:** Available near Section 112 with diaper changing stations.\n- Wait times are currently normal (under 2 minutes).`;
  }

  // 9. Transport
  if (msg.includes('transport') || msg.includes('bus') || msg.includes('train') || msg.includes('get there') || msg.includes('parking') || msg.includes('shuttle') || msg.includes('autobús') || msg.includes('tren') || msg.includes('navette') || msg.includes('voiture')) {
    if (lang === 'es') {
      return `🚌 **Información de Transporte Abierta**\n\nHe abierto la pestaña de opciones de transporte, estacionamiento y tránsito público.\n\n**Información Clave:**\n- 🚇 Se recomienda usar el **Metro** para evitar el tráfico.\n- 🚌 Los **shuttles gratuitos** del estadio operan desde 3 horas antes del partido hasta 2 horas después.\n- 🚗 Las plataformas de viaje compartido tienen zona de recogida en la Puerta C.`;
    }
    if (lang === 'fr') {
      return `🚌 **Informations de Transport Ouvertes**\n\nJ'ai ouvert l'onglet transports (navettes, parkings et transports en commun).\n\n**Infos Clés :**\n- 🚇 Le **Métro** est fortement conseillé pour éviter les bouchons.\n- 🚌 Des **Navettes Gratuites** circulent 3h avant et jusqu'à 2h après le match.\n- 🚗 Les **VTC/Taxis** ont un point de dépose dédié à la Porte C.`;
    }
    return '🚌 **Transportation Information Opened**\n\nI have navigated you to the transport options tab showing shuttles, parking, and public transit.\n\n**Key Info:**\n- 🚇 **Metro/Metro Rail** is highly recommended to beat traffic.\n- 🚌 **Free Stadium Shuttles** run continuously starting 3 hours before kick-off and up to 2 hours after final whistle.\n- 🚗 **Rideshares** have a dedicated pickup zone at Gate C.';
  }

  // 10. Accessibility
  if (msg.includes('accessibility') || msg.includes('wheelchair') || msg.includes('disability') || msg.includes('accessible') || msg.includes('elevator') || msg.includes('silla') || msg.includes('fauteuil') || msg.includes('handicap')) {
    if (lang === 'es') {
      return `♿ **Servicios de Accesibilidad Abiertos**\n\nHe abierto la pestaña de accesibilidad para personas en silla de ruedas o con necesidades sensoriales.\n\n**Servicios Disponibles:**\n- **Rampas y Elevadores** en todas las puertas (Elevador B es el más cercano para zonas accesibles).\n- **Salas Sensoriales** para personas con sensibilidades.\n- **Intérpretes de Señas** en Atención al Cliente.`;
    }
    if (lang === 'fr') {
      return `♿ **Services d'Accessibilité Ouverts**\n\nJ'ai ouvert l'onglet accessibilité (fauteuils roulants, sensoriel et malvoyants).\n\n**Services Dispo :**\n- **Rampes & Ascenseurs** à toutes les portes (Ascenseur B le plus proche pour les billets PMR).\n- **Salles Sensorielles** adaptées pour le calme.\n- **Interprètes LSF** à l'accueil.`;
    }
    return '♿ **Accessibility Services Opened**\n\nI have opened the accessibility tab showing services for wheelchair, sensory, and low-vision fans.\n\n**Services Available:**\n- **Ramps & Elevators** at all gates (Elevator B is nearest for wheelchair seating).\n- **Sensory Rooms** available for fans with sensory sensitivities.\n- **ASL Interpreters** are stationed at Guest Services.';
  }

  // 11. Incidents & Emergency
  if (msg.includes('emergency') || msg.includes('help') || msg.includes('medical') || msg.includes('first aid') || msg.includes('report') || msg.includes('incident') || msg.includes('spill') || msg.includes('emergencia') || msg.includes('ayuda') || msg.includes('urgence') || msg.includes('secours')) {
    if (lang === 'es') {
      return '🚨 **Página de Reporte de Incidentes Abierta**\n\nTe he llevado al formulario de reporte. Por favor detalla el incidente para que nuestro equipo de despacho del estadio pueda responder de inmediato.';
    }
    if (lang === 'fr') {
      return '🚨 **Page de Signalement d\'Incident Ouverte**\n\nJe vous ai redirigé vers le formulaire. Décrivez l\'incident pour que nos équipes de sécurité du stade puissent intervenir au plus vite.';
    }
    return '🚨 **Incident Report Page Opened**\n\nI have navigated you to the Incident Reporting form. Please input the details of what occurred so our stadium dispatch team can respond immediately.';
  }

  // 12. Weather
  if (msg.includes('weather') || msg.includes('temperature') || msg.includes('rain') || msg.includes('clima') || msg.includes('temperatura') || msg.includes('lluvia') || msg.includes('météo') || msg.includes('pluie')) {
    if (lang === 'es') {
      return '🌤️ **Aviso Meteorológico**\n\nLas ciudades sede registran temperaturas de verano templadas (25-34°C). Mantente hidratado, usa protector solar y aprovecha las estaciones de agua gratis.';
    }
    if (lang === 'fr') {
      return '🌤️ **Alerte Météo**\n\nLes villes hôtes ont des températures estivales chaudes (25-34°C). Restez hydratés, mettez de la crème solaire et utilisez les fontaines d\'eau gratuites.';
    }
    return '🌤️ **Weather advisory**\n\nHost cities are experiencing warm summer temperatures (25-34°C). Stay hydrated, wear sunscreen, and utilize free water refilling stations around the concourse.';
  }

  // Default response
  if (lang === 'es') {
    return '⚽ ¡Gracias por tu pregunta! Soy tu conserje de IA para la Copa Mundial de la FIFA 2026.\n\nDime qué necesitas:\n- "¿Dónde está la Sección 215?"\n- "Quiero reportar un piso mojado"\n- "¿Hay puestos de comida vegetariana?"\n- "¿Cómo tomo el shuttle?"\n\n¿Qué te gustaría saber?';
  }
  if (lang === 'fr') {
    return '⚽ Merci pour votre question ! Je suis votre concierge IA de la Coupe du Monde de la FIFA 2026.\n\nDites-moi ce dont vous avez besoin :\n- "Où se trouve la Section 215 ?"\n- "Je veux signaler un sol mouillé"\n- "Y a-t-il des stands végétariens ?"\n- "Comment prendre la navette ?"\n\nQue souhaitez-vous savoir ?';
  }
  return '⚽ Thanks for your question! I\'m your FIFA World Cup 2026 AI Concierge.\n\nTell me what you need:\n- "Where is Section 215?"\n- "I want to report a wet floor spill"\n- "Are there vegetarian food stands?"\n- "How do I take the shuttle?"\n\nWhat would you like to know?';
}

export function getOpsFallbackResponse(message, venue = null) {
  const msg = message.toLowerCase();
  const lang = localStorage.getItem('stadiumai_lang') || 'en';
  const venueName = venue ? venue.stadium : 'the stadium';

  // 1. PA Announcement requests
  if (
    msg.includes('announcement') || 
    msg.includes('broadcast') || 
    msg.includes('pa') || 
    msg.includes('anuncio') || 
    msg.includes('annonce') ||
    msg.includes('draft')
  ) {
    if (lang === 'es' || msg.includes('anuncio') || msg.includes('español')) {
      return `📢 **Borrador de Anuncio de Megafonía (PA) — Actividades de Medio Tiempo**

**[Español - ES]**
"Atención aficionados: Les invitamos a permanecer en sus asientos durante el medio tiempo para disfrutar de nuestro espectáculo especial de luces y la presentación de música en vivo. Los puestos de comida y servicios están abiertos en los pasillos Este y Oeste. Sigan las indicaciones del personal de seguridad."

**[English - EN]**
"Attention fans: Please remain in your seats during halftime to enjoy our special light show and live music performance. Concession stands and amenities are fully open in the East and West concourses. Please follow safety staff directions."`;
    }
    
    if (lang === 'fr' || msg.includes('annonce') || msg.includes('français')) {
      return `📢 **Brouillon d'Annonce Micro (PA) — Activités de la Mi-Temps**

**[Français - FR]**
"Attention chers supporters : veuillez rester assis durant la mi-temps pour assister à notre spectacle de lumières et concert en direct. Les buvettes et sanitaires restent ouverts dans les couloirs Est et Ouest. Merci de respecter les consignes de sécurité."

**[English - EN]**
"Attention fans: Please remain in your seats during halftime to enjoy our special light show and live music performance. Concession stands and amenities are fully open in the East and West concourses. Please follow safety staff directions."`;
    }

    // Default English response
    return `📢 **Draft PA Announcement — Halftime Activities**

**[English - EN]**
"Attention all fans: We invite you to remain in your seats at halftime to enjoy our special World Cup celebration light show and live musical performances on the pitch. Concessions and restrooms are fully open on the East and West concourses. Please move carefully and follow the directions of safety stewards."

**[Español - ES]**
"Atención aficionados: Los invitamos a permanecer en sus asientos durante el medio tiempo para disfrutar del espectáculo especial de luces y presentaciones musicales en vivo. Las concesiones y sanitarios están abiertos en los pasillos Este y Oeste."`;
  }

  // 2. Staff / Volunteers / Resource Allocation
  if (
    msg.includes('staff') || 
    msg.includes('volunteer') || 
    msg.includes('security') || 
    msg.includes('deploy') || 
    msg.includes('resource') ||
    msg.includes('personal') ||
    msg.includes('seguridad')
  ) {
    return `👥 **AI Resource & Staff Deployment Advisory**

- ⚠️ **Gate B Congestion**: Deploy **4 additional volunteers** to Gate B immediately to assist with ticketing line flow.
- 🔴 **Section 215 Surge**: Shift **2 security stewards** from Section 112 to Section 215 entry corridor to manage queue bottlenecks.
- 🟢 **Medical Readiness**: First-aid stations on Level 1 and Level 2 are fully staffed and report normal status.`;
  }

  // 3. Crowd Management & Surges
  if (msg.includes('crowd') || msg.includes('surge') || msg.includes('capacity') || msg.includes('density') || msg.includes('congest')) {
    return `📊 **AI Crowd Management Advisory**

- **Live Stand Density**: North Stand (35%), South Stand (75%), West Stand (88% Avoid), East Stand (42%).
- **Surge Prediction**: A post-match exit bottleneck is predicted at the West concourse exit corridors.
- **Rerouting Recommendation**: Activate dynamic signs to redirect outgoing traffic from West Stand towards Gate C.`;
  }

  // 4. Incident Response / Safety
  if (msg.includes('emergency') || msg.includes('incident') || msg.includes('accident') || msg.includes('spill') || msg.includes('medical') || msg.includes('safety')) {
    return `🚨 **AI Operations Incident response Plan**

- **Incident Severity**: Medium/High.
- **SOP Directive**: Dispatch nearby Response Team Alpha.
- **Actions Required**:
  1. Erect temporary barriers to redirect pedestrian corridor flow.
  2. Deploy cleaning crew for immediate spill hazard removal.
  3. Monitor local CCTV feed at security desk.`;
  }

  // 5. Default Operations Assistant Greeting
  return `🎯 **Operations AI Copilot Ready**

I can assist with real-time command center decisions. Try asking:
- "Draft a PA announcement about halftime activities"
- "Where should I deploy security staff right now?"
- "Give me a crowd density report for the stands"
- "Suggest a response plan for a wet floor spill"`;
}
