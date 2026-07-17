// ============================================
// StadiumAI — Fan Incident Reporting Page
// Fans can report incidents in real-time.
// GenAI gives them instant feedback on the response plan.
// ============================================

import { addIncident } from '../data/mock-data.js';
import { getAIIncidentResponse } from '../ai/insights-engine.js';
import { getVenueById } from '../data/venues.js';
import { observeAnimations, escapeHTML } from '../utils/helpers.js';

export function renderFanReport(container, venueId) {
  const venue = getVenueById(venueId || 'new-york');

  container.innerHTML = `
    <div class="section-header anim-on-scroll">
      <div>
        <h2 class="section-title">🚨 Report an Incident</h2>
        <p class="section-subtitle">${venue?.stadium || 'Stadium'} · Help us keep the stadium safe</p>
      </div>
      <span class="badge badge-crimson">Emergency & Facility Help</span>
    </div>

    <div class="grid grid-2">
      <!-- Left: Form -->
      <div class="card anim-on-scroll">
        <h4 style="margin-bottom:var(--sp-4);">📝 Incident Report Details</h4>
        <form id="incident-form" onsubmit="return false;">
          <div style="margin-bottom:var(--sp-4);">
            <label style="display:block;font-size:var(--fs-xs);color:var(--text-secondary);margin-bottom:6px;">Incident Type:</label>
            <select id="inc-type" style="width:100%;padding:var(--sp-3);background:var(--bg-secondary);border:1px solid var(--glass-border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--fs-sm);">
              <option value="medical">🏥 Medical Emergency</option>
              <option value="critical">🚨 Safety & Security Threat</option>
              <option value="warning">⚠️ Facility Hazard (spill, broken seat, elevator down)</option>
              <option value="info">ℹ️ Lost & Found / Assistance needed</option>
            </select>
          </div>

          <div style="margin-bottom:var(--sp-4);">
            <label style="display:block;font-size:var(--fs-xs);color:var(--text-secondary);margin-bottom:6px;">Location inside Stadium:</label>
            <input type="text" id="inc-location" placeholder="e.g. Section 215, Row 12 or Gate B restrooms" required
              style="width:100%;padding:var(--sp-3);background:var(--bg-secondary);border:1px solid var(--glass-border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--fs-sm);" />
          </div>

          <div style="margin-bottom:var(--sp-4);">
            <label style="display:block;font-size:var(--fs-xs);color:var(--text-secondary);margin-bottom:6px;">Describe what is happening:</label>
            <textarea id="inc-desc" rows="4" placeholder="Describe the incident with as much detail as possible..." required
              style="width:100%;padding:var(--sp-3);background:var(--bg-secondary);border:1px solid var(--glass-border);border-radius:var(--radius-md);color:var(--text-primary);font-size:var(--fs-sm);resize:vertical;"></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-report" style="width:100%;">
            🚨 Submit Report to Command Center
          </button>
        </form>
      </div>

      <!-- Right: AI Live Feedback -->
      <div class="card anim-on-scroll" style="border-color:rgba(0,229,160,0.15);">
        <h4 style="margin-bottom:var(--sp-2);">🤖 AI Real-Time Response Plan</h4>
        <p style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:var(--sp-4);">
          Once you submit, our Operations Command is instantly notified and Gemini generates a response plan.
        </p>
        <div id="ai-report-response" style="display:flex;flex-direction:column;gap:var(--sp-3);justify-content:center;align-items:center;min-height:200px;background:rgba(255,255,255,0.02);border-radius:var(--radius-md);padding:var(--sp-4);border:1px dashed var(--glass-border);">
          <div style="font-size:2.5rem;animation:float 2s ease-in-out infinite;">🤖</div>
          <div style="font-weight:600;font-size:var(--fs-sm);color:var(--text-secondary);">Awaiting incident submission...</div>
          <div style="font-size:var(--fs-xs);color:var(--text-tertiary);text-align:center;">Fill out the form on the left to see the AI response plan in real-time.</div>
        </div>
      </div>
    </div>
  `;

  // Submit handler
  document.getElementById('btn-submit-report')?.addEventListener('click', async () => {
    const type = document.getElementById('inc-type').value;
    const location = document.getElementById('inc-location').value.trim();
    const desc = document.getElementById('inc-desc').value.trim();

    if (!location || !desc) {
      alert('Please fill out all fields.');
      return;
    }

    const typeIcons = { medical: '🏥', critical: '🚨', warning: '⚠️', info: 'ℹ️' };
    const typeTitles = { medical: 'Medical Incident', critical: 'Security Incident', warning: 'Facility Hazard', info: 'Info Request' };

    // Escape user inputs to prevent XSS vulnerabilities
    const safeLocation = escapeHTML(location);
    const safeDesc = escapeHTML(desc);

    const newIncident = {
      type,
      icon: typeIcons[type] || '🚨',
      title: `${typeTitles[type]} - ${safeLocation}`,
      detail: `${safeDesc} • Reported by Fan App`,
    };

    // Add to shared incident list
    const reported = addIncident(newIncident);

    // AI Response Plan Loading
    const responseEl = document.getElementById('ai-report-response');
    responseEl.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = 'var(--sp-3)';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.height = '100%';
    
    const bot = document.createElement('div');
    bot.style.fontSize = '2rem';
    bot.style.animation = 'pulse 1.5s ease-in-out infinite';
    bot.textContent = '🤖';
    
    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.fontSize = 'var(--fs-sm)';
    title.style.color = 'var(--text-secondary)';
    title.textContent = 'GenAI Generating Response Plan...';
    
    const descEl = document.createElement('div');
    descEl.style.fontSize = 'var(--fs-xs)';
    descEl.style.color = 'var(--text-tertiary)';
    descEl.textContent = 'Gemini is calculating priority, dispatching resources and drafting announcements...';
    
    wrapper.appendChild(bot);
    wrapper.appendChild(title);
    wrapper.appendChild(descEl);
    responseEl.appendChild(wrapper);

    try {
      const plan = await getAIIncidentResponse(reported, venue);
      responseEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:var(--sp-3);width:100%;font-size:var(--fs-sm);text-align:left;">
          <div style="display:flex;align-items:center;gap:var(--sp-2);padding:var(--sp-3);background:rgba(0,229,160,0.06);border-radius:var(--radius-sm);color:var(--accent-teal);border:1px solid rgba(0,229,160,0.15);">
            ✅ <strong>Report Pushed to Operations Hub successfully!</strong>
          </div>
          <div style="padding:var(--sp-3);background:var(--bg-secondary);border-left:2px solid var(--accent-gold);border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
            <strong>AI Assessment:</strong> ${plan.assessment}
          </div>
          <div><strong>Response Priority:</strong> <span class="badge ${plan.priority === 'critical' ? 'badge-crimson' : plan.priority === 'high' ? 'badge-gold' : 'badge-teal'}">${plan.priority.toUpperCase()}</span></div>
          <div><strong>Command Center Actions:</strong>
            <ul style="list-style:none;margin-top:var(--sp-1);display:flex;flex-direction:column;gap:var(--sp-1);font-size:var(--fs-xs);color:var(--text-secondary);">
              ${plan.actions.map(a => `<li>→ ${a}</li>`).join('')}
            </ul>
          </div>
          <div><strong>Resources Dispatched:</strong> <span class="text-secondary" style="font-size:var(--fs-xs);">${plan.resources_needed}</span></div>
          <div><strong>Est. Response Time:</strong> <span class="text-secondary" style="font-size:var(--fs-xs);">${plan.estimated_resolution}</span></div>
          ${plan.priority === 'critical' ? `
            <div style="padding:var(--sp-3);background:rgba(255,59,92,0.05);border-left:2px solid var(--accent-crimson);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-size:var(--fs-xs);">
              <strong>📢 Pre-drafted PA Announcement:</strong><br>
              <em style="color:var(--text-secondary);">${plan.communication}</em>
            </div>
          ` : ''}
          <div style="margin-top:var(--sp-2);padding:var(--sp-3);background:rgba(0,229,160,0.02);border-radius:var(--radius-sm);font-size:var(--fs-xs);color:var(--text-tertiary);text-align:center;">
            ❤️ Please stay at the location if safe to do so. Volunteers are on their way.
          </div>
        </div>
      `;
    } catch {
      responseEl.innerHTML = '<div style="color:var(--accent-crimson);text-align:center;">Report received, but AI plan generation failed. Operations staff have been notified.</div>';
    }
  });

  observeAnimations(container);
}
