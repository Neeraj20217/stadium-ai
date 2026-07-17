// ============================================
// StadiumAI — Operations Dashboard (Problem-Statement Aligned)
// GenAI Decision Support is the CORE feature.
// ============================================

import { generateCrowdData, generateGateData, generateIncidents, generateOpsKPIs, generateCrowdHistory } from '../data/mock-data.js';
import { observeAnimations, animateCounter, escapeHTML } from '../utils/helpers.js';
import { setChatContext, openChatWithPrefill } from '../components/chat-widget.js';
import { generateDecisionSupportCards, getAICrowdPrediction, getAIIncidentResponse } from '../ai/insights-engine.js';

let chartInstances = [];

function destroyCharts() {
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];
}

export function renderOpsDashboard(container, venue) {
  destroyCharts();

  const crowdData = generateCrowdData(venue);
  const gateData = generateGateData();
  const incidents = generateIncidents(8);
  const kpis = generateOpsKPIs(venue);
  const crowdHistory = generateCrowdHistory();
  const decisions = generateDecisionSupportCards(crowdData, incidents, kpis, venue);

  setChatContext(venue, crowdData, incidents, kpis);

  const venueName = venue ? venue.stadium : 'All Venues';
  const criticalCount = incidents.filter(i => i.type === 'critical').length;

  container.innerHTML = `
    <div style="padding-bottom: var(--sp-8);">
      <!-- Page Header -->
    <div class="section-header anim-on-scroll">
      <div>
        <h2 class="section-title">🎯 AI Operations Command Center</h2>
        <p class="section-subtitle">${venueName} · GenAI-Powered Real-Time Decision Support</p>
      </div>
      <div style="display:flex;align-items:center;gap:var(--sp-3);">
        <span class="badge badge-live badge-dot">LIVE</span>
        <div class="weather-widget">
          <span class="weather-icon">${venue?.weather?.icon || '🌤️'}</span>
          <div>
            <div class="weather-temp">${venue?.weather?.temp || 25}°C</div>
            <div class="weather-desc">${venue?.weather?.condition || 'Clear'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="ops-kpi-row stagger-children">
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">👥 Total Fans</div>
        <div class="stats-value" data-count="${kpis.totalFans.value}">0</div>
        <div class="stats-trend ${kpis.totalFans.trend === 'up' ? 'up' : 'down'}">${kpis.totalFans.trend === 'up' ? '↑' : '↓'} ${kpis.totalFans.change}</div>
      </div>
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">⏱️ Avg Wait Time</div>
        <div class="stats-value" style="font-size:var(--fs-2xl);">${kpis.avgWaitTime.value}</div>
        <div class="stats-trend ${kpis.avgWaitTime.trend === 'down' ? 'up' : 'down'}">${kpis.avgWaitTime.trend === 'down' ? '↓' : '↑'} ${kpis.avgWaitTime.change}</div>
      </div>
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">🚨 Active Incidents</div>
        <div class="stats-value" data-count="${kpis.incidents.value}">0</div>
        <div class="stats-trend ${kpis.incidents.trend === 'down' ? 'up' : 'down'}">${kpis.incidents.trend === 'down' ? '↓' : '↑'} ${kpis.incidents.change}</div>
      </div>
      <div class="stats-card anim-on-scroll">
        <div class="stats-label">🌱 Sustainability</div>
        <div class="stats-value" style="font-size:var(--fs-2xl);">${kpis.sustainScore.value}</div>
        <div class="stats-trend up">↑ ${kpis.sustainScore.change}</div>
      </div>
    </div>

    <!-- ★ AI DECISION SUPPORT — The Core GenAI Feature ★ -->
    <div class="card mb-6 anim-on-scroll" style="border-color:rgba(212,175,55,0.25);background:linear-gradient(135deg,rgba(212,175,55,0.04),rgba(0,229,160,0.03));">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--accent-gold-dim);display:flex;align-items:center;justify-content:center;">🤖</div>
          <div>
            <h4 class="card-title" style="margin:0;">GenAI Decision Support</h4>
            <div style="font-size:var(--fs-xs);color:var(--text-tertiary);">Powered by Gemini · Proactive recommendations updated every 30s</div>
          </div>
        </div>
        <div style="display:flex;gap:var(--sp-2);">
          <button class="btn btn-sm btn-primary" id="btn-ask-copilot" style="font-size:var(--fs-xs);">💬 Ask AI Copilot</button>
        </div>
      </div>
      <div class="decision-cards" style="display:flex;flex-direction:column;gap:var(--sp-4);margin-top:var(--sp-4);">
        ${decisions.map((d, i) => `
          <div class="decision-card" id="decision-card-${i}" style="display:flex;gap:var(--sp-4);padding:var(--sp-4);border-radius:var(--radius-md);background:var(--glass-bg);border:1px solid ${d.severity === 'critical' ? 'rgba(255,59,92,0.25)' : d.severity === 'warning' ? 'rgba(212,175,55,0.2)' : 'var(--glass-border)'};">
            <div style="flex-shrink:0;width:40px;text-align:center;">
              <div style="font-size:1.5rem;margin-bottom:4px;">${d.icon}</div>
              <span class="badge ${d.severity === 'critical' ? 'badge-crimson' : d.severity === 'warning' ? 'badge-gold' : 'badge-teal'}" id="decision-badge-${i}" style="font-size:9px;padding:2px 6px;">${d.severity.toUpperCase()}</span>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-2);">
                <span style="font-size:var(--fs-xs);color:var(--accent-gold);font-weight:var(--fw-semibold);text-transform:uppercase;">${d.category}</span>
                <span class="badge badge-gold" style="font-size:9px;">GenAI</span>
              </div>
              <div style="font-weight:var(--fw-semibold);margin-bottom:var(--sp-2);font-size:var(--fs-md);">${d.title}</div>
              <div style="font-size:var(--fs-sm);color:var(--text-secondary);line-height:var(--lh-relaxed);margin-bottom:var(--sp-3);padding:var(--sp-2) var(--sp-3);background:rgba(0,229,160,0.04);border-left:2px solid var(--accent-teal);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
                🤖 <em>${d.aiInsight}</em>
              </div>
              <div style="font-size:var(--fs-sm);font-weight:var(--fw-medium);margin-bottom:var(--sp-2);color:var(--text-primary);">Suggested Actions:</div>
              <ul style="list-style:none;display:flex;flex-direction:column;gap:var(--sp-1);font-size:var(--fs-xs);color:var(--text-secondary);">
                ${d.suggestedActions.map(a => `<li>→ ${a}</li>`).join('')}
              </ul>
              ${d.automatable ? `<div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-2);">
                <button class="btn btn-sm btn-primary btn-execute-decision" data-index="${i}" data-title="${d.title.replace(/"/g, '&quot;')}" style="font-size:11px;">✅ Execute Actions</button>
                <button class="btn btn-sm btn-secondary btn-modify-decision" data-index="${i}" data-title="${d.title.replace(/"/g, '&quot;')}" style="font-size:11px;">📝 Modify Plan</button>
              </div>` : `<div style="margin-top:var(--sp-3);font-size:var(--fs-xs);color:var(--accent-gold);">⚠️ Requires manual review before execution</div>`}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Main Grid -->
    <div class="ops-main-grid">
      <!-- Left Column -->
      <div>
        <!-- Crowd Heatmap -->
        <div class="card mb-6 anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">🗺️ AI Crowd Density Map</h4>
            <span class="badge badge-teal">Real-time + AI Predicted</span>
          </div>
          <div class="heatmap-container" style="height:280px;position:relative;padding:var(--sp-4);">
            ${crowdData.map((z, i) => {
              const cols = Math.min(crowdData.length, 5);
              const col = i % cols;
              const row = Math.floor(i / cols);
              const densityClass = z.density < 30 ? 'low' : z.density < 60 ? 'medium' : z.density < 85 ? 'high' : 'critical';
              const w = 100 / cols - 2;
              const h = 100 / Math.ceil(crowdData.length / cols) - 5;
              return `<div class="heatmap-zone density-${densityClass}" style="left:${col * (100 / cols) + 1}%;top:${row * (100 / Math.ceil(crowdData.length / cols)) + 2}%;width:${w}%;height:${h}%;">
                <div style="font-size:10px;text-align:center;"><div>${z.zone.split(' ').slice(0,2).join(' ')}</div><div style="font-size:var(--fs-md);font-weight:700;">${z.density}%</div></div>
              </div>`;
            }).join('')}
          </div>
          <div class="heatmap-legend" style="margin-top:var(--sp-2);">
            <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(0,229,160,0.4);"></div>Low (&lt;30%)</div>
            <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(212,175,55,0.5);"></div>Medium (30-60%)</div>
            <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(249,115,22,0.6);"></div>High (60-85%)</div>
            <div class="heatmap-legend-item"><div class="heatmap-legend-color" style="background:rgba(255,59,92,0.7);"></div>Critical (&gt;85%)</div>
          </div>
        </div>

        <!-- AI Crowd Predictions -->
        <div class="card mb-6 anim-on-scroll" id="ai-predictions-card">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">🔮 AI Crowd Predictions</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
            <button class="btn btn-sm btn-secondary" id="btn-refresh-predictions">↻ Refresh</button>
          </div>
          <div id="ai-predictions-content" style="display:flex;flex-direction:column;gap:var(--sp-3);">
            <div style="padding:var(--sp-6);text-align:center;color:var(--text-tertiary);"><span style="animation:pulse 1.5s ease-in-out infinite;">🤖</span> Generating AI predictions...</div>
          </div>
        </div>

        <!-- Crowd Flow Chart -->
        <div class="card mb-6 anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">📈 Crowd Flow — AI Predicted vs Actual</h4>
          </div>
          <div class="chart-wrapper">
            <canvas id="crowd-flow-chart"></canvas>
          </div>
        </div>

        <!-- Gate Throughput -->
        <div class="card anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">🚪 Gate Throughput</h4>
          </div>
          <div class="grid grid-2" style="gap:var(--sp-3);">
            ${gateData.map(g => `
              <div class="transport-item">
                <div class="transport-icon" style="background:${g.status === 'open' ? 'var(--accent-teal-dim)' : 'var(--accent-crimson-dim)'}; color:${g.status === 'open' ? 'var(--accent-teal)' : 'var(--accent-crimson)'};">🚪</div>
                <div class="transport-info">
                  <div class="transport-name">${g.gate}</div>
                  <div class="transport-desc">${g.throughput} fans/min · Wait: ${g.waitTime}min</div>
                </div>
                <span class="badge ${g.status === 'open' ? 'badge-teal' : 'badge-crimson'}">${g.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="ops-sidebar-panel">
        <!-- Incident Feed with AI Analysis -->
        <div class="card anim-on-scroll">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">🚨 AI Incident Analysis</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
            <span class="badge badge-crimson">${criticalCount} critical</span>
          </div>
          <div class="incident-feed">
            ${incidents.map(inc => `
              <div class="incident-item" style="cursor:pointer;" data-incident='${JSON.stringify(inc).replace(/'/g, "\\'")}'>
                <div class="incident-icon ${inc.type}">${inc.icon}</div>
                <div class="incident-content">
                  <div class="incident-title">${inc.title}</div>
                  <div class="incident-detail">${inc.detail}</div>
                  <div style="font-size:var(--fs-xs);color:var(--accent-gold);margin-top:2px;">🤖 Click for AI response plan</div>
                </div>
                <div class="incident-time">${inc.time}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Incident Response Panel (hidden by default) -->
        <div class="card hidden" id="ai-incident-panel" style="border-color:rgba(212,175,55,0.25);">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">🤖 AI Response Plan</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
            <button class="btn btn-sm btn-ghost" id="btn-close-incident-panel">✕</button>
          </div>
          <div id="ai-incident-content">
            <div style="padding:var(--sp-4);text-align:center;color:var(--text-tertiary);">
              <span style="animation:pulse 1.5s ease-in-out infinite;">🤖</span> AI analyzing incident...
            </div>
          </div>
        </div>

        <!-- Staff Distribution -->
        <div class="card anim-on-scroll">
          <div class="card-header">
            <h4 class="card-title">👷 Staff Distribution</h4>
          </div>
          <div class="chart-wrapper" style="height:200px;">
            <canvas id="staff-chart"></canvas>
          </div>
        </div>

        <!-- Multilingual Demand -->
        <div class="card anim-on-scroll">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h4 class="card-title">🌍 AI Language Demand</h4>
              <span class="badge badge-gold" style="font-size:10px;">GenAI</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            ${[
              { lang: 'English', pct: 45, bar: '#3B82F6' },
              { lang: 'Spanish', pct: 28, bar: '#00E5A0' },
              { lang: 'Portuguese', pct: 8, bar: '#D4AF37' },
              { lang: 'French', pct: 6, bar: '#A855F7' },
              { lang: 'Arabic', pct: 5, bar: '#F97316' },
              { lang: 'Other (10+)', pct: 8, bar: '#FF3B5C' },
            ].map(l => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);margin-bottom:2px;">
                  <span>${l.lang}</span>
                  <span style="color:var(--text-tertiary);">${l.pct}%</span>
                </div>
                <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${l.pct}%;background:${l.bar};border-radius:3px;transition:width 1s ease;"></div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:var(--sp-3);font-size:var(--fs-xs);color:var(--accent-gold);display:flex;align-items:center;gap:var(--sp-2);">
            🤖 AI: Spanish queries up 340% — deploy bilingual volunteers to Gates A, C
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  // Animate counters
  setTimeout(() => {
    container.querySelectorAll('[data-count]').forEach(el => {
      animateCounter(el, parseInt(el.dataset.count), 1800);
    });
  }, 300);

  // Load AI predictions
  loadAIPredictions(venue, crowdData);

  // Incident click handlers
  container.querySelectorAll('.incident-item').forEach(item => {
    item.addEventListener('click', async () => {
      const panel = document.getElementById('ai-incident-panel');
      const content = document.getElementById('ai-incident-content');
      if (!panel || !content) return;
      panel.classList.remove('hidden');
      content.innerHTML = '<div style="padding:var(--sp-4);text-align:center;color:var(--text-tertiary);"><span style="animation:pulse 1.5s ease-in-out infinite;">🤖</span> AI generating response plan...</div>';

      try {
        const incident = JSON.parse(item.dataset.incident);
        const response = await getAIIncidentResponse(incident, venue);
        content.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);font-size:var(--fs-sm);">
            <div style="padding:var(--sp-3);background:rgba(0,229,160,0.05);border-left:2px solid var(--accent-teal);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
              <strong>AI Assessment:</strong> ${response.assessment}
            </div>
            <div><strong>Priority:</strong> <span class="badge ${response.priority === 'critical' ? 'badge-crimson' : response.priority === 'high' ? 'badge-gold' : 'badge-teal'}">${response.priority}</span></div>
            <div><strong>Actions:</strong>
              <ul style="list-style:none;margin-top:var(--sp-2);display:flex;flex-direction:column;gap:var(--sp-1);">
                ${response.actions.map(a => `<li style="font-size:var(--fs-xs);color:var(--text-secondary);">→ ${a}</li>`).join('')}
              </ul>
            </div>
            <div><strong>Resources:</strong> <span class="text-secondary">${response.resources_needed}</span></div>
            <div><strong>Est. Resolution:</strong> <span class="text-secondary">${response.estimated_resolution}</span></div>
            <div style="padding:var(--sp-3);background:rgba(212,175,55,0.05);border-left:2px solid var(--accent-gold);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
              <strong>📢 Draft PA (bilingual):</strong><br>
              <em style="font-size:var(--fs-xs);color:var(--text-secondary);">${response.communication}</em>
            </div>
            <div style="display:flex;gap:var(--sp-2);">
              <button class="btn btn-sm btn-primary btn-execute-incident-plan" data-title="${incident.title.replace(/"/g, '&quot;')}">✅ Execute Plan</button>
              <button class="btn btn-sm btn-secondary btn-broadcast-incident-pa" data-title="${incident.title.replace(/"/g, '&quot;')}">📢 Broadcast PA</button>
            </div>
          </div>
        `;
      } catch (err) {
        content.innerHTML = '<div style="color:var(--accent-crimson);padding:var(--sp-4);">Error generating response plan.</div>';
      }
    });
  });

  // Close incident panel
  document.getElementById('btn-close-incident-panel')?.addEventListener('click', () => {
    document.getElementById('ai-incident-panel')?.classList.add('hidden');
  });

  // Ask copilot button
  document.getElementById('btn-ask-copilot')?.addEventListener('click', () => {
    document.getElementById('chat-fab')?.click();
  });

  // Refresh predictions
  document.getElementById('btn-refresh-predictions')?.addEventListener('click', () => {
    loadAIPredictions(venue, generateCrowdData(venue));
  });

  // Execute Decision Actions
  container.querySelectorAll('.btn-execute-decision').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = btn.dataset.index;
      const title = btn.dataset.title;
      
      btn.textContent = 'Executed ✅';
      btn.disabled = true;
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      
      const badge = document.getElementById(`decision-badge-${idx}`);
      if (badge) {
        badge.textContent = 'RESOLVED';
        badge.className = 'badge badge-teal';
      }

      showToast(`AI Action Plan executed successfully: "${title}". Resources deployed.`, 'success');
    });
  });

  // Modify Decision Plan
  container.querySelectorAll('.btn-modify-decision').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = btn.dataset.title;
      openChatWithPrefill(`Modify plan for: "${title}". Let's adjust the details by...`, 'ops');
    });
  });

  // Execute Incident response Plan
  container.addEventListener('click', (e) => {
    const executeBtn = e.target.closest('.btn-execute-incident-plan');
    if (executeBtn) {
      const title = executeBtn.dataset.title;
      executeBtn.textContent = 'Plan Executed ✅';
      executeBtn.disabled = true;
      executeBtn.classList.remove('btn-primary');
      executeBtn.classList.add('btn-secondary');
      showToast(`Incident safety plan executed for: "${title}". First-responders dispatched.`, 'success');
    }
  });

  // Broadcast Incident PA
  container.addEventListener('click', (e) => {
    const broadcastBtn = e.target.closest('.btn-broadcast-incident-pa');
    if (broadcastBtn) {
      const title = broadcastBtn.dataset.title;
      showToast(`Bilingual PA Safety announcement broadcasted for: "${title}".`, 'warning');
    }
  });

  initCrowdFlowChart(crowdHistory);
  initStaffChart();
  observeAnimations(container);
}

