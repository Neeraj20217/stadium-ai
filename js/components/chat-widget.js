// ============================================
// StadiumAI — Chat Widget Component
// ============================================

import { askFanAssistant } from '../ai/fan-assistant.js';
import { askOpsCopilot } from '../ai/ops-copilot.js';
import { hasApiKey } from '../ai/gemini-client.js';
import { getCurrentLanguage } from '../utils/translator.js';
import { navigateTo } from '../utils/router.js';

const langMap = {
  en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese', de: 'German',
  ja: 'Japanese', ko: 'Korean', zh: 'Chinese', ar: 'Arabic', hi: 'Hindi'
};

let chatOpen = false;
let chatMessages = [];
let currentMode = 'fan'; // 'fan' or 'ops'
let venueRef = null;
let crowdDataRef = null;
let incidentsRef = null;
let kpisRef = null;

export function setChatMode(mode) {
  currentMode = mode;
  chatMessages = [];
  const container = document.getElementById('chat-messages');
  if (container) {
    container.innerHTML = '';
    addBotMessage(getWelcomeMessage());
  }

  const titleEl = document.getElementById('chat-title');
  if (titleEl) {
    titleEl.textContent = mode === 'ops' ? 'Ops Copilot' : 'Goleo AI';
  }

  const inputEl = document.getElementById('chat-input');
  if (inputEl) {
    inputEl.placeholder = mode === 'ops' ? 'Ask the copilot...' : 'Ask me anything...';
  }
}

export function setChatContext(venue, crowdData, incidents, kpis) {
  venueRef = venue;
  crowdDataRef = crowdData;
  incidentsRef = incidents;
  kpisRef = kpis;
}

function getWelcomeMessage() {
  const lang = getCurrentLanguage();
  if (currentMode === 'ops') {
    if (lang === 'es') {
      return '🎯 **Copiloto de Operaciones Activo**\n\nPuedo ayudarte con:\n• Análisis y predicciones de densidad de multitudes\n• Recomendaciones de respuesta a incidentes\n• Sugerencias de asignación de recursos\n• Información de sustentabilidad\n• Borradores de anuncios públicos\n\n¿Qué necesitas?';
    }
    if (lang === 'fr') {
      return '🎯 **Copilote des Opérations Actif**\n\nJe peux vous aider pour :\n• Analyse et prédictions de la densité de la foule\n• Recommandations de réponse aux incidents\n• Suggestions d\'allocation des ressources\n• Informations sur le développement durable\n• Brouillons d\'annonces publiques\n\nDe quoi avez-vous besoin ?';
    }
    return '🎯 **Operations Copilot Active**\n\nI can help you with:\n• Crowd density analysis & predictions\n• Incident response recommendations\n• Resource allocation suggestions\n• Sustainability insights\n• Draft PA announcements\n\nWhat do you need?';
  }

  if (lang === 'es') {
    return '👋 **¡Bienvenido a la Copa Mundial de la FIFA 2026!**\n\n¡Soy Goleo, tu Asistente de Estadio de IA! Puedo ayudarte con:\n• 🗺️ Encontrar tu asiento\n• 🚌 Opciones de transporte\n• ♿ Servicios de accesibilidad\n• 🍔 Recomendaciones de comida y bebida\n• 🌍 Soporte multilingüe\n\n¿Cómo puedo ayudarte hoy?';
  }
  if (lang === 'fr') {
    return '👋 **Bienvenue à la Coupe du Monde de la FIFA 2026 !**\n\nJe suis Goleo, votre assistant IA du stade ! Je peux vous aider avec :\n• 🗺️ Trouver votre siège\n• 🚌 Options de transport\n• ♿ Services d\'accessibilité\n• 🍔 Recommandations de restauration\n• 🌍 Support multilingue\n\nComment puis-je vous aider aujourd\'hui ?';
  }
  return '👋 **Welcome to FIFA World Cup 2026!**\n\nI\'m Goleo, your AI Stadium Assistant! I can help with:\n• 🗺️ Finding your seat\n• 🚌 Transportation options\n• ♿ Accessibility services\n• 🍔 Food & drink recommendations\n• 🌍 Multilingual support\n\nHow can I help you today?';
}

