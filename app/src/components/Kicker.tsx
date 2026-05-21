import React from 'react';
import { Text, TextStyle } from 'react-native';

interface KickerProps {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}

export function Kicker({ children, color, style }: KickerProps) {
  return (
    <Text className="font-sans-md text-2xs tracking-kicker uppercase" style={[{ color }, style]}>
      {children}
    </Text>
  );
}

interface DisplayProps {
  children: React.ReactNode;
  size?: number;
  style?: TextStyle;
}

export function Display({ children, size = 34, style }: DisplayProps) {
  return (
    <Text style={[{
      fontFamily: 'InstrumentSerif_400Regular',
      fontSize: size, lineHeight: size * 1.08, letterSpacing: -0.5,
    }, style]}>
      {children}
    </Text>
  );
}
