import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { ROLES, weightOf } from '../tokens';
import { COLORS } from '../colors';
import { Avatar, RoleGlyph, Kicker, Display, WeightBars, Dot, Icon } from '../components/primitives';
import { FadeInView } from '../components/FadeInView';

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

  const handleFilter = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(id);
  };

  const me = persona.members[0];
  const byId = Object.fromEntries(persona.members.map(m => [m.id, m]));
  let tasks = persona.tasks.filter(t => t.status !== 'done');
  if (filter === 'mine')   tasks = tasks.filter(t => t.reminder === me.id);
  if (filter === 'others') tasks = tasks.filter(t => t.reminder !== me.id);
  if (filter === 'soon')   tasks = tasks.filter(t => ['Mon', 'Tue', 'Wed', 'Today', 'Tomorrow', 'daily'].includes(t.when));

  const groups = {};
  tasks.forEach(t => { (groups[t.reminder] = groups[t.reminder] || []).push(t); });
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
          <View key={m.id} className="mb-5">
            <View className="flex-row items-center gap-2.5 mb-2.5 px-0.5">
              <Avatar member={m} size={22} />
              <Text className="font-sans-bold text-sm text-ink" style={{ letterSpacing: 0.2 }}>
                {m.id === me.id ? 'You' : m.name} · {groupTasks.length} {groupTasks.length === 1 ? 'item' : 'items'}
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
            <Icon name="check" size={32} color={COLORS.executor} />
            <Text className="font-sans text-md text-muted mt-2.5">Nothing waiting. Quiet moment.</Text>
          </View>
        )}
      </ScrollView>
    </FadeInView>
  );
}

function InboxRow({ task, persona, me, byId, onPress }) {
  const [picked, setPicked] = useState(false);
  const { showToast } = useApp();
  const doer = byId[task.executor];
  const holder = byId[task.reminder];
  const isMine = holder?.id === me.id;

  return (
    <View className="rounded-xl border-half border-line bg-surface overflow-hidden">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="p-3.5">
        <Text className="font-sans-md text-md text-ink leading-[19px] mb-1.5">{task.title}</Text>
        <View className="flex-row gap-2.5 items-center mb-2">
          {ROLES.map(r => {
            const m = byId[task[r.key]];
            return (
              <View key={r.key} className="flex-row items-center gap-0.5">
                <RoleGlyph role={r.key} color={COLORS[r.key]} size={10} />
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
            <Icon name={picked ? 'check' : 'handoff'} size={14} color={picked ? COLORS.executor : COLORS.ink} />
            <Text className="font-sans-md text-sm" style={{ color: picked ? COLORS.executor : COLORS.ink }}>
              {picked ? `Picked up · ${holder?.name} notified` : `Pick up from ${holder?.name}`}
            </Text>
          </TouchableOpacity>
          {!picked && <>
            <View className="w-[0.5px]" style={{ backgroundColor: COLORS.line }} />
            <TouchableOpacity className="flex-row items-center gap-2 p-3" activeOpacity={0.7}
              onPress={() => showToast(`Reminded ${holder?.name} about ${task.title}`)}>
              <Icon name="bell" size={14} color={COLORS.muted} />
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
