import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { memberBg, memberInk } from '../utils/load';
import type { Member } from '../types';

type AvatarSize = 's' | 'm' | 'l';

const containerClass: Record<AvatarSize, string> = {
  s: 'w-5 h-5',   // 20px — inline/list
  m: 'w-7 h-7',   // 28px — default
  l: 'w-9 h-9',   // 36px — featured
};

const textSize: Record<AvatarSize, { fontSize: number; lineHeight: number }> = {
  s: { fontSize: 9,  lineHeight: 10 },
  m: { fontSize: 12, lineHeight: 14 },
  l: { fontSize: 15, lineHeight: 18 },
};

interface Props {
  member: Member | null | undefined;
  size?: AvatarSize;
  ring?: boolean;
  style?: ViewStyle;
}

export function Avatar({ member, size = 's', ring = false, style }: Props) {
  if (!member) return null;
  return (
    <View
      className={`${containerClass[size]} rounded-full shrink-0 items-center justify-center${ring ? ' border-2 border-white' : ''}`}
      style={[{ backgroundColor: memberBg(member.hue) }, style]}
    >
      <Text style={{
        fontFamily: 'DMSans_600SemiBold',
        color: memberInk(member.hue),
        ...textSize[size],
      }}>{member.short}</Text>
    </View>
  );
}
