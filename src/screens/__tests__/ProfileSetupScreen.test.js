import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileSetupScreen } from '../ProfileSetupScreen';
import { AppContext } from '../../AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('ProfileSetupScreen', () => {
  it('renders correctly', () => {
    const mockContext = { palette: { bg: '#fff', ink: '#000', surface: '#fff', lineStrong: '#ccc', muted: '#888' }, setProfile: jest.fn() };
    const { getByText } = render(
      <SafeAreaProvider>
        <AppContext.Provider value={mockContext}>
          <ProfileSetupScreen />
        </AppContext.Provider>
      </SafeAreaProvider>
    );
    expect(getByText('Who are you?')).toBeTruthy();
  });
});
