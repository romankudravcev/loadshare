// tokens.js — shared palettes, personas, roles, weights

export const PALETTES = {
  dusk: {
    bg: '#EEF0EE',
    surface: '#FBFBF9',
    surfaceAlt: '#F4F5F2',
    ink: '#1C1F2A',
    inkSoft: '#3A3E4B',
    muted: '#6B7280',
    line: 'rgba(28,31,42,0.08)',
    lineStrong: 'rgba(28,31,42,0.16)',
    accent: '#6B7A8F',
    accent2: '#C9B8D6',
    accent3: '#A8B8A5',
    warn: '#C07B6B',
    planner: '#8D9AB3',
    organizer: '#B8A6C9',
    reminder: '#C2B48A',
    executor: '#8FA29B',
  },
  warm: {
    bg: '#F4EFE6',
    surface: '#FBF7F2',
    surfaceAlt: '#EFE9DD',
    ink: '#2B2A26',
    inkSoft: '#4A4843',
    muted: '#8C8779',
    line: 'rgba(43,42,38,0.08)',
    lineStrong: 'rgba(43,42,38,0.18)',
    accent: '#B8A88A',
    accent2: '#7A8471',
    accent3: '#C7A588',
    warn: '#B76A4C',
    planner: '#9EA88F',
    organizer: '#C9A87C',
    reminder: '#B8897A',
    executor: '#8A9BA4',
  },
  mono: {
    bg: '#F6F6F4',
    surface: '#FFFFFF',
    surfaceAlt: '#ECECE8',
    ink: '#111111',
    inkSoft: '#2F2F2F',
    muted: '#6B6B68',
    line: 'rgba(0,0,0,0.09)',
    lineStrong: 'rgba(0,0,0,0.18)',
    accent: '#4E5B4A',
    accent2: '#8B887E',
    accent3: '#C4B994',
    warn: '#A0553C',
    planner: '#6B6B68',
    organizer: '#4E5B4A',
    reminder: '#8B887E',
    executor: '#111111',
  },
};

export const ROLES = [
  { key: 'planner',   name: 'Planner',   verb: 'Thought of it',  desc: 'Noticed it needed doing', glyph: '◐' },
  { key: 'organizer', name: 'Organizer', verb: 'Scheduled it',   desc: 'Put it on the calendar',   glyph: '◑' },
  { key: 'reminder',  name: 'Reminder',  verb: 'Followed up',    desc: 'Nudged it forward',        glyph: '◒' },
  { key: 'executor',  name: 'Executor',  verb: 'Did it',         desc: 'Completed the task',       glyph: '●' },
];