export function renderChatWidget() {
  // Floating Action Button
  const fab = document.createElement('button');
  fab.id = 'chat-fab';
  fab.className = 'chat-fab';
  fab.innerHTML = '💬';
  fab.setAttribute('aria-label', 'Open AI Chat');
  fab.addEventListener('click', toggleChat);

  // Chat Panel
  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'chat-panel';
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-avatar">⚽</div>
      <div class="chat-info">
        <div class="chat-name" id="chat-title">${currentMode === 'ops' ? 'Ops Copilot' : 'Goleo AI'}</div>
        <div class="chat-status">${hasApiKey() ? 'AI Powered' : 'Demo Mode'}</div>
      </div>
      <button class="btn btn-ghost btn-icon" id="chat-close" aria-label="Close chat">✕</button>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="chat-input-area">
      <input type="text" class="chat-input" id="chat-input" placeholder="${currentMode === 'ops' ? 'Ask the copilot...' : 'Ask me anything...'}" autocomplete="off" />
      <button class="chat-send-btn" id="chat-send" aria-label="Send message">➤</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  // Event listeners
  document.getElementById('chat-close').addEventListener('click', toggleChat);
  document.getElementById('chat-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Add welcome message
  addBotMessage(getWelcomeMessage());
}

function toggleChat() {
  chatOpen = !chatOpen;
  const fab = document.getElementById('chat-fab');
  const panel = document.getElementById('chat-panel');
  if (fab) fab.classList.toggle('open', chatOpen);
  if (panel) panel.classList.toggle('open', chatOpen);
  if (chatOpen) {
    setTimeout(() => document.getElementById('chat-input')?.focus(), 300);
  }
}

function addBotMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = 'chat-msg bot';
  msg.innerHTML = formatMessage(text) + `<div class="msg-time">${getTimeString()}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  chatMessages.push({ role: 'bot', text });
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = 'chat-msg user';
  msg.innerHTML = formatMessage(text) + `<div class="msg-time">${getTimeString()}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  chatMessages.push({ role: 'user', text });
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.id = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('chat-typing');
  if (typing) typing.remove();
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text) return;

  const lowerText = text.toLowerCase();

  input.value = '';
  addUserMessage(text);
  showTypingIndicator();

  // Auto-detect typed language and switch app language accordingly
  let detectedLang = null;
  if (lowerText.includes('¿') || lowerText.includes('hola') || lowerText.includes('dónde') || lowerText.includes('donde') || lowerText.includes('silla de ruedas') || lowerText.includes('gracias')) {
    detectedLang = 'es';
  } else if (lowerText.includes('bonjour') || lowerText.includes('où est') || lowerText.includes('fauteuil roulant') || lowerText.includes('merci')) {
    detectedLang = 'fr';
  } else if (lowerText.includes('olá') || lowerText.includes('onde está') || lowerText.includes('cadeira de rodas') || lowerText.includes('obrigado')) {
    detectedLang = 'pt';
  } else if (lowerText.includes('مرحبا') || lowerText.includes('أين') || lowerText.includes('كرسي متحرك') || lowerText.includes('شكرا')) {
    detectedLang = 'ar';
  } else if (lowerText.includes('नमस्ते') || lowerText.includes('कहाँ') || lowerText.includes('व्हीलचेयर') || lowerText.includes('धन्यवाद')) {
    detectedLang = 'hi';
  }

  if (detectedLang) {
    const selector = document.getElementById('lang-selector');
    if (selector && selector.value !== detectedLang) {
      selector.value = detectedLang;
      selector.dispatchEvent(new Event('change'));
    }
  }

  // Intent-driven Auto Routing
  let intentMessage = '';

  // 1. Prioritize Emergency & Incident Reports (so "incident response plan at Section 100" doesn't match Wayfinding)
  if (
    lowerText.includes('report') || 
    lowerText.includes('incident') || 
    lowerText.includes('emergency') || 
    lowerText.includes('accident') || 
    lowerText.includes('spill') || 
    lowerText.includes('medical') || 
    lowerText.includes('hurt') || 
    lowerText.includes('lost')
  ) {
    if (currentMode === 'ops') {
      intentMessage = '🚨 **Operations Incident Command**: I have navigated you to the Command Center dashboard so you can deploy response playbooks and assign dispatch teams.';
      navigateTo('/ops');
    } else {
      intentMessage = '🚨 **Incident Report Opened**: I have opened the Incident Report page. Please submit the form so our Command Center can assist you immediately.';
      navigateTo('/fan/report');
    }

  // 2. Crowd Levels & Density heatmap routing
  } else if (
    lowerText.includes('crowd') || 
    lowerText.includes('density') || 
    lowerText.includes('traffic') || 
    lowerText.includes('congested') || 
    lowerText.includes('busy') || 
    lowerText.includes('avoid') || 
    lowerText.includes('congestion') || 
    lowerText.includes('overcrowded')
  ) {
    if (currentMode === 'ops') {
      intentMessage = '👥 **Crowd Intelligence Opened**: I have navigated you to the Crowd Intelligence dashboard where you can monitor real-time zone densities and gate performances.';
      navigateTo('/ops/crowd');
    } else {
      intentMessage = '🏟️ **Venue Explorer (Overview) Opened**: I have navigated you to the Venue Explorer showing the live Zone Density Map heatmap so you can identify crowded stands.';
      navigateTo(`/fan/venue/${venueRef?.id || 'new-york'}`);
      setTimeout(() => {
        document.querySelector('[data-tab="overview"]')?.click();
      }, 450);
    }

  // 3. Sustainability, Recycling & Reusable Cups
  } else if (
    lowerText.includes('recycle') || 
    lowerText.includes('sustainability') || 
    lowerText.includes('green') || 
    lowerText.includes('refill') || 
    lowerText.includes('eco') || 
    lowerText.includes('carbon')
  ) {
    if (currentMode === 'ops') {
      intentMessage = '🌱 **Sustainability Dashboard Opened**: I have navigated you to the Operations Sustainability dashboard to monitor carbon stats and energy savings.';
      navigateTo('/ops/sustainability');
    } else {
      intentMessage = '🌱 **Sustainability Advice**: I have navigated you to the Venue Explorer. Bring your empty reusable water bottle to use the free water refill stations. Recycling bins are located near all concession zones.';
      navigateTo(`/fan/venue/${venueRef?.id || 'new-york'}`);
      setTimeout(() => {
        document.querySelector('[data-tab="overview"]')?.click();
      }, 450);
    }

  // 4. Live Matches & Standings
  } else if (
    lowerText.includes('match') || 
    lowerText.includes('score') || 
    lowerText.includes('schedule') || 
    lowerText.includes('group') || 
    lowerText.includes('standing') || 
    lowerText.includes('game')
  ) {
    intentMessage = '⚽ **Live Matches & Standings Opened**: I have returned you to the Home screen where you can view today\'s schedules, scores, group stages, and stadium details.';
    navigateTo('/fan');

  // 5. Wayfinding (Word Boundary check to avoid matching "transit" with "sit")
  } else if (
    lowerText.includes('navigate') || 
    /\bseats?\b/i.test(text) || 
    /\bsit\b/i.test(text) || 
    /\bsections?\b/i.test(text) || 
    lowerText.includes('wayfinding') || 
    /\bmaps?\b/i.test(text) || 
    /\bgates?\b/i.test(text) || 
    lowerText.includes('direction') ||
    lowerText.includes('where is')
  ) {
    intentMessage = '🌐 **Smart Wayfinding Opened**: I have opened the Smart Wayfinding page for you. You can see the interactive stadium map and get turn-by-turn directions.';
    navigateTo('/fan/navigate');
    
    // Parse possible section or gate details to prefill fields
    setTimeout(() => {
      const secMatch = text.match(/(?:section|sec)\s*([0-9a-zA-Z]+)/i);
      const gateMatch = text.match(/(?:gate)\s*([0-9a-zA-Z]+)/i);
      
      const toInput = document.getElementById('nav-to');
      const fromInput = document.getElementById('nav-from');
      
      if (secMatch && toInput) {
        toInput.value = `Section ${secMatch[1].toUpperCase()}`;
      }
      if (gateMatch && fromInput) {
        fromInput.value = `Gate ${gateMatch[1].toUpperCase()}`;
      }
      
      // Auto-trigger directions calculation if fields are present
      if (toInput || fromInput) {
        document.getElementById('btn-get-directions')?.click();
      }
    }, 450);

  // 6. Food, Restrooms & Concessions
  } else if (
    lowerText.includes('food') || 
    lowerText.includes('eat') || 
    lowerText.includes('drink') || 
    lowerText.includes('concession') || 
    lowerText.includes('hungry') || 
    lowerText.includes('restaurant') || 
    lowerText.includes('beer') ||
    lowerText.includes('restroom') ||
    lowerText.includes('toilet') ||
    lowerText.includes('washroom') ||
    lowerText.includes('bathroom') ||
    lowerText.includes('wc')
  ) {
    intentMessage = '🍔 **Amenities & Restrooms Opened**: I have opened the Venue Explorer and selected the Concessions & Amenities tab so you can find restrooms and food stands near you.';
    navigateTo(`/fan/venue/${venueRef?.id || 'new-york'}`);
    setTimeout(() => {
      document.querySelector('[data-tab="amenities"]')?.click();
    }, 450);

  // 7. Accessibility Options
  } else if (
    lowerText.includes('accessibility') || 
    lowerText.includes('wheelchair') || 
    lowerText.includes('sensory') || 
    lowerText.includes('asl') || 
    lowerText.includes('disabled') || 
    lowerText.includes('elevator')
  ) {
    intentMessage = '♿ **Accessibility Tab Opened**: I have opened the Venue Explorer accessibility services tab. Here you can see wheelchair routes and sensory rooms.';
    navigateTo(`/fan/venue/${venueRef?.id || 'new-york'}`);
    setTimeout(() => {
      document.querySelector('[data-tab="accessibility"]')?.click();
    }, 450);

  // 8. General Transport Options
  } else if (
    lowerText.includes('transport') || 
    lowerText.includes('bus') || 
    lowerText.includes('train') || 
    lowerText.includes('metro') || 
    lowerText.includes('parking') || 
    lowerText.includes('shuttle') || 
    lowerText.includes('taxi')
  ) {
    intentMessage = '🚌 **Transport Tab Opened**: I have opened the Venue Explorer transportation tab showing bus schedules, shuttle ETAs, and parking details.';
    navigateTo(`/fan/venue/${venueRef?.id || 'new-york'}`);
    setTimeout(() => {
      document.querySelector('[data-tab="transport"]')?.click();
    }, 450);
  }

  try {
    let response;
    const history = chatMessages.slice(-10); // Last 10 messages for context

    if (currentMode === 'ops') {
      response = await askOpsCopilot(text, venueRef, crowdDataRef, incidentsRef, kpisRef, history);
    } else {
      const currentLang = getCurrentLanguage();
      const languageName = langMap[currentLang] || 'English';
      response = await askFanAssistant(text, venueRef, history, languageName);
    }

    if (intentMessage) {
      response = `${intentMessage}\n\n${response}`;
    }

    removeTypingIndicator();
    addBotMessage(response);
  } catch (error) {
    removeTypingIndicator();
    addBotMessage('⚠️ Sorry, I encountered an error. Please try again.');
    console.error('Chat error:', error);
  }
}

// Simple markdown-like formatting
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMessage(text) {
  const escaped = escapeHTML(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)/gm, '• $1')
    .replace(/^(\d+)\. (.+)/gm, '$1. $2')
    .replace(/\n/g, '<br>');
}

function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function openChatWithPrefill(text, mode = 'ops') {
  if (currentMode !== mode) {
    setChatMode(mode);
  }
  const panel = document.getElementById('chat-panel');
  if (panel && !panel.classList.contains('open')) {
    toggleChat();
  }
  const inputEl = document.getElementById('chat-input');
  if (inputEl) {
    inputEl.value = text;
    inputEl.focus();
  }
}
