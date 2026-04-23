import React, { createContext, useContext, useState } from 'react';
import { PALETTES, PERSONAS } from './tokens';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [paletteKey, setPaletteKey] = useState('warm');
  const [personaKey, setPersonaKey] = useState('flat');
  const [openTask, setOpenTask] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const palette = PALETTES[paletteKey];
  const persona = PERSONAS[personaKey];

  return (
    <AppContext.Provider value={{
      palette, paletteKey, setPaletteKey,
      persona, personaKey, setPersonaKey,
      openTask, setOpenTask,
      activeTab, setActiveTab,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
