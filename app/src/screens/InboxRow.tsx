import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ROLES, weightOf } from '../constants/roles';
import { COLORS } from '../colors';
import { Avatar } from '../components/Avatar';
import { RoleGlyph } from '../components/RoleGlyph';
import { WeightBars } from '../components/WeightBars';
import { Dot } from '../components/Dot';
import type { Task, Persona, Member } from '../types';

export interface InboxRowProps {
  task:    Task;
  persona: Persona;
  me:      Member;
  byId:    Record<string, Member>;
  onPress: () => void;
}

export function InboxRow({ task, persona: _persona, me, byId, onPress }: InboxRowProps) {
  const [picked, setPicked] = useState(false);
  const { showToast } = useApp();
  const doer   = byId[task.executor ?? ''];
  const holder = byId[task.reminder ?? ''];
  const isMine = holder?.id === me.id;

  return (
    <View className="rounded-xl border-half border-line bg-surface overflow-hidden">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="p-3.5">
        <Text className="font-sans-md text-md text-ink leading-[19px] mb-1.5">{task.title}</Text>
        <View className="flex-row gap-2.5 items-center mb-2">
          {ROLES.map(r => {
            const m = byId[task[r.key] ?? ''];
            return (
              <View key={r.key} className="flex-row items-center gap-0.5">
                <RoleGlyph role={r.key} color={COLORS[r.key as keyof typeof COLORS] as string} size={10} />
                <Text className="font-sans-md text-2xs text-muted">{m?.short}</Text>
              </View>
            );
          })}
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="font-sans text-xs text-muted">{task.when}</Text>
          <Dot color={COLORS.muted} />
          <Text className="font-sans text-xs text-muted">{task.category}</Text>
          <Dot color={COLORS.muted} />
          <WeightBars value={task.weight} color={COLORS.inkSoft} muted={COLORS.inkSoft} size="xs" />
          <Text className="font-sans-md text-xs text-ink-soft">{weightOf(task.weight).label}</Text>
        </View>
      </TouchableOpacity>

      {!isMine ? (
        <View className="flex-row items-stretch border-t-half border-line">
          <TouchableOpacity
            className="flex-1 flex-row items-center gap-2 p-3"
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setPicked(p => !p);
              showToast(!picked ? `Picked up from ${holder?.name}` : 'Put back');
            }}
            activeOpacity={0.7}
          >
            <Feather name={picked ? 'check' : 'arrow-right'} size={14} color={picked ? COLORS.executor : COLORS.ink} />
            <Text className="font-sans-md text-sm" style={{ color: picked ? COLORS.executor : COLORS.ink }}>
              {picked ? `Picked up · ${holder?.name} notified` : `Pick up from ${holder?.name}`}
            </Text>
          </TouchableOpacity>
          {!picked && <>
            <View className="w-[0.5px]" style={{ backgroundColor: COLORS.line }} />
            <TouchableOpacity className="flex-row items-center gap-2 p-3" activeOpacity={0.7}
              onPress={() => showToast(`Reminded ${holder?.name} about ${task.title}`)}>
              <Feather name="bell" size={14} color={COLORS.muted} />
              <Text className="font-sans-md text-sm text-muted">Remind</Text>
            </TouchableOpacity>
          </>}
        </View>
      ) : (
        <View className="border-t-half border-line bg-surface-alt px-3.5 py-2.5 flex-row justify-between items-center">
          <Text className="font-sans text-xs text-muted">Waiting on {doer?.name} to finish</Text>
          <TouchableOpacity onPress={() => showToast(`Nudged ${doer?.name} about ${task.title}`)}>
            <Text className="font-sans-md text-xs text-accent">Nudge</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
