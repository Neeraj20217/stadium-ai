// ============================================
// StadiumAI — Fan Home Page (Problem-Statement Aligned)
// GenAI features are front-and-center, not hidden.
// ============================================

import { venues, tournamentStats } from '../data/venues.js';
import { generateMatches } from '../data/mock-data.js';
import { animateCounter, observeAnimations } from '../utils/helpers.js';
import { navigateTo } from '../utils/router.js';

export function renderFanHome(container) {
  const matches = generateMatches(5);
  const today = new Date();
  const dayOfTournament = Math.floor((today - new Date('2026-06-11')) / 86400000) + 1;
  const phase = dayOfTournament > 30 ? 'Knockout Stage' : dayOfTournament > 14 ? 'Round of 16' : 'Group Stage';

  container.innerHTML = `
    <!-- Hero: Centered on GenAI Value Proposition -->
    <section class="hero" id="fan-hero">
      <div class="hero-content">
        <div style="display:flex;align-items:center;justify-content:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
          <span class="badge badge-live badge-dot">LIVE</span>
          <span class="badge badge-gold">Day ${Math.min(dayOfTournament, 39)} · ${phase}</span>
        </div>
        <h1 class="hero-title">FIFA World Cup 2026</h1>
        <p class="hero-subtitle">
          Your Generative AI-powered stadium companion — 
          real-time navigation, crowd intelligence, accessibility assistance, and multilingual support 
          across all 16 venues in 🇺🇸 USA, 🇲🇽 Mexico & 🇨🇦 Canada.
        </p>
        <div style="display: flex; gap: var(--sp-4); justify-content: center; flex-wrap: wrap; margin-bottom: var(--sp-6);">
          <button class="btn btn-primary btn-lg" onclick="document.getElementById('chat-fab')?.click()">
            🤖 Ask AI Assistant
          </button>
          <button class="btn btn-secondary btn-lg" id="btn-explore-venues">
            🏟️ Explore Venues
          </button>
        </div>
        <div class="hero-stats stagger-children">
          <div class="hero-stat anim-on-scroll">
            <div class="hero-stat-value" data-count="${tournamentStats.totalVenues}">0</div>
            <div class="hero-stat-label">Venues</div>
          </div>
          <div class="hero-stat anim-on-scroll">
            <div class="hero-stat-value" data-count="${tournamentStats.countries}">0</div>
            <div class="hero-stat-label">Countries</div>
          </div>
          <div class="hero-stat anim-on-scroll">
            <div class="hero-stat-value" data-count="${tournamentStats.totalMatches}">0</div>
            <div class="hero-stat-label">Matches</div>
          </div>
          <div class="hero-stat anim-on-scroll">
            <div class="hero-stat-value" data-count="${Math.floor(tournamentStats.totalCapacity / 1000)}">0</div>
            <div class="hero-stat-label">Total Capacity (K)</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: GenAI-Powered Features — This IS the solution -->
    <section class="section anim-on-scroll" id="ai-features">
      <div class="section-header">
        <div>
          <h3 class="section-title">🤖 How GenAI Enhances Your Experience</h3>
          <p class="section-subtitle">Powered by Google Gemini — real-time intelligence for every fan</p>
        </div>
      </div>
      <div class="grid grid-auto-fit stagger-children" style="gap:var(--sp-5);">
        
        <div class="card card-accent-teal" style="cursor:pointer;" data-action="ai-navigate">
          <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <div style="width:44px;height:44px;border-radius:var(--radius-lg);background:var(--accent-teal-dim);display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🗺️</div>
            <div>
              <h4 style="font-size:var(--fs-md);margin:0;">AI Navigation</h4>
              <span class="badge badge-teal" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p class="text-secondary text-sm" style="line-height:var(--lh-relaxed);">
            Ask "How do I get to Section 215?" and get AI-generated turn-by-turn directions — 
            including accessible routes with elevator locations, ramp paths, and real-time wait estimates.
          </p>
          <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--glass-border);font-size:var(--fs-xs);color:var(--text-tertiary);">
            ✦ Problem area: <strong style="color:var(--text-secondary);">Navigation & Accessibility</strong>
          </div>
        </div>

        <div class="card card-accent-gold" style="cursor:pointer;" data-action="ai-crowd">
          <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <div style="width:44px;height:44px;border-radius:var(--radius-lg);background:var(--accent-gold-dim);display:flex;align-items:center;justify-content:center;font-size:1.4rem;">👥</div>
            <div>
              <h4 style="font-size:var(--fs-md);margin:0;">AI Crowd Prediction</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p class="text-secondary text-sm" style="line-height:var(--lh-relaxed);">
            Gemini analyzes real-time sensor data to predict crowd surges 15 minutes in advance — 
            recommending gate openings, staff redeployment, and fan rerouting before bottlenecks form.
          </p>
          <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--glass-border);font-size:var(--fs-xs);color:var(--text-tertiary);">
            ✦ Problem area: <strong style="color:var(--text-secondary);">Crowd Management</strong>
          </div>
        </div>

        <div class="card card-accent-blue" style="cursor:pointer;" data-action="ai-multilingual">
          <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <div style="width:44px;height:44px;border-radius:var(--radius-lg);background:var(--accent-blue-dim);display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🌍</div>
            <div>
              <h4 style="font-size:var(--fs-md);margin:0;">AI Multilingual Assistant</h4>
              <span class="badge badge-blue" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p class="text-secondary text-sm" style="line-height:var(--lh-relaxed);">
            Fans from 200+ nations can speak or type in their own language — 
            Gemini auto-detects and responds in 10+ languages including English, Spanish, French, Arabic, Hindi, Japanese and more.
          </p>
          <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--glass-border);font-size:var(--fs-xs);color:var(--text-tertiary);">
            ✦ Problem area: <strong style="color:var(--text-secondary);">Multilingual Assistance</strong>
          </div>
        </div>

        <div class="card" style="cursor:pointer;border-color:rgba(168,85,247,0.15);" data-action="ai-transport">
          <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <div style="width:44px;height:44px;border-radius:var(--radius-lg);background:var(--accent-purple-dim);display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🚌</div>
            <div>
              <h4 style="font-size:var(--fs-md);margin:0;">AI Transport Optimizer</h4>
              <span class="badge badge-purple" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p class="text-secondary text-sm" style="line-height:var(--lh-relaxed);">
            AI analyzes match time, crowd size, and transit schedules to give you the fastest post-match exit plan — 
            including shuttle ETAs, rideshare surge predictions, and metro crowd levels.
          </p>
          <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--glass-border);font-size:var(--fs-xs);color:var(--text-tertiary);">
            ✦ Problem area: <strong style="color:var(--text-secondary);">Transportation</strong>
          </div>
        </div>

        <div class="card" style="cursor:pointer;border-color:rgba(0,229,160,0.15);" data-action="ai-sustain">
          <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <div style="width:44px;height:44px;border-radius:var(--radius-lg);background:var(--accent-teal-dim);display:flex;align-items:center;justify-content:center;font-size:1.4rem;">🌱</div>
            <div>
              <h4 style="font-size:var(--fs-md);margin:0;">AI Sustainability Tracker</h4>
              <span class="badge badge-teal" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p class="text-secondary text-sm" style="line-height:var(--lh-relaxed);">
            Gemini monitors waste, energy, and water in real-time and generates actionable eco-recommendations — 
            from optimizing HVAC to redirecting recycling flow, reducing per-match carbon by up to 18%.
          </p>
          <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--glass-border);font-size:var(--fs-xs);color:var(--text-tertiary);">
            ✦ Problem area: <strong style="color:var(--text-secondary);">Sustainability</strong>
          </div>
        </div>

        <div class="card card-accent-crimson" style="cursor:pointer;" data-action="ai-ops">
          <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
            <div style="width:44px;height:44px;border-radius:var(--radius-lg);background:var(--accent-crimson-dim);display:flex;align-items:center;justify-content:center;font-size:1.4rem;">⚡</div>
            <div>
              <h4 style="font-size:var(--fs-md);margin:0;">AI Decision Support</h4>
              <span class="badge badge-crimson" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p class="text-secondary text-sm" style="line-height:var(--lh-relaxed);">
            Operations staff get an AI copilot that generates incident response plans, 
            draft PA announcements in multiple languages, and suggests resource reallocation in real-time.
          </p>
          <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--glass-border);font-size:var(--fs-xs);color:var(--text-tertiary);">
            ✦ Problem area: <strong style="color:var(--text-secondary);">Operational Intelligence & Real-time Decision Support</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Live Match Ticker -->
    <section class="match-ticker anim-on-scroll" id="match-ticker">
      <div class="match-ticker-header">
        <h4>⚽ Today's Matches — ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h4>
        <span class="badge badge-live badge-dot">LIVE</span>
      </div>
      <div class="match-list" id="match-list">
        ${matches.map(m => `
          <div class="match-item ${m.status === 'LIVE' ? 'live' : ''}">
            <div class="match-teams">
              <div class="match-team">
                <span class="match-team-flag">${m.team1.flag}</span>
                <span>${m.team1.name}</span>
              </div>
              <div class="match-score">${m.score1} - ${m.score2}</div>
              <div class="match-team">
                <span>${m.team2.name}</span>
                <span class="match-team-flag">${m.team2.flag}</span>
              </div>
            </div>
            <div class="match-meta">
              <span class="badge ${m.status === 'LIVE' ? 'badge-crimson badge-dot' : m.status === 'FT' ? 'badge-teal' : 'badge-blue'}">${m.status}</span>
              <span>📍 ${m.venue}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- AI-Powered Quick Actions -->
    <section class="section anim-on-scroll" id="quick-actions">
      <div class="section-header">
        <div>
          <h3 class="section-title">🎯 AI-Powered Quick Actions</h3>
          <p class="section-subtitle">Tap any option — the AI assistant will respond instantly in your language</p>
        </div>
      </div>
      <div class="quick-actions stagger-children">
        <div class="quick-action" data-action="navigate">
          <div class="action-icon" style="background: var(--accent-teal-dim); color: var(--accent-teal);">🗺️</div>
          <div class="action-label">AI: Find My Seat</div>
          <div class="action-desc">Turn-by-turn AI directions</div>
        </div>
        <div class="quick-action" data-action="transport">
          <div class="action-icon" style="background: var(--accent-blue-dim); color: var(--accent-blue);">🚌</div>
          <div class="action-label">AI: Best Exit Route</div>
          <div class="action-desc">Optimized post-match transit</div>
        </div>
        <div class="quick-action" data-action="food">
          <div class="action-icon" style="background: var(--accent-orange-dim); color: var(--accent-orange);">🍔</div>
          <div class="action-label">AI: Food Near Me</div>
          <div class="action-desc">Wait times + dietary filters</div>
        </div>
        <div class="quick-action" data-action="accessibility">
          <div class="action-icon" style="background: var(--accent-purple-dim); color: var(--accent-purple);">♿</div>
          <div class="action-label">AI: Accessible Route</div>
          <div class="action-desc">Wheelchair, ASL, sensory</div>
        </div>
        <div class="quick-action" data-action="emergency">
          <div class="action-icon" style="background: var(--accent-crimson-dim); color: var(--accent-crimson);">🚨</div>
          <div class="action-label">AI: Emergency Help</div>
          <div class="action-desc">Nearest medical + security</div>
        </div>
        <div class="quick-action" data-action="sustainability">
          <div class="action-icon" style="background: var(--accent-gold-dim); color: var(--accent-gold);">🌱</div>
          <div class="action-label">AI: Eco Tips</div>
          <div class="action-desc">Recycle, refill, reduce</div>
        </div>
      </div>
    </section>

    <!-- Venue Map -->
    <section class="section anim-on-scroll" id="venue-map-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">🏟️ Host Venues</h3>
          <p class="section-subtitle">16 AI-connected stadiums across 3 countries</p>
        </div>
        <div style="display:flex;gap:var(--sp-2);">
          <button class="btn btn-sm btn-secondary filter-btn active" data-filter="all">All</button>
          <button class="btn btn-sm btn-secondary filter-btn" data-filter="USA">🇺🇸 USA</button>
          <button class="btn btn-sm btn-secondary filter-btn" data-filter="Mexico">🇲🇽 Mexico</button>
          <button class="btn btn-sm btn-secondary filter-btn" data-filter="Canada">🇨🇦 Canada</button>
        </div>
      </div>
      <div class="map-container" id="venue-map" style="height:400px; margin-bottom: var(--sp-6);"></div>
      <div class="grid grid-auto-fit stagger-children" id="venue-grid">
        ${venues.map(v => `
          <div class="venue-card" data-venue="${v.id}" data-country="${v.country}">
            <div class="venue-card-image">
              ${v.image}
              <span class="venue-flag">${v.flag}</span>
            </div>
            <div class="venue-card-body">
              <div class="venue-card-city">${v.city}</div>
              <div class="venue-card-stadium">${v.stadium}</div>
              <div class="venue-card-meta">
                <span>👥 ${v.capacity.toLocaleString()}</span>
                <span>${v.weather.icon} ${v.weather.temp}°C</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Solution Architecture -->
    <section class="section anim-on-scroll" id="architecture-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">🏗️ Solution Architecture</h3>
          <p class="section-subtitle">How GenAI addresses each FIFA World Cup 2026 challenge</p>
        </div>
      </div>
      <div class="card" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:var(--fs-sm);">
          <thead>
            <tr style="border-bottom:2px solid var(--glass-border);">
              <th style="text-align:left;padding:var(--sp-3) var(--sp-4);color:var(--accent-gold);font-weight:var(--fw-semibold);">Challenge Area</th>
              <th style="text-align:left;padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);font-weight:var(--fw-semibold);">GenAI Solution</th>
              <th style="text-align:left;padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);font-weight:var(--fw-semibold);">How It Works</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">🗺️ Navigation</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">AI Wayfinding</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Gemini generates turn-by-turn directions from natural language queries</td>
            </tr>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">👥 Crowd Management</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Predictive Crowd AI</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Real-time density analysis with 15-min surge predictions and auto-routing</td>
            </tr>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">♿ Accessibility</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Accessible Route AI</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Wheelchair routes, elevator status, sensory room locations, ASL services</td>
            </tr>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">🚌 Transportation</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Transit Optimizer</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Post-match exit plans, shuttle ETAs, rideshare surge prediction, eco transit</td>
            </tr>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">🌱 Sustainability</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Eco-Intelligence</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Real-time carbon, waste & energy tracking with AI optimization suggestions</td>
            </tr>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">🌍 Multilingual</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Auto-Translate AI</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Gemini auto-detects 10+ languages; translates UI, chat, and PA announcements</td>
            </tr>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">📊 Operational Intelligence</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Ops Copilot</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">AI-generated incident playbooks, resource allocation, staff deployment</td>
            </tr>
            <tr>
              <td style="padding:var(--sp-3) var(--sp-4);font-weight:var(--fw-medium);">⚡ Decision Support</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--accent-teal);">Decision Cards</td>
              <td style="padding:var(--sp-3) var(--sp-4);color:var(--text-secondary);">Proactive AI recommendations with one-click actions for venue staff</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Accessibility Section -->
    <section class="section anim-on-scroll" id="accessibility-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">♿ AI-Enhanced Accessibility</h3>
          <p class="section-subtitle">GenAI ensures inclusive experiences for every fan at every venue</p>
        </div>
      </div>
      <div class="grid grid-3">
        <div class="card card-accent-teal">
          <h4 style="margin-bottom:var(--sp-3);">🦽 AI Mobility Routing</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--sp-2);font-size:var(--fs-sm);color:var(--text-secondary);">
            <li>• AI generates wheelchair-accessible routes in real-time</li>
            <li>• Live elevator status and wait time predictions</li>
            <li>• Companion seating availability checked by AI</li>
            <li>• Mobility assistance dispatch via AI copilot</li>
          </ul>
        </div>
        <div class="card card-accent-gold">
          <h4 style="margin-bottom:var(--sp-3);">🧏 AI Sensory Support</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--sp-2);font-size:var(--fs-sm);color:var(--text-secondary);">
            <li>• Sensory room locations with AI-predicted availability</li>
            <li>• ASL interpreter scheduling via AI assistant</li>
            <li>• Audio-descriptive commentary integration</li>
            <li>• Noise-level predictions by zone</li>
          </ul>
        </div>
        <div class="card card-accent-blue">
          <h4 style="margin-bottom:var(--sp-3);">🌐 AI Digital Inclusion</h4>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--sp-2);font-size:var(--fs-sm);color:var(--text-secondary);">
            <li>• WCAG 2.1 AA compliant interface</li>
            <li>• AI-powered voice navigation in 10+ languages</li>
            <li>• Screen reader optimized chat responses</li>
            <li>• High-contrast mode with AI-adapted layouts</li>
          </ul>
        </div>
      </div>
    </section>
  `;

  // Animate counters
  setTimeout(() => {
    container.querySelectorAll('[data-count]').forEach(el => {
      animateCounter(el, parseInt(el.dataset.count), 2000);
    });
  }, 500);

  // Initialize map
  initVenueMap();

  // Venue card clicks
  container.querySelectorAll('.venue-card').forEach(card => {
    card.addEventListener('click', () => navigateTo(`/fan/venue/${card.dataset.venue}`));
  });

  // AI feature card clicks — open chat with context
  container.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const chatFab = document.getElementById('chat-fab');
      if (chatFab) chatFab.click();
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        const prompts = {
          'ai-navigate': 'I need help finding my seat — Section 215, Row 12. Can you give me turn-by-turn directions?',
          'ai-crowd': 'What are the current crowd levels? Are there any areas I should avoid right now?',
          'ai-multilingual': 'Hola! ¿Dónde está la entrada más cercana para personas con silla de ruedas?',
          'ai-transport': 'The match is about to end. What\'s the fastest way to get back to my hotel via public transit?',
          'ai-sustain': 'Where can I recycle my cup and find a water refill station?',
          'ai-ops': 'Generate an incident response plan for a medical emergency at Section 100.',
          navigate: 'How do I find my seat? I\'m at Gate A with ticket for Section 312.',
          transport: 'What\'s the best way to leave the stadium after the match?',
          food: 'I\'m vegetarian. What food options are near Section 200?',
          accessibility: 'I need a wheelchair-accessible route to Section 115.',
          emergency: 'Where is the nearest medical station from Section 200?',
          sustainability: 'Where can I recycle and refill my water bottle?',
        };
        if (input && prompts[el.dataset.action]) {
          input.value = prompts[el.dataset.action];
          input.focus();
        }
      }, 400);
    });
  });

  // Filter buttons
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      container.querySelectorAll('.venue-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.country === filter) ? '' : 'none';
      });
    });
  });

  document.getElementById('btn-explore-venues')?.addEventListener('click', () => {
    document.getElementById('venue-map-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  observeAnimations(container);
}

function initVenueMap() {
  const mapEl = document.getElementById('venue-map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('venue-map', { center: [35, -98], zoom: 4, zoomControl: true, scrollWheelZoom: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '©CartoDB', maxZoom: 18,
  }).addTo(map);

  venues.forEach(v => {
    const marker = L.circleMarker([v.lat, v.lng], {
      radius: 8,
      fillColor: v.country === 'USA' ? '#3B82F6' : v.country === 'Mexico' ? '#00E5A0' : '#FF3B5C',
      color: '#fff', weight: 2, fillOpacity: 0.8,
    }).addTo(map);

    marker.bindPopup(`
      <div style="min-width:180px;">
        <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${v.flag} ${v.city}</div>
        <div style="font-size:12px;color:#8892a8;margin-bottom:6px;">${v.stadium}</div>
        <div style="font-size:12px;">👥 ${v.capacity.toLocaleString()} • ${v.weather.icon} ${v.weather.temp}°C</div>
      </div>
    `);
    marker.on('click', () => navigateTo(`/fan/venue/${v.id}`));
  });
}
