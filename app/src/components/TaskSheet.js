import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Pressable, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROLES, weightOf } from '../tokens';
import { COLORS } from '../colors';
import { Avatar, RoleGlyph, WeightBars, Kicker, Display } from './primitives';

export function TaskSheet({ task, persona, onClose }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(!!task);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (task) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1, duration: 250,
        easing: Easing.out(Easing.poly(4)), useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0, duration: 200,
        easing: Easing.in(Easing.poly(4)), useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [task]);

  if (!visible && !task) return null;
  const currentTask = task || {};
  const byId = Object.fromEntries(persona?.members?.map(m => [m.id, m]) || []);
  const events = ROLES.map(r => ({
    role: r.key, label: r.name, verb: r.verb,
    who: byId[currentTask[r.key]],
    pending: r.key === 'executor' && currentTask.status !== 'done',
  }));
  const w = weightOf(currentTask.weight || 1);

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  const opacity    = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View className="flex-1 justify-end bg-black/35" style={{ opacity }}>
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Animated.View
          className="bg-canvas rounded-t-[22px] px-5"
          style={{ paddingBottom: Math.max(insets.bottom + 12, 24), transform: [{ translateY }] }}
        >
          <View className="w-9 h-1 rounded-full bg-line-strong self-center mt-3 mb-4" />

          <View className="flex-row justify-between items-center mb-0.5">
            <Kicker color={COLORS.muted}>{currentTask.category} · {currentTask.when}</Kicker>
            <View className="flex-row items-center gap-1.5 bg-surface border-half border-line rounded-full px-2.5 py-1">
              <WeightBars value={currentTask.weight} color={COLORS.ink} muted={COLORS.ink} size="xs" />
              <Text className="font-sans-bold text-2xs tracking-role uppercase text-ink-soft">{w.label}</Text>
            </View>
          </View>

          <Display size={26} style={{ color: COLORS.ink, marginTop: 6, marginBottom: 4 }}>
            {currentTask.title}
          </Display>
          <Text className="font-sans-i text-sm text-muted mb-5">
            {w.sub} · adds {currentTask.weight} pts per role to whoever holds it
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
            {events.map((e, i) => (
              <View key={e.role} className="flex-row gap-3 pb-3.5">
                <View className="w-[22px] items-center">
                  <RoleGlyph role={e.role} color={COLORS[e.role]} size={14} />
                  {i < events.length - 1 && (
                    <View className="w-px flex-1 mt-0.5" style={{ backgroundColor: COLORS.lineStrong }} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-baseline">
                    <Text className="font-sans-bold text-xs tracking-role uppercase" style={{ color: COLORS[e.role] }}>
                      {e.label}
                    </Text>
                    {e.pending && <Text className="font-sans-i text-2xs text-muted">pending</Text>}
                  </View>
                  <Text className="font-sans text-base text-ink mt-0.5 mb-1.5">{e.verb}</Text>
                  <View className="flex-row items-center gap-1.5">
                    <Avatar member={e.who} size={18} />
                    <Text className="font-sans text-sm text-ink-soft">{e.who?.name || '—'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row gap-2 mt-4">
            <TouchableOpacity className="flex-1 h-11 rounded-[22px] bg-ink items-center justify-center" onPress={onClose}>
              <Text className="font-sans-md text-md text-surface">Pick up</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 h-11 rounded-[22px] border border-line-strong items-center justify-center" onPress={onClose}>
              <Text className="font-sans-md text-md text-ink">Hand off</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
