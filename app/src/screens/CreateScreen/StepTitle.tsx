import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { COLORS } from '../../colors';

type Props = {
  title: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
};

export function StepTitle({ title, onChange, onSubmit }: Props) {
  return (
    <View className="flex-1 px-5 pt-8">
      <Text className="font-serif text-5xl text-ink mb-6" style={{ lineHeight: 40, letterSpacing: -0.5 }}>
        What needs doing?
      </Text>
      <TextInput
        autoFocus
        value={title}
        onChangeText={onChange}
        placeholder="Name this task…"
        placeholderTextColor={COLORS.muted}
        multiline
        className="font-serif text-3xl text-ink"
        style={{ lineHeight: 34, letterSpacing: -0.3 }}
        blurOnSubmit
        onSubmitEditing={title.trim() ? onSubmit : undefined}
      />
    </View>
  );
}
