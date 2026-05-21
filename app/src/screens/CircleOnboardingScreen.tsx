import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Display } from '../components/Kicker';
import { COLORS } from '../colors';
import { circles as circlesApi } from '../services/circles';
import { joinRequests as joinReqApi } from '../services/joinRequests';
import { supabase } from '../services/db';

type Mode = 'landing' | 'create' | 'join' | 'waiting';

export function CircleOnboardingScreen() {
  const { profile, session, refreshPersona, signOut } = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode]             = useState<Mode>('landing');
  const [circleName, setCircleName] = useState('');
  const [circleId, setCircleId]     = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (mode !== 'waiting') return;
    const userId = session?.user?.id;
    if (!userId) return;
    const channel = supabase
      .channel('circle-accept-watch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'circle_members', filter: `user_id=eq.${userId}` },
        async () => { await refreshPersona(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mode, session]);

  async function handleCreate() {
    if (!circleName.trim()) return;
    setLoading(true);
    try { await circlesApi.create(circleName.trim()); await refreshPersona(); }
    catch (err: unknown) { Alert.alert('Could not create circle', (err as Error).message); }
    finally { setLoading(false); }
  }

  async function handleJoinRequest() {
    const id = circleId.trim();
    if (!id) return;
    setLoading(true);
    try { await joinReqApi.create(id); }
    catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      if (!e.message?.includes('unique') && !e.code?.includes('23505')) {
        Alert.alert('Request failed', e.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setMode('waiting');
  }

  const displayName = profile?.user_metadata?.full_name || profile?.email?.split('@')[0] || 'there';

  return (
    <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 px-6" style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }}>

        <Display size={40} style={{ color: COLORS.ink, textAlign: 'center', marginBottom: 8 }}>loadshare</Display>

        {mode === 'landing' && <>
          <Text className="font-sans text-lg text-muted text-center leading-6 mt-2">
            Hey {displayName}!{'\n'}Let's set up your household.
          </Text>
          <View className="flex-1" />

          <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2.5">Start fresh</Text>
          <TouchableOpacity className="rounded-2xl border-half border-line-strong bg-surface p-4 mb-2" onPress={() => setMode('create')} activeOpacity={0.8}>
            <Text className="font-sans-bold text-lg text-ink mb-1">Create a circle</Text>
            <Text className="font-sans text-base text-muted leading-[19px]">Start a new household and invite others to join.</Text>
          </TouchableOpacity>

          <Text className="font-sans text-base text-muted text-center my-5">— or —</Text>

          <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2.5">Join someone's household</Text>
          <TouchableOpacity className="rounded-2xl border-half border-line-strong bg-surface p-4 mb-2" onPress={() => setMode('join')} activeOpacity={0.8}>
            <Text className="font-sans-bold text-lg text-ink mb-1">Request to join</Text>
            <Text className="font-sans text-base text-muted leading-[19px]">Ask a household member to share their circle ID from Settings.</Text>
          </TouchableOpacity>

          <View className="flex-1" />
          <TouchableOpacity onPress={signOut} activeOpacity={0.7} className="items-center p-3">
            <Text className="font-sans text-md text-muted">Sign out</Text>
          </TouchableOpacity>
        </>}

        {mode === 'create' && <>
          <Text className="font-sans text-lg text-muted text-center mt-2">Give your household a name.</Text>
          <View className="flex-1" />
          <View className="rounded-2xl border-half border-line-strong bg-surface p-4 mb-4">
            <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2">Circle name</Text>
            <TextInput
              value={circleName} onChangeText={setCircleName}
              placeholder="e.g. Cedar St. flat" placeholderTextColor={COLORS.muted}
              autoFocus className="font-serif text-2xl text-ink py-1"
            />
          </View>
          <TouchableOpacity
            className="h-[54px] rounded-[27px] items-center justify-center"
            style={{ backgroundColor: COLORS.ink, opacity: circleName.trim() ? 1 : 0.35 }}
            onPress={handleCreate} disabled={loading || !circleName.trim()} activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color={COLORS.surface} size="small" /> : <Text className="font-sans-bold text-lg text-surface">Create circle</Text>}
          </TouchableOpacity>
          <View className="flex-1" />
          <TouchableOpacity onPress={() => setMode('landing')} className="items-center p-3">
            <Text className="font-sans text-md text-muted">← Back</Text>
          </TouchableOpacity>
        </>}

        {mode === 'join' && <>
          <Text className="font-sans text-lg text-muted text-center mt-2 leading-6">
            Ask a household member to share their circle ID from the Settings sheet.
          </Text>
          <View className="flex-1" />
          <View className="rounded-2xl border-half border-line-strong bg-surface p-4 mb-4">
            <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-2">Circle ID</Text>
            <TextInput
              value={circleId} onChangeText={setCircleId}
              placeholder="Paste ID here" placeholderTextColor={COLORS.muted}
              autoCapitalize="none" autoCorrect={false} autoFocus
              className="font-sans text-md text-ink py-1"
            />
          </View>
          <TouchableOpacity
            className="h-[54px] rounded-[27px] items-center justify-center"
            style={{ backgroundColor: COLORS.ink, opacity: circleId.trim() ? 1 : 0.35 }}
            onPress={handleJoinRequest} disabled={loading || !circleId.trim()} activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color={COLORS.surface} size="small" /> : <Text className="font-sans-bold text-lg text-surface">Send request</Text>}
          </TouchableOpacity>
          <View className="flex-1" />
          <TouchableOpacity onPress={() => setMode('landing')} className="items-center p-3">
            <Text className="font-sans text-md text-muted">← Back</Text>
          </TouchableOpacity>
        </>}

        {mode === 'waiting' && <>
          <View className="flex-1" />
          <View className="rounded-[20px] border-half border-line-strong bg-surface p-8 items-center">
            <ActivityIndicator color={COLORS.ink} size="small" style={{ marginBottom: 18 }} />
            <Text className="font-serif text-4xl text-ink mb-3">Request sent!</Text>
            <Text className="font-sans text-md text-muted text-center leading-[22px]">
              Waiting for a circle member to approve you.{'\n'}This screen updates automatically.
            </Text>
          </View>
          <View className="flex-1" />
          <TouchableOpacity onPress={() => setMode('landing')} className="items-center p-3">
            <Text className="font-sans text-md text-muted">← Back</Text>
          </TouchableOpacity>
        </>}

      </View>
    </KeyboardAvoidingView>
  );
}
