import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Share, ActivityIndicator,
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
import * as SecureStore from 'expo-secure-store';

import { AppProvider, useApp } from './src/AppContext';
import { ProfileSetupScreen }      from './src/screens/ProfileSetupScreen';
import { AppIntroScreen }          from './src/screens/AppIntroScreen';
import { DashboardScreen }         from './src/screens/DashboardScreen';
import { CreateScreen }            from './src/screens/CreateScreen';
import { InboxScreen }             from './src/screens/InboxScreen';
import { StartupScreen }           from './src/screens/StartupScreen';
import { AuthScreen }              from './src/screens/AuthScreen';
import { CircleOnboardingScreen }  from './src/screens/CircleOnboardingScreen';
import { TaskSheet }               from './src/components/TaskSheet';
import { Icon, Avatar }            from './src/components/primitives';
import { Toast }                   from './src/components/Toast';

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
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom + 6 }]} pointerEvents="box-none">
      <View style={[styles.tabBarPill, { borderColor: palette.line }]}>
        {tabs.map(tab => {
          const isFocused = active === tab.id;
          const isCreate  = tab.id === 'create';
          return (
            <TouchableOpacity key={tab.id} onPress={() => onChange(tab.id)}
              activeOpacity={0.75} style={styles.tabBtn}>
              {isCreate ? (
                <View style={[styles.createCircle, { backgroundColor: palette.ink }]}>
                  <Icon name="plus" size={20} color={palette.surface} />
                </View>
              ) : (
                <Icon name={tab.icon} size={22} color={isFocused ? palette.ink : palette.muted} />
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

// ── Pending join requests (shown inside SettingsSheet for circle owners) ───────
function PendingRequests({ circleId, palette }) {
  const { joinRequests } = useApp();
  const [requests, setRequests] = useState([]);
  const [busy, setBusy]         = useState(null); // requestId being processed

  useEffect(() => {
    if (!circleId) return;
    joinRequests.listPending(circleId)
      .then(setRequests)
      .catch(() => {});
  }, [circleId]);

  async function handleAccept(req) {
    setBusy(req.id);
    try {
      await joinRequests.accept(req.id, req.circle_id, req.requester_id);
      setRequests(r => r.filter(x => x.id !== req.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(req) {
    setBusy(req.id);
    try {
      await joinRequests.reject(req.id);
      setRequests(r => r.filter(x => x.id !== req.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <View style={{ marginTop: 4 }}>
      <Text style={[styles.settingsSectionLabel, { color: palette.muted, marginBottom: 10 }]}>
        Join Requests
      </Text>
      {requests.map(req => (
        <View key={req.id} style={[styles.reqRow, { borderColor: palette.lineStrong, backgroundColor: palette.surfaceAlt }]}>
          {req.requester && <Avatar member={req.requester} size={28} />}
          <Text style={[styles.reqName, { color: palette.ink }]}>
            {req.requester?.name ?? 'Unknown'}
          </Text>
          {busy === req.id ? (
            <ActivityIndicator size="small" color={palette.muted} />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => handleAccept(req)}
                style={[styles.reqBtn, { backgroundColor: palette.ink }]}>
                <Text style={[styles.reqBtnText, { color: palette.surface }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReject(req)}
                style={[styles.reqBtn, { borderWidth: 0.5, borderColor: palette.lineStrong }]}>
                <Text style={[styles.reqBtnText, { color: palette.muted }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Preferences sheet ─────────────────────────────────────────────────────────
function SettingsSheet({ visible, onClose }) {
  const { palette, paletteKey, setPaletteKey, personaKey, setPersonaKey,
          isAuthenticated, activeCircle, session } = useApp();
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

  const isOwner = activeCircle && session?.user?.id === activeCircle.owner_id;

  function shareCircleId() {
    if (!activeCircle) return;
    Share.share({
      message: `Join my LoadShare circle!\nCircle ID: ${activeCircle.id}`,
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide"
      onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.settingsOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        <View style={[styles.settingsSheet, {
          backgroundColor: palette.surface,
          paddingBottom: Math.max(insets.bottom + 16, 24),
        }]}>
          <View style={[styles.handle, { backgroundColor: palette.lineStrong }]} />
          <Text style={[styles.settingsTitle, { color: palette.ink }]}>Settings</Text>

          {/* Palette */}
          <Text style={[styles.settingsSectionLabel, { color: palette.muted }]}>Palette</Text>
          <View style={[styles.settingsRow, { marginBottom: 22 }]}>
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

          {/* Demo personas — only when not authenticated */}
          {!isAuthenticated && <>
            <Text style={[styles.settingsSectionLabel, { color: palette.muted }]}>Demo household</Text>
            <View style={{ gap: 6, marginBottom: 22 }}>
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
          </>}

          {/* Circle ID — share with others so they can request to join */}
          {isAuthenticated && activeCircle && <>
            <Text style={[styles.settingsSectionLabel, { color: palette.muted }]}>Your circle</Text>
            <TouchableOpacity
              onPress={shareCircleId}
              style={[styles.circleIdBox, { backgroundColor: palette.surfaceAlt, borderColor: palette.lineStrong }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.circleIdLabel, { color: palette.muted }]}>Circle ID  ·  tap to share</Text>
              <Text style={[styles.circleIdValue, { color: palette.inkSoft }]} numberOfLines={1}>
                {activeCircle.id}
              </Text>
            </TouchableOpacity>

            {/* Pending join requests (owners only) */}
            {isOwner && <PendingRequests circleId={activeCircle.id} palette={palette} />}
          </>}
        </View>
      </View>
    </Modal>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { palette, persona, openTask, setOpenTask, activeTab, setActiveTab, loading } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading || !persona) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.muted} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {activeTab === 'dashboard' && <DashboardScreen />}
      {activeTab === 'create'    && <CreateScreen />}
      {activeTab === 'inbox'     && <InboxScreen />}

      <FloatingTabBar active={activeTab} onChange={setActiveTab} />

      <TaskSheet task={openTask} persona={persona} palette={palette}
        onClose={() => setOpenTask(null)} />
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast />

      <TouchableOpacity
        onPress={() => setSettingsOpen(true)}
        style={[styles.settingsFab, { backgroundColor: palette.surface, borderColor: palette.line }]}>
        <Icon name="dots" size={18} color={palette.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ── App Router ────────────────────────────────────────────────────────────────
function AppRouter() {
  const { isAuthenticated, profile, loading, hasCircle } = useApp();
  const [startupDone, setStartupDone]   = useState(false);
  const [introDone, setIntroDone]       = useState(false);
  const [introChecked, setIntroChecked] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('@intro_done')
      .then(v => { if (v === 'true') setIntroDone(true); })
      .catch(() => {})
      .finally(() => setIntroChecked(true));
  }, []);

  const handleIntroComplete = async () => {
    await SecureStore.setItemAsync('@intro_done', 'true').catch(() => {});
    setIntroDone(true);
  };

  if (!startupDone || !introChecked) return <StartupScreen onComplete={() => setStartupDone(true)} />;
  if (!introDone)                     return <AppIntroScreen onComplete={handleIntroComplete} />;
  if (!isAuthenticated)               return <AuthScreen />;
  if (!profile)                       return <ProfileSetupScreen />;
  if (loading)                        return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
  if (!hasCircle)                     return <CircleOnboardingScreen />;
  return <AppShell />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Root() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic,
    DMSans_400Regular, DMSans_400Regular_Italic,
    DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold,
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
  tabBarOuter: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 14, paddingTop: 8,
  },
  tabBarPill: {
    flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 28, borderWidth: 0.5,
    backgroundColor: 'rgba(255,253,248,0.9)',
    shadowColor: '#000', shadowOpacity: 0.09, shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 }, elevation: 10,
  },
  tabBtn: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  tabLabel: { fontFamily: 'DMSans_500Medium', fontSize: 10, letterSpacing: 0.2 },
  createCircle: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    marginTop: -4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  settingsFab: {
    position: 'absolute', right: 16, bottom: 110,
    width: 36, height: 36, borderRadius: 18, borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  settingsOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  settingsSheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  settingsTitle: { fontFamily: 'InstrumentSerif_400Regular', fontSize: 26, marginBottom: 22 },
  settingsSectionLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 11,
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10,
  },
  settingsRow: { flexDirection: 'row', gap: 8 },
  settingsChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 0.5 },
  settingsChipWide: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 0.5 },
  settingsChipText: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
  circleIdBox: {
    borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 16,
  },
  circleIdLabel: { fontFamily: 'DMSans_500Medium', fontSize: 10, letterSpacing: 0.8, marginBottom: 4 },
  circleIdValue: { fontFamily: 'DMSans_400Regular', fontSize: 12 },
  reqRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 0.5, padding: 12, marginBottom: 8,
  },
  reqName: { flex: 1, fontFamily: 'DMSans_500Medium', fontSize: 14 },
  reqBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  reqBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
});
