// ============================================
// StadiumAI — Crowd Intelligence Page
// ============================================

import { generateCrowdData, generateGateData, generateCrowdHistory } from '../data/mock-data.js';
import { observeAnimations, animateCounter } from '../utils/helpers.js';

let chartInstances = [];

function destroyCharts() {
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];
}

export function renderOpsCrowd(container, venue) {
  destroyCharts();
  const crowdData = generateCrowdData(venue);
  const gateData = generateGateData();
  const history = generateCrowdHistory();
  const totalFans = crowdData.reduce((s, z) => s + z.count, 0);
  const avgDensity = Math.round(crowdData.reduce((s, z) => s + z.density, 0) / crowdData.length);
  const peakZone = crowdData.reduce((max, z) => z.density > max.density ? z : max, crowdData[0]);
  const venueName = venue ? venue.stadium : 'All Venues';

  container.innerHTML = `
    <div class="section-header anim-on-scroll">
      <div>
        <h2 class="section-title">👥 Crowd Intelligence</h2>
        <p class="section-subtitle">${venueName} · Real-time Crowd Analytics</p>
      </div>
      <span class="badge badge-live badge-dot">LIVE</span>
    </div>

    <!-- KPI Row -->
    <div class="crowd-stats-row stagger-children">
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">👥 Total Fans</div>
        <div class="stats-value" data-count="${totalFans}">0</div>
        <div class="stats-trend up">Capacity: ${venue ? venue.capacity.toLocaleString() : '70,000'}</div>
      </div>
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">📊 Avg Density</div>
        <div class="stats-value" style="color:${avgDensity > 80 ? 'var(--accent-crimson)' : avgDensity > 60 ? 'var(--accent-gold)' : 'var(--accent-teal)'};">${avgDensity}%</div>
        <div class="stats-trend ${avgDensity < 70 ? 'up' : 'down'}">${avgDensity < 70 ? '🟢 Normal' : '🟡 Elevated'}</div>
      </div>
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">🔥 Peak Zone</div>
        <div class="stats-value" style="font-size:var(--fs-xl);color:var(--accent-crimson);">${peakZone.zone}</div>
        <div class="stats-trend down">${peakZone.density}% density</div>
      </div>
    </div>

    <div class="crowd-main-grid">
      <!-- Full Heatmap -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">🗺️ Zone Density Map</h4>
          <button class="btn btn-sm btn-secondary" id="btn-refresh-crowd">↻ Refresh</button>
        </div>
        <div class="heatmap-container" style="height:350px;position:relative;padding:var(--sp-4);" id="crowd-heatmap">
          ${renderHeatmapZones(crowdData)}
        </div>
        <div class="heatmap-legend" style="margin-top:var(--sp-3);">
          <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(0,229,160,0.4);"></div>Low</div>
          <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(212,175,55,0.5);"></div>Medium</div>
          <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(249,115,22,0.6);"></div>High</div>
          <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(255,59,92,0.7);"></div>Critical</div>
        </div>
      </div>

      <!-- Zone Details Table -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">📋 Zone Details</h4>
        </div>
        <div style="overflow-y:auto;max-height:380px;">
          <table style="width:100%;border-collapse:collapse;font-size:var(--fs-sm);">
            <thead>
              <tr style="border-bottom:1px solid var(--glass-border);">
                <th style="text-align:left;padding:var(--sp-3);color:var(--text-secondary);font-weight:var(--fw-semibold);">Zone</th>
                <th style="text-align:center;padding:var(--sp-3);color:var(--text-secondary);font-weight:var(--fw-semibold);">Density</th>
                <th style="text-align:center;padding:var(--sp-3);color:var(--text-secondary);font-weight:var(--fw-semibold);">Count</th>
                <th style="text-align:center;padding:var(--sp-3);color:var(--text-secondary);font-weight:var(--fw-semibold);">Trend</th>
              </tr>
            </thead>
            <tbody>
              ${crowdData.map(z => {
                const color = z.density < 30 ? 'var(--accent-teal)' : z.density < 60 ? 'var(--accent-gold)' : z.density < 85 ? 'var(--accent-orange)' : 'var(--accent-crimson)';
                return `<tr style="border-bottom:1px solid var(--glass-border);">
                  <td style="padding:var(--sp-3);font-weight:var(--fw-medium);">${z.zone}</td>
                  <td style="text-align:center;padding:var(--sp-3);"><span class="badge" style="background:${color}22;color:${color};">${z.density}%</span></td>
                  <td style="text-align:center;padding:var(--sp-3);color:var(--text-secondary);">${z.count.toLocaleString()}</td>
                  <td style="text-align:center;padding:var(--sp-3);">${z.trend === 'rising' ? '📈' : z.trend === 'falling' ? '📉' : '➡️'} ${z.trend}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-2 mt-6">
      <!-- Crowd Flow -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">📈 24-Hour Crowd Flow</h4>
        </div>
        <div class="chart-wrapper">
          <canvas id="crowd-flow-detail-chart"></canvas>
        </div>
      </div>

      <!-- Gate Performance -->
      <div class="card anim-on-scroll">
        <div class="card-header">
          <h4 class="card-title">🚪 Gate Performance</h4>
        </div>
        <div class="chart-wrapper">
          <canvas id="gate-performance-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Evacuation Panel -->
    <div class="card mt-6 card-accent-crimson anim-on-scroll">
      <div class="card-header">
        <h4 class="card-title">🚨 Emergency Evacuation Readiness</h4>
        <span class="badge badge-teal">All Clear</span>
      </div>
      <div class="grid grid-4" style="gap:var(--sp-4);">
        <div style="text-align:center;">
          <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);font-family:var(--font-display);color:var(--accent-teal);">4</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);">Exit Routes Open</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);font-family:var(--font-display);color:var(--accent-teal);">12 min</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);">Est. Full Evacuation</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);font-family:var(--font-display);color:var(--accent-teal);">100%</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);">PA System Online</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:var(--fs-2xl);font-weight:var(--fw-bold);font-family:var(--font-display);color:var(--accent-teal);">8</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);">Medical Teams Ready</div>
        </div>
      </div>
    </div>
  `;

  // Animate counters
  setTimeout(() => {
    container.querySelectorAll('[data-count]').forEach(el => {
      animateCounter(el, parseInt(el.dataset.count), 1500);
    });
  }, 300);

  // Refresh button
  document.getElementById('btn-refresh-crowd')?.addEventListener('click', () => {
    const newData = generateCrowdData(venue);
    const heatmap = document.getElementById('crowd-heatmap');
    if (heatmap) heatmap.innerHTML = renderHeatmapZones(newData);
  });

  initCrowdFlowDetailChart(history);
  initGatePerformanceChart(gateData);
  observeAnimations(container);
}

function renderHeatmapZones(crowdData) {
  const cols = Math.min(crowdData.length, 5);
  return crowdData.map((z, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const densityClass = z.density < 30 ? 'low' : z.density < 60 ? 'medium' : z.density < 85 ? 'high' : 'critical';
    const w = 100 / cols - 2;
    const h = 100 / Math.ceil(crowdData.length / cols) - 5;
    return `<div class="heatmap-zone density-${densityClass}" style="left:${col * (100 / cols) + 1}%;top:${row * (100 / Math.ceil(crowdData.length / cols)) + 2}%;width:${w}%;height:${h}%;">
      <div style="font-size:10px;text-align:center;"><div>${z.zone.split(' ').slice(0,2).join(' ')}</div><div style="font-size:var(--fs-md);font-weight:700;">${z.density}%</div><div style="font-size:9px;opacity:0.7;">${z.count} fans</div></div>
    </div>`;
  }).join('');
}

function initCrowdFlowDetailChart(history) {
  const ctx = document.getElementById('crowd-flow-detail-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.hour),
      datasets: [
        {
          label: 'Actual Crowd',
          data: history.map(h => h.actual),
          borderColor: '#00E5A0',
          backgroundColor: 'rgba(0,229,160,0.08)',
          fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
        },
        {
          label: 'Predicted',
          data: history.map(h => h.predicted),
          borderColor: '#D4AF37',
          borderDash: [5, 5],
          fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8892a8', font: { family: 'Inter', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#5a6478', font: { size: 10 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#5a6478', font: { size: 10 }, callback: v => (v / 1000) + 'K' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      },
    },
  });
  chartInstances.push(chart);
}

function initGatePerformanceChart(gateData) {
  const ctx = document.getElementById('gate-performance-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gateData.map(g => g.gate),
      datasets: [
        {
          label: 'Throughput (fans/min)',
          data: gateData.map(g => g.throughput),
          backgroundColor: gateData.map(g => g.status === 'open' ? 'rgba(0,229,160,0.6)' : 'rgba(255,59,92,0.6)'),
          borderRadius: 6, borderSkipped: false,
        },
        {
          label: 'Wait Time (min)',
          data: gateData.map(g => g.waitTime),
          backgroundColor: 'rgba(212,175,55,0.5)',
          borderRadius: 6, borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8892a8', font: { family: 'Inter', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#5a6478', font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: '#5a6478', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      },
    },
  });
  chartInstances.push(chart);
}
