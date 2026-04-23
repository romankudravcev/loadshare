import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export default function App() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [data, setData] = useState(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Simulated data fetch
    setTimeout(() => {
      setData({ status: 'loaded' });
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ ...styles.card, opacity: fadeAnim }}>
        <Text style={styles.title}>Feature: feat/10-invite-option</Text>
        <Text style={styles.subtitle}>{data ? 'Data Loaded!' : 'Loading...'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Interact</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  card: { padding: 20, backgroundColor: 'white', borderRadius: 12, shadowOpacity: 0.1, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#007aff', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' }
});
