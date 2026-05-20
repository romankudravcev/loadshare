import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../colors';
import { TOTAL_STEPS } from './constants';

type Props = { step: number };

export function StepDots({ step }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View className="items-center pb-2" style={{ paddingTop: insets.top + 14 }}>
      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View key={i} style={{
            height: 6, borderRadius: 3, width: i === step ? 20 : 6,
            backgroundColor: i <= step ? COLORS.ink : COLORS.line,
          }} />
        ))}
      </View>
    </View>
  );
}