async function loadAIPredictions(venue, crowdData) {
  const content = document.getElementById('ai-predictions-content');
  if (!content) return;

  try {
    const predictions = await getAICrowdPrediction(venue, crowdData);
    content.innerHTML = predictions.map(p => `
      <div style="display:flex;gap:var(--sp-3);align-items:flex-start;padding:var(--sp-3);background:var(--glass-bg);border-radius:var(--radius-sm);border-left:3px solid ${p.severity === 'critical' ? 'var(--accent-crimson)' : p.severity === 'warning' ? 'var(--accent-gold)' : 'var(--accent-teal)'};">
        <span>${p.severity === 'critical' ? '🔴' : p.severity === 'warning' ? '🟡' : '🟢'}</span>
        <div style="flex:1;">
          <div style="font-weight:var(--fw-semibold);font-size:var(--fs-sm);margin-bottom:2px;">${p.prediction}</div>
          <div style="font-size:var(--fs-xs);color:var(--text-secondary);">📍 ${p.zone} · ⏱️ ${p.eta}</div>
          <div style="font-size:var(--fs-xs);color:var(--accent-teal);margin-top:4px;">→ ${p.action}</div>
        </div>
      </div>
    `).join('');
  } catch {
    content.innerHTML = '<div style="color:var(--text-tertiary);padding:var(--sp-3);">Unable to load predictions.</div>';
  }
}

