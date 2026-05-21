import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WeightBars } from '../../components/WeightBars';
import { WEIGHTS } from '../../constants/roles';
import { COLORS } from '../../colors';
import { GAP, CATEGORIES, WHEN_OPTIONS, CATEGORY_ICONS, type WhenValue, type CategoryValue } from './constants';

type Props = {
  when: WhenValue | null;
  category: CategoryValue | null;
  weight: number | null;
  onPickWhen: (v: WhenValue) => void;
  onPickCategory: (v: CategoryValue) => void;
  onPickWeight: (v: number) => void;
};

function Tile({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-1 rounded-xl border-half items-center justify-center gap-1.5 ${active ? 'bg-ink border-ink' : 'bg-surface border-line'}`}
    >
      {children}
    </TouchableOpacity>
  );
}

export function StepDetails({ when, category, weight, onPickWhen, onPickCategory, onPickWeight }: Props) {
  return (
    <View className="flex-1 px-5 py-3 gap-3">

      <View className="flex-1">
        <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2.5">When</Text>
        <View className="flex-1 flex-row" style={{ gap: GAP }}>
          {WHEN_OPTIONS.map(opt => {
            const active = when === opt.value;
            const color  = active ? COLORS.surface : COLORS.ink;
            return (
              <Tile key={opt.value} active={active} onPress={() => onPickWhen(opt.value)}>
                <Feather name={opt.icon as any} size={20} color={color} />
                <Text className="font-sans-md text-sm" style={{ color }}>{opt.label}</Text>
              </Tile>
            );
          })}
        </View>
      </View>

      <View className="flex-1">
        <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2.5">Category</Text>
        <View className="flex-1 gap-2">
          {[CATEGORIES.slice(0, 3), CATEGORIES.slice(3)].map((row, ri) => (
            <View key={ri} className="flex-1 flex-row" style={{ gap: GAP }}>
              {row.map(c => {
                const active = category === c;
                const color  = active ? COLORS.surface : COLORS.ink;
                return (
                  <Tile key={c} active={active} onPress={() => onPickCategory(c)}>
                    <Feather name={CATEGORY_ICONS[c] as any} size={18} color={color} />
                    <Text className="font-sans-md text-sm" style={{ color }}>{c}</Text>
                  </Tile>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View className="flex-1">
        <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2.5">How heavy</Text>
        <View className="flex-1 gap-2">
          {[WEIGHTS.slice(0, 3), WEIGHTS.slice(3)].map((row, ri) => (
            <View key={ri} className="flex-1 flex-row" style={{ gap: GAP }}>
              {row.map(wt => {
                const active = weight === wt.value;
                const color  = active ? COLORS.surface : COLORS.ink;
                return (
                  <Tile key={wt.value} active={active} onPress={() => onPickWeight(wt.value)}>
                    <WeightBars value={wt.value} size="md" color={color} muted={color} />
                    <Text className="font-sans-md text-sm" style={{ color }}>{wt.label}</Text>
                    <Text className="font-sans-i text-2xs text-center" style={{ color: active ? COLORS.surface : COLORS.muted }}>{wt.sub}</Text>
                  </Tile>
                );
              })}
            </View>
          ))}
        </View>
      </View>

    </View>
  );
}
