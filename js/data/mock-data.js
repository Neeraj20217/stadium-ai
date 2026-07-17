// ============================================
// StadiumAI — Mock Data Generators
// ============================================

// --- Crowd Density ---
export function generateCrowdData(venue) {
  const zones = venue?.zones || ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
  return zones.map(zone => ({
    zone,
    density: Math.floor(Math.random() * 100),
    trend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)],
    count: Math.floor(Math.random() * 5000) + 500,
  }));
}

export function generateGateData() {
  const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D'];
  return gates.map(gate => ({
    gate,
    throughput: Math.floor(Math.random() * 120) + 30,
    waitTime: Math.floor(Math.random() * 15) + 1,
    status: Math.random() > 0.2 ? 'open' : 'congested',
  }));
}

export function generateCrowdHistory() {
  const hours = [];
  let count = 0;
  for (let h = 0; h < 24; h++) {
    if (h >= 14 && h <= 16) count = Math.min(count + Math.floor(Math.random() * 12000) + 5000, 70000);
    else if (h >= 17 && h <= 19) count = 50000 + Math.floor(Math.random() * 20000);
    else if (h >= 20 && h <= 22) count = Math.max(count - Math.floor(Math.random() * 15000), 5000);
    else count = Math.floor(Math.random() * 3000);
    hours.push({ hour: `${h}:00`, actual: count, predicted: count + (Math.random() - 0.5) * 8000 });
  }
  return hours;
}

// --- Incidents ---
const incidentTypes = [
  { type: 'critical', icon: '🚨', titles: ['Medical Emergency - Section 215', 'Overcrowding Alert - Gate B', 'Power Outage - East Wing', 'Suspicious Package - Lot C'] },
  { type: 'warning', icon: '⚠️', titles: ['High Crowd Density - North Entrance', 'Wet Floor - Concourse Level 2', 'Long Queue - Food Court A', 'Lost Child Report - Section 112', 'Elevator Malfunction - Tower B'] },
  { type: 'info', icon: 'ℹ️', titles: ['VIP Arrival - Gate D', 'Halftime Services Active', 'Weather Update: Light Rain Expected', 'Press Conference Starting', 'Volunteer Shift Change'] },
  { type: 'success', icon: '✅', titles: ['Medical Case Resolved', 'Gate B Congestion Cleared', 'Accessibility Request Fulfilled', 'Lost Item Returned', 'Emergency Drill Complete'] },
];

let persistentIncidents = null;

