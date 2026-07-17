// ============================================
// StadiumAI — Main Application Entry
// ============================================

import { registerRoute, initRouter, navigateTo, getCurrentRoute, renderCurrentRoute } from './utils/router.js';
import { renderChatWidget, setChatMode, setChatContext } from './components/chat-widget.js';
import { setCurrentLanguage, getCurrentLanguage, translateElement, startTranslationObserver } from './utils/translator.js';
import { renderFanHome } from './pages/fan-home.js';
import { renderFanVenue } from './pages/fan-venue.js';
import { renderFanNavigate } from './pages/fan-navigate.js';
import { renderFanReport } from './pages/fan-report.js';
import { renderOpsDashboard } from './pages/ops-dashboard.js';
import { renderOpsCrowd } from './pages/ops-crowd.js';
import { renderOpsSustainability } from './pages/ops-sustainability.js';
import { venues, getVenueById } from './data/venues.js';
import { showDiagnosticsOverlay } from './utils/diagnostics.js';
import { hasApiKey, setApiKey, getApiKey } from './ai/gemini-client.js';

let currentRole = 'fan'; // 'fan' or 'ops'
let selectedVenueId = 'new-york';

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  renderAppShell();
  registerRoutes();
  renderChatWidget();
  initRouter('#page-content');
  updateUIForRole();

  const currentLang = getCurrentLanguage();
  if (currentLang !== 'en') {
    translateElement(document.getElementById('navbar'), currentLang);
    translateElement(document.getElementById('sidebar'), currentLang);
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
      translateElement(chatPanel, currentLang);
    }
    startTranslationObserver(currentLang);
  }
});

