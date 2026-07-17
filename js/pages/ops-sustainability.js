// ============================================
// StadiumAI — AI Sustainability Analytics Page
// GenAI drives eco-recommendations and impact tracking
// ============================================

import { generateSustainabilityData, generateSustainabilityHistory } from '../data/mock-data.js';
import { observeAnimations, animateCounter } from '../utils/helpers.js';
import { getAISustainabilityTips } from '../ai/insights-engine.js';

let chartInstances = [];

function destroyCharts() {
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];
}

export function renderOpsSustainability(container, venue) {
  destroyCharts();
  const data = generateSustainabilityData();
  const history = generateSustainabilityHistory();
  const venueName = venue ? venue.stadium : 'All Venues';

  container.innerHTML = `
    <div class="section-header anim-on-scroll">
      <div>
        <h2 class="section-title">🌱 AI Sustainability Analytics</h2>
        <p class="section-subtitle">${venueName} · GenAI-Powered Environmental Impact Dashboard</p>
      </div>
      <div style="display:flex;gap:var(--sp-2);">
        <span class="badge badge-gold" style="font-size:10px;">GenAI Powered</span>
        <span class="badge badge-teal badge-dot">Tracking Active</span>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="sustainability-grid stagger-children">
      <div class="stats-card card-accent-teal anim-on-scroll">
        <div class="stats-label">🏭 Carbon Emissions</div>
        <div class="stats-value" style="font-size:var(--fs-2xl);" data-count="${data.carbon.total}">0</div>
        <div class="stats-trend ${data.carbon.total < data.carbon.target ? 'up' : 'down'}">
          ${data.carbon.total < data.carbon.target ? '✅' : '⚠️'} Target: ${data.carbon.target} tons
        </div>
      </div>
      <div class="stats-card card-accent-gold anim-on-scroll">
        <div class="stats-label">♻️ Recycling Rate</div>
        <div class="stats-value" style="font-size:var(--fs-2xl);">${data.waste.recycled}%</div>
        <div class="stats-trend up">↑ +3% from last match</div>
      </div>
      <div class="stats-card card-accent-blue anim-on-scroll">
        <div class="stats-label">⚡ Renewable Energy</div>
        <div class="stats-value" style="font-size:var(--fs-2xl);">${data.energy.renewablePercent}%</div>
        <div class="stats-trend up">↑ Solar + Grid mix</div>
      </div>
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">💧 Water Per Capita</div>
        <div class="stats-value" style="font-size:var(--fs-2xl);">${data.water.perCapita}L</div>
        <div class="stats-trend up">↓ -8% efficiency gain</div>
      </div>
    </div>

    <!-- Gauges -->
    <div class="card mb-6 anim-on-scroll">
      <div class="card-header">
        <h4 class="card-title">📊 Environmental Gauges</h4>
      </div>
      <div class="sustainability-gauges" style="padding:var(--sp-4) 0;">
        <div class="gauge-container">
          <div class="gauge-ring">
            <svg viewBox="0 0 120 120">
              <circle class="gauge-bg" cx="60" cy="60" r="52"></circle>
              <circle class="gauge-fill" cx="60" cy="60" r="52"
                stroke="url(#grad-teal)" 
                stroke-dasharray="${2 * Math.PI * 52}" 
                stroke-dashoffset="${2 * Math.PI * 52 * (1 - data.waste.recycled / 100)}">
              </circle>
              <defs><linearGradient id="grad-teal" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00E5A0"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient></defs>
            </svg>
            <div class="gauge-value" style="color:var(--accent-teal);">${data.waste.recycled}%</div>
          </div>
          <div class="gauge-label">Waste Recycled</div>
        </div>
        <div class="gauge-container">
          <div class="gauge-ring">
            <svg viewBox="0 0 120 120">
              <circle class="gauge-bg" cx="60" cy="60" r="52"></circle>
              <circle class="gauge-fill" cx="60" cy="60" r="52"
                stroke="url(#grad-gold)"
                stroke-dasharray="${2 * Math.PI * 52}"
                stroke-dashoffset="${2 * Math.PI * 52 * (1 - data.energy.renewablePercent / 100)}">
              </circle>
              <defs><linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#D4AF37"/><stop offset="100%" stop-color="#F97316"/></linearGradient></defs>
            </svg>
            <div class="gauge-value" style="color:var(--accent-gold);">${data.energy.renewablePercent}%</div>
          </div>
          <div class="gauge-label">Renewable Energy</div>
        </div>
        <div class="gauge-container">
          <div class="gauge-ring">
            <svg viewBox="0 0 120 120">
              <circle class="gauge-bg" cx="60" cy="60" r="52"></circle>
              <circle class="gauge-fill" cx="60" cy="60" r="52"
                stroke="url(#grad-blue)"
                stroke-dasharray="${2 * Math.PI * 52}"
                stroke-dashoffset="${2 * Math.PI * 52 * (1 - data.water.recycledPercent / 100)}">
              </circle>
              <defs><linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#3B82F6"/><stop offset="100%" stop-color="#A855F7"/></linearGradient></defs>
            </svg>
            <div class="gauge-value" style="color:var(--accent-blue);">${data.water.recycledPercent}%</div>
          </div>
          <div class="gauge-label">Water Recycled</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="sustainability-charts">
      <!-- Carbon Breakdown -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">🏭 Carbon Breakdown</h4>
        </div>
        <div class="chart-wrapper">
          <canvas id="carbon-chart"></canvas>
        </div>
      </div>

      <!-- Waste Management -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">♻️ Waste Management</h4>
          <span class="text-sm text-secondary">${data.waste.totalTons} tons total</span>
        </div>
        <div class="chart-wrapper">
          <canvas id="waste-chart"></canvas>
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">📈 7-Day Carbon Trend</h4>
        </div>
        <div class="chart-wrapper">
          <canvas id="carbon-trend-chart"></canvas>
        </div>
      </div>

      <!-- AI Sustainability Recommendations (GenAI) -->
      <div class="card card-accent-teal anim-on-scroll" style="border-color:rgba(212,175,55,0.2);">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:var(--sp-2);">
            <h4 class="card-title">🤖 GenAI Sustainability Recommendations</h4>
            <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
          </div>
          <button class="btn btn-sm btn-secondary" id="btn-refresh-sustain-ai">↻ Refresh AI</button>
        </div>
        <div id="ai-sustain-content" style="display:flex;flex-direction:column;gap:var(--sp-4);font-size:var(--fs-sm);">
          <div style="padding:var(--sp-4);text-align:center;color:var(--text-tertiary);"><span style="animation:pulse 1.5s ease-in-out infinite;">🤖</span> Generating AI sustainability recommendations...</div>
        </div>
      </div>
    </div>
  `;

  // Animate counters
  setTimeout(() => {
    container.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      animateCounter(el, target, 1500, '', ' tons');
    });
  }, 300);

  initCarbonChart(data);
  initWasteChart(data);
  initCarbonTrendChart(history);

  // Load AI sustainability recommendations
  loadAISustainability(venue, data);

  // Refresh AI button
  document.getElementById('btn-refresh-sustain-ai')?.addEventListener('click', () => {
    loadAISustainability(venue, generateSustainabilityData());
  });

  observeAnimations(container);
}

