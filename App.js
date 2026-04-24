import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import { AppProvider, useApp } from './src/AppContext';
import { AppIntroScreen } from './src/screens/AppIntroScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CreateScreen }   from './src/screens/CreateScreen';
import { InboxScreen }    from './src/screens/InboxScreen';
import { TaskSheet }      from './src/components/TaskSheet';
import { Icon }           from './src/components/primitives';

// ── Floating tab bar ──────────────────────────────────────────────────────────
function FloatingTabBar({ active, onChange }) {
  const { palette } = useApp();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'dashboard', label: 'Home',   icon: 'home' },
    { id: 'create',    label: 'Create', icon: 'plus' },
    { id: 'inbox',     label: 'Inbox',  icon: 'inbox' },
  ];

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom + 6 }]}
      pointerEvents="box-none">
      <View style={[styles.tabBarPill, { borderColor: palette.line }]}>
        {tabs.map(tab => {
          const isFocused = active === tab.id;
          const isCreate  = tab.id === 'create';
          return (
            <TouchableOpacity key={tab.id}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.75}
              style={styles.tabBtn}>
              {isCreate ? (
                <View style={[styles.createCircle, { backgroundColor: palette.ink }]}>
                  <Icon name="plus" size={20} color={palette.surface} />
                </View>
              ) : (
                <Icon name={tab.icon} size={22}
                  color={isFocused ? palette.ink : palette.muted} />
              )}
              <Text style={[styles.tabLabel, {
                color: (isFocused && !isCreate) ? palette.ink : palette.muted,
              }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Preferences sheet ─────────────────────────────────────────────────────────
function SettingsSheet({ visible, onClose }) {
  const { palette, paletteKey, setPaletteKey, personaKey, setPersonaKey } = useApp();
  const insets = useSafeAreaInsets();

  const palettes = [
    { key: 'warm', label: 'Warm' },
    { key: 'dusk', label: 'Dusk' },
    { key: 'mono', label: 'Mono' },
  ];
  const personas = [
    { key: 'couple', label: 'Couple · Mira & Theo' },
    { key: 'family', label: 'Family · Okafors' },
    { key: 'flat',   label: 'Flat · Cedar St.' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide"
      onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.settingsOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject}
          onPress={onClose} activeOpacity={1} />
        <View style={[styles.settingsSheet, {
          backgroundColor: palette.surface,
          paddingBottom: Math.max(insets.bottom + 16, 24),
        }]}>
          <View style={[styles.handle, { backgroundColor: palette.lineStrong }]} />

          <Text style={[styles.settingsTitle, { color: palette.ink }]}>Preferences</Text>

          <Text style={[styles.settingsSectionLabel, { color: palette.muted }]}>Palette</Text>
          <View style={styles.settingsRow}>
            {palettes.map(p => (
              <TouchableOpacity key={p.key} onPress={() => setPaletteKey(p.key)}
                style={[styles.settingsChip, {
                  backgroundColor: p.key === paletteKey ? palette.ink : 'transparent',
                  borderColor: p.key === paletteKey ? palette.ink : palette.lineStrong,
                }]}>
                <Text style={[styles.settingsChipText, {
                  color: p.key === paletteKey ? palette.surface : palette.ink,
                }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.settingsSectionLabel, { color: palette.muted }]}>Household</Text>
          <View style={{ gap: 6 }}>
            {personas.map(p => (
              <TouchableOpacity key={p.key} onPress={() => setPersonaKey(p.key)}
                style={[styles.settingsChipWide, {
                  backgroundColor: p.key === personaKey ? palette.ink : 'transparent',
                  borderColor: p.key === personaKey ? palette.ink : palette.lineStrong,
                }]}>
                <Text style={[styles.settingsChipText, {
                  color: p.key === personaKey ? palette.surface : palette.ink,
                }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { palette, persona, openTask, setOpenTask } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* Active screen */}
      {activeTab === 'dashboard' && <DashboardScreen />}
      {activeTab === 'create'    && <CreateScreen />}
      {activeTab === 'inbox'     && <InboxScreen />}

      {/* Floating tab bar — positioned over content */}
      <FloatingTabBar active={activeTab} onChange={setActiveTab} />

      {/* Overlays */}
      <TaskSheet task={openTask} persona={persona} palette={palette}
        onClose={() => setOpenTask(null)} />

      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Floating preferences dot */}
      <TouchableOpacity
        onPress={() => setSettingsOpen(true)}
        style={[styles.settingsFab, {
          backgroundColor: palette.surface,
          borderColor: palette.line,
        }]}>
        <Icon name="dots" size={18} color={palette.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ── App Router ────────────────────────────────────────────────────────────────
import { StartupScreen } from './src/screens/StartupScreen';

function AppRouter() {
  const [startupDone, setStartupDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  if (!startupDone) {
    return <StartupScreen onComplete={() => setStartupDone(true)} />;
  }

  if (!introDone) {
    return <AppIntroScreen onComplete={() => setIntroDone(true)} />;
  }

  return <AppShell />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Root() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    DMSans_400Regular,
    DMSans_400Regular_Italic,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Tab bar
  tabBarOuter: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 14, paddingTop: 8,
  },
  tabBarPill: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 28, borderWidth: 0.5,
    backgroundColor: 'rgba(255,253,248,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.09, shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  tabBtn: {
    flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4,
  },
  tabLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 10, letterSpacing: 0.2,
  },
  createCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -4, marginBottom: 0,
    shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  // Settings FAB
  settingsFab: {
    position: 'absolute', right: 16, bottom: 110,
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  // Settings sheet
  settingsOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  settingsSheet: {
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 20,
  },
  settingsTitle: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 26, marginBottom: 22,
  },
  settingsSectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11, letterSpacing: 1.4,
    textTransform: 'uppercase', marginBottom: 10,
  },
  settingsRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  settingsChip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 0.5,
  },
  settingsChipWide: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14, borderWidth: 0.5,
  },
  settingsChipText: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
});
