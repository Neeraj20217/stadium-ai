// ============================================
// StadiumAI — AI Smart Wayfinding Page
// GenAI generates navigation routes in real-time
// ============================================

import { getVenueById } from '../data/venues.js';
import { observeAnimations, escapeHTML } from '../utils/helpers.js';
import { getAINavigation } from '../ai/insights-engine.js';

const locationCoords = {
  // Gates - walkable concourse perimeter
  'gate a': { cx: 200, cy: 25, name: 'Gate A' },
  'gate b': { cx: 200, cy: 275, name: 'Gate B' },
  'gate c': { cx: 35, cy: 150, name: 'Gate C' },
  'gate d': { cx: 365, cy: 150, name: 'Gate D' },
  'entrance': { cx: 200, cy: 25, name: 'Gate A' },
  'main entrance': { cx: 200, cy: 25, name: 'Gate A' },

  // Stands/Sections - strictly outside the field box boundaries: X [110, 290], Y [80, 220]
  'section 100': { cx: 200, cy: 55, name: 'Sec 100' },
  'section 112': { cx: 140, cy: 55, name: 'Sec 112' },
  'section 115': { cx: 120, cy: 58, name: 'Sec 115' },
  'section 125': { cx: 75, cy: 80, name: 'Sec 125' },
  
  'section 200': { cx: 200, cy: 245, name: 'Sec 200' },
  'section 215': { cx: 310, cy: 235, name: 'Sec 215' }, // outside right-bottom concourse
  'section 225': { cx: 320, cy: 245, name: 'Sec 225' }, // outside right-bottom concourse
  
  'section 300': { cx: 65, cy: 150, name: 'Sec 300' },
  'section 312': { cx: 65, cy: 100, name: 'Sec 312' },
  
  'section 400': { cx: 335, cy: 150, name: 'Sec 400' },
  'section 415': { cx: 335, cy: 200, name: 'Sec 415' },

  // Amenities
  'food': { cx: 80, cy: 235, name: 'Food Court' },
  'food court': { cx: 80, cy: 235, name: 'Food Court' },
  'restroom': { cx: 320, cy: 65, name: 'Restrooms' },
  'restrooms': { cx: 320, cy: 65, name: 'Restrooms' },
  'first aid': { cx: 80, cy: 65, name: 'First Aid' },
  'medical': { cx: 80, cy: 65, name: 'First Aid' },
  'elevator': { cx: 320, cy: 235, name: 'Elevator B' },
  'elevators': { cx: 320, cy: 235, name: 'Elevator B' },
};

