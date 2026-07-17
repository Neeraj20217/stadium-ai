// ============================================
// StadiumAI — Fan Venue Detail Page
// ============================================

import { getVenueById, venues } from '../data/venues.js';
import { generateCrowdData } from '../data/mock-data.js';
import { observeAnimations } from '../utils/helpers.js';
import { navigateTo } from '../utils/router.js';

export function renderFanVenue(container, venueId) {
  const venue = getVenueById(venueId);
  if (!venue) {
    container.innerHTML = `<div class="flex-center" style="min-height:60vh;"><div class="card text-center p-8"><h3>Venue not found</h3><p class="text-secondary mt-4">Please select a venue from the list.</p><button class="btn btn-primary mt-4" onclick="location.hash='/fan'">← Back to Home</button></div></div>`;
    return;
  }

  const crowdData = generateCrowdData(venue);
  const waitTimes = venue.concessions.map(c => ({ name: c, wait: Math.floor(Math.random() * 12) + 1 }));

  container.innerHTML = `
    <!-- Back button -->
    <button class="btn btn-ghost mb-6" id="btn-back-home" style="font-size:var(--fs-sm);">← Back to Venues</button>

    <!-- Venue Header -->
    <div class="venue-detail-header anim-on-scroll">
      <div class="venue-detail-info">
        <div style="display:flex;align-items:center;gap:var(--sp-3);margin-bottom:var(--sp-2);">
          <span style="font-size:2.5rem;">${venue.flag}</span>
          <div>
            <h1 class="venue-detail-name">${venue.city}</h1>
            <div class="venue-detail-city">${venue.stadium} · ${venue.state}, ${venue.country}</div>
          </div>
        </div>
        <div class="venue-detail-stats" style="margin-top:var(--sp-4);">
          <div class="stats-card card-sm">
            <div class="stats-label">👥 Capacity</div>
            <div class="stats-value" style="font-size:var(--fs-2xl);">${venue.capacity.toLocaleString()}</div>
          </div>
          <div class="stats-card card-sm">
            <div class="stats-label">${venue.weather.icon} Weather</div>
            <div class="stats-value" style="font-size:var(--fs-2xl);">${venue.weather.temp}°C</div>
            <div class="stats-trend neutral">${venue.weather.condition}</div>
          </div>
          <div class="stats-card card-sm">
            <div class="stats-label">💧 Humidity</div>
            <div class="stats-value" style="font-size:var(--fs-2xl);">${venue.weather.humidity}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="venue-tabs">
      <button class="tab-btn active" data-tab="overview">🏟️ Overview</button>
      <button class="tab-btn" data-tab="amenities">🍔 Amenities</button>
      <button class="tab-btn" data-tab="accessibility">♿ Accessibility</button>
      <button class="tab-btn" data-tab="transport">🚌 Transport</button>
    </div>

    <!-- Tab Content -->
    <div id="tab-content">
      <!-- Overview Tab -->
      <div class="tab-panel" id="tab-overview">
        <div class="grid grid-2">
          <!-- Features -->
          <div class="card anim-on-scroll">
            <h4 style="margin-bottom:var(--sp-4);">✨ Venue Features</h4>
            <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
              ${venue.features.map(f => `<span class="badge badge-gold">${f}</span>`).join('')}
            </div>
          </div>

          <!-- Stadium Zones -->
          <div class="card anim-on-scroll">
            <h4 style="margin-bottom:var(--sp-4);">📍 Stadium Zones</h4>
            <div class="heatmap-container" style="height:250px;position:relative;padding:var(--sp-4);">
              ${crowdData.map((z, i) => {
                const col = i % 5;
                const row = Math.floor(i / 5);
                const densityClass = z.density < 30 ? 'low' : z.density < 60 ? 'medium' : z.density < 85 ? 'high' : 'critical';
                return `<div class="heatmap-zone density-${densityClass}" style="left:${col * 20 + 2}%;top:${row * 50 + 5}%;width:18%;height:40%;" title="${z.zone}: ${z.density}% occupancy">${z.density}%</div>`;
              }).join('')}
            </div>
            <div class="heatmap-legend" style="margin-top:var(--sp-3);">
              <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(0,229,160,0.4);"></div>Low</div>
              <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(212,175,55,0.5);"></div>Medium</div>
              <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(249,115,22,0.6);"></div>High</div>
              <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(255,59,92,0.7);"></div>Critical</div>
            </div>
          </div>
        </div>

        <!-- Wait Times -->
        <div class="card mt-6 anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">⏱️ Estimated Wait Times</h4>
          <div class="grid grid-auto-fit" style="gap:var(--sp-3);">
            ${waitTimes.map(w => `
              <div class="transport-item">
                <div class="transport-icon" style="background:${w.wait < 5 ? 'var(--accent-teal-dim)' : w.wait < 9 ? 'var(--accent-gold-dim)' : 'var(--accent-crimson-dim)'};">
                  🍽️
                </div>
                <div class="transport-info">
                  <div class="transport-name">${w.name}</div>
                  <div class="transport-desc">${w.wait < 5 ? 'Short wait' : w.wait < 9 ? 'Moderate wait' : 'Long wait'}</div>
                </div>
                <div class="transport-eta" style="color:${w.wait < 5 ? 'var(--accent-teal)' : w.wait < 9 ? 'var(--accent-gold)' : 'var(--accent-crimson)'};">${w.wait}m</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Amenities Tab -->
      <div class="tab-panel hidden" id="tab-amenities">
        <div class="card anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">🍔 Food & Concessions</h4>
          <div class="venue-amenities">
            ${venue.concessions.map(c => `
              <div class="amenity-item">
                <span class="amenity-icon">🍽️</span>
                <span>${c}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card mt-6 anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">🏪 General Amenities</h4>
          <div class="venue-amenities">
            ${['🚻 Restrooms', '💧 Water Refill Station', '📱 Charging Station', '🏪 Fan Shop', '📷 Photo Spot', '🙏 Prayer Room', '👶 Family Room', '🧊 Ice/Cold Towels', '🔐 Lockers', '📻 Lost & Found'].map(a => `
              <div class="amenity-item"><span class="amenity-icon">${a.split(' ')[0]}</span><span>${a.split(' ').slice(1).join(' ')}</span></div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Accessibility Tab -->
      <div class="tab-panel hidden" id="tab-accessibility">
        <div class="card anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">♿ Accessibility Features at ${venue.stadium}</h4>
          <div class="venue-amenities">
            ${venue.accessibility.map(a => `
              <div class="amenity-item" style="border-color:var(--accent-teal-dim);">
                <span class="amenity-icon">✅</span>
                <span>${a}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card mt-6 anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">📞 Assistance Contacts</h4>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            <div class="transport-item">
              <div class="transport-icon" style="background:var(--accent-teal-dim);">📞</div>
              <div class="transport-info"><div class="transport-name">Guest Services Desk</div><div class="transport-desc">Located at every main gate</div></div>
            </div>
            <div class="transport-item">
              <div class="transport-icon" style="background:var(--accent-blue-dim);">🧏</div>
              <div class="transport-info"><div class="transport-name">ASL Interpreter Request</div><div class="transport-desc">Available at info desks & via FIFA app</div></div>
            </div>
            <div class="transport-item">
              <div class="transport-icon" style="background:var(--accent-purple-dim);">🦮</div>
              <div class="transport-info"><div class="transport-name">Service Animal Relief Area</div><div class="transport-desc">Designated areas near each gate</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transport Tab -->
      <div class="tab-panel hidden" id="tab-transport">
        <div class="card anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">🚌 Getting to ${venue.stadium}</h4>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${venue.transit.map(t => {
              const icons = { metro: '🚇', bus: '🚌', train: '🚆', shuttle: '🚐', rideshare: '🚗', tram: '🚊', ferry: '⛴️' };
              return `
                <div class="transport-item">
                  <div class="transport-icon">${icons[t.type] || '🚌'}</div>
                  <div class="transport-info">
                    <div class="transport-name">${t.name}</div>
                    <div class="transport-desc">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</div>
                  </div>
                  <div class="transport-eta">${t.eta}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="card mt-6 anim-on-scroll">
          <h4 style="margin-bottom:var(--sp-4);">🌱 Sustainable Travel Tip</h4>
          <p class="text-secondary" style="font-size:var(--fs-sm);line-height:var(--lh-relaxed);">
            Choose public transit or the FIFA shuttle to reduce your carbon footprint! 
            Each fan switching from car to transit saves approximately <strong style="color:var(--accent-teal);">2.3 kg CO₂</strong> per trip.
            💚 Over 60% of fans at this venue are expected to use sustainable transport options.
          </p>
        </div>
      </div>
    </div>
  `;

  // Back button
  document.getElementById('btn-back-home')?.addEventListener('click', () => navigateTo('/fan'));

  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      const tabId = `tab-${btn.dataset.tab}`;
      document.getElementById(tabId)?.classList.remove('hidden');
    });
  });

  observeAnimations(container);
}