// ---- App Shell ----
function renderAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Navbar -->
    <nav class="navbar" id="navbar">
      <div class="navbar-brand">
        <div class="brand-icon">⚽</div>
        <span>StadiumAI</span>
        <span class="brand-tag">FIFA 2026</span>
      </div>
      <div class="navbar-center">
        <div class="role-toggle" id="role-toggle">
          <button class="role-toggle-btn active" data-role="fan" id="btn-role-fan">🎉 Fan</button>
          <button class="role-toggle-btn" data-role="ops" id="btn-role-ops">🎯 Operations</button>
        </div>
      </div>
      <div class="navbar-right">
        <select class="venue-select" id="venue-selector">
          <optgroup label="🇺🇸 United States">
            ${venues.filter(v => v.country === 'USA').map(v => `<option value="${v.id}" ${v.id === selectedVenueId ? 'selected' : ''}>${v.flag} ${v.city}</option>`).join('')}
          </optgroup>
          <optgroup label="🇲🇽 Mexico">
            ${venues.filter(v => v.country === 'Mexico').map(v => `<option value="${v.id}">${v.flag} ${v.city}</option>`).join('')}
          </optgroup>
          <optgroup label="🇨🇦 Canada">
            ${venues.filter(v => v.country === 'Canada').map(v => `<option value="${v.id}">${v.flag} ${v.city}</option>`).join('')}
          </optgroup>
        </select>
        <button class="btn btn-ghost btn-icon" id="btn-api-key" title="API Key Settings" style="font-size:var(--fs-lg);">⚙️</button>
        <select class="lang-select" id="lang-selector" title="Language">
          ${['en', 'es', 'fr', 'hi'].map(l => `
            <option value="${l}" ${l === getCurrentLanguage() ? 'selected' : ''}>${l.toUpperCase()}</option>
          `).join('')}
        </select>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <!-- Fan sidebar -->
      <div id="sidebar-fan">
        <div class="sidebar-label">Fan Companion</div>
        <div class="sidebar-item active" data-route="/fan">
          <span class="item-icon">🏠</span>
          <span>Home</span>
        </div>
        <div class="sidebar-item" data-route="/fan/venue">
          <span class="item-icon">🏟️</span>
          <span>Venue Explorer</span>
        </div>
        <div class="sidebar-item" data-route="/fan/navigate">
          <span class="item-icon">🗺️</span>
          <span>Smart Wayfinding</span>
        </div>
        <div class="sidebar-item" data-route="/fan/report">
          <span class="item-icon">🚨</span>
          <span>Report Incident</span>
        </div>
        <div class="sidebar-label" style="margin-top:var(--sp-4);">Quick Help</div>
        <div class="sidebar-item" data-action="chat-navigate">
          <span class="item-icon">🗺️</span>
          <span>Find My Seat</span>
        </div>
        <div class="sidebar-item" data-action="chat-transport">
          <span class="item-icon">🚌</span>
          <span>Transportation</span>
        </div>
        <div class="sidebar-item" data-action="chat-food">
          <span class="item-icon">🍔</span>
          <span>Food & Drinks</span>
        </div>
        <div class="sidebar-item" data-action="chat-accessibility">
          <span class="item-icon">♿</span>
          <span>Accessibility</span>
        </div>
      </div>

      <!-- Ops sidebar -->
      <div id="sidebar-ops" class="hidden">
        <div class="sidebar-label">Operations Hub</div>
        <div class="sidebar-item active" data-route="/ops">
          <span class="item-icon">📊</span>
          <span>Dashboard</span>
        </div>
        <div class="sidebar-item" data-route="/ops/crowd">
          <span class="item-icon">👥</span>
          <span>Crowd Intelligence</span>
        </div>
        <div class="sidebar-item" data-route="/ops/sustainability">
          <span class="item-icon">🌱</span>
          <span>Sustainability</span>
        </div>
        <div class="sidebar-label" style="margin-top:var(--sp-4);">Quick Tools</div>
        <div class="sidebar-item" data-action="ops-announce">
          <span class="item-icon">📢</span>
          <span>Draft Announcement</span>
        </div>
        <div class="sidebar-item" data-action="ops-incident">
          <span class="item-icon">🚨</span>
          <span>Log Incident</span>
          <span class="item-badge">3</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content with-sidebar" id="page-content"></main>

    <!-- API Key Modal (hidden) -->
    <div class="modal-overlay hidden" id="api-modal">
      <div class="modal">
        <h3 class="modal-title">⚙️ Gemini API Key</h3>
        <p class="modal-desc">
          Enter your Google Gemini API key to unlock full AI-powered conversations. 
          Without a key, the assistant runs in demo mode with pre-built responses.
        </p>
        <input type="password" id="api-key-input" placeholder="Enter your Gemini API key..." 
          style="width:100%;margin-bottom:var(--sp-4);" value="${getApiKey()}" />
        <div style="display:flex;gap:var(--sp-3);justify-content:flex-end;">
          <button class="btn btn-secondary" id="btn-cancel-api">Cancel</button>
          <button class="btn btn-primary" id="btn-save-api">💾 Save Key</button>
        </div>
        <button class="btn btn-primary" id="btn-run-diagnostics" style="width:100%;margin-top:var(--sp-4);background:linear-gradient(135deg,#A855F7,#3B82F6);">🧪 Run Diagnostic Tests</button>
        <p style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-top:var(--sp-4);">
          🔒 Your key is stored locally in your browser. It's never sent to our servers.
        </p>
      </div>
    </div>
  `;

  // Event Listeners
  bindEvents();
}

function bindEvents() {
  // Role toggle
  document.querySelectorAll('.role-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRole = btn.dataset.role;
      updateUIForRole();
      navigateTo(currentRole === 'fan' ? '/fan' : '/ops');
    });
  });

  // Venue selector
  document.getElementById('venue-selector')?.addEventListener('change', (e) => {
    selectedVenueId = e.target.value;
    // Re-render current page with new venue
    const route = getCurrentRoute();
    if (route.startsWith('/ops')) {
      navigateTo(route);
    }
    // Update chat context
    const venue = getVenueById(selectedVenueId);
    setChatContext(venue, null, null, null);
  });

  // Language selector
  document.getElementById('lang-selector')?.addEventListener('change', (e) => {
    const lang = e.target.value;
    setCurrentLanguage(lang);

    // Re-render shell to restore base English layout
    renderAppShell();
    updateUIForRole();

    // Restore selected states on new DOM
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) langSelector.value = lang;

    const venueSelector = document.getElementById('venue-selector');
    if (venueSelector) venueSelector.value = selectedVenueId;

    // Force re-routing of current route to apply translations
    navigateTo(getCurrentRoute(), true);

    // Translate navbar and sidebar layout
    if (lang !== 'en') {
      translateElement(document.getElementById('navbar'), lang);
      translateElement(document.getElementById('sidebar'), lang);
      const chatPanel = document.getElementById('chat-panel');
      if (chatPanel) {
        translateElement(chatPanel, lang);
      }
    }
  });

  // API Key modal
  document.getElementById('btn-api-key')?.addEventListener('click', () => {
    document.getElementById('api-modal')?.classList.remove('hidden');
  });
  document.getElementById('btn-cancel-api')?.addEventListener('click', () => {
    document.getElementById('api-modal')?.classList.add('hidden');
  });
  document.getElementById('btn-run-diagnostics')?.addEventListener('click', () => {
    document.getElementById('api-modal')?.classList.add('hidden');
    showDiagnosticsOverlay();
  });
  document.getElementById('btn-save-api')?.addEventListener('click', () => {
    const key = document.getElementById('api-key-input')?.value?.trim();
    if (key) {
      setApiKey(key);
      document.getElementById('api-modal')?.classList.add('hidden');
      // Update chat status
      const statusEl = document.querySelector('.chat-status');
      if (statusEl) statusEl.textContent = 'AI Powered';
    }
  });

  // Sidebar navigation
  document.querySelectorAll('.sidebar-item[data-route]').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      if (route === '/fan/venue') {
        navigateTo(`/fan/venue/${selectedVenueId}`);
      } else {
        navigateTo(route);
      }
    });
  });

  // Sidebar quick actions (open chat with prompt)
  document.querySelectorAll('.sidebar-item[data-action]').forEach(item => {
    item.addEventListener('click', () => {
      const chatFab = document.getElementById('chat-fab');
      const panel = document.getElementById('chat-panel');
      if (chatFab && panel && !panel.classList.contains('open')) {
        chatFab.click();
      }
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        const action = item.dataset.action;
        const prompts = {
          'chat-navigate': 'How do I find my seat?',
          'chat-transport': 'What are the transport options?',
          'chat-food': 'What food is available nearby?',
          'chat-accessibility': 'What accessibility services are available?',
          'ops-announce': 'Draft a PA announcement about halftime activities',
          'ops-incident': 'Summarize current incidents and recommended actions',
        };
        if (input && prompts[action]) {
          input.value = prompts[action];
          input.focus();
        }
      }, 400);
    });
  });
}

function updateUIForRole() {
  // Toggle buttons
  document.querySelectorAll('.role-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === currentRole);
  });

  // Toggle sidebars
  document.getElementById('sidebar-fan')?.classList.toggle('hidden', currentRole !== 'fan');
  document.getElementById('sidebar-ops')?.classList.toggle('hidden', currentRole !== 'ops');

  // Update chat mode
  setChatMode(currentRole);
}

// ---- Routes ----
function registerRoutes() {
  registerRoute('/fan', (container) => {
    const venue = getVenueById(selectedVenueId);
    setChatContext(venue, null, null, null);
    renderFanHome(container);
  });

  // Dynamic venue routes
  registerRoute('/fan/venue', (container, venueId) => {
    if (venueId) selectedVenueId = venueId;
    const venue = getVenueById(venueId || selectedVenueId);
    setChatContext(venue, null, null, null);
    renderFanVenue(container, venueId || selectedVenueId);
  });

  registerRoute('/fan/navigate', (container) => {
    const venue = getVenueById(selectedVenueId);
    setChatContext(venue, null, null, null);
    renderFanNavigate(container, venue);
  });

  registerRoute('/fan/report', (container) => {
    const venue = getVenueById(selectedVenueId);
    setChatContext(venue, null, null, null);
    renderFanReport(container, selectedVenueId);
  });

  registerRoute('/ops', (container) => {
    const venue = getVenueById(selectedVenueId);
    // Ops dashboard handles its own setChatContext dynamically inside renderOpsDashboard
    renderOpsDashboard(container, venue);
  });

  registerRoute('/ops/crowd', (container) => {
    const venue = getVenueById(selectedVenueId);
    setChatContext(venue, null, null, null);
    renderOpsCrowd(container, venue);
  });

  registerRoute('/ops/sustainability', (container) => {
    const venue = getVenueById(selectedVenueId);
    setChatContext(venue, null, null, null);
    renderOpsSustainability(container, venue);
  });

  // Keep venue dropdown synchronized on direct hash navigations
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('/fan/venue/')) {
      const venueId = hash.replace('/fan/venue/', '');
      selectedVenueId = venueId;
      const venueSelector = document.getElementById('venue-selector');
      if (venueSelector) venueSelector.value = venueId;
    }
  });
}
