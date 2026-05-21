import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export function FadeInView({ children, style, delay = 0 }: Props) {
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,       { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, translateYAnim, delay]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }, style]}>
      {children}
    </Animated.View>
  );
}
