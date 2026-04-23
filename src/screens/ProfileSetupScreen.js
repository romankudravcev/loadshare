import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Icon } from '../components/primitives';

const AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐙'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#FF8ED4'];

export function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { palette, setProfile } = useApp();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const handleComplete = () => {
    if (!name.trim()) return;
    setProfile({ name: name.trim(), avatar, color });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container, 
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }
        ]}
      >
        <Text style={[styles.title, { color: palette.ink }]}>Who are you?</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Set up your personal profile.</Text>

        {/* Avatar Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.muted }]}>Choose an Avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <TouchableOpacity 
                key={a}
                style={[
                  styles.avatarWrapper, 
                  avatar === a && { backgroundColor: color, borderColor: color }
                ]}
                onPress={() => setAvatar(a)}
              >
                <Text style={styles.avatarText}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.muted }]}>Your Name</Text>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: palette.surface, color: palette.ink, borderColor: palette.lineStrong }
            ]}
            placeholder="Type your name..."
            placeholderTextColor={palette.muted}
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.muted }]}>Pick a Theme Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  color === c && styles.colorCircleSelected,
                ]}
                onPress={() => setColor(c)}
              >
                {color === c && <Icon name="check" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: name.trim() ? palette.ink : palette.muted }
          ]}
          onPress={handleComplete}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitText, { color: palette.surface }]}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 42,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  avatarText: {
    fontSize: 24,
  },
  input: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
});
