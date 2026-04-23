import React, { createContext, useContext, useState, useEffect } from 'react';
import { PALETTES, PERSONAS } from './tokens';
import { api } from './services/mockApi';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [paletteKey, setPaletteKey] = useState('warm');
  // personaKey is kept for preference, but we load actual persona state async
  const [personaKey, setPersonaKey] = useState('flat');
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [openTask, setOpenTask] = useState(null);

  const palette = PALETTES[paletteKey];

  useEffect(() => {
    const fetchPersona = async () => {
      setLoading(true);
      const data = await api.getPersona(personaKey);
      setPersona(data);
      setLoading(false);
    };
    fetchPersona();
  }, [personaKey]);

  const refreshPersona = async () => {
    const data = await api.getPersona(personaKey);
    setPersona(data);
  };

  return (
    <AppContext.Provider value={{
      palette, paletteKey, setPaletteKey,
      persona, personaKey, setPersonaKey,
      openTask, setOpenTask,
      loading, refreshPersona,
      api
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
