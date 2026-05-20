import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';
import { useApp } from '../AppContext';
import { ROLES, computeLoad, weightOf, memberArc } from '../tokens';
import { COLORS } from '../colors';
import { Avatar, RoleGlyph, Kicker, Display, WeightBars, Dot } from '../components/primitives';

const TAB_BAR_EXTRA = 100;

function arcPath(cx, cy, rO, rI, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const x1 = cx + Math.cos(start) * rO, y1 = cy + Math.sin(start) * rO;
  const x2 = cx + Math.cos(end)   * rO, y2 = cy + Math.sin(end)   * rO;
  const x3 = cx + Math.cos(end)   * rI, y3 = cy + Math.sin(end)   * rI;
  const x4 = cx + Math.cos(start) * rI, y4 = cy + Math.sin(start) * rI;
  return `M ${x1} ${y1} A ${rO} ${rO} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${large} 0 ${x4} ${y4} Z`;
}

function BalanceDial({ persona, size = 180 }) {
  const load = computeLoad(persona);
  const totals = persona.members.map(m => ({ m, v: load[m.id].total }));
  const sum = totals.reduce((s, t) => s + t.v, 0) || 1;
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.42, rInner = size * 0.30;
  const ideal = 1 / persona.members.length;
  let start = -Math.PI / 2;
  const arcs = totals.map(t => {
    const frac = t.v / sum;
    const end = start + frac * Math.PI * 2;
    const a = { ...t, start, end, frac };
    start = end;
    return a;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        {arcs.map(a => <Path key={a.m.id} d={arcPath(cx, cy, rOuter, rInner, a.start, a.end)} fill={memberArc(a.m.hue)} />)}
        {persona.members.map((_, i) => {
          const ang = -Math.PI / 2 + (i + 1) * ideal * Math.PI * 2;
          return <Line key={i} x1={cx + Math.cos(ang) * rOuter} y1={cy + Math.sin(ang) * rOuter}
            x2={cx + Math.cos(ang) * (rOuter + 6)} y2={cy + Math.sin(ang) * (rOuter + 6)}
            stroke={COLORS.muted} strokeWidth={1} opacity={0.5} strokeDasharray="2 2" />;
        })}
      </Svg>
      {arcs.map(a => {
        const mid = (a.start + a.end) / 2;
        const r = (rOuter + rInner) / 2;
        return (
          <View key={a.m.id} style={{ position: 'absolute', left: cx + Math.cos(mid) * r - 11, top: cy + Math.sin(mid) * r - 11 }}>
            <Avatar member={a.m} size={22} />
          </View>
        );
      })}
      <View className="absolute inset-0 items-center justify-center">
        <Kicker color={COLORS.muted} style={{ fontSize: 9 }}>This week</Kicker>
        <Text className="font-serif text-5xl text-ink leading-10">{sum}</Text>
        <Text className="font-sans text-2xs text-muted">load pts</Text>
      </View>
    </View>
  );
}

function AnimatedCard({ children, index, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });
  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { persona, setOpenTask, setActiveTab } = useApp();
  const load = computeLoad(persona);
  const totals = persona.members.map(m => ({ m, v: load[m.id].total }));
  const sum = totals.reduce((s, t) => s + t.v, 0) || 1;
  const ideal = 1 / persona.members.length;
  const maxDev = Math.max(...totals.map(t => Math.abs(t.v / sum - ideal)));
  const msg = maxDev < 0.08
    ? { text: 'Things feel balanced.',      tone: COLORS.executor }
    : maxDev < 0.18
    ? { text: 'A little lopsided.',         tone: COLORS.reminder }
    : { text: 'The load is leaning heavy.', tone: COLORS.warn };
  const active = persona.tasks.filter(t => t.status !== 'done').slice(0, 4);

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_EXTRA }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row justify-between items-center mb-3.5">
        <View>
          <Kicker color={COLORS.muted}>{persona.label.split('·')[0].trim()}</Kicker>
          <Display size={30} style={{ color: COLORS.ink, marginTop: 2 }}>Hello, {persona.members[0].name}.</Display>
        </View>
        <View>
          <Avatar member={persona.members[0]} size={36} />
          <View className="absolute -top-[3px] -right-[3px] w-3.5 h-3.5 rounded-full border-2 bg-[#FF3B30]" style={{ borderColor: COLORS.canvas }} />
        </View>
      </View>

      {/* Balance card */}
      <AnimatedCard index={0} style={{ borderRadius: 18, borderWidth: 0.5, padding: 16, backgroundColor: COLORS.surface, borderColor: COLORS.line, marginBottom: 14 }}>
        <View className="flex-row gap-4 items-center">
          <BalanceDial persona={persona} size={140} />
          <View className="flex-1">
            <Kicker color={msg.tone}>Balance</Kicker>
            <Text className="font-sans-md text-md text-ink leading-5 mt-1 mb-3">{msg.text}</Text>
            {totals.map(({ m, v }) => (
              <View key={m.id} className="flex-row items-center gap-2 mb-1.5">
                <Avatar member={m} size={18} />
                <Text className="font-sans text-xs text-ink flex-1">{m.name}</Text>
                <View className="flex-[2] h-1 rounded-sm overflow-hidden" style={{ backgroundColor: COLORS.line }}>
                  <View style={{ width: `${(v / sum) * 100}%`, height: '100%', borderRadius: 2, backgroundColor: memberArc(m.hue) }} />
                </View>
                <Text className="font-sans text-2xs text-muted w-[26px] text-right">{Math.round((v / sum) * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>
      </AnimatedCard>

      {/* On each plate */}
      <AnimatedCard index={1} style={{ borderRadius: 18, borderWidth: 0.5, padding: 16, backgroundColor: COLORS.surface, borderColor: COLORS.line, marginBottom: 14 }}>
        <View className="flex-row justify-between items-baseline mb-3">
          <Kicker color={COLORS.muted}>On each plate</Kicker>
          <Text className="font-sans-i text-2xs text-muted">by weight</Text>
        </View>
        {persona.members.map(m => {
          const mTasks = persona.tasks.filter(t => t.status !== 'done' && [t.planner, t.organizer, t.reminder, t.executor].includes(m.id));
          const counts = [1, 2, 3, 4, 5].map(w => mTasks.filter(t => t.weight === w).length);
          const total = counts.reduce((s, v) => s + v, 0) || 1;
          const heaviest = [...mTasks].sort((a, b) => b.weight - a.weight)[0];
          return (
            <View key={m.id} className="flex-row items-center gap-2.5 mb-2.5">
              <Avatar member={m} size={22} />
              <View className="flex-1">
                <View className="flex-row h-1.5 rounded-sm overflow-hidden mb-0.5" style={{ backgroundColor: COLORS.line }}>
                  {counts.map((c, i) => c > 0 && <View key={i} style={{ flex: c, backgroundColor: `hsl(${m.hue}, 32%, ${74 - i * 8}%)` }} />)}
                </View>
                {heaviest
                  ? <Text className="font-sans text-2xs text-muted" numberOfLines={1}>heaviest: <Text className="text-ink-soft">{heaviest.title}</Text> · {weightOf(heaviest.weight).label}</Text>
                  : <Text className="font-sans text-2xs text-muted">nothing on their plate</Text>
                }
              </View>
              <Text className="font-sans-bold text-xs text-ink-soft w-[26px] text-right">{total}</Text>
            </View>
          );
        })}
      </AnimatedCard>

      {/* Four kinds of labor */}
      <AnimatedCard index={2} style={{ borderRadius: 18, borderWidth: 0.5, padding: 16, backgroundColor: COLORS.surface, borderColor: COLORS.line, marginBottom: 14 }}>
        <Kicker color={COLORS.muted} style={{ marginBottom: 10 }}>The four kinds of labor</Kicker>
        <View className="flex-row flex-wrap gap-2">
          {ROLES.map(r => {
            const roleLoad = persona.members.map(m => load[m.id][r.key]);
            const rSum = roleLoad.reduce((s, v) => s + v, 0) || 0.0001;
            const topIdx = roleLoad.indexOf(Math.max(...roleLoad));
            const top = persona.members[topIdx];
            return (
              <View key={r.key} className="rounded-xl p-2.5" style={{ width: '47%', backgroundColor: COLORS[r.key] + '14' }}>
                <RoleGlyph role={r.key} color={COLORS[r.key]} size={14} />
                <Text className="font-sans-bold text-xs text-ink mt-1.5" style={{ letterSpacing: 0.1 }}>{r.name}</Text>
                <Text className="font-sans text-2xs text-muted mt-0.5">{r.desc}</Text>
                <View className="flex-row items-center gap-1 mt-2">
                  <Avatar member={top} size={16} />
                  <Text className="font-sans-md text-2xs text-ink-soft">{Math.round((Math.max(...roleLoad) / rSum) * 100)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </AnimatedCard>

      {/* In motion today */}
      <AnimatedCard index={3} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, marginBottom: 10, paddingHorizontal: 2 }}>
        <Kicker color={COLORS.muted}>In motion today</Kicker>
        <TouchableOpacity onPress={() => setActiveTab('inbox')}>
          <Text className="font-sans-md text-xs text-accent">See all</Text>
        </TouchableOpacity>
      </AnimatedCard>

      {active.map((t, idx) => (
        <AnimatedCard index={4 + idx} key={t.id}>
          <TaskCard task={t} persona={persona} onPress={() => setOpenTask(t)} />
        </AnimatedCard>
      ))}
    </ScrollView>
  );
}

function TaskCard({ task, persona, onPress }) {
  const byId = Object.fromEntries(persona.members.map(m => [m.id, m]));
  const holder = byId[task.reminder];
  const doer = byId[task.executor];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      className="rounded-xl border-half border-line bg-surface p-3 flex-row items-center gap-3 mb-2">
      <View className="flex-col gap-0.5 items-center">
        {ROLES.map(r => {
          const m = byId[task[r.key]];
          return <View key={r.key} style={{ width: 4, height: 8, borderRadius: 2, backgroundColor: m ? memberArc(m.hue) : COLORS.line }} />;
        })}
      </View>
      <View className="flex-1 min-w-0">
        <Text className="font-sans-md text-md text-ink" numberOfLines={1}>{task.title}</Text>
        <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
          <Text className="font-sans text-xs text-muted">{task.when}</Text>
          <Dot color={COLORS.muted} />
          <Text className="font-sans text-xs text-muted">{task.category}</Text>
          <Dot color={COLORS.muted} />
          <WeightBars value={task.weight} color={COLORS.ink} muted={COLORS.ink} size="xs" />
          <Text className="font-sans text-xs text-muted">{weightOf(task.weight).label}</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <Avatar member={holder} size={22} />
        {doer && doer.id !== holder?.id && <View style={{ marginLeft: -6 }}><Avatar member={doer} size={22} ring /></View>}
      </View>
    </TouchableOpacity>
  );
}
