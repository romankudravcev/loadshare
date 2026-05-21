import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Kicker } from '../../components/Kicker';
import { WeightBars } from '../../components/WeightBars';
import { RoleGlyph } from '../../components/RoleGlyph';
import { Feather } from '@expo/vector-icons';
import { memberArc } from '../../utils/load';
import { COLORS } from '../../colors';
import { H_PAD, ROLES, type RoleAssign, type Member } from './constants';
import { RoleRow } from './RoleRow';

type Props = {
  assign: RoleAssign;
  onChangeAssign: (key: string, id: string) => void;
  members: Member[];
  weight: number;
  rolesOnMe: number;
  lightestMember: Member;
  autoBalance: boolean;
  onHandOff: () => void;
  onDismissNudge: () => void;
};

export function StepRoles({ assign, onChangeAssign, members, weight, rolesOnMe, lightestMember, autoBalance, onHandOff, onDismissNudge }: Props) {
  const byId = Object.fromEntries(members.map(m => [m.id, m]));
  const allSame = Object.values(assign).every(v => v === assign.planner);

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: 32, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Text className="font-serif text-5xl text-ink mb-6" style={{ lineHeight: 40, letterSpacing: -0.5 }}>Who does what?</Text>
      <Text className="font-sans-i text-base text-muted mb-6" style={{ marginTop: -16 }}>One task, four kinds of labor.</Text>

      <View className="rounded-2xl overflow-hidden border border-line-strong mb-4">
        {ROLES.map((r, i) => (
          <View key={r.key}>
            <RoleRow role={r} members={members} value={assign[r.key as keyof RoleAssign]} onChange={id => onChangeAssign(r.key, id)} />
            {i < ROLES.length - 1 && <View className="h-[1px]" style={{ backgroundColor: COLORS.lineStrong }} />}
          </View>
        ))}
      </View>

      {rolesOnMe >= 3 && autoBalance && (
        <View className="border-half rounded-xl p-3.5 flex-row gap-2.5 mb-4" style={{ backgroundColor: COLORS.nudge + '26', borderColor: COLORS.nudge + '55' }}>
          <View className="w-7 h-7 rounded-full items-center justify-center flex-shrink-0" style={{ backgroundColor: COLORS.nudge + '55' }}>
            <Feather name="flag" size={14} color={COLORS.inkSoft} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-md text-sm text-ink leading-[18px] mb-0.5">You're holding {rolesOnMe} of 4 roles.</Text>
            <Text className="font-sans text-xs text-ink-soft leading-[17px]">{lightestMember.name} has room. Hand off execution?</Text>
            <View className="flex-row gap-1.5 mt-2.5">
              <TouchableOpacity className="px-3.5 py-1.5 rounded-full bg-ink" onPress={onHandOff}>
                <Text className="font-sans-md text-sm text-surface">Hand to {lightestMember.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-3.5 py-1.5 rounded-full border-half border-line-strong" onPress={onDismissNudge}>
                <Text className="font-sans-md text-sm text-ink">Keep it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View className="rounded-xl border-half border-line bg-surface p-3.5">
        <View className="flex-row justify-between items-center mb-2.5">
          <Kicker color={COLORS.muted} style={undefined}>What this adds</Kicker>
          <View className="flex-row items-center gap-1.5">
            <WeightBars value={weight} color={COLORS.ink} muted={COLORS.ink} size="sm" />
            <Text className="font-sans-md text-2xs text-ink-soft">+{weight * 4} pts</Text>
          </View>
        </View>
        <View className="flex-row h-6 rounded overflow-hidden">
          {ROLES.map(r => {
            const m = byId[assign[r.key as keyof RoleAssign]];
            return (
              <View key={r.key} className="flex-1 flex-row items-center justify-center gap-0.5" style={{ backgroundColor: m ? memberArc(m.hue) : COLORS.line }}>
                <RoleGlyph role={r.key} color="#fff" size={10} />
                <Text className="font-sans-bold text-micro text-white tracking-micro">{m?.short}</Text>
              </View>
            );
          })}
        </View>
        <Text className="font-sans text-xs text-muted leading-4 mt-2">
          Each role earns {weight} load pts — this task puts {weight} pts on{' '}
          {allSame ? `${byId[assign.planner]?.name} alone.` : 'each role-holder.'}
        </Text>
      </View>
    </ScrollView>
  );
}
