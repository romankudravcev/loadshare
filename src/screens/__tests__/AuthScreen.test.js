import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthScreen } from '../AuthScreen';
import { AppContext } from '../../AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('AuthScreen', () => {
  it('renders correctly', () => {
    const mockContext = { palette: { bg: '#fff', ink: '#000', surface: '#fff', lineStrong: '#ccc' } };
    const { getByText } = render(
      <SafeAreaProvider>
        <AppContext.Provider value={mockContext}>
          <AuthScreen />
        </AppContext.Provider>
      </SafeAreaProvider>
    );
    expect(getByText('Continue with Email')).toBeTruthy();
  });
});
