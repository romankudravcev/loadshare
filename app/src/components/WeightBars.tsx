import React from 'react';
import { View } from 'react-native';

interface Dims { w: number; h: number; gap: number }

const DIMS: Record<string, Dims> = {
  xs: { w: 3, h: 6,  gap: 1.5 },
  sm: { w: 3, h: 8,  gap: 2 },
  md: { w: 4, h: 12, gap: 2.5 },
};

interface Props {
  value: number;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  muted?: string;
}

const MIN_HEIGHT_RATIO = 0.52; // shortest bar (i=1) as a fraction of dims.h
const HEIGHT_STEP = 0.12;      // height added per bar level
const INACTIVE_OPACITY = 0.18;

export function WeightBars({ value, color = '#000', size = 'sm', muted }: Props) {
  const dims = DIMS[size] ?? DIMS['sm'];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: dims.gap }}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={{
          width: dims.w, height: dims.h * (MIN_HEIGHT_RATIO + (i - 1) * HEIGHT_STEP), borderRadius: 1,
          backgroundColor: i <= value ? color : (muted ?? color),
          opacity: i <= value ? 1 : INACTIVE_OPACITY,
        }} />
      ))}
    </View>
  );
}
