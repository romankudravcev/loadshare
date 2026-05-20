import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Keyboard, Dimensions, ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { ROLES, WEIGHTS, weightOf, computeLoad, memberArc } from '../tokens';
import { Avatar, RoleGlyph, Kicker, WeightBars, Icon } from '../components/primitives';

const H_PAD = 20;
const GAP   = 8;

const CATEGORIES = ['Home', 'Food', 'Kids', 'Admin', 'Family', 'Errands'];

function whenToDate(label) {
  const d = new Date();
  if (label === 'Today')     return d;
  if (label === 'Tomorrow')  { d.setDate(d.getDate() + 1); return d; }
  if (label === 'This week') { d.setDate(d.getDate() + (7 - d.getDay())); return d; }
  if (label === 'Next week') { d.setDate(d.getDate() + (7 - d.getDay()) + 7); return d; }
  return d;
}

function toISODate(d) {
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}
const TOTAL_STEPS = 3;
const WHEN_OPTIONS = [
  { label: 'Today',     value: 'Today' },
  { label: 'Tomorrow',  value: 'Tomorrow' },
  { label: 'This week', value: 'This week' },
  { label: 'Next week', value: 'Next week' },
];

export function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { palette, persona, setActiveTab, activeCircle, tasks, refreshPersona, showToast, currentMember } = useApp();

  const defaultId = currentMember?.id ?? persona.members[0].id;

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState(null);
  const [category, setCategory] = useState(null);
  const [weight, setWeight] = useState(null);
  const [assign, setAssign] = useState({
    planner: defaultId, organizer: defaultId, reminder: defaultId, executor: defaultId,
  });
  const [autoBalance, setAutoBalance] = useState(true);
  const [saving, setSaving] = useState(false);
  const autoAdvance = useRef(true);

  const load = computeLoad(persona);
  const byId = Object.fromEntries(persona.members.map(m => [m.id, m]));
  const lightest = [...persona.members].sort((a, b) => load[a.id].total - load[b.id].total)[0];
  const myId = persona.members[0].id;
  const rolesOnMe = ROLES.filter(r => assign[r.key] === myId).length;
  const w = weight ?? 2;

  useEffect(() => {
    if (step === 1 && autoAdvance.current && when && category && weight !== null) {
      const t = setTimeout(() => { Keyboard.dismiss(); setStep(2); }, 380);
      return () => clearTimeout(t);
    }
  }, [when, category, weight, step]);

  const reset = () => {
    autoAdvance.current = true;
    setTitle(''); setWhen(null); setCategory(null); setWeight(null);
    setAssign({ planner: defaultId, organizer: defaultId, reminder: defaultId, executor: defaultId });
    setAutoBalance(true); setSaving(false); setStep(0);
  };

  const handleCancel = () => { reset(); setActiveTab('dashboard'); };

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await tasks.create({
        circle_id:    activeCircle.id,
        title:        title.trim(),
        due_date:     toISODate(whenToDate(when)),
        category,
        weight:       weight ?? 2,
        planner_id:   assign.planner,
        organizer_id: assign.organizer,
        reminder_id:  assign.reminder,
        executor_id:  assign.executor,
      });
      await refreshPersona();
      showToast('Task added');
      reset();
      setActiveTab('dashboard');
    } catch (err) {
      console.error('create task:', err);
      showToast('Could not save task');
      setSaving(false);
    }
  };
  const goNext = () => { Keyboard.dismiss(); setStep(s => s + 1); };
  const goBack = () => {
    if (step === 2) autoAdvance.current = false;
    setStep(s => s - 1);
  };

  const pick = (setter) => (v) => { autoAdvance.current = true; setter(v); };

  const canContinue = step === 0 ? !!title.trim()
    : step === 1 ? (when !== null && category !== null && weight !== null)
    : true;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* ── Header dots ── */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, {
              backgroundColor: i <= step ? palette.ink : palette.line,
              width: i === step ? 20 : 6,
            }]} />
          ))}
        </View>
      </View>

      {/* ── Steps ── */}
      <Animated.View key={step} entering={FadeIn.duration(200)} style={{ flex: 1 }}>

        {/* Step 0 — Title */}
        {step === 0 && (
          <View style={{ flex: 1, paddingHorizontal: H_PAD, paddingTop: 32 }}>
            <Text style={[styles.prompt, { color: palette.ink }]}>What needs doing?</Text>
            <TextInput
              autoFocus
              value={title}
              onChangeText={setTitle}
              placeholder="Name this task…"
              placeholderTextColor={palette.muted}
              multiline
              style={[styles.titleInput, { color: palette.ink }]}
              blurOnSubmit
              onSubmitEditing={title.trim() ? goNext : undefined}
            />
          </View>
        )}

        {/* Step 1 — When + Category + Weight (no scroll, fills screen) */}
        {step === 1 && (
          <View style={{ flex: 1, paddingHorizontal: H_PAD, paddingVertical: 12, gap: 12 }}>

            {/* When */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionLabel, { color: palette.muted }]}>When</Text>
              <View style={{ flex: 1, flexDirection: 'row', gap: GAP }}>
                {WHEN_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => pick(setWhen)(opt.value)}
                    activeOpacity={0.75}
                    style={[styles.tile, {
                      flex: 1,
                      backgroundColor: when === opt.value ? palette.ink : palette.surface,
                      borderColor: when === opt.value ? palette.ink : palette.line,
                    }]}
                  >
                    <WhenIcon value={opt.value} color={when === opt.value ? palette.surface : palette.ink} size={22} />
                    <Text style={[styles.tileLabel, { color: when === opt.value ? palette.surface : palette.ink }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionLabel, { color: palette.muted }]}>Category</Text>
              <View style={{ flex: 1, gap: GAP }}>
                {[CATEGORIES.slice(0, 3), CATEGORIES.slice(3)].map((row, ri) => (
                  <View key={ri} style={{ flex: 1, flexDirection: 'row', gap: GAP }}>
                    {row.map(c => {
                      const active = category === c;
                      const color  = active ? palette.surface : palette.ink;
                      return (
                        <TouchableOpacity
                          key={c}
                          onPress={() => pick(setCategory)(c)}
                          activeOpacity={0.75}
                          style={[styles.tile, {
                            flex: 1,
                            backgroundColor: active ? palette.ink : palette.surface,
                            borderColor:     active ? palette.ink : palette.line,
                          }]}
                        >
                          <CategoryIcon value={c} color={color} size={20} />
                          <Text style={[styles.tileLabel, { color }]}>{c}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* Weight */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionLabel, { color: palette.muted }]}>How heavy</Text>
              <View style={{ flex: 1, gap: GAP }}>
                {[WEIGHTS.slice(0, 3), WEIGHTS.slice(3)].map((row, ri) => (
                  <View key={ri} style={{ flex: 1, flexDirection: 'row', gap: GAP }}>
                    {row.map(wt => {
                      const active = weight === wt.value;
                      const color  = active ? palette.surface : palette.ink;
                      return (
                        <TouchableOpacity
                          key={wt.value}
                          onPress={() => pick(setWeight)(wt.value)}
                          activeOpacity={0.75}
                          style={[styles.tile, {
                            flex: 1,
                            backgroundColor: active ? palette.ink : palette.surface,
                            borderColor:     active ? palette.ink : palette.line,
                          }]}
                        >
                          <WeightBars value={wt.value} size="md" color={color} muted={color} />
                          <Text style={[styles.tileLabel, { color }]}>{wt.label}</Text>
                          <Text style={[styles.tileDesc, { color: active ? palette.surface : palette.muted }]}>
                            {wt.sub}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

          </View>
        )}

        {/* Step 2 — Roles */}
        {step === 2 && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: 32, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.prompt, { color: palette.ink }]}>Who does what?</Text>
            <Text style={[styles.sub, { color: palette.muted }]}>One task, four kinds of labor.</Text>

            <View style={[styles.rolesContainer, { borderColor: palette.lineStrong }]}>
              {ROLES.map((r, i) => (
                <View key={r.key}>
                  <RoleRow role={r} palette={palette} members={persona.members}
                    value={assign[r.key]}
                    onChange={v => setAssign(a => ({ ...a, [r.key]: v }))} />
                  {i < ROLES.length - 1 && (
                    <View style={[styles.roleDivider, { backgroundColor: palette.lineStrong }]} />
                  )}
                </View>
              ))}
            </View>

            {rolesOnMe >= 3 && autoBalance && (
              <View style={[styles.nudge, {
                backgroundColor: palette.accent2 + '26', borderColor: palette.accent2 + '55',
              }]}>
                <View style={[styles.nudgeIcon, { backgroundColor: palette.accent2 + '55' }]}>
                  <Icon name="flag" size={14} color={palette.inkSoft} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nudgeTitle, { color: palette.ink }]}>
                    You're holding {rolesOnMe} of 4 roles.
                  </Text>
                  <Text style={[styles.nudgeBody, { color: palette.inkSoft }]}>
                    {lightest.name} has room. Hand off execution?
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

            <View style={[styles.previewCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
              <View style={styles.previewHeader}>
                <Kicker color={palette.muted}>What this adds</Kicker>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <WeightBars value={w} color={palette.ink} muted={palette.ink} size="sm" />
                  <Text style={[styles.ptsText, { color: palette.inkSoft }]}>+{w * 4} pts</Text>
                </View>
              </View>
              <View style={styles.roleStrip}>
                {ROLES.map(r => {
                  const m = byId[assign[r.key]];
                  return (
                    <View key={r.key} style={[styles.roleStripCell, {
                      backgroundColor: m ? memberArc(m.hue) : palette.line,
                    }]}>
                      <RoleGlyph role={r.key} color="#fff" size={10} />
                      <Text style={styles.roleStripLabel}>{m?.short}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={[styles.previewBody, { color: palette.muted }]}>
                Each role earns {w} load pts — this task puts {w} pts on{' '}
                {Object.values(assign).every(v => v === assign.planner)
                  ? `${byId[assign.planner]?.name} alone.`
                  : 'each role-holder.'}
              </Text>
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* ── Nav arrows ── */}
      <View style={[styles.nav, { paddingBottom: insets.bottom + 100 }]}>
        <TouchableOpacity
          onPress={step === 0 ? handleCancel : goBack}
          style={[styles.navBtn, { backgroundColor: palette.surface, borderColor: palette.line }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icon name="back" size={20} color={palette.ink} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={step === TOTAL_STEPS - 1 ? handleSave : goNext}
          disabled={!canContinue || saving}
          style={[styles.navBtn, { backgroundColor: canContinue ? palette.ink : palette.line }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          {saving
            ? <ActivityIndicator size="small" color={palette.surface} />
            : <Icon name={step === TOTAL_STEPS - 1 ? 'check' : 'chev'} size={20} color={canContinue ? palette.surface : palette.muted} />
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

function WhenIcon({ value, color, size = 20 }) {
  const s = { stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  if (value === 'Today') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4" fill={color} />
      <Path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" {...s} />
      <Path d="M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" {...s} />
    </Svg>
  );
  if (value === 'Tomorrow') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </Svg>
  );
  if (value === 'This week') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...s} />
      <Path d="M3 10h18M8 4V2M16 4V2" {...s} />
    </Svg>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...s} />
      <Path d="M3 10h18M8 4V2M16 4V2" {...s} />
      <Path d="m9 15 2 2 4-4" {...s} />
    </Svg>
  );
}

function CategoryIcon({ value, color, size = 22 }) {
  const s = { stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  if (value === 'Home') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 9.5L12 3l9 6.5" {...s} />
      <Path d="M5 8.5v11h14v-11" {...s} />
      <Path d="M10 19.5v-6h4v6" {...s} />
    </Svg>
  );
  if (value === 'Food') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 3v5M9 3v5M11 3v5M9 8v12" {...s} />
      <Path d="M15 3v18" {...s} />
      <Path d="M13 3c0 2 2 3 2 5h-2" {...s} />
    </Svg>
  );
  if (value === 'Kids') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" {...s} />
    </Svg>
  );
  if (value === 'Admin') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" {...s} />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" {...s} />
    </Svg>
  );
  if (value === 'Family') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...s} />
      <Circle cx="9" cy="7" r="4" {...s} />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...s} />
    </Svg>
  );
  if (value === 'Errands') return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" {...s} />
      <Path d="M3 6h18M16 10a4 4 0 0 1-8 0" {...s} />
    </Svg>
  );
  return null;
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
  header: { alignItems: 'center', paddingBottom: 8 },
  dots:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:    { height: 6, borderRadius: 3 },

  prompt: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 34, lineHeight: 40, letterSpacing: -0.5, marginBottom: 24,
  },
  sub: {
    fontFamily: 'DMSans_400Regular', fontSize: 13,
    fontStyle: 'italic', marginTop: -16, marginBottom: 24,
  },
  titleInput: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 26, lineHeight: 34, letterSpacing: -0.3,
  },

  sectionLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 10,
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10,
  },

  tile: {
    borderRadius: 12, borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  tileLabel: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  tileDesc:  { fontFamily: 'DMSans_400Regular', fontSize: 10, fontStyle: 'italic', textAlign: 'center' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: 20, borderWidth: 0.5,
  },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 13 },

  rolesContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 16 },
  roleRow:  { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleDivider: { height: 1 },
  roleIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roleRowName: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  roleRowDesc: { fontFamily: 'DMSans_400Regular', fontSize: 11, fontStyle: 'italic', marginTop: 1 },
  avatarBtn: { borderRadius: 14, padding: 2 },

  nudge: { borderWidth: 0.5, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 16 },
  nudgeIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nudgeTitle: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 18, marginBottom: 3 },
  nudgeBody:  { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 17 },
  nudgeActions: { flexDirection: 'row', gap: 6, marginTop: 10 },
  nudgeBtn:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  nudgeBtnSecondary: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 0.5, backgroundColor: 'transparent' },
  nudgeBtnText:      { fontFamily: 'DMSans_500Medium', fontSize: 12 },

  previewCard:   { borderRadius: 14, borderWidth: 0.5, padding: 14 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ptsText:       { fontFamily: 'DMSans_500Medium', fontSize: 11 },
  roleStrip:     { flexDirection: 'row', height: 24, borderRadius: 4, overflow: 'hidden' },
  roleStripCell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  roleStripLabel:{ fontFamily: 'DMSans_600SemiBold', fontSize: 9, color: '#fff', letterSpacing: 0.3 },
  previewBody:   { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 16, marginTop: 10 },

  nav: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: H_PAD, paddingTop: 8,
  },
  navBtn: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
});
