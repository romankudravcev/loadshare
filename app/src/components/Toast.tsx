import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

export function Toast() {
  const { toastMessage } = useApp();
  const insets     = useSafeAreaInsets();
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toastMessage) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toastMessage]);

  if (!toastMessage && (opacity as unknown as { _value: number })._value === 0) return null;

  return (
    <Animated.View
      className="absolute self-center bg-ink px-4 py-3 rounded-lg z-[9999] shadow-sm"
      style={{ top: insets.top + 10, opacity, transform: [{ translateY }] }}
    >
      <Text className="font-sans-md text-md text-canvas">{toastMessage}</Text>
    </Animated.View>
  );
}
