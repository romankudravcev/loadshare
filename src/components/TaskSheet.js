import React, { useRef, useEffect, useState } from 'react';
import {
  Modal, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Pressable, Animated, Easing
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROLES, weightOf } from '../tokens';
import { Avatar, RoleGlyph, WeightBars, Kicker, Display } from './primitives';

export function TaskSheet({ task, persona, palette, onClose }) {
  const insets = useSafeAreaInsets();
  
  const [visible, setVisible] = useState(!!task);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (task) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.poly(4)),
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [task]);

  if (!visible && !task) return null;
  const currentTask = task || {}; // use last task when animating out

  const byId = Object.fromEntries(persona?.members?.map(m => [m.id, m]) || []);
  const events = ROLES.map(r => ({
    role: r.key, label: r.name, verb: r.verb,
    who: byId[currentTask[r.key]],
    pending: r.key === 'executor' && currentTask.status !== 'done',
  }));
  const w = weightOf(currentTask.weight || 1);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0] // start 600px down
  });
  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View style={[styles.sheet, {
          backgroundColor: palette.bg,
          paddingBottom: Math.max(insets.bottom + 12, 24),
          transform: [{ translateY }]
        }]}>
          {/* handle */}
          <View style={[styles.handle, { backgroundColor: palette.lineStrong }]} />

          {/* header row */}
          <View style={styles.headerRow}>
            <Kicker color={palette.muted}>{currentTask.category} · {currentTask.when}</Kicker>
            <View style={[styles.weightPill, {
              backgroundColor: palette.surface,
              borderColor: palette.line,
            }]}>
              <WeightBars value={currentTask.weight} color={palette.ink} muted={palette.ink} size="xs" />
              <Text style={[styles.weightLabel, { color: palette.inkSoft }]}>{w.label}</Text>
            </View>
          </View>

          <Display size={26} style={{ color: palette.ink, marginTop: 6, marginBottom: 4 }}>
            {currentTask.title}
          </Display>
          <Text style={[styles.subtext, { color: palette.muted }]}>
            {w.sub} · adds {currentTask.weight} pts per role to whoever holds it
          </Text>

          {/* role timeline */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
            {events.map((e, i) => (
              <View key={e.role} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <RoleGlyph role={e.role} color={palette[e.role]} size={14} />
                  {i < events.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: palette.lineStrong }]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={[styles.roleLabel, { color: palette[e.role] }]}>{e.label}</Text>
                    {e.pending && (
                      <Text style={[styles.pendingLabel, { color: palette.muted }]}>pending</Text>
                    )}
                  </View>
                  <Text style={[styles.verbText, { color: palette.ink }]}>{e.verb}</Text>
                  <View style={styles.whoRow}>
                    <Avatar member={e.who} size={18} />
                    <Text style={[styles.whoName, { color: palette.inkSoft }]}>{e.who?.name || '—'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: palette.ink }]}>
              <Text style={[styles.btnText, { color: palette.surface }]}>Pick up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSecondary, { borderColor: palette.lineStrong }]}>
              <Text style={[styles.btnText, { color: palette.ink }]}>Hand off</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  weightPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 0.5, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  weightLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10, letterSpacing: 0.3, textTransform: 'uppercase',
  },
  subtext: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12, fontStyle: 'italic', marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row', gap: 12, paddingBottom: 14,
  },
  timelineLeft: {
    width: 22, alignItems: 'center',
  },
  timelineLine: {
    width: 1, flex: 1, marginTop: 2,
  },
  timelineContent: { flex: 1 },
  timelineHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
  },
  roleLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  pendingLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10, fontStyle: 'italic',
  },
  verbText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13, marginTop: 3, marginBottom: 6,
  },
  whoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  whoName: { fontFamily: 'DMSans_400Regular', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btnPrimary: {
    flex: 1, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondary: {
    flex: 1, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, backgroundColor: 'transparent',
  },
  btnText: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
});
