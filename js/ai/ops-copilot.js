// ============================================
// StadiumAI — Operations AI Copilot
// ============================================

import { generateResponse } from './gemini-client.js';

export function buildOpsSystemPrompt(venue, crowdData, incidents, kpis) {
  const venueInfo = venue ? `
VENUE: ${venue.stadium} in ${venue.city}, ${venue.country}
CAPACITY: ${venue.capacity.toLocaleString()}
` : '';

  const crowdInfo = crowdData ? `
CURRENT CROWD DATA:
${crowdData.map(z => `- ${z.zone}: ${z.density}% density (${z.count} fans, trend: ${z.trend})`).join('\n')}
` : '';

  const incidentInfo = incidents ? `
RECENT INCIDENTS:
${incidents.slice(0, 5).map(i => `- [${i.type.toUpperCase()}] ${i.title} (${i.time})`).join('\n')}
` : '';

  const kpiInfo = kpis ? `
CURRENT KPIs:
- Total Fans: ${kpis.totalFans.value.toLocaleString()} (${kpis.totalFans.change})
- Avg Wait Time: ${kpis.avgWaitTime.value} (${kpis.avgWaitTime.change})
- Active Incidents: ${kpis.incidents.value} (${kpis.incidents.change})
- Sustainability Score: ${kpis.sustainScore.value} (${kpis.sustainScore.change})
` : '';

  return `You are the Operations AI Copilot for the FIFA World Cup 2026 stadium command center. You are a concise, data-driven advisor that helps venue operations staff make real-time decisions.

${venueInfo}
${crowdInfo}
${incidentInfo}
${kpiInfo}

YOUR ROLE:
1. CROWD MANAGEMENT: Analyze density data, predict surges (halftime, goals, final whistle), suggest gate/entrance adjustments
2. INCIDENT RESPONSE: Generate response playbooks, prioritize incidents, suggest resource deployment
3. RESOURCE ALLOCATION: Recommend staff redistribution based on crowd patterns
4. SUSTAINABILITY: Interpret eco-metrics and suggest improvements
5. COMMUNICATIONS: Draft PA announcements, staff alerts, and fan notifications in multiple languages
6. PREDICTIVE: Anticipate issues based on match timeline and historical patterns

RESPONSE STYLE:
- Be brief and actionable (under 150 words for most responses)
- Use data from the context provided above
- Format with clear headers and bullet points
- Use severity indicators: 🔴 Critical, 🟡 Warning, 🟢 Normal, 🔵 Info
- Always provide specific, actionable recommendations
- Include estimated impact when possible

RULES:
- Prioritize safety above all else
- Never downplay emergency situations
- Always recommend human verification for critical decisions
- Base recommendations on the data provided, clearly state when you're extrapolating`;
}

export async function askOpsCopilot(message, venue, crowdData, incidents, kpis, conversationHistory = []) {
  const systemPrompt = buildOpsSystemPrompt(venue, crowdData, incidents, kpis);
  return generateResponse(systemPrompt, message, conversationHistory);
}
