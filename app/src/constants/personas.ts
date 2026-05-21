import type { Persona } from '../types';

export const PERSONAS: Record<string, Persona> = {
  couple: {
    label: 'Couple · Mira & Theo',
    members: [
      { id: 'm', name: 'Mira', short: 'M', hue: 248 },
      { id: 't', name: 'Theo', short: 'T', hue: 28 },
    ],
    tasks: [
      { id: 1,  title: 'Book dentist appointments',   planner:'m', organizer:'m', reminder:'m', executor:'t', when:'Tue',     status:'scheduled', weight:3, category:'Health' },
      { id: 2,  title: 'Groceries for the week',      planner:'m', organizer:'t', reminder:'m', executor:'t', when:'Sat',     status:'done',      weight:2, category:'Food' },
      { id: 3,  title: 'Call plumber about the leak', planner:'t', organizer:'m', reminder:'m', executor:'t', when:'Wed',     status:'scheduled', weight:4, category:'Home' },
      { id: 4,  title: 'Plan visit to parents',       planner:'m', organizer:'m', reminder:'m', executor:'m', when:'next wk', status:'planning',  weight:5, category:'Family' },
      { id: 5,  title: 'Replace smoke alarm battery', planner:'t', organizer:'t', reminder:'t', executor:'t', when:'Mon',     status:'done',      weight:1, category:'Home' },
      { id: 6,  title: 'Taxes — gather receipts',     planner:'m', organizer:'m', reminder:'m', executor:'t', when:'Fri',     status:'scheduled', weight:4, category:'Admin' },
      { id: 7,  title: 'Return library books',        planner:'t', organizer:'t', reminder:'m', executor:'t', when:'Wed',     status:'done',      weight:1, category:'Errands' },
      { id: 8,  title: 'Water the plants',            planner:'m', organizer:'m', reminder:'m', executor:'t', when:'daily',   status:'recurring', weight:1, category:'Home' },
      { id: 9,  title: 'Anniversary dinner plan',     planner:'m', organizer:'m', reminder:'m', executor:'m', when:'Sat',     status:'planning',  weight:4, category:'Family' },
      { id: 10, title: 'Car service',                 planner:'t', organizer:'t', reminder:'t', executor:'t', when:'next mo', status:'scheduled', weight:3, category:'Admin' },
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
      { id: 1,  title: "Pack Jada's lunches",       planner:'a', organizer:'a', reminder:'a', executor:'k', when:'daily',   status:'recurring', weight:2, category:'Kids' },
      { id: 2,  title: 'Sign permission slip',       planner:'a', organizer:'a', reminder:'a', executor:'k', when:'Mon',     status:'scheduled', weight:1, category:'Kids' },
      { id: 3,  title: 'Swim class drop-off',        planner:'a', organizer:'a', reminder:'a', executor:'k', when:'Wed',     status:'recurring', weight:2, category:'Kids' },
      { id: 4,  title: 'Birthday party RSVPs',       planner:'a', organizer:'a', reminder:'a', executor:'a', when:'Thu',     status:'planning',  weight:3, category:'Family' },
      { id: 5,  title: 'Dishwasher broken',          planner:'k', organizer:'a', reminder:'a', executor:'k', when:'Fri',     status:'scheduled', weight:4, category:'Home' },
      { id: 6,  title: 'Groceries',                  planner:'a', organizer:'a', reminder:'a', executor:'k', when:'Sat',     status:'scheduled', weight:2, category:'Food' },
      { id: 7,  title: 'School bake sale',           planner:'a', organizer:'a', reminder:'a', executor:'a', when:'Sat',     status:'planning',  weight:3, category:'Kids' },
      { id: 8,  title: "Jada's homework check",      planner:'a', organizer:'a', reminder:'a', executor:'j', when:'daily',   status:'recurring', weight:2, category:'Kids' },
      { id: 9,  title: 'Take bins out',              planner:'k', organizer:'k', reminder:'k', executor:'k', when:'Tue',     status:'recurring', weight:1, category:'Home' },
      { id: 10, title: "Plan Grandma's visit",       planner:'a', organizer:'a', reminder:'a', executor:'a', when:'next wk', status:'planning',  weight:5, category:'Family' },
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
      { id: 1, title: 'Restock kitchen roll & soap', planner:'s', organizer:'s', reminder:'s', executor:'r', when:'Sun', status:'recurring', weight:1, category:'Home' },
      { id: 2, title: 'Clean bathroom (rotation)',   planner:'s', organizer:'s', reminder:'s', executor:'l', when:'Sat', status:'scheduled', weight:2, category:'Home' },
      { id: 3, title: 'Pay utilities',               planner:'r', organizer:'r', reminder:'s', executor:'r', when:'Mon', status:'scheduled', weight:2, category:'Admin' },
      { id: 4, title: 'Take out bins',               planner:'s', organizer:'s', reminder:'s', executor:'l', when:'Tue', status:'recurring', weight:1, category:'Home' },
      { id: 5, title: 'Fix wobbly shelf',            planner:'l', organizer:'l', reminder:'s', executor:'l', when:'Thu', status:'scheduled', weight:2, category:'Home' },
      { id: 6, title: 'Landlord: radiator',          planner:'s', organizer:'s', reminder:'s', executor:'r', when:'Fri', status:'scheduled', weight:3, category:'Admin' },
      { id: 7, title: 'House dinner Sat',            planner:'l', organizer:'l', reminder:'l', executor:'l', when:'Sat', status:'planning',  weight:3, category:'Family' },
      { id: 8, title: 'Split holiday bills',         planner:'s', organizer:'s', reminder:'s', executor:'s', when:'Wed', status:'done',      weight:2, category:'Admin' },
    ],
  },
};
