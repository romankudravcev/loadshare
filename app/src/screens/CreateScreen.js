import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { ROLES, WEIGHTS, weightOf, computeLoad, memberArc } from '../tokens';
import { Avatar, RoleGlyph, Kicker, WeightBars, Icon } from '../components/primitives';
import { FadeInView } from '../components/FadeInView';

const TAB_BAR_EXTRA = 100;
const WHENS = ['Today', 'Tomorrow', 'This week', 'Next week'];
const CATEGORIES = ['Home', 'Food', 'Kids', 'Admin', 'Family', 'Errands'];

function whenToDate(label) {
  const d = new Date();
  switch (label) {
    case 'Today':     return d.toISOString().split('T')[0];
    case 'Tomorrow':  d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
    case 'This week': d.setDate(d.getDate() + (7 - d.getDay() || 7)); return d.toISOString().split('T')[0];
    case 'Next week': d.setDate(d.getDate() + (14 - d.getDay() || 7)); return d.toISOString().split('T')[0];
    default: return null;
  }
}

export function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { palette, persona, activeCircle, tasks, setActiveTab, refreshPersona, currentMember } = useApp();

  const members = persona?.members ?? [];
  const defaultId = currentMember?.id ?? members[0]?.id ?? null;

  const [title, setTitle]       = useState('');
  const [when, setWhen]         = useState('This week');
  const [category, setCategory] = useState('Home');
  const [weight, setWeight]     = useState(2);
  const [saving, setSaving]     = useState(false);
  const [autoBalance, setAutoBalance] = useState(true);
  const [assign, setAssign]     = useState({
    planner: null, organizer: null, reminder: null, executor: null,
  });

  // Set default assignments when members load
  useEffect(() => {
    if (defaultId && !assign.planner) {
      setAssign({ planner: defaultId, organizer: defaultId, reminder: defaultId, executor: defaultId });
    }
  }, [defaultId]);

  const load    = persona ? computeLoad(persona) : {};
  const byId    = Object.fromEntries(members.map(m => [m.id, m]));
  const lightest = members.length
    ? [...members].sort((a, b) => (load[a.id]?.total ?? 0) - (load[b.id]?.total ?? 0))[0]
    : null;
  const myId      = currentMember?.id ?? null;
  const rolesOnMe = ROLES.filter(r => assign[r.key] === myId).length;

  const handleCancel = () => {
    setTitle('');
    setActiveTab('dashboard');
  };

  const handleSave = async () => {
    if (!title.trim() || !activeCircle) return;
    setSaving(true);
    try {
      await tasks.create({
        circle_id:    activeCircle.id,
        title:        title.trim(),
        weight,
        category,
        due_date:     whenToDate(when),
        status:       'todo',
        planner_id:   assign.planner   || null,
        organizer_id: assign.organizer || null,
        reminder_id:  assign.reminder  || null,
        executor_id:  assign.executor  || null,
      });
      await refreshPersona();
      setTitle('');
      setActiveTab('dashboard');
    } catch (err) {
      Alert.alert('Could not save task', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!persona) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.muted} />
      </View>
    );
  }

  return (
    <FadeInView style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: TAB_BAR_EXTRA,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[styles.cancelBtn, { color: palette.muted }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.titleLabel, { color: palette.ink }]}>New task</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()}>
            {saving
              ? <ActivityIndicator size="small" color={palette.accent} />
              : <Text style={[styles.saveBtn, { color: title.trim() ? palette.accent : palette.muted }]}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={{ marginBottom: 20 }}>
          <TextInput
            autoFocus
            value={title}
            onChangeText={setTitle}
            placeholder="What needs doing?"
            placeholderTextColor={palette.muted}
            multiline
            style={[styles.titleInput, { color: palette.ink }]}
          />
          <View style={[styles.divider, { backgroundColor: palette.line }]} />
        </View>

        {/* When chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {WHENS.map(w => (
              <Chip key={w} palette={palette} active={when === w} onPress={() => setWhen(w)}>{w}</Chip>
            ))}
          </View>
        </ScrollView>

        {/* Category */}
        <Kicker color={palette.muted} style={{ marginBottom: 10 }}>Category</Kicker>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <Chip key={c} palette={palette} active={category === c} onPress={() => setCategory(c)}>{c}</Chip>
          ))}
        </View>

        {/* Weight */}
        <View style={styles.weightHeader}>
          <Kicker color={palette.muted}>Weight</Kicker>
          <Text style={[styles.weightSub, { color: palette.muted }]}>{weightOf(weight).sub}</Text>
        </View>
        <Text style={[styles.weightHint, { color: palette.muted }]}>
          Heavier tasks count for more in everyone's load.
        </Text>
        <View style={[styles.weightPicker, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          {WEIGHTS.map(w => {
            const active = w.value === weight;
            return (
              <TouchableOpacity key={w.value} onPress={() => setWeight(w.value)}
                style={[styles.weightBtn, { backgroundColor: active ? palette.ink : 'transparent' }]}
                activeOpacity={0.7}>
                <WeightBars value={w.value} size="md"
                  color={active ? palette.surface : palette.ink}
                  muted={active ? palette.surface : palette.ink} />
                <Text style={[styles.weightBtnLabel, { color: active ? palette.surface : palette.ink }]}>
                  {w.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Four roles */}
        <Kicker color={palette.muted} style={{ marginBottom: 4, marginTop: 4 }}>The four roles</Kicker>
        <Text style={[styles.rolesHint, { color: palette.muted }]}>
          One task, four kinds of labor. Assign each.
        </Text>
        <View style={[styles.rolesContainer, { borderColor: palette.lineStrong }]}>
          {ROLES.map((r, i) => (
            <View key={r.key}>
              <RoleRow role={r} palette={palette} members={members}
                value={assign[r.key]}
                onChange={v => setAssign(a => ({ ...a, [r.key]: v }))} />
              {i < ROLES.length - 1 && <View style={[styles.roleDivider, { backgroundColor: palette.lineStrong }]} />}
            </View>
          ))}
        </View>

        {/* Auto-balance nudge */}
        {myId && rolesOnMe >= 3 && autoBalance && lightest && lightest.id !== myId && (
          <View style={[styles.nudge, {
            backgroundColor: palette.accent2 + '26', borderColor: palette.accent2 + '55',
          }]}>
            <View style={[styles.nudgeIcon, { backgroundColor: palette.accent2 + '55' }]}>
              <Icon name="flag" size={14} color={palette.inkSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nudgeTitle, { color: palette.ink }]}>
                You're holding {rolesOnMe} of 4 roles on this one.
              </Text>
              <Text style={[styles.nudgeBody, { color: palette.inkSoft }]}>
                {lightest.name} has room this week. Hand off the execution?
              </Text>
              <View style={styles.nudgeActions}>
                <TouchableOpacity
                  style={[styles.nudgeBtn, { backgroundColor: palette.ink }]}
                  onPress={() => setAssign(a => ({ ...a, executor: lightest.id }))}>
                  <Text style={[styles.nudgeBtnText, { color: palette.surface }]}>Hand to {lightest.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nudgeBtnSecondary, { borderColor: palette.lineStrong }]}
                  onPress={() => setAutoBalance(false)}>
                  <Text style={[styles.nudgeBtnText, { color: palette.ink }]}>Keep it</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Preview */}
        <View style={[styles.previewCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          <View style={styles.previewHeader}>
            <Kicker color={palette.muted}>What this adds</Kicker>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <WeightBars value={weight} color={palette.ink} muted={palette.ink} size="sm" />
              <Text style={[styles.ptsText, { color: palette.inkSoft }]}>+{weight * 4} pts</Text>
            </View>
          </View>
          <View style={styles.roleStrip}>
            {ROLES.map(r => {
              const m = byId[assign[r.key]];
              return (
                <View key={r.key} style={[styles.roleStripCell, { backgroundColor: m ? memberArc(m.hue) : palette.line }]}>
                  <RoleGlyph role={r.key} color="#fff" size={10} />
                  <Text style={styles.roleStripLabel}>{m?.short ?? '?'}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.previewBody, { color: palette.muted }]}>
            Each role earns {weight} load pts on the person holding it.
          </Text>
        </View>
      </ScrollView>
    </FadeInView>
  );
}

function Chip({ children, palette, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={[styles.chip, {
        backgroundColor: active ? palette.ink : palette.surface,
        borderColor: palette.line, borderWidth: active ? 0 : 0.5,
      }]}>
      <Text style={[styles.chipText, { color: active ? palette.surface : palette.ink }]}>{children}</Text>
    </TouchableOpacity>
  );
}

function RoleRow({ role, palette, members, value, onChange }) {
  return (
    <View style={[styles.roleRow, { backgroundColor: palette.surface }]}>
      <View style={[styles.roleIcon, { backgroundColor: palette[role.key] + '22' }]}>
        <RoleGlyph role={role.key} color={palette[role.key]} size={14} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.roleRowName, { color: palette.ink }]}>{role.name}</Text>
        <Text style={[styles.roleRowDesc, { color: palette.muted }]}>{role.desc}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {members.map(m => (
          <TouchableOpacity key={m.id} onPress={() => onChange(m.id)} activeOpacity={0.7}
            style={[styles.avatarBtn, {
              borderColor: m.id === value ? palette[role.key] : 'transparent',
              borderWidth: 2, opacity: m.id === value ? 1 : 0.5,
            }]}>
            <Avatar member={m} size={22} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  cancelBtn: { fontFamily: 'DMSans_400Regular', fontSize: 15 },
  titleLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 15 },
  saveBtn: { fontFamily: 'DMSans_600SemiBold', fontSize: 15 },
  titleInput: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 30, lineHeight: 36, letterSpacing: -0.5, paddingVertical: 4,
  },
  divider: { height: 1, marginTop: 8 },
  weightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  weightSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, fontStyle: 'italic' },
  weightHint: { fontFamily: 'DMSans_400Regular', fontSize: 12, fontStyle: 'italic', marginBottom: 10 },
  weightPicker: { borderRadius: 14, borderWidth: 0.5, padding: 10, flexDirection: 'row', gap: 4, marginBottom: 24 },
  weightBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  weightBtnLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, letterSpacing: 0.3 },
  rolesHint: { fontFamily: 'DMSans_400Regular', fontSize: 12, fontStyle: 'italic', marginBottom: 12 },
  rolesContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 16 },
  roleRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleDivider: { height: 1 },
  roleIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roleRowName: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  roleRowDesc: { fontFamily: 'DMSans_400Regular', fontSize: 11, fontStyle: 'italic', marginTop: 1 },
  avatarBtn: { borderRadius: 14, padding: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 13 },
  nudge: { borderWidth: 0.5, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 16 },
  nudgeIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nudgeTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 18, marginBottom: 3 },
  nudgeBody: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 17 },
  nudgeActions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  nudgeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  nudgeBtnSecondary: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 0.5, backgroundColor: 'transparent' },
  nudgeBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  previewCard: { borderRadius: 14, borderWidth: 0.5, padding: 14 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ptsText: { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  roleStrip: { flexDirection: 'row', height: 24, borderRadius: 4, overflow: 'hidden' },
  roleStripCell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  roleStripLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, color: '#fff', letterSpacing: 0.3 },
  previewBody: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 16, marginTop: 10 },
});
