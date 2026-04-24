import React from 'react';
import { render } from '@testing-library/react-native';
import { AppIntroScreen } from '../AppIntroScreen';
import { AppContext } from '../../AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('AppIntroScreen', () => {
  it('renders correctly', () => {
    const mockContext = { palette: { bg: '#fff', ink: '#000', surface: '#fff', lineStrong: '#ccc', muted: '#888' } };
    const { getByText } = render(
      <SafeAreaProvider>
        <AppContext.Provider value={mockContext}>
          <AppIntroScreen onComplete={() => {}} />
        </AppContext.Provider>
      </SafeAreaProvider>
    );
    expect(getByText('Share the load.')).toBeTruthy();
  });
});
