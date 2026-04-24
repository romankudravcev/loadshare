import React, { createContext, useContext, useState, useEffect } from 'react';
import { PALETTES, PERSONAS } from './tokens';
import { api } from './services/mockApi';
import { getSession, onAuthStateChange, signOut as authSignOut } from './services/auth';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [paletteKey, setPaletteKey] = useState('warm');
  const [personaKey, setPersonaKey] = useState('flat');
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openTask, setOpenTask] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);

  // Auth state — driven by Supabase session
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);

  const palette = PALETTES[paletteKey];

  // ── Auth bootstrap ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Restore existing session on startup
    getSession().then(s => {
      setSession(s);
      setIsAuthenticated(!!s);
      if (s?.user) setProfile(s.user);
    });

    // Keep session in sync with Supabase auth state changes
    const unsubscribe = onAuthStateChange(s => {
      setSession(s);
      setIsAuthenticated(!!s);
      setProfile(s?.user ?? null);
    });

    return unsubscribe;
  }, []);

  // ── Persona data ────────────────────────────────────────────────────────────
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

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const signOut = async () => {
    await authSignOut();
    // onAuthStateChange will clear session/profile automatically
  };

  return (
    <AppContext.Provider value={{
      palette, paletteKey, setPaletteKey,
      persona, personaKey, setPersonaKey,
      openTask, setOpenTask,
      session, isAuthenticated, profile,
      signOut,
      activeTab, setActiveTab,
      loading, refreshPersona,
      api,
      toastMessage, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
