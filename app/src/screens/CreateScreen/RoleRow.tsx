import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar, RoleGlyph } from '../../components/primitives';
import { COLORS } from '../../colors';
import type { Member } from './constants';

type Role = { key: string; name: string; desc: string };

type Props = {
  role: Role;
  members: Member[];
  value: string;
  onChange: (id: string) => void;
};

export function RoleRow({ role, members, value, onChange }: Props) {
  const roleColor = COLORS[role.key as keyof typeof COLORS] as string;
  return (
    <View className="p-3.5 flex-row items-center gap-3 bg-surface">
      <View className="w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: roleColor + '22' }}>
        <RoleGlyph role={role.key} color={roleColor} size={14} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-bold text-sm text-ink">{role.name}</Text>
        <Text className="font-sans-i text-xs text-muted mt-0.5">{role.desc}</Text>
      </View>
      <View className="flex-row gap-1">
        {members.map(m => (
          <TouchableOpacity
            key={m.id}
            onPress={() => onChange(m.id)}
            activeOpacity={0.7}
            style={{ borderRadius: 14, padding: 2, borderWidth: 2, borderColor: m.id === value ? roleColor : 'transparent', opacity: m.id === value ? 1 : 0.5 }}
          >
            <Avatar member={m} size={22} style={undefined} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