export function getIncidents(count = 8) {
  if (!persistentIncidents) {
    persistentIncidents = [];
    for (let i = 0; i < count; i++) {
      const category = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      const title = category.titles[Math.floor(Math.random() * category.titles.length)];
      const minutesAgo = Math.floor(Math.random() * 59) + 1;
      persistentIncidents.push({
        id: `INC-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
        type: category.type,
        icon: category.icon,
        title,
        detail: `Reported by ${['Security', 'Volunteer', 'Sensor', 'Fan App', 'Staff'][Math.floor(Math.random() * 5)]} • Zone ${['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)]}`,
        time: `${minutesAgo}m ago`,
        timestamp: Date.now() - minutesAgo * 60000,
      });
    }
  }
  return [...persistentIncidents].sort((a, b) => b.timestamp - a.timestamp);
}

export function addIncident(incident) {
  getIncidents(); // Ensure initialization
  const newInc = {
    id: `INC-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    type: incident.type || 'info',
    icon: incident.icon || 'ℹ️',
    title: incident.title || 'Incident reported',
    detail: incident.detail || 'Reported by Fan App',
    time: 'Just now',
    timestamp: Date.now()
  };
  persistentIncidents.push(newInc);
  return newInc;
}

export function generateIncidents(count = 8) {
  return getIncidents(count);
}

// --- Sustainability ---
export function generateSustainabilityData() {
  return {
    carbon: {
      total: Math.floor(Math.random() * 50) + 120,
      target: 150,
      transit: Math.floor(Math.random() * 30) + 40,
      energy: Math.floor(Math.random() * 20) + 30,
      waste: Math.floor(Math.random() * 15) + 15,
      other: Math.floor(Math.random() * 10) + 10,
    },
    waste: {
      recycled: Math.floor(Math.random() * 20) + 55,
      composted: Math.floor(Math.random() * 15) + 15,
      landfill: Math.floor(Math.random() * 15) + 10,
      totalTons: (Math.random() * 5 + 8).toFixed(1),
    },
    energy: {
      totalKWh: Math.floor(Math.random() * 5000) + 15000,
      renewablePercent: Math.floor(Math.random() * 20) + 60,
      solarKWh: Math.floor(Math.random() * 3000) + 5000,
      gridKWh: Math.floor(Math.random() * 3000) + 4000,
    },
    water: {
      totalLiters: Math.floor(Math.random() * 50000) + 200000,
      perCapita: (Math.random() * 2 + 2.5).toFixed(1),
      recycledPercent: Math.floor(Math.random() * 15) + 30,
    },
  };
}

export function generateSustainabilityHistory() {
  const days = [];
  const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  labels.forEach(label => {
    days.push({
      label,
      carbon: Math.floor(Math.random() * 40) + 110,
      recyclingRate: Math.floor(Math.random() * 15) + 60,
      energyKWh: Math.floor(Math.random() * 5000) + 14000,
    });
  });
  return days;
}

// --- Match Data ---
const teams = [
  { name: 'Brazil', flag: '🇧🇷' }, { name: 'Argentina', flag: '🇦🇷' },
  { name: 'France', flag: '🇫🇷' }, { name: 'Germany', flag: '🇩🇪' },
  { name: 'Spain', flag: '🇪🇸' }, { name: 'England', flag: '🏴' },
  { name: 'USA', flag: '🇺🇸' }, { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Japan', flag: '🇯🇵' }, { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Portugal', flag: '🇵🇹' }, { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Canada', flag: '🇨🇦' }, { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Senegal', flag: '🇸🇳' }, { name: 'Australia', flag: '🇦🇺' },
];

export function generateMatches(count = 5) {
  const matches = [];
  const usedPairs = new Set();
  for (let i = 0; i < count; i++) {
    let t1, t2;
    do {
      t1 = Math.floor(Math.random() * teams.length);
      t2 = Math.floor(Math.random() * teams.length);
    } while (t1 === t2 || usedPairs.has(`${t1}-${t2}`));
    usedPairs.add(`${t1}-${t2}`);

    const isLive = i === 0;
    const isFinished = i > 2;
    matches.push({
      id: `M-${i}`,
      team1: teams[t1],
      team2: teams[t2],
      score1: isLive || isFinished ? Math.floor(Math.random() * 4) : '-',
      score2: isLive || isFinished ? Math.floor(Math.random() * 4) : '-',
      status: isLive ? 'LIVE' : isFinished ? 'FT' : `${14 + i * 3}:00`,
      venue: ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium', 'Estadio Azteca', 'Hard Rock Stadium'][i % 5],
      group: `Group ${String.fromCharCode(65 + (i % 8))}`,
    });
  }
  return matches;
}

// --- Operational KPIs ---
export function generateOpsKPIs(venue) {
  const capacity = venue?.capacity || 70000;
  const fanCount = Math.floor(capacity * (0.7 + Math.random() * 0.25));
  return {
    totalFans: { value: fanCount, trend: 'up', change: '+2.3%' },
    avgWaitTime: { value: `${Math.floor(Math.random() * 8) + 3} min`, trend: Math.random() > 0.5 ? 'down' : 'up', change: Math.random() > 0.5 ? '-12%' : '+5%' },
    incidents: { value: Math.floor(Math.random() * 8) + 2, trend: 'down', change: '-18%' },
    sustainScore: { value: `${Math.floor(Math.random() * 15) + 78}/100`, trend: 'up', change: '+3pts' },
  };
}