async function loadAISustainability(venue, data) {
  const content = document.getElementById('ai-sustain-content');
  if (!content) return;
  try {
    const tips = await getAISustainabilityTips(venue, data);
    content.innerHTML = tips.map(t => `
      <div style="display:flex;gap:var(--sp-3);align-items:flex-start;padding:var(--sp-3);background:var(--glass-bg);border-radius:var(--radius-sm);border-left:3px solid ${t.priority === 'high' ? 'var(--accent-crimson)' : t.priority === 'medium' ? 'var(--accent-gold)' : 'var(--accent-teal)'};">
        <span>${t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢'}</span>
        <div style="flex:1;">
          <div style="font-weight:var(--fw-semibold);margin-bottom:2px;">${t.title}</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);margin-bottom:4px;">${t.action}</div>
          <div style="font-size:var(--fs-xs);color:var(--accent-teal);">📊 Impact: ${t.impact}</div>
        </div>
      </div>
    `).join('');
  } catch {
    content.innerHTML = '<div style="padding:var(--sp-3);color:var(--text-tertiary);">Unable to load AI recommendations.</div>';
  }
}

function initCarbonChart(data) {
  const ctx = document.getElementById('carbon-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Transit', 'Energy', 'Waste', 'Other'],
      datasets: [{
        data: [data.carbon.transit, data.carbon.energy, data.carbon.waste, data.carbon.other],
        backgroundColor: ['#3B82F6', '#F97316', '#FF3B5C', '#A855F7'],
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#5a6478', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#5a6478', font: { size: 10 }, callback: v => v + 't' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      },
    },
  });
  chartInstances.push(chart);
}

function initWasteChart(data) {
  const ctx = document.getElementById('waste-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Recycled', 'Composted', 'Landfill'],
      datasets: [{
        data: [data.waste.recycled, data.waste.composted, data.waste.landfill],
        backgroundColor: ['#00E5A0', '#D4AF37', '#FF3B5C'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8892a8', font: { family: 'Inter', size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } },
      },
      cutout: '60%',
    },
  });
  chartInstances.push(chart);
}

function initCarbonTrendChart(history) {
  const ctx = document.getElementById('carbon-trend-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.label),
      datasets: [{
        label: 'CO₂ (tons)',
        data: history.map(h => h.carbon),
        borderColor: '#00E5A0',
        backgroundColor: 'rgba(0, 229, 160, 0.1)',
        fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#00E5A0', borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#5a6478', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#5a6478', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      },
    },
  });
  chartInstances.push(chart);
}
