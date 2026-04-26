import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { ROLES, weightOf } from '../tokens';
import { Avatar, RoleGlyph, Kicker, Display, WeightBars, Dot, Icon } from '../components/primitives';
import { FadeInView } from '../components/FadeInView';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_BAR_EXTRA = 100;
const FILTERS = [
  { id: 'all',    label: 'All open' },
  { id: 'mine',   label: "I'm holding" },
  { id: 'others', label: 'Others holding' },
  { id: 'soon',   label: 'Soon' },
];

function isSoon(when) {
  if (!when) return false;
  const due  = new Date(when);
  const now  = new Date();
  const days = (due - now) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

function formatWhen(when) {
  if (!when) return '';
  const d = new Date(when);
  if (isNaN(d)) return when;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function InboxScreen() {
  const insets = useSafeAreaInsets();
  const { palette, persona, setOpenTask, currentMember } = useApp();
  const [filter, setFilter] = useState('all');

  const me    = currentMember ?? persona?.members?.[0];
  const byId  = Object.fromEntries((persona?.members ?? []).map(m => [m.id, m]));
  let tasks   = (persona?.tasks ?? []).filter(t => t.status !== 'done');

  if (filter === 'mine')   tasks = tasks.filter(t => t.reminder === me?.id);
  if (filter === 'others') tasks = tasks.filter(t => t.reminder !== me?.id);
  if (filter === 'soon')   tasks = tasks.filter(t => isSoon(t.when));

  // Group by holder (reminder role)
  const groups = {};
  tasks.forEach(t => { (groups[t.reminder] = groups[t.reminder] || []).push(t); });
  const holders = Object.keys(groups)
    .map(id => ({ m: byId[id], tasks: groups[id] }))
    .filter(g => g.m); // skip if member no longer in circle

  const handleFilter = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(id);
  };

  return (
    <FadeInView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: TAB_BAR_EXTRA,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 16 }}>
          <Kicker color={palette.muted}>Inbox</Kicker>
          <Display size={32} style={{ color: palette.ink, marginTop: 2 }}>Things being held.</Display>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Each item is mental weight someone is carrying. Picking one up is a small way to share the load.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map(f => (
              <FilterChip key={f.id} palette={palette} active={filter === f.id}
                onPress={() => handleFilter(f.id)} label={f.label} />
            ))}
          </View>
        </ScrollView>

        {holders.map(({ m, tasks: groupTasks }) => (
          <View key={m.id} style={{ marginBottom: 22 }}>
            <View style={styles.groupHeader}>
              <Avatar member={m} size={22} />
              <Text style={[styles.groupLabel, { color: palette.ink }]}>
                {m.id === me?.id ? 'You' : m.name} · {groupTasks.length} {groupTasks.length === 1 ? 'item' : 'items'}
              </Text>
              <View style={[styles.groupLine, { backgroundColor: palette.line }]} />
            </View>
            <View style={{ gap: 6 }}>
              {groupTasks.map(t => (
                <InboxRow key={t.id} task={t} palette={palette}
                  me={me} byId={byId} onPress={() => setOpenTask(t)} />
              ))}
            </View>
          </View>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="check" size={32} color={palette.executor} />
            <Text style={[styles.emptyText, { color: palette.muted }]}>Nothing waiting. Quiet moment.</Text>
          </View>
        )}
      </ScrollView>
    </FadeInView>
  );
}

function InboxRow({ task, palette, me, byId, onPress }) {
  const [picked, setPicked] = useState(false);
  const { showToast } = useApp();

  const doer   = byId[task.executor];
  const holder = byId[task.reminder];
  const isMine = holder?.id === me?.id;

  return (
    <View style={[styles.inboxCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.inboxCardContent}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.inboxTitle, { color: palette.ink }]}>{task.title}</Text>
          <View style={styles.inlineRoles}>
            {ROLES.map(r => {
              const m = byId[task[r.key]];
              if (!m) return null;
              return (
                <View key={r.key} style={styles.inlineRole}>
                  <RoleGlyph role={r.key} color={palette[r.key]} size={10} />
                  <Text style={[styles.roleShort, { color: palette.muted }]}>{m.short}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.inboxMeta}>
            {task.when ? <>
              <Text style={[styles.metaText, { color: palette.muted }]}>{formatWhen(task.when)}</Text>
              <Dot color={palette.muted} />
            </> : null}
            {task.category ? <>
              <Text style={[styles.metaText, { color: palette.muted }]}>{task.category}</Text>
              <Dot color={palette.muted} />
            </> : null}
            <WeightBars value={task.weight} color={palette.inkSoft} muted={palette.inkSoft} size="xs" />
            <Text style={[styles.weightLabel, { color: palette.inkSoft }]}>{weightOf(task.weight).label}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {!isMine ? (
        <View style={[styles.actionStrip, { borderColor: palette.line }]}>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              const next = !picked;
              setPicked(next);
              showToast(next ? `Picked up from ${holder?.name}` : 'Put back');
            }}
            style={[styles.actionBtn, { flex: 1 }]} activeOpacity={0.7}>
            <Icon name={picked ? 'check' : 'handoff'} size={14}
              color={picked ? palette.executor : palette.ink} />
            <Text style={[styles.actionText, { color: picked ? palette.executor : palette.ink }]}>
              {picked ? `Picked up · ${holder?.name} notified` : `Pick up from ${holder?.name}`}
            </Text>
          </TouchableOpacity>
          {!picked && <>
            <View style={[styles.actionDivider, { backgroundColor: palette.line }]} />
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}
              onPress={() => showToast(`Reminded ${holder?.name} about "${task.title}"`)}>
              <Icon name="bell" size={14} color={palette.muted} />
              <Text style={[styles.actionText, { color: palette.muted }]}>Remind</Text>
            </TouchableOpacity>
          </>}
        </View>
      ) : (
        <View style={[styles.waitingStrip, { borderColor: palette.line, backgroundColor: palette.surfaceAlt }]}>
          <Text style={[styles.waitingText, { color: palette.muted }]}>
            Waiting on {doer?.name ?? 'someone'} to finish
          </Text>
          <TouchableOpacity onPress={() => showToast(`Nudged ${doer?.name}`)}>
            <Text style={[styles.nudgeText, { color: palette.accent }]}>Nudge</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function FilterChip({ palette, active, onPress, label }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={[styles.chip, {
        backgroundColor: active ? palette.ink : palette.surface,
        borderColor: palette.line, borderWidth: active ? 0 : 0.5,
      }]}>
      <Text style={[styles.chipText, { color: active ? palette.surface : palette.ink }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 19, marginTop: 6 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingHorizontal: 2 },
  groupLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, letterSpacing: 0.2 },
  groupLine: { flex: 1, height: 0.5, marginLeft: 6 },
  inboxCard: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  inboxCardContent: { padding: 14 },
  inboxTitle: { fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 19, marginBottom: 6 },
  inlineRoles: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  inlineRole: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  roleShort: { fontFamily: 'DMSans_500Medium', fontSize: 10 },
  inboxMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontFamily: 'DMSans_400Regular', fontSize: 11 },
  weightLabel: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  actionStrip: { borderTopWidth: 0.5, flexDirection: 'row', alignItems: 'stretch' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  actionText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  actionDivider: { width: 0.5 },
  waitingStrip: {
    borderTopWidth: 0.5, paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  waitingText: { fontFamily: 'DMSans_400Regular', fontSize: 11 },
  nudgeText: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 13 },
  emptyState: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 14, marginTop: 10 },
});
