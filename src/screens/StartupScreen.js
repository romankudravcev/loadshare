import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { useApp } from '../AppContext';
import { Display } from '../components/primitives';

export function StartupScreen({ onComplete }) {
  const { palette } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // 1. Enter animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 2. Pause, then exit animation
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, 1000);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ translateY: translateYAnim }, { scale: scaleAnim }] 
      }}>
        <Display size={56} style={{ color: palette.ink, textAlign: 'center' }}>loadshare</Display>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
