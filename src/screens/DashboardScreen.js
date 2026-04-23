import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';
import { useApp } from '../AppContext';
import { ROLES, computeLoad, weightOf, memberArc } from '../tokens';
import { Avatar, RoleGlyph, Kicker, Display, WeightBars, Dot } from '../components/primitives';

const TAB_BAR_EXTRA = 100;

// Donut-wedge path helper (same math as web prototype)
function arcPath(cx, cy, rO, rI, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const x1 = cx + Math.cos(start) * rO, y1 = cy + Math.sin(start) * rO;
  const x2 = cx + Math.cos(end)   * rO, y2 = cy + Math.sin(end)   * rO;
  const x3 = cx + Math.cos(end)   * rI, y3 = cy + Math.sin(end)   * rI;
  const x4 = cx + Math.cos(start) * rI, y4 = cy + Math.sin(start) * rI;
  return `M ${x1} ${y1} A ${rO} ${rO} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${large} 0 ${x4} ${y4} Z`;
}

function BalanceDial({ persona, palette, size = 180 }) {
  const load = computeLoad(persona);
  const totals = persona.members.map(m => ({ m, v: load[m.id].total }));
  const sum = totals.reduce((s, t) => s + t.v, 0) || 1;
  const cx = size / 2, cy = size / 2;
  const rOuter = size * 0.42;
  const rInner = size * 0.30;
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
        {arcs.map(a => (
          <Path key={a.m.id}
            d={arcPath(cx, cy, rOuter, rInner, a.start, a.end)}
            fill={memberArc(a.m.hue)} />
        ))}
        {persona.members.map((_, i) => {
          const ang = -Math.PI / 2 + (i + 1) * ideal * Math.PI * 2;
          const x1 = cx + Math.cos(ang) * rOuter;
          const y1 = cy + Math.sin(ang) * rOuter;
          const x2 = cx + Math.cos(ang) * (rOuter + 6);
          const y2 = cy + Math.sin(ang) * (rOuter + 6);
          return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={palette.muted} strokeWidth={1} opacity={0.5} strokeDasharray="2 2" />;
        })}
      </Svg>

      {/* avatars at arc midpoints */}
      {arcs.map(a => {
        const mid = (a.start + a.end) / 2;
        const r = (rOuter + rInner) / 2;
        const x = cx + Math.cos(mid) * r;
        const y = cy + Math.sin(mid) * r;
        return (
          <View key={a.m.id} style={{
            position: 'absolute', left: x - 11, top: y - 11,
          }}>
            <Avatar member={a.m} size={22} />
          </View>
        );
      })}

      {/* center readout */}
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Kicker color={palette.muted} style={{ fontSize: 9 }}>This week</Kicker>
        <Text style={{ fontFamily: 'InstrumentSerif_400Regular', fontSize: 36, color: palette.ink, lineHeight: 40 }}>
          {sum}
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 10, color: palette.muted }}>load pts</Text>
      </View>
    </View>
  );
}

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { palette, persona, setOpenTask, setActiveTab } = useApp();
  const load = computeLoad(persona);
  const totals = persona.members.map(m => ({ m, v: load[m.id].total }));
  const sum = totals.reduce((s, t) => s + t.v, 0) || 1;

  const ideal = 1 / persona.members.length;
  const maxDev = Math.max(...totals.map(t => Math.abs(t.v / sum - ideal)));
  const msg = maxDev < 0.08
    ? { text: 'Things feel balanced.', tone: palette.executor }
    : maxDev < 0.18
    ? { text: 'A little lopsided.', tone: palette.reminder }
    : { text: 'The load is leaning heavy.', tone: palette.warn };

  const active = persona.tasks.filter(t => t.status !== 'done').slice(0, 4);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: TAB_BAR_EXTRA,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Kicker color={palette.muted}>{persona.label.split('·')[0].trim()}</Kicker>
          <Display size={30} style={{ color: palette.ink, marginTop: 2 }}>
            Hello, {persona.members[0].name}.
          </Display>
        </View>
        <View>
          <Avatar member={persona.members[0]} size={36} />
          <View style={[styles.notifDot, { backgroundColor: palette.warn, borderColor: palette.bg }]} />
        </View>
      </View>

      {/* Balance card */}
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line, marginBottom: 14 }]}>
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <BalanceDial persona={persona} palette={palette} size={140} />
          <View style={{ flex: 1 }}>
            <Kicker color={msg.tone}>Balance</Kicker>
            <Text style={[styles.balanceMsg, { color: palette.ink }]}>{msg.text}</Text>
            {totals.map(({ m, v }) => (
              <View key={m.id} style={styles.memberRow}>
                <Avatar member={m} size={18} />
                <Text style={[styles.memberName, { color: palette.ink }]}>{m.name}</Text>
                <View style={[styles.barBg, { backgroundColor: palette.line }]}>
                  <View style={[styles.barFill, {
                    width: `${(v / sum) * 100}%`,
                    backgroundColor: memberArc(m.hue),
                  }]} />
                </View>
                <Text style={[styles.pct, { color: palette.muted }]}>
                  {Math.round((v / sum) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* On each plate */}
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line, marginBottom: 14 }]}>
        <View style={styles.cardHeader}>
          <Kicker color={palette.muted}>On each plate</Kicker>
          <Text style={[styles.byWeight, { color: palette.muted }]}>by weight</Text>
        </View>
        {persona.members.map(m => {
          const mTasks = persona.tasks.filter(
            t => t.status !== 'done' && [t.planner, t.organizer, t.reminder, t.executor].includes(m.id)
          );
          const counts = [1, 2, 3, 4, 5].map(w => mTasks.filter(t => t.weight === w).length);
          const total = counts.reduce((s, v) => s + v, 0) || 1;
          const heaviest = [...mTasks].sort((a, b) => b.weight - a.weight)[0];
          return (
            <View key={m.id} style={styles.plateRow}>
              <Avatar member={m} size={22} />
              <View style={{ flex: 1 }}>
                <View style={[styles.stackedBar, { backgroundColor: palette.line }]}>
                  {counts.map((c, i) => c > 0 && (
                    <View key={i} style={{
                      flex: c,
                      backgroundColor: `hsl(${m.hue}, 32%, ${74 - i * 8}%)`,
                    }} />
                  ))}
                </View>
                {heaviest ? (
                  <Text style={[styles.heaviestText, { color: palette.muted }]} numberOfLines={1}>
                    {'heaviest: '}
                    <Text style={{ color: palette.inkSoft }}>{heaviest.title}</Text>
                    {' · ' + weightOf(heaviest.weight).label}
                  </Text>
                ) : (
                  <Text style={[styles.heaviestText, { color: palette.muted }]}>nothing on their plate</Text>
                )}
              </View>
              <Text style={[styles.plateCount, { color: palette.inkSoft }]}>{total}</Text>
            </View>
          );
        })}
      </View>

      {/* Four kinds of labor */}
      <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line, marginBottom: 14 }]}>
        <Kicker color={palette.muted} style={{ marginBottom: 10 }}>The four kinds of labor</Kicker>
        <View style={styles.rolesGrid}>
          {ROLES.map(r => {
            const totalsPerMember = persona.members.map(m => load[m.id][r.key]);
            const rSum = totalsPerMember.reduce((s, v) => s + v, 0) || 0.0001;
            const topIdx = totalsPerMember.indexOf(Math.max(...totalsPerMember));
            const top = persona.members[topIdx];
            return (
              <View key={r.key} style={[styles.roleCell, { backgroundColor: palette[r.key] + '14' }]}>
                <RoleGlyph role={r.key} color={palette[r.key]} size={14} />
                <Text style={[styles.roleName, { color: palette.ink }]}>{r.name}</Text>
                <Text style={[styles.roleDesc, { color: palette.muted }]}>{r.desc}</Text>
                <View style={styles.roleWho}>
                  <Avatar member={top} size={16} />
                  <Text style={[styles.rolePct, { color: palette.inkSoft }]}>
                    {Math.round((Math.max(...totalsPerMember) / rSum) * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* In motion today */}
      <View style={styles.sectionHeader}>
        <Kicker color={palette.muted}>In motion today</Kicker>
        <TouchableOpacity onPress={() => setActiveTab('inbox')}>
          <Text style={[styles.seeAll, { color: palette.accent }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {active.map(t => (
        <TaskCard key={t.id} task={t} persona={persona} palette={palette}
          onPress={() => setOpenTask(t)} />
      ))}
    </ScrollView>
  );
}

function TaskCard({ task, persona, palette, onPress }) {
  const byId = Object.fromEntries(persona.members.map(m => [m.id, m]));
  const holder = byId[task.reminder];
  const doer = byId[task.executor];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={[styles.taskCard, {
        backgroundColor: palette.surface,
        borderColor: palette.line,
        marginBottom: 8,
      }]}>
      {/* role rail */}
      <View style={styles.roleRail}>
        {ROLES.map(r => {
          const m = byId[task[r.key]];
          return (
            <View key={r.key} style={{
              width: 4, height: 8, borderRadius: 2,
              backgroundColor: m ? memberArc(m.hue) : palette.line,
            }} />
          );
        })}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.taskTitle, { color: palette.ink }]} numberOfLines={1}>{task.title}</Text>
        <View style={styles.taskMeta}>
          <Text style={[styles.metaText, { color: palette.muted }]}>{task.when}</Text>
          <Dot color={palette.muted} />
          <Text style={[styles.metaText, { color: palette.muted }]}>{task.category}</Text>
          <Dot color={palette.muted} />
          <WeightBars value={task.weight} color={palette.ink} muted={palette.ink} size="xs" />
          <Text style={[styles.metaText, { color: palette.muted }]}>{weightOf(task.weight).label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar member={holder} size={22} />
        {doer && doer.id !== holder?.id && (
          <View style={{ marginLeft: -6 }}>
            <Avatar member={doer} size={22} ring />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  notifDot: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#F4EFE6' },
  card: { borderRadius: 18, borderWidth: 0.5, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  balanceMsg: { fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  memberName: { fontFamily: 'DMSans_400Regular', fontSize: 11, flex: 1 },
  barBg: { flex: 2, height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  pct: { fontFamily: 'DMSans_400Regular', fontSize: 10, width: 26, textAlign: 'right' },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  stackedBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  heaviestText: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  plateCount: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, width: 26, textAlign: 'right' },
  byWeight: { fontFamily: 'DMSans_400Regular', fontSize: 10, fontStyle: 'italic' },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleCell: { width: '47%', borderRadius: 12, padding: 10 },
  roleName: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, marginTop: 6, letterSpacing: 0.1 },
  roleDesc: { fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 1 },
  roleWho: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  rolePct: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, marginBottom: 10, paddingHorizontal: 2 },
  seeAll: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  taskCard: { borderRadius: 14, borderWidth: 0.5, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleRail: { flexDirection: 'column', gap: 2, alignItems: 'center' },
  taskTitle: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  metaText: { fontFamily: 'DMSans_400Regular', fontSize: 11 },
});
