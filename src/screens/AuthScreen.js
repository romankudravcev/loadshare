import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { Display, Icon } from '../components/primitives';

function AuthButton({ label, icon, primary, onPress, loading }) {
  const { palette } = useApp();
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={[
        styles.button,
        primary ? { backgroundColor: palette.ink } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.lineStrong }
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={primary ? palette.surface : palette.ink} size="small" />
      ) : (
        <>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={[
            styles.buttonText,
            { color: primary ? palette.surface : palette.ink }
          ]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function AuthScreen() {
  const { palette, setIsAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const [loadingType, setLoadingType] = useState(null);

  const handleMockLogin = (type) => {
    setLoadingType(type);
    setTimeout(() => {
      setIsAuthenticated(true);
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Display size={42} style={{ color: palette.ink, marginBottom: 8 }}>
          loadshare
        </Display>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Manage your household, seamlessly.
        </Text>
        
        <View style={styles.spacer} />
        
        <View style={styles.buttonContainer}>
          <AuthButton 
            label="Continue with Apple" 
            primary={true}
            onPress={() => handleMockLogin('apple')}
            loading={loadingType === 'apple'}
          />
          <AuthButton 
            label="Continue with Google" 
            primary={false}
            onPress={() => handleMockLogin('google')}
            loading={loadingType === 'google'}
          />
          <AuthButton 
            label="Continue with Email" 
            primary={false}
            onPress={() => handleMockLogin('email')}
            loading={loadingType === 'email'}
          />
        </View>

        <Text style={[styles.terms, { color: palette.muted }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  spacer: {
    height: 40,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  terms: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 'auto',
    paddingHorizontal: 20,
  }
});
