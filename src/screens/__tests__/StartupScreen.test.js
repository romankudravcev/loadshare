import React from 'react';
import { render } from '@testing-library/react-native';
import { StartupScreen } from '../StartupScreen';
import { AppContext } from '../../AppContext';

describe('StartupScreen', () => {
  it('renders correctly', () => {
    const mockContext = { palette: { bg: '#fff', ink: '#000' } };
    const { getByText } = render(
      <AppContext.Provider value={mockContext}>
        <StartupScreen onComplete={() => {}} />
      </AppContext.Provider>
    );
    expect(getByText('loadshare')).toBeTruthy();
  });
});
