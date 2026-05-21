import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../colors';

const AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙'];
const ACCENT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#FF8ED4'];

export function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { profiles, refreshPersona } = useApp();
  const [name, setName]     = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor]   = useState(ACCENT_COLORS[0]);

  const handleComplete = async () => {
    if (!name.trim()) return;
    try {
      await profiles.updateMe({ name: name.trim() });
      await refreshPersona();
    } catch (err) {
      console.error('Profile setup error:', err);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-canvas" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }}>
        <Text className="font-serif text-7xl text-ink text-center mb-2">Who are you?</Text>
        <Text className="font-sans text-lg text-muted text-center mb-8">Set up your personal profile.</Text>

        <View className="mb-8">
          <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-3">Choose an Avatar</Text>
          <View className="flex-row flex-wrap gap-3">
            {AVATARS.map(a => (
              <TouchableOpacity
                key={a}
                className="w-[50px] h-[50px] rounded-full border items-center justify-center"
                style={{ backgroundColor: avatar === a ? color : 'rgba(0,0,0,0.05)', borderColor: avatar === a ? color : 'transparent' }}
                onPress={() => setAvatar(a)}
              >
                <Text style={{ fontSize: 24 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-8">
          <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-3">Your Name</Text>
          <TextInput
            className="font-sans-md text-xl border border-line-strong rounded-xl px-4 py-3.5 bg-surface text-ink"
            placeholder="Type your name..."
            placeholderTextColor={COLORS.muted}
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
        </View>

        <View className="mb-8">
          <Text className="font-sans-md text-2xs tracking-kicker uppercase text-muted mb-3">Pick a Theme Color</Text>
          <View className="flex-row gap-4">
            {ACCENT_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={[
                  { backgroundColor: c },
                  color === c ? { borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 } : {},
                ]}
                onPress={() => setColor(c)}
              >
                {color === c && <Feather name="check" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-1" />

        <TouchableOpacity
          className="py-4 rounded-2xl items-center mt-5"
          style={{ backgroundColor: name.trim() ? COLORS.ink : COLORS.muted }}
          onPress={handleComplete}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <Text className="font-sans-bold text-lg text-surface">Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