export const PERSONAS = {
  couple: {
    label: 'Couple · Mira & Theo',
    members: [
      { id: 'm', name: 'Mira',  short: 'M', hue: 248 },
      { id: 't', name: 'Theo',  short: 'T', hue: 28 },
    ],
    tasks: [
      { id: 1,  title: 'Book dentist appointments',  planner:'m', organizer:'m', reminder:'m', executor:'t', when:'Tue',     status:'scheduled', weight: 3, category:'Health' },
      { id: 2,  title: 'Groceries for the week',     planner:'m', organizer:'t', reminder:'m', executor:'t', when:'Sat',     status:'done',      weight: 2, category:'Food' },
      { id: 3,  title: 'Call plumber about the leak',planner:'t', organizer:'m', reminder:'m', executor:'t', when:'Wed',     status:'scheduled', weight: 4, category:'Home' },
      { id: 4,  title: 'Plan visit to parents',      planner:'m', organizer:'m', reminder:'m', executor:'m', when:'next wk', status:'planning',  weight: 5, category:'Family' },
      { id: 5,  title: 'Replace smoke alarm battery',planner:'t', organizer:'t', reminder:'t', executor:'t', when:'Mon',     status:'done',      weight: 1, category:'Home' },
      { id: 6,  title: 'Taxes — gather receipts',    planner:'m', organizer:'m', reminder:'m', executor:'t', when:'Fri',     status:'scheduled', weight: 4, category:'Admin' },
      { id: 7,  title: 'Return library books',       planner:'t', organizer:'t', reminder:'m', executor:'t', when:'Wed',     status:'done',      weight: 1, category:'Errands' },
      { id: 8,  title: 'Water the plants',           planner:'m', organizer:'m', reminder:'m', executor:'t', when:'daily',   status:'recurring', weight: 1, category:'Home' },
      { id: 9,  title: 'Anniversary dinner plan',    planner:'m', organizer:'m', reminder:'m', executor:'m', when:'Sat',     status:'planning',  weight: 4, category:'Us' },
      { id: 10, title: 'Car service',                planner:'t', organizer:'t', reminder:'t', executor:'t', when:'next mo', status:'scheduled', weight: 3, category:'Admin' },
    ],
  },
  family: {
    label: 'Family · Okafor household',
    members: [
      { id: 'a', name: 'Amara', short: 'A', hue: 248 },
      { id: 'k', name: 'Kofi',  short: 'K', hue: 28 },
      { id: 'j', name: 'Jada',  short: 'J', hue: 150 },
    ],
    tasks: [
      { id: 1,  title: "Pack Jada's lunches",       planner:'a', organizer:'a', reminder:'a', executor:'k', when:'daily',   status:'recurring', weight: 2, category:'Kids' },
      { id: 2,  title: 'Sign permission slip',       planner:'a', organizer:'a', reminder:'a', executor:'k', when:'Mon',     status:'scheduled', weight: 1, category:'Kids' },
      { id: 3,  title: 'Swim class drop-off',        planner:'a', organizer:'a', reminder:'a', executor:'k', when:'Wed',     status:'recurring', weight: 2, category:'Kids' },
      { id: 4,  title: 'Birthday party RSVPs',       planner:'a', organizer:'a', reminder:'a', executor:'a', when:'Thu',     status:'planning',  weight: 3, category:'Family' },
      { id: 5,  title: 'Dishwasher broken',          planner:'k', organizer:'a', reminder:'a', executor:'k', when:'Fri',     status:'scheduled', weight: 4, category:'Home' },
      { id: 6,  title: 'Groceries',                  planner:'a', organizer:'a', reminder:'a', executor:'k', when:'Sat',     status:'scheduled', weight: 2, category:'Food' },
      { id: 7,  title: 'School bake sale',           planner:'a', organizer:'a', reminder:'a', executor:'a', when:'Sat',     status:'planning',  weight: 3, category:'Kids' },
      { id: 8,  title: "Jada's homework check",      planner:'a', organizer:'a', reminder:'a', executor:'j', when:'daily',   status:'recurring', weight: 2, category:'Kids' },
      { id: 9,  title: 'Take bins out',              planner:'k', organizer:'k', reminder:'k', executor:'k', when:'Tue',     status:'recurring', weight: 1, category:'Home' },
      { id: 10, title: "Plan Grandma's visit",       planner:'a', organizer:'a', reminder:'a', executor:'a', when:'next wk', status:'planning',  weight: 5, category:'Family' },
    ],
  },
  flat: {
    label: 'Flatmates · Cedar St.',
    members: [
      { id: 'r', name: 'Ren',  short: 'R', hue: 200 },
      { id: 's', name: 'Sami', short: 'S', hue: 340 },
      { id: 'l', name: 'Luka', short: 'L', hue: 60 },
    ],
    tasks: [
      { id: 1, title: 'Restock kitchen roll & soap', planner:'s', organizer:'s', reminder:'s', executor:'r', when:'Sun', status:'recurring', weight: 1, category:'Home' },
      { id: 2, title: 'Clean bathroom (rotation)',   planner:'s', organizer:'s', reminder:'s', executor:'l', when:'Sat', status:'scheduled', weight: 2, category:'Home' },
      { id: 3, title: 'Pay utilities',               planner:'r', organizer:'r', reminder:'s', executor:'r', when:'Mon', status:'scheduled', weight: 2, category:'Admin' },
      { id: 4, title: 'Take out bins',               planner:'s', organizer:'s', reminder:'s', executor:'l', when:'Tue', status:'recurring', weight: 1, category:'Home' },
      { id: 5, title: 'Fix wobbly shelf',            planner:'l', organizer:'l', reminder:'s', executor:'l', when:'Thu', status:'scheduled', weight: 2, category:'Home' },
      { id: 6, title: 'Landlord: radiator',          planner:'s', organizer:'s', reminder:'s', executor:'r', when:'Fri', status:'scheduled', weight: 3, category:'Admin' },
      { id: 7, title: 'House dinner Sat',            planner:'l', organizer:'l', reminder:'l', executor:'l', when:'Sat', status:'planning',  weight: 3, category:'Us' },
      { id: 8, title: 'Split holiday bills',         planner:'s', organizer:'s', reminder:'s', executor:'s', when:'Wed', status:'done',      weight: 2, category:'Admin' },
    ],
  },
};

export const WEIGHTS = [
  { value: 1, label: 'Quick',  sub: 'under 15 min',      bars: 1 },
  { value: 2, label: 'Normal', sub: '15–45 min',         bars: 2 },
  { value: 3, label: 'Effort', sub: '1–2 hrs · focus',   bars: 3 },
  { value: 4, label: 'Heavy',  sub: 'half a day',        bars: 4 },
  { value: 5, label: 'Epic',   sub: 'multi-day / draining', bars: 5 },
];

export const weightOf = (v) => WEIGHTS.find(w => w.value === v) || WEIGHTS[1];

export function computeLoad(persona) {
  const init = Object.fromEntries(
    persona.members.map(m => [m.id, { planner: 0, organizer: 0, reminder: 0, executor: 0, total: 0, mental: 0, physical: 0 }])
  );
  persona.tasks.forEach(t => {
    // Only count active tasks towards current mental load? Let's count all or maybe only non-done.
    // The previous implementation counted all tasks, let's just count active ones for true load.
    if (t.status === 'done') return;
    
    ROLES.forEach(r => {
      const who = t[r.key];
      if (who && init[who]) {
        init[who][r.key] += t.weight;
        init[who].total  += t.weight;
        
        if (r.key === 'executor') {
          init[who].physical += t.weight;
        } else {
          init[who].mental += t.weight;
        }
      }
    });
  });
  return init;
}

// Convert hue to light tinted color for avatars / arcs
export function memberBg(hue) {
  return `hsl(${hue}, 38%, 76%)`;
}
export function memberInk(hue) {
  return `hsl(${hue}, 45%, 26%)`;
}
export function memberArc(hue) {
  return `hsl(${hue}, 35%, 73%)`;
}
export function memberPlate(hue, index) {
  return `hsl(${hue}, 32%, ${74 - index * 8}%)`;
}
