import React, { createContext, useContext, useState } from 'react';
import { PALETTES, PERSONAS } from './tokens';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [paletteKey, setPaletteKey] = useState('warm');
  const [personaKey, setPersonaKey] = useState('flat');
  const [openTask, setOpenTask] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const palette = PALETTES[paletteKey];
  const persona = PERSONAS[personaKey];

  return (
    <AppContext.Provider value={{
      palette, paletteKey, setPaletteKey,
      persona, personaKey, setPersonaKey,
      openTask, setOpenTask,
      isAuthenticated, setIsAuthenticated,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