export function renderFanNavigate(container, venue) {
  if (!venue) {
    container.innerHTML = `<div class="flex-center" style="min-height:60vh;"><div class="card text-center p-8"><h3>Select a venue first</h3><p class="text-secondary mt-4">Choose a venue from the dropdown to see AI wayfinding.</p></div></div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header anim-on-scroll">
      <div>
        <h2 class="section-title">🗺️ AI Smart Wayfinding</h2>
        <p class="section-subtitle">${venue.stadium} · GenAI-Powered Indoor Navigation</p>
      </div>
      <div style="display:flex;gap:var(--sp-2);">
        <span class="badge badge-gold" style="font-size:10px;">GenAI Powered</span>
        <span class="badge badge-teal">Real-time</span>
      </div>
    </div>

    <!-- AI Navigation Input -->
    <div class="card mb-6 anim-on-scroll" style="border-color:rgba(212,175,55,0.2);background:linear-gradient(135deg,rgba(212,175,55,0.04),rgba(0,229,160,0.03));">
      <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-4);">
        <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--accent-gold-dim);display:flex;align-items:center;justify-content:center;">🤖</div>
        <div>
          <h4 style="margin:0;">Ask AI for Directions</h4>
          <div style="font-size:var(--fs-xs);color:var(--text-tertiary);">Describe where you are and where you want to go — in any language</div>
        </div>
      </div>
      <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <label style="font-size:var(--fs-xs);color:var(--text-secondary);display:block;margin-bottom:4px;">📍 I'm currently at:</label>
          <input type="text" id="nav-from" value="Gate A" placeholder="e.g., Gate A, Main Entrance, Section 100"
            style="width:100%;padding:var(--sp-3);border-radius:var(--radius-md);background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);font-size:var(--fs-sm);" />
        </div>
        <div style="flex:1;min-width:200px;">
          <label style="font-size:var(--fs-xs);color:var(--text-secondary);display:block;margin-bottom:4px;">🎯 I want to go to:</label>
          <input type="text" id="nav-to" value="Section 215" placeholder="e.g., Section 215, Food Court, Restroom"
            style="width:100%;padding:var(--sp-3);border-radius:var(--radius-md);background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);font-size:var(--fs-sm);" />
        </div>
      </div>
      <div style="display:flex;gap:var(--sp-3);margin-top:var(--sp-4);flex-wrap:wrap;">
        <button class="btn btn-primary" id="btn-get-directions">🤖 Get AI Directions</button>
        <button class="btn btn-secondary" id="btn-get-accessible">♿ Get Accessible Route</button>
        <label style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-sm);color:var(--text-secondary);cursor:pointer;">
          <input type="checkbox" id="nav-accessibility" /> ♿ I need wheelchair-accessible routing
        </label>
        <label style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--fs-sm);color:var(--text-secondary);cursor:pointer;">
          <input type="checkbox" id="nav-heatmap" /> 🔥 Show AI Crowd Predictions
        </label>
      </div>
    </div>

    <div class="wayfinding-grid">
      <!-- Left: AI-Generated Directions + Map -->
      <div>
        <!-- AI Generated Route -->
        <div class="card mb-6 anim-on-scroll" id="ai-route-card">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">📍 AI-Generated Route</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
            <span class="badge badge-teal" id="route-time">~5 min</span>
          </div>
          <div id="ai-route-content">
            <!-- Will be populated by AI -->
          </div>
        </div>

        <!-- Stadium Map -->
        <div class="card mb-6 anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">🏟️ Interactive Stadium Map</h4>
          </div>
          <div style="position:relative;height:340px;background:linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;overflow:hidden;">
            <svg viewBox="0 0 400 300" style="width:92%;height:92%;">
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Stadium Outer Rings -->
              <ellipse cx="200" cy="150" rx="182" ry="132" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
              <ellipse cx="200" cy="150" rx="175" ry="125" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="1.5" stroke-dasharray="6 4"/>
              <ellipse cx="200" cy="150" rx="155" ry="105" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="3"/>

              <!-- Playing Field (Pitch Markup) -->
              <g id="pitch-markings">
                <!-- Base green pitch background -->
                <rect x="110" y="80" width="180" height="140" rx="4" fill="#1b6e4f" stroke="#00e5a0" stroke-width="1.5"/>
                <!-- Alternating grass stripes -->
                <rect x="130" y="80" width="20" height="140" fill="#14573e" opacity="0.45"/>
                <rect x="170" y="80" width="20" height="140" fill="#14573e" opacity="0.45"/>
                <rect x="210" y="80" width="20" height="140" fill="#14573e" opacity="0.45"/>
                <rect x="250" y="80" width="20" height="140" fill="#14573e" opacity="0.45"/>
                <!-- Boundary lines & center pitch markings -->
                <rect x="110" y="80" width="180" height="140" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
                <line x1="200" y1="80" x2="200" y2="220" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
                <circle cx="200" cy="150" r="22" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
                <circle cx="200" cy="150" r="1.5" fill="rgba(255,255,255,0.6)"/>
                <!-- Goal & Penalty areas -->
                <rect x="110" y="115" width="18" height="70" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
                <rect x="272" y="115" width="18" height="70" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
              </g>

              <!-- Concourse Zones labels -->
              <text x="200" y="44" text-anchor="middle" fill="var(--text-secondary)" font-size="9" font-family="Inter" font-weight="500">North Stand — Sections 100-125</text>
              <text x="200" y="268" text-anchor="middle" fill="var(--text-secondary)" font-size="9" font-family="Inter" font-weight="500">South Stand — Sections 200-225</text>
              <text x="48" y="150" text-anchor="middle" fill="var(--text-secondary)" font-size="9" font-family="Inter" font-weight="500" transform="rotate(-90,48,150)">West — 300s</text>
              <text x="352" y="150" text-anchor="middle" fill="var(--text-secondary)" font-size="9" font-family="Inter" font-weight="500" transform="rotate(90,352,150)">East — 400s</text>

              <!-- Stadium Gates -->
              <circle cx="200" cy="25" r="5" fill="var(--accent-gold)" opacity="0.8"/>
              <text x="200" y="17" text-anchor="middle" fill="var(--accent-gold)" font-size="8" font-weight="bold" font-family="Inter">Gate A</text>
              <circle cx="200" cy="275" r="5" fill="var(--accent-gold)" opacity="0.8"/>
              <text x="200" y="289" text-anchor="middle" fill="var(--accent-gold)" font-size="8" font-weight="bold" font-family="Inter">Gate B</text>
              <circle cx="35" cy="150" r="5" fill="var(--accent-gold)" opacity="0.8"/>
              <text x="35" y="139" text-anchor="middle" fill="var(--accent-gold)" font-size="8" font-weight="bold" font-family="Inter">Gate C</text>
              <circle cx="365" cy="150" r="5" fill="var(--accent-gold)" opacity="0.8"/>
              <text x="365" y="139" text-anchor="middle" fill="var(--accent-gold)" font-size="8" font-weight="bold" font-family="Inter">Gate D</text>

              <!-- Amenities markers cluster near every Gate (A, B, C, D) -->
              <!-- Gate A Amenities (Top) -->
              <circle cx="172" cy="35" r="3.5" fill="var(--accent-blue)" opacity="0.8"/>
              <text x="172" y="31" text-anchor="middle" fill="var(--accent-blue)" font-size="6" font-family="Inter">🚻</text>
              <circle cx="228" cy="35" r="3.5" fill="var(--accent-orange)" opacity="0.8"/>
              <text x="228" y="31" text-anchor="middle" fill="var(--accent-orange)" font-size="6" font-family="Inter">🍔</text>
              <circle cx="200" cy="48" r="3.5" fill="var(--accent-teal)" opacity="0.8"/>
              <text x="200" y="44" text-anchor="middle" fill="var(--accent-teal)" font-size="6" font-family="Inter">♿</text>

              <!-- Gate B Amenities (Bottom) -->
              <circle cx="172" cy="265" r="3.5" fill="var(--accent-blue)" opacity="0.8"/>
              <text x="172" y="261" text-anchor="middle" fill="var(--accent-blue)" font-size="6" font-family="Inter">🚻</text>
              <circle cx="228" cy="265" r="3.5" fill="var(--accent-orange)" opacity="0.8"/>
              <text x="228" y="261" text-anchor="middle" fill="var(--accent-orange)" font-size="6" font-family="Inter">🍔</text>
              <circle cx="200" cy="252" r="3.5" fill="var(--accent-teal)" opacity="0.8"/>
              <text x="200" y="248" text-anchor="middle" fill="var(--accent-teal)" font-size="6" font-family="Inter">♿</text>

              <!-- Gate C Amenities (Left) -->
              <circle cx="48" cy="120" r="3.5" fill="var(--accent-blue)" opacity="0.8"/>
              <text x="48" y="116" text-anchor="middle" fill="var(--accent-blue)" font-size="6" font-family="Inter">🚻</text>
              <circle cx="48" cy="180" r="3.5" fill="var(--accent-orange)" opacity="0.8"/>
              <text x="48" y="176" text-anchor="middle" fill="var(--accent-orange)" font-size="6" font-family="Inter">🍔</text>
              <circle cx="58" cy="150" r="3.5" fill="var(--accent-teal)" opacity="0.8"/>
              <text x="58" y="146" text-anchor="middle" fill="var(--accent-teal)" font-size="6" font-family="Inter">♿</text>

              <!-- Gate D Amenities (Right) -->
              <circle cx="352" cy="120" r="3.5" fill="var(--accent-blue)" opacity="0.8"/>
              <text x="352" y="116" text-anchor="middle" fill="var(--accent-blue)" font-size="6" font-family="Inter">🚻</text>
              <circle cx="352" cy="180" r="3.5" fill="var(--accent-orange)" opacity="0.8"/>
              <text x="352" y="176" text-anchor="middle" fill="var(--accent-orange)" font-size="6" font-family="Inter">🍔</text>
              <circle cx="342" cy="150" r="3.5" fill="var(--accent-teal)" opacity="0.8"/>
              <text x="342" y="146" text-anchor="middle" fill="var(--accent-teal)" font-size="6" font-family="Inter">♿</text>

              <!-- First Aid / Medical Point -->
              <circle cx="80" cy="65" r="4.5" fill="var(--accent-crimson)" opacity="0.8"/>
              <text x="80" y="58" text-anchor="middle" fill="var(--accent-crimson)" font-size="7" font-family="Inter" font-weight="600">➕ First Aid</text>

              <!-- AI route line (with neon-glow filter) -->
              <path id="svg-route-path" d="M 200 25 Q 330 50, 310 235" stroke="var(--accent-gold)" stroke-width="3" fill="none" stroke-dasharray="7 4" filter="url(#neon-glow)" opacity="0.95">
                <animate attributeName="stroke-dashoffset" values="33;0" dur="1.3s" repeatCount="indefinite"/>
              </path>

              <!-- Your location -->
              <circle id="svg-you-pulse" cx="200" cy="25" r="8" fill="var(--accent-blue)" opacity="0.55">
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle id="svg-you-dot" cx="200" cy="25" r="4.5" fill="var(--accent-blue)"/>
              <text id="svg-you-text" x="215" y="29" fill="var(--accent-blue)" font-size="9" font-weight="bold" font-family="Inter">YOU</text>

              <!-- Destination -->
              <circle id="svg-dest-pulse" cx="310" cy="235" r="8" fill="var(--accent-teal)" opacity="0.55">
                <animate attributeName="r" values="8;11;8" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle id="svg-dest-dot" cx="310" cy="235" r="4.5" fill="var(--accent-teal)"/>
              <text id="svg-dest-text" x="325" y="239" fill="var(--accent-teal)" font-size="9" font-weight="bold" font-family="Inter">DEST</text>

              <!-- AI Crowd Predictions & Heatmap Overlay -->
              <g id="svg-crowd-heatmap" class="hidden">
                <!-- North Stand (Normal: 35%) -->
                <circle cx="200" cy="55" r="24" fill="var(--accent-teal)" opacity="0.22" filter="url(#neon-glow)"/>
                <text x="200" y="60" text-anchor="middle" fill="var(--accent-teal)" font-size="7" font-weight="bold" font-family="Inter">35%</text>

                <!-- South Stand (Congested: 75%) -->
                <circle cx="200" cy="245" r="24" fill="var(--accent-orange)" opacity="0.22" filter="url(#neon-glow)"/>
                <text x="200" y="250" text-anchor="middle" fill="var(--accent-orange)" font-size="7" font-weight="bold" font-family="Inter">75%</text>

                <!-- West Stand (Critical: 88%) -->
                <circle cx="65" cy="150" r="24" fill="var(--accent-crimson)" opacity="0.22" filter="url(#neon-glow)"/>
                <text x="65" y="154" text-anchor="middle" fill="var(--accent-crimson)" font-size="7" font-weight="bold" font-family="Inter">88% (AVOID)</text>

                <!-- East Stand (Normal: 42%) -->
                <circle cx="335" cy="150" r="24" fill="var(--accent-teal)" opacity="0.22" filter="url(#neon-glow)"/>
                <text x="335" y="154" text-anchor="middle" fill="var(--accent-teal)" font-size="7" font-weight="bold" font-family="Inter">42%</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Emergency Exits -->
        <div class="card card-accent-crimson anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">🚨 Emergency Exits</h4>
            <span class="badge badge-teal">All Clear</span>
          </div>
          <div class="grid grid-2" style="gap:var(--sp-3);">
            ${[
              { name: 'North Exit', via: 'Gate A ramp', dist: '45m' },
              { name: 'South Exit', via: 'Gate B stairs', dist: '60m' },
              { name: 'West Emergency', via: 'Service corridor', dist: '30m' },
              { name: 'East Emergency', via: 'Field-level exit', dist: '55m' },
            ].map(e => `
              <div class="transport-item">
                <div class="transport-icon" style="background:var(--accent-crimson-dim);color:var(--accent-crimson);">🚪</div>
                <div class="transport-info"><div class="transport-name">${e.name}</div><div class="transport-desc">Via ${e.via}</div></div>
                <div class="transport-eta" style="color:var(--accent-teal);">${e.dist}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right: AI Features + Nearby -->
      <div>
        <!-- AI Accessible Routes -->
        <div class="card mb-6 card-accent-teal anim-on-scroll">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">♿ AI Accessible Routes</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p style="font-size:var(--fs-sm);color:var(--text-secondary);margin-bottom:var(--sp-4);line-height:var(--lh-relaxed);">
            The AI generates <strong>personalized accessible routes</strong> based on your mobility needs. 
            It checks real-time elevator status, ramp availability, and companion seating.
          </p>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${[
              { icon: '🦽', label: 'Wheelchair Route', desc: 'Step-free path via ramp and elevator', time: '8 min', note: 'Elevator B: 2 min wait' },
              { icon: '👁️', label: 'Low-Vision Route', desc: 'High-contrast signage + tactile strips', time: '7 min', note: 'Braille maps at each gate' },
              { icon: '🧏', label: 'ASL Interpreter', desc: 'Nearest ASL station: Guest Services', time: '3 min', note: 'Live ASL for all matches' },
              { icon: '🧘', label: 'Sensory Room', desc: 'Quiet space — dimmed lights, calm zone', time: '5 min', note: 'AI predicts: 60% available' },
            ].map(r => `
              <div class="transport-item">
                <div class="transport-icon" style="background:var(--accent-teal-dim);">${r.icon}</div>
                <div class="transport-info">
                  <div class="transport-name">${r.label}</div>
                  <div class="transport-desc">${r.desc}</div>
                  <div style="font-size:var(--fs-xs);color:var(--accent-gold);margin-top:2px;">🤖 ${r.note}</div>
                </div>
                <div class="transport-eta">${r.time}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Nearby Points of Interest -->
        <div class="card mb-6 anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">📍 Nearby (AI-ranked by distance)</h4>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${[
              { icon: '🚻', name: 'Restrooms', dist: '45m', wait: '2 min', ai: 'Low traffic now' },
              { icon: '🍔', name: venue.concessions[0] || 'Food Court', dist: '60m', wait: '5 min', ai: 'Moderate wait' },
              { icon: '💧', name: 'Water Refill Station', dist: '30m', wait: '1 min', ai: '♻️ Save a plastic bottle!' },
              { icon: '🏪', name: 'Fan Shop', dist: '80m', wait: '3 min', ai: 'Short queue right now' },
              { icon: '➕', name: 'First Aid Station', dist: '120m', wait: 'No wait', ai: 'Fully staffed' },
              { icon: '📱', name: 'Charging Station', dist: '95m', wait: '4 min', ai: '3 ports available' },
            ].map(p => `
              <div class="transport-item">
                <div class="transport-icon" style="background:var(--glass-bg);">${p.icon}</div>
                <div class="transport-info">
                  <div class="transport-name">${p.name}</div>
                  <div class="transport-desc">${p.dist} away · Wait: ${p.wait}</div>
                  <div style="font-size:var(--fs-xs);color:var(--accent-teal);">🤖 ${p.ai}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Multilingual Help -->
        <div class="card anim-on-scroll" style="border-color:rgba(59,130,246,0.15);">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">🌍 AI Multilingual Help</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <p style="font-size:var(--fs-sm);color:var(--text-secondary);line-height:var(--lh-relaxed);margin-bottom:var(--sp-3);">
            Need directions in another language? Ask the AI assistant — it auto-detects and responds in your language.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
            ${[
              { lang: '🇪🇸 Español', prompt: '¿Cómo llego a mi asiento? Sección 215.' },
              { lang: '🇫🇷 Français', prompt: 'Comment puis-je trouver ma place ? Section 215.' },
              { lang: '🇧🇷 Português', prompt: 'Como chego ao meu assento? Seção 215.' },
              { lang: '🇸🇦 العربية', prompt: 'كيف أصل إلى مقعدي؟ القسم 215.' },
              { lang: '🇮🇳 हिन्दी', prompt: 'मैं अपनी सीट कैसे ढूंढूं? सेक्शन 215।' },
              { lang: '🇯🇵 日本語', prompt: '席の場所を教えてください。セクション215。' },
            ].map(l => `
              <button class="btn btn-sm btn-secondary lang-prompt-btn" data-prompt="${l.prompt}" style="font-size:11px;">${l.lang}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Load initial AI route
  loadAIRoute(venue, 'Gate A', 'Section 215, Row 12', false);

  // Wire AI Crowd Heatmap toggle listener
  document.getElementById('nav-heatmap')?.addEventListener('change', (e) => {
    const heatmapGroup = document.getElementById('svg-crowd-heatmap');
    if (heatmapGroup) {
      heatmapGroup.classList.toggle('hidden', !e.target.checked);
    }
  });

  // Get Directions button
  document.getElementById('btn-get-directions')?.addEventListener('click', () => {
    const from = document.getElementById('nav-from')?.value || 'Gate A';
    const to = document.getElementById('nav-to')?.value || 'my seat';
    const accessible = document.getElementById('nav-accessibility')?.checked || false;
    loadAIRoute(venue, from, to, accessible);
  });

  // Get Accessible Route button
  document.getElementById('btn-get-accessible')?.addEventListener('click', () => {
    const from = document.getElementById('nav-from')?.value || 'Gate A';
    const to = document.getElementById('nav-to')?.value || 'my seat';
    loadAIRoute(venue, from, to, true);
  });

  // Multilingual prompt buttons
  container.querySelectorAll('.lang-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chatFab = document.getElementById('chat-fab');
      if (chatFab) chatFab.click();
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = btn.dataset.prompt;
          input.focus();
        }
      }, 400);
    });
  });

  observeAnimations(container);
}

async function loadAIRoute(venue, from, to, accessible) {
  const content = document.getElementById('ai-route-content');
  const timeEl = document.getElementById('route-time');
  if (!content) return;

  content.textContent = '';
  const wrapper = document.createElement('div');
  wrapper.style.padding = 'var(--sp-6)';
  wrapper.style.textAlign = 'center';
  wrapper.style.color = 'var(--text-tertiary)';
  
  const botSpan = document.createElement('span');
  botSpan.style.animation = 'pulse 1.5s ease-in-out infinite';
  botSpan.textContent = '🤖';
  
  const textNode = document.createTextNode(` AI generating ${accessible ? 'accessible ' : ''}route from "${from}" to "${to}"...`);
  
  wrapper.appendChild(botSpan);
  wrapper.appendChild(textNode);
  content.appendChild(wrapper);

  // Update Interactive Stadium Map elements
  const cleanFrom = from.toLowerCase().trim();
  const cleanTo = to.toLowerCase().trim();

  const fromKey = Object.keys(locationCoords).find(k => cleanFrom.includes(k)) || 'gate a';
  const fromCoord = locationCoords[fromKey] || locationCoords['gate a'];
  
  let toCoord;
  if (cleanTo.includes('restroom') || cleanTo.includes('toilet') || cleanTo.includes('washroom') || cleanTo.includes('bathroom') || cleanTo.includes('wc')) {
    // Route to nearest gate restroom
    if (fromCoord.cy < 100) {
      toCoord = { cx: 172, cy: 35, name: 'Restrooms A' };
    } else if (fromCoord.cy > 200) {
      toCoord = { cx: 172, cy: 265, name: 'Restrooms B' };
    } else if (fromCoord.cx < 150) {
      toCoord = { cx: 48, cy: 120, name: 'Restrooms C' };
    } else {
      toCoord = { cx: 352, cy: 120, name: 'Restrooms D' };
    }
  } else if (cleanTo.includes('food') || cleanTo.includes('eat') || cleanTo.includes('concession') || cleanTo.includes('hungry')) {
    // Route to nearest gate food
    if (fromCoord.cy < 100) {
      toCoord = { cx: 228, cy: 35, name: 'Food A' };
    } else if (fromCoord.cy > 200) {
      toCoord = { cx: 228, cy: 265, name: 'Food B' };
    } else if (fromCoord.cx < 150) {
      toCoord = { cx: 48, cy: 180, name: 'Food C' };
    } else {
      toCoord = { cx: 352, cy: 180, name: 'Food D' };
    }
  } else if (cleanTo.includes('elevator') || cleanTo.includes('lift') || cleanTo.includes('wheelchair') || cleanTo.includes('accessible')) {
    // Route to nearest gate elevator
    if (fromCoord.cy < 100) {
      toCoord = { cx: 200, cy: 48, name: 'Elevator A' };
    } else if (fromCoord.cy > 200) {
      toCoord = { cx: 200, cy: 252, name: 'Elevator B' };
    } else if (fromCoord.cx < 150) {
      toCoord = { cx: 58, cy: 150, name: 'Elevator C' };
    } else {
      toCoord = { cx: 342, cy: 150, name: 'Elevator D' };
    }
  } else {
    // Match section or other coordinate
    const toKey = Object.keys(locationCoords).find(k => cleanTo.includes(k)) || 'section 215';
    toCoord = locationCoords[toKey] || locationCoords['section 215'];
  }

  // Update SVG YOU Elements
  const youPulse = document.getElementById('svg-you-pulse');
  const youDot = document.getElementById('svg-you-dot');
  const youText = document.getElementById('svg-you-text');
  if (youPulse) {
    youPulse.setAttribute('cx', fromCoord.cx);
    youPulse.setAttribute('cy', fromCoord.cy);
  }
  if (youDot) {
    youDot.setAttribute('cx', fromCoord.cx);
    youDot.setAttribute('cy', fromCoord.cy);
  }
  if (youText) {
    youText.setAttribute('x', fromCoord.cx + 12);
    youText.setAttribute('y', fromCoord.cy + 4);
    youText.textContent = fromCoord.name.toUpperCase();
  }

  // Update SVG DEST Elements
  const destPulse = document.getElementById('svg-dest-pulse');
  const destDot = document.getElementById('svg-dest-dot');
  const destText = document.getElementById('svg-dest-text');
  if (destPulse) {
    destPulse.setAttribute('cx', toCoord.cx);
    destPulse.setAttribute('cy', toCoord.cy);
  }
  if (destDot) {
    destDot.setAttribute('cx', toCoord.cx);
    destDot.setAttribute('cy', toCoord.cy);
  }
  if (destText) {
    destText.setAttribute('x', toCoord.cx + 12);
    destText.setAttribute('y', toCoord.cy + 4);
    destText.textContent = toCoord.name.toUpperCase();
  }

  // Update SVG Route Path (Routing around the pitch, not inside the ground)
  const routePath = document.getElementById('svg-route-path');
  if (routePath) {
    const x1 = fromCoord.cx;
    const y1 = fromCoord.cy;
    const x2 = toCoord.cx;
    const y2 = toCoord.cy;

    const crossesX = (x1 < 110 && x2 > 290) || (x1 > 290 && x2 < 110);
    const crossesY = (y1 < 80 && y2 > 220) || (y1 > 220 && y2 < 80);

    let pathD = '';
    if (crossesX && crossesY) {
      // Diagonal crossing: route via outer corner control point (x=345/55) to curve around the corner
      const goEast = (x1 + x2) / 2 > 200;
      const cpX = goEast ? 345 : 55;
      pathD = `M ${x1} ${y1} C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`;
    } else if (crossesX) {
      // Horizontal crossing (left to right): route via North or South concourse
      const goNorth = (y1 + y2) / 2 < 150;
      const cpY = goNorth ? 45 : 255;
      pathD = `M ${x1} ${y1} C ${x1} ${cpY}, ${x2} ${cpY}, ${x2} ${y2}`;
    } else if (crossesY) {
      // Vertical crossing (top to bottom): route via East or West concourse
      const goEast = (x1 + x2) / 2 > 200;
      const cpX = goEast ? 345 : 55;
      pathD = `M ${x1} ${y1} C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`;
    } else {
      // Direct smooth curve for non-crossing paths
      const cpX = (x1 + x2) / 2;
      const cpY = (y1 + y2) / 2;
      pathD = `M ${x1} ${y1} Q ${cpX} ${cpY}, ${x2} ${y2}`;
    }
    routePath.setAttribute('d', pathD);
  }

  try {
    const result = await getAINavigation(venue, from, to, accessible);
    if (timeEl) timeEl.textContent = `~${result.total_time}`;

    content.innerHTML = `
      ${accessible ? `<div style="display:flex;align-items:center;gap:var(--sp-2);padding:var(--sp-3);background:rgba(0,229,160,0.06);border-radius:var(--radius-sm);margin-bottom:var(--sp-4);font-size:var(--fs-sm);color:var(--accent-teal);border:1px solid rgba(0,229,160,0.15);">
        ♿ <strong>Wheelchair-Accessible Route</strong> — all steps are step-free
      </div>` : ''}
      <div class="wayfinding-steps">
        ${result.route.map(step => `
          <div class="wayfinding-step">
            <div class="wayfinding-step-num">${step.step}</div>
            <div style="flex:1;">
              <div class="wayfinding-step-text">${step.instruction}</div>
              <div class="wayfinding-step-meta" style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
                <span>📍 ${step.landmark}</span>
                <span>📏 ${step.distance}</span>
              </div>
              ${step.accessibility_note ? `<div style="font-size:var(--fs-xs);color:var(--accent-teal);margin-top:4px;">♿ ${step.accessibility_note}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:var(--sp-4);padding:var(--sp-3);background:rgba(212,175,55,0.04);border-left:2px solid var(--accent-gold);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-size:var(--fs-xs);color:var(--text-secondary);">
        🤖 This route was generated by <strong style="color:var(--accent-gold);">Google Gemini AI</strong> based on the stadium layout, real-time crowd data, and ${accessible ? 'accessibility requirements' : 'shortest path analysis'}.
        Need a different route? Modify your input above or ask the AI chat assistant.
      </div>
    `;
  } catch {
    content.innerHTML = '<div style="color:var(--accent-crimson);padding:var(--sp-4);">Error generating route. Try the AI chat assistant instead.</div>';
  }
}
