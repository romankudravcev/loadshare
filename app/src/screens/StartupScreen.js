import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../AppContext';

const AnimatedPath   = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── Timing ────────────────────────────────────────────────────
const LOGO_MS    = 1400;  // hold logo before switching to ticker
const TICK_MS    = 900;   // time each task is shown
const CROSSFADE  = 280;   // overlap between out and in animations
const MIN_TICKS  = 2;     // minimum tasks shown after loading done
const FADE_MS    = 500;

// ── Task pool ─────────────────────────────────────────────────
const ALL_TASKS = [
  { text: 'Calling the doctor',       role: 'reminder' },
  { text: 'Pay electric bill',        role: 'organizer' },
  { text: 'Order groceries',          role: 'executor' },
  { text: 'Birthday party RSVPs',     role: 'planner' },
  { text: 'Fix the leaky tap',        role: 'executor' },
  { text: 'Refill prescription',      role: 'reminder' },
  { text: 'Water the plants',         role: 'executor' },
  { text: 'Reply to landlord',        role: 'reminder' },
  { text: 'Book vet visit',           role: 'planner' },
  { text: 'Take out the bins',        role: 'executor' },
  { text: 'Schedule car service',     role: 'organizer' },
  { text: 'Sign permission slip',     role: 'organizer' },
  { text: 'Plan visit to parents',    role: 'planner' },
  { text: 'Return library books',     role: 'executor' },
  { text: 'Sort the recycling',       role: 'executor' },
  { text: 'Book dentist appointment', role: 'planner' },
  { text: 'Check smoke alarm',        role: 'reminder' },
  { text: 'Split last month's bills', role: 'organizer' },
  { text: 'Remind about swim class',  role: 'reminder' },
  { text: 'Restock kitchen supplies', role: 'planner' },
  { text: 'Schedule dinner with mum', role: 'organizer' },
  { text: 'Renew car insurance',      role: 'planner' },
  { text: 'Clear the gutters',        role: 'executor' },
  { text: 'File the taxes',           role: 'organizer' },
];

// ── LoadShare quartered-ring mark ─────────────────────────────
const MARK_SIZE = 80;
const MARK_R    = MARK_SIZE * 0.38;
const ARC_LEN   = (Math.PI * 2 * MARK_R) / 4;
const STROKE_W  = Math.max(2.5, MARK_SIZE * 0.07);

function LSMark({ palette, arcAnims, pipAnim }) {
  const cx = MARK_SIZE / 2, cy = MARK_SIZE / 2;

  const segs = [
    { color: palette.planner,   from: -90, to:   0 },
    { color: palette.organizer, from:   0, to:  90 },
    { color: palette.reminder,  from:  90, to: 180 },
    { color: palette.executor,  from: 180, to: 270 },
  ];

  const pt = (deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + MARK_R * Math.cos(a), cy + MARK_R * Math.sin(a)];
  };

  return (
    <Svg width={MARK_SIZE} height={MARK_SIZE}>
      {segs.map(({ color, from, to }, i) => {
        const [x1, y1] = pt(from);
        const [x2, y2] = pt(to);
        return (
          <AnimatedPath
            key={i}
            d={`M ${x1} ${y1} A ${MARK_R} ${MARK_R} 0 0 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={arcAnims[i]}
          />
        );
      })}
      <AnimatedCircle
        cx={cx} cy={cy} r={MARK_SIZE * 0.05}
        fill={palette.ink}
        opacity={pipAnim}
      />
    </Svg>
  );
}

// ── Boot screen ───────────────────────────────────────────────
export function StartupScreen({ onComplete }) {
  const { palette, loading } = useApp();

  // Shuffle once on mount — long enough to never repeat during a session
  const queue = useMemo(() => {
    const shuffled = [...ALL_TASKS].sort(() => Math.random() - 0.5);
    // Repeat if needed so we always have plenty
    return [...shuffled, ...shuffled];
  }, []);

  // ── State ──────────────────────────────────────────────────
  const [phase, setPhase]   = useState('logo');   // 'logo' | 'ticker'
  const tickRef             = useRef(0);          // current queue index (ref avoids stale closures)
  const [displayTick, setDisplayTick] = useState(0); // drives which task is rendered
  const ticksAfterDone      = useRef(0);          // how many ticks shown after loading finished
  const logoPhoneDone       = useRef(false);      // true once logo phase ends
  const exitScheduled       = useRef(false);

  // ── Animation values ───────────────────────────────────────
  const arcAnims   = useRef([0,1,2,3].map(() => new Animated.Value(ARC_LEN))).current;
  const pipAnim    = useRef(new Animated.Value(0)).current;
  const wordAnim   = useRef(new Animated.Value(0)).current;
  const tagAnim    = useRef(new Animated.Value(0)).current;
  const logoLayer  = useRef(new Animated.Value(1)).current;
  const tickerLayer= useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  // Per-task slot — outgoing and incoming
  const inOpacity  = useRef(new Animated.Value(0)).current;
  const inSlide    = useRef(new Animated.Value(18)).current;
  const outOpacity = useRef(new Animated.Value(0)).current;
  const outSlide   = useRef(new Animated.Value(0)).current;
  const [slots, setSlots] = useState({ current: 0, next: 1 }); // indices into queue

  // ── Helpers ────────────────────────────────────────────────
  const exit = () => {
    if (exitScheduled.current) return;
    exitScheduled.current = true;
    Animated.timing(screenFade, {
      toValue: 0, duration: FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onComplete?.());
  };

  const advanceTick = () => {
    const next = tickRef.current + 1;
    tickRef.current = next;

    // Track ticks after loading done
    if (!loading) ticksAfterDone.current += 1;

    setSlots(prev => ({ current: prev.next, next: (prev.next + 1) % queue.length }));
    setDisplayTick(next);

    // Crossfade: outgoing fades up, incoming slides in — overlapping
    outOpacity.setValue(1);
    outSlide.setValue(0);
    inOpacity.setValue(0);
    inSlide.setValue(18);

    Animated.parallel([
      // Outgoing: slide up and fade
      Animated.timing(outOpacity, {
        toValue: 0, duration: CROSSFADE + 60,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(outSlide, {
        toValue: -14, duration: CROSSFADE + 80,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      // Incoming: slide up from below and fade in (slightly delayed)
      Animated.sequence([
        Animated.delay(CROSSFADE - 80),
        Animated.parallel([
          Animated.timing(inOpacity, {
            toValue: 1, duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(inSlide, {
            toValue: 0, duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  };

  // ── Logo phase ─────────────────────────────────────────────
  useEffect(() => {
    const timers = [];

    // Draw arcs staggered
    Animated.stagger(110, arcAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 0, duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // SVG prop — can't use native driver
      })
    )).start();

    // Pip + wordmark
    timers.push(setTimeout(() =>
      Animated.spring(pipAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: false }).start()
    , 380));

    timers.push(setTimeout(() =>
      Animated.timing(wordAnim, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    , 260));

    timers.push(setTimeout(() =>
      Animated.timing(tagAnim, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    , 580));

    // Transition to ticker
    timers.push(setTimeout(() => {
      logoPhoneDone.current = true;
      setPhase('ticker');

      Animated.parallel([
        Animated.timing(logoLayer,   { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(tickerLayer, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();

      // Animate first task in from scratch
      inOpacity.setValue(0);
      inSlide.setValue(18);
      Animated.parallel([
        Animated.timing(inOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(inSlide,   { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, LOGO_MS));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Ticker loop — driven by an interval once in ticker phase ──
  useEffect(() => {
    if (phase !== 'ticker') return;

    const id = setInterval(() => {
      // Check if we should exit after this tick
      const doneAndWaited = !loading && ticksAfterDone.current >= MIN_TICKS;
      if (doneAndWaited) {
        clearInterval(id);
        // Small pause so current task reads, then exit
        setTimeout(exit, 200);
        return;
      }
      advanceTick();
    }, TICK_MS);

    return () => clearInterval(id);
  }, [phase, loading]); // re-create when loading changes so interval picks up new value

  // ── If loading finishes between ticks, let the interval catch it ──
  // (no extra effect needed — the interval checks `loading` via ref already
  //  since we restart it on `loading` change above)

  const task    = queue[slots.current];
  const nextTask= queue[slots.next];
  const roleColor     = palette[task?.role]     ?? palette.muted;
  const nextRoleColor = palette[nextTask?.role] ?? palette.muted;

  return (
    <Animated.View style={[styles.root, { backgroundColor: palette.bg, opacity: screenFade }]}>

      {/* ── Logo layer ── */}
      <Animated.View style={[styles.layer, { opacity: logoLayer }]} pointerEvents="none">
        <LSMark palette={palette} arcAnims={arcAnims} pipAnim={pipAnim} />
        <Animated.Text style={[
          styles.wordmark, { color: palette.ink },
          { opacity: wordAnim, transform: [{ translateY: wordAnim.interpolate({ inputRange: [0,1], outputRange: [10, 0] }) }] },
        ]}>
          Load<Text style={styles.italic}>Share</Text>
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { color: palette.muted, opacity: tagAnim }]}>
          Share the load
        </Animated.Text>
      </Animated.View>

      {/* ── Ticker layer ── */}
      <Animated.View style={[styles.layer, { opacity: tickerLayer }]} pointerEvents="none">

        {/* Outgoing task */}
        <Animated.View style={[styles.taskRow, { opacity: outOpacity, transform: [{ translateY: outSlide }], position: 'absolute' }]}>
          <View style={[styles.chip, { backgroundColor: roleColor + '22' }]}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
          </View>
          <Text style={[styles.taskText, { color: palette.ink }]} numberOfLines={1}>
            {task?.text}<Text style={{ color: palette.muted }}>…</Text>
          </Text>
        </Animated.View>

        {/* Incoming task */}
        <Animated.View style={[styles.taskRow, { opacity: inOpacity, transform: [{ translateY: inSlide }] }]}>
          <View style={[styles.chip, { backgroundColor: nextRoleColor + '22' }]}>
            <View style={[styles.roleDot, { backgroundColor: nextRoleColor }]} />
          </View>
          <Text style={[styles.taskText, { color: palette.ink }]} numberOfLines={1}>
            {nextTask?.text}<Text style={{ color: palette.muted }}>…</Text>
          </Text>
        </Animated.View>

        {/* Dimmed wordmark */}
        <Text style={[styles.wordmarkSm, { color: palette.ink }]}>
          Load<Text style={styles.italic}>Share</Text>
        </Text>

        {/* Progress bar — fills while loading, pulses when done */}
        <View style={[styles.progressBg, { backgroundColor: palette.line }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: palette.ink, width: loading ? '60%' : '100%' }]} />
        </View>
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  layer: {
    position: 'absolute', width: '100%',
    alignItems: 'center', justifyContent: 'center', gap: 0,
  },
  wordmark: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 38, letterSpacing: -0.4, marginTop: 20,
  },
  wordmarkSm: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 28, letterSpacing: -0.3,
    opacity: 0.35, marginTop: 36,
  },
  italic: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
  },
  tagline: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase',
    marginTop: 12,
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 40, width: '100%',
    marginBottom: 20,
  },
  chip: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  roleDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  taskText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 17, letterSpacing: -0.2, flex: 1,
  },
  progressBg: {
    width: 100, height: 1.5, borderRadius: 1,
    overflow: 'hidden', marginTop: 8,
  },
  progressFill: {
    height: '100%', borderRadius: 1,
  },
});
