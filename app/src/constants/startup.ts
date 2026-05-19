// ── Timing (ms) ───────────────────────────────────────────────
export const TIMING = {
  logoHold:          1400,  // logo display before switching to ticker
  tick:              1100,  // interval between task advances
  minTicksAfterLoad: 2,     // tasks shown after loading completes
  exitFade:          500,
  exitDelay:         200,   // pause before screen fade-out starts
  // Logo phase
  arcDuration:       520,
  arcStagger:        110,   // delay between each arc quarter drawing
  pipDelay:          380,
  wordDelay:         260,
  wordDuration:      560,
  taglineDelay:      580,
  taglineDuration:   460,
  layerCrossfade:    360,   // logo ↔ ticker layer cross-fade
  initialIncoming:   420,   // first task fade-in when entering ticker
  // Ticker transitions
  tickFadeOut:       200,
  tickBuffer:        60,    // pause so React re-renders before fade-in
  tickFadeIn:        300,
  tickSlideDuration: 320,
} as const;

// ── Logo mark geometry ────────────────────────────────────────
export const MARK = {
  size:            80,
  radiusFactor:    0.38,
  strokeFactor:    0.07,
  strokeMin:       2.5,
  pipRadiusFactor: 0.05,
} as const;

// ── Center pip spring ─────────────────────────────────────────
export const SPRING = {
  damping:   12,
  stiffness: 70,
} as const;

// ── Ticker chip ───────────────────────────────────────────────
export const CHIP = {
  size:      72,
  radius:    22,
  iconSize:  32,
  bgOpacity: '18', // hex suffix ≈ 10% opacity
} as const;

export const TEXT_SLOT = {
  width:  260,
  height: 48,
} as const;

// ── Animation parameters ──────────────────────────────────────
export const ANIM = {
  inScaleFrom:    1.07,
  slideFrom:      14,
  wordTranslateY: 10,
} as const;

// ── Logo mark arc segments ────────────────────────────────────
export const ARC_SEGS = [
  { role: 'planner',   from: -90, to:   0 },
  { role: 'organizer', from:   0, to:  90 },
  { role: 'reminder',  from:  90, to: 180 },
  { role: 'executor',  from: 180, to: 270 },
] as const;

// ── Task pool ─────────────────────────────────────────────────
export type TaskRole = 'planner' | 'organizer' | 'reminder' | 'executor';

export type StartupTask = {
  text: string;
  role: TaskRole;
  icon: string;
};

export const ALL_TASKS: StartupTask[] = [
  { text: 'Calling the doctor',        role: 'reminder',  icon: 'call-outline'       },
  { text: 'Pay electric bill',         role: 'organizer', icon: 'flash-outline'      },
  { text: 'Order groceries',           role: 'executor',  icon: 'cart-outline'       },
  { text: 'Birthday party RSVPs',      role: 'planner',   icon: 'gift-outline'       },
  { text: 'Fix the leaky tap',         role: 'executor',  icon: 'build-outline'      },
  { text: 'Refill prescription',       role: 'reminder',  icon: 'medkit-outline'     },
  { text: 'Water the plants',          role: 'executor',  icon: 'leaf-outline'       },
  { text: 'Reply to landlord',         role: 'reminder',  icon: 'mail-outline'       },
  { text: 'Book vet visit',            role: 'planner',   icon: 'paw-outline'        },
  { text: 'Take out the bins',         role: 'executor',  icon: 'trash-outline'      },
  { text: 'Schedule car service',      role: 'organizer', icon: 'car-outline'        },
  { text: 'Sign permission slip',      role: 'organizer', icon: 'book-outline'       },
  { text: 'Plan visit to parents',     role: 'planner',   icon: 'gift-outline'       },
  { text: 'Return library books',      role: 'executor',  icon: 'book-outline'       },
  { text: 'Sort the recycling',        role: 'executor',  icon: 'water-outline'      },
  { text: 'Book dentist appointment',  role: 'planner',   icon: 'alarm-outline'      },
  { text: 'Check smoke alarm',         role: 'reminder',  icon: 'alarm-outline'      },
  { text: "Split last month's bills",  role: 'organizer', icon: 'flash-outline'      },
  { text: 'Remind about swim class',   role: 'reminder',  icon: 'alarm-outline'      },
  { text: 'Restock kitchen supplies',  role: 'planner',   icon: 'cart-outline'       },
  { text: 'Schedule dinner with mum',  role: 'organizer', icon: 'gift-outline'       },
  { text: 'Renew car insurance',       role: 'planner',   icon: 'car-outline'        },
  { text: 'Clear the gutters',         role: 'executor',  icon: 'build-outline'      },
  { text: 'File the taxes',            role: 'organizer', icon: 'calculator-outline' },
];
