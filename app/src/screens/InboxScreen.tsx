import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS } from '../colors';
import { Avatar } from '../components/Avatar';
import { Kicker, Display } from '../components/Kicker';
import { Feather } from '@expo/vector-icons';
import { FadeInView } from '../components/FadeInView';
import { InboxRow } from './InboxRow';
import type { Task } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_BAR_EXTRA = 100;
const FILTERS = [
  { id: 'all',    label: 'All open' },
  { id: 'mine',   label: "I'm holding" },
  { id: 'others', label: 'Others holding' },
  { id: 'soon',   label: 'Soon' },
];

export function InboxScreen() {
  const insets = useSafeAreaInsets();
  const { persona, setOpenTask } = useApp();
  const [filter, setFilter] = useState('all');

  if (!persona) return null;

  const handleFilter = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(id);
  };

  const me   = persona.members[0];
  const byId = Object.fromEntries(persona.members.map(m => [m.id, m]));
  let tasks  = persona.tasks.filter(t => t.status !== 'done');
  if (filter === 'mine')   tasks = tasks.filter(t => t.reminder === me.id);
  if (filter === 'others') tasks = tasks.filter(t => t.reminder !== me.id);
  if (filter === 'soon')   tasks = tasks.filter(t => ['Mon', 'Tue', 'Wed', 'Today', 'Tomorrow', 'daily'].includes(t.when));

  const groups: Record<string, Task[]> = {};
  tasks.forEach(t => {
    const key = t.reminder ?? 'none';
    (groups[key] = groups[key] ?? []).push(t);
  });
  const holders = Object.keys(groups).map(id => ({ m: byId[id], tasks: groups[id] }));

  return (
    <FadeInView style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: TAB_BAR_EXTRA }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Kicker color={COLORS.muted}>Inbox</Kicker>
          <Display size={32} style={{ color: COLORS.ink, marginTop: 2 }}>Things being held.</Display>
          <Text className="font-sans text-base text-muted leading-[19px] mt-1.5">
            Each item is mental weight someone is carrying. Picking one up is a small way to share the load.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {FILTERS.map(f => (
              <TouchableOpacity key={f.id} onPress={() => handleFilter(f.id)} activeOpacity={0.7}
                className={`px-3.5 py-2 rounded-full ${filter === f.id ? 'bg-ink' : 'bg-surface border-half border-line'}`}>
                <Text className={`font-sans-md text-base ${filter === f.id ? 'text-surface' : 'text-ink'}`}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {holders.map(({ m, tasks: groupTasks }) => (
          <View key={m?.id ?? 'none'} className="mb-5">
            <View className="flex-row items-center gap-2.5 mb-2.5 px-0.5">
              <Avatar member={m} size="m" />
              <Text className="font-sans-bold text-sm text-ink" style={{ letterSpacing: 0.2 }}>
                {m?.id === me.id ? 'You' : (m?.name ?? 'Unknown')} · {groupTasks.length} {groupTasks.length === 1 ? 'item' : 'items'}
              </Text>
              <View className="flex-1 h-[0.5px] ml-1.5" style={{ backgroundColor: COLORS.line }} />
            </View>
            <View className="gap-1.5">
              {groupTasks.map(t => (
                <InboxRow key={t.id} task={t} persona={persona} me={me} byId={byId} onPress={() => setOpenTask(t)} />
              ))}
            </View>
          </View>
        ))}

        {tasks.length === 0 && (
          <View className="py-[60px] items-center">
            <Feather name="check" size={32} color={COLORS.executor} />
            <Text className="font-sans text-md text-muted mt-2.5">Nothing waiting. Quiet moment.</Text>
          </View>
        )}
      </ScrollView>
    </FadeInView>
  );
}

