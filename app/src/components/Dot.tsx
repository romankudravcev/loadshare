import React from 'react';
import { View } from 'react-native';

export function Dot({ color }: { color: string }) {
  return (
    <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color, alignSelf: 'center' }} />
  );
}
