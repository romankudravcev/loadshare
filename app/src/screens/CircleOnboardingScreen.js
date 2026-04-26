import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Display } from '../components/primitives';
import { circles as circlesApi } from '../services/circles';
import { joinRequests as joinReqApi } from '../services/joinRequests';
import { supabase } from '../services/db';

export function CircleOnboardingScreen() {
  const { palette, profile, session, refreshPersona, signOut } = useApp();
  const insets = useSafeAreaInsets();

  const [mode, setMode]             = useState('landing'); // landing | create | join | waiting
  const [circleName, setCircleName] = useState('');
  const [circleId, setCircleId]     = useState('');
  const [loading, setLoading]       = useState(false);

  // Realtime: auto-navigate when the owner accepts the join request
  useEffect(() => {
    if (mode !== 'waiting') return;
    const userId = session?.user?.id;
    if (!userId) return;

    const channel = supabase
      .channel('circle-accept-watch')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'circle_members',
        filter: `user_id=eq.${userId}`,
      }, async () => {
        await refreshPersona();
        // hasCircle becomes true → AppRouter transitions to AppShell automatically
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [mode, session]);

  async function handleCreate() {
    if (!circleName.trim()) return;
    setLoading(true);
    try {
      await circlesApi.create(circleName.trim());
      await refreshPersona();
    } catch (err) {
      Alert.alert('Could not create circle', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRequest() {
    const id = circleId.trim();
    if (!id) return;
    setLoading(true);
    try {
      await joinReqApi.create(id);
    } catch (err) {
      // unique constraint → request already exists, still show waiting
      if (!err.message?.includes('unique') && !err.code?.includes('23505')) {
        Alert.alert('Request failed', err.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setMode('waiting');
  }

  const displayName =
    profile?.user_metadata?.full_name ||
    profile?.email?.split('@')[0] ||
    'there';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, {
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 32,
      }]}>

        <Display size={40} style={{ color: palette.ink, textAlign: 'center', marginBottom: 8 }}>
          loadshare
        </Display>

        {/* ── Landing ── */}
        {mode === 'landing' && <>
          <Text style={[styles.greeting, { color: palette.muted }]}>
            Hey {displayName}!{'\n'}Let's set up your household.
          </Text>

          <View style={styles.spacer} />

          <Text style={[styles.sectionLabel, { color: palette.muted }]}>Start fresh</Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.lineStrong }]}
            onPress={() => setMode('create')} activeOpacity={0.8}
          >
            <Text style={[styles.cardTitle, { color: palette.ink }]}>Create a circle</Text>
            <Text style={[styles.cardSub, { color: palette.muted }]}>
              Start a new household and invite others to join.
            </Text>
          </TouchableOpacity>

          <Text style={[styles.orLabel, { color: palette.muted }]}>— or —</Text>

          <Text style={[styles.sectionLabel, { color: palette.muted }]}>Join someone's household</Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.lineStrong }]}
            onPress={() => setMode('join')} activeOpacity={0.8}
          >
            <Text style={[styles.cardTitle, { color: palette.ink }]}>Request to join</Text>
            <Text style={[styles.cardSub, { color: palette.muted }]}>
              Ask a household member to share their circle ID from Settings.
            </Text>
          </TouchableOpacity>

          <View style={styles.spacer} />
          <TouchableOpacity onPress={signOut} activeOpacity={0.7} style={styles.signOutBtn}>
            <Text style={[styles.linkText, { color: palette.muted }]}>Sign out</Text>
          </TouchableOpacity>
        </>}

        {/* ── Create ── */}
        {mode === 'create' && <>
          <Text style={[styles.greeting, { color: palette.muted }]}>
            Give your household a name.
          </Text>
          <View style={styles.spacer} />

          <View style={[styles.inputCard, { backgroundColor: palette.surface, borderColor: palette.lineStrong }]}>
            <Text style={[styles.inputLabel, { color: palette.muted }]}>Circle name</Text>
            <TextInput
              value={circleName}
              onChangeText={setCircleName}
              placeholder="e.g. Cedar St. flat"
              placeholderTextColor={palette.muted}
              autoFocus
              style={[styles.inputField, { color: palette.ink }]}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, {
              backgroundColor: palette.ink,
              opacity: circleName.trim() ? 1 : 0.35,
            }]}
            onPress={handleCreate}
            disabled={loading || !circleName.trim()}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={palette.surface} size="small" />
              : <Text style={[styles.primaryBtnText, { color: palette.surface }]}>Create circle</Text>
            }
          </TouchableOpacity>

          <View style={styles.spacer} />
          <TouchableOpacity onPress={() => setMode('landing')} style={styles.backBtn}>
            <Text style={[styles.linkText, { color: palette.muted }]}>← Back</Text>
          </TouchableOpacity>
        </>}

        {/* ── Join ── */}
        {mode === 'join' && <>
          <Text style={[styles.greeting, { color: palette.muted }]}>
            Ask a household member to share their circle ID from the Settings sheet.
          </Text>
          <View style={styles.spacer} />

          <View style={[styles.inputCard, { backgroundColor: palette.surface, borderColor: palette.lineStrong }]}>
            <Text style={[styles.inputLabel, { color: palette.muted }]}>Circle ID</Text>
            <TextInput
              value={circleId}
              onChangeText={setCircleId}
              placeholder="Paste ID here"
              placeholderTextColor={palette.muted}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              style={[styles.inputField, { color: palette.ink, fontSize: 14 }]}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, {
              backgroundColor: palette.ink,
              opacity: circleId.trim() ? 1 : 0.35,
            }]}
            onPress={handleJoinRequest}
            disabled={loading || !circleId.trim()}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={palette.surface} size="small" />
              : <Text style={[styles.primaryBtnText, { color: palette.surface }]}>Send request</Text>
            }
          </TouchableOpacity>

          <View style={styles.spacer} />
          <TouchableOpacity onPress={() => setMode('landing')} style={styles.backBtn}>
            <Text style={[styles.linkText, { color: palette.muted }]}>← Back</Text>
          </TouchableOpacity>
        </>}

        {/* ── Waiting ── */}
        {mode === 'waiting' && <>
          <View style={styles.spacer} />
          <View style={[styles.waitCard, { backgroundColor: palette.surface, borderColor: palette.lineStrong }]}>
            <ActivityIndicator color={palette.ink} size="small" style={{ marginBottom: 18 }} />
            <Text style={[styles.waitTitle, { color: palette.ink }]}>Request sent!</Text>
            <Text style={[styles.waitSub, { color: palette.muted }]}>
              Waiting for a circle member to approve you.{'\n'}
              This screen updates automatically.
            </Text>
          </View>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={() => setMode('landing')} style={styles.backBtn}>
            <Text style={[styles.linkText, { color: palette.muted }]}>← Back</Text>
          </TouchableOpacity>
        </>}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  greeting: {
    fontFamily: 'DMSans_400Regular', fontSize: 16,
    textAlign: 'center', lineHeight: 24, marginTop: 10,
  },
  spacer: { flex: 1 },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 11,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  orLabel: {
    fontFamily: 'DMSans_400Regular', fontSize: 13,
    textAlign: 'center', marginVertical: 20,
  },
  card: {
    borderRadius: 16, borderWidth: 0.5, padding: 18, marginBottom: 8,
  },
  cardTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, marginBottom: 4 },
  cardSub: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 19 },
  inputCard: { borderRadius: 16, borderWidth: 0.5, padding: 18, marginBottom: 16 },
  inputLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 11,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  inputField: {
    fontFamily: 'InstrumentSerif_400Regular', fontSize: 24, paddingVertical: 4,
  },
  primaryBtn: {
    height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 16 },
  signOutBtn: { alignItems: 'center', padding: 12 },
  backBtn: { alignItems: 'center', padding: 12 },
  linkText: { fontFamily: 'DMSans_400Regular', fontSize: 14 },
  waitCard: {
    borderRadius: 20, borderWidth: 0.5, padding: 32, alignItems: 'center',
  },
  waitTitle: {
    fontFamily: 'InstrumentSerif_400Regular', fontSize: 28, marginBottom: 12,
  },
  waitSub: {
    fontFamily: 'DMSans_400Regular', fontSize: 14,
    textAlign: 'center', lineHeight: 22,
  },
});