function initCrowdFlowChart(history) {
  const ctx = document.getElementById('crowd-flow-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(h => h.hour),
      datasets: [
        { label: 'Actual', data: history.map(h => h.actual), borderColor: '#00E5A0', backgroundColor: 'rgba(0,229,160,0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
        { label: 'AI Predicted', data: history.map(h => h.predicted), borderColor: '#D4AF37', borderDash: [5, 5], fill: false, tension: 0.4, pointRadius: 0, borderWidth: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8892a8', font: { family: 'Inter', size: 11 } } } },
      scales: {
        x: { ticks: { color: '#5a6478', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#5a6478', font: { size: 10 }, callback: v => (v / 1000) + 'K' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      },
    },
  });
  chartInstances.push(chart);
}

function initStaffChart() {
  const ctx = document.getElementById('staff-chart');
  if (!ctx || typeof Chart === 'undefined') return;
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Security', 'Medical', 'Volunteers', 'Concessions', 'Ops'],
      datasets: [{ data: [35, 15, 80, 45, 25], backgroundColor: ['#FF3B5C', '#00E5A0', '#3B82F6', '#F97316', '#A855F7'], borderWidth: 0 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#8892a8', font: { family: 'Inter', size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } } },
      cutout: '65%',
    },
  });
  chartInstances.push(chart);
}

function showToast(message, type = 'success') {
  const container = document.body;
  let toastEl = document.getElementById('ops-toast-container');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'ops-toast-container';
    toastEl.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px;pointer-events:none;';
    container.appendChild(toastEl);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: var(--sp-3) var(--sp-4);
    background: rgba(18, 24, 38, 0.95);
    border: 1px solid ${type === 'success' ? 'var(--accent-teal)' : type === 'warning' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.1)'};
    border-left: 4px solid ${type === 'success' ? 'var(--accent-teal)' : type === 'warning' ? 'var(--accent-gold)' : 'var(--text-secondary)'};
    color: var(--text-primary);
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
    border-radius: var(--radius-md);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    min-width: 280px;
    max-width: 450px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: 0;
    transform: translateY(12px);
    pointer-events: auto;
  `;
  
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  const safeMessage = escapeHTML(message);
  toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${safeMessage}</span>`;
  
  toastEl.appendChild(toast);

  // Trigger animation reflow
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => {
      toast.remove();
      if (toastEl.children.length === 0) {
        toastEl.remove();
      }
    }, 300);
  }, 4000);
}
