import React, { createContext, useContext, useState, useEffect } from 'react';
import { PALETTES, PERSONAS } from './tokens';
import { api as mockApi } from './services/mockApi';
import { backendApi } from './services/api';
import { getSession, onAuthStateChange, signOut as authSignOut } from './services/auth';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [paletteKey, setPaletteKey]   = useState('warm');
  const [personaKey, setPersonaKey]   = useState('flat');
  const [persona, setPersona]         = useState(null);
  const [loading, setLoading]         = useState(true);

  const [openTask, setOpenTask]       = useState(null);
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);

  // Auth — driven by Supabase session
  const [session, setSession]         = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile]         = useState(null);

  const palette = PALETTES[paletteKey];

  // ── Auth bootstrap ──────────────────────────────────────────────────────────
  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setIsAuthenticated(!!s);
      if (s?.user) setProfile(s.user);
    });

    return onAuthStateChange(s => {
      setSession(s);
      setIsAuthenticated(!!s);
      setProfile(s?.user ?? null);
    });
  }, []);

  // ── Persona / household data ────────────────────────────────────────────────
  // Uses the mock API for local demo data while backend integration is in progress.
  // Swap mockApi for backendApi once your circle/task endpoints are wired.
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await mockApi.getPersona(personaKey);
      setPersona(data);
      setLoading(false);
    };
    load();
  }, [personaKey]);

  const refreshPersona = async () => {
    const data = await mockApi.getPersona(personaKey);
    setPersona(data);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const signOut = async () => {
    await authSignOut();
    // onAuthStateChange clears session/profile automatically
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
      api: mockApi,
      backendApi,
      toastMessage, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
