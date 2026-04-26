import React, { createContext, useContext, useState, useEffect } from 'react';
import { PALETTES, PERSONAS } from './tokens';
import { api as mockApi } from './services/mockApi';
import { circles as circlesApi } from './services/circles';
import { tasks as tasksApi, circleToPersona } from './services/tasks';
import { profiles as profilesApi } from './services/profiles';
import { joinRequests as joinReqApi } from './services/joinRequests';
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

  const [session, setSession]         = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile]         = useState(null);

  const [activeCircle, setActiveCircle] = useState(null);
  const [circleList, setCircleList]     = useState([]);
  const [hasCircle, setHasCircle]       = useState(false);

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

  // ── Data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const list = await circlesApi.list();
          setCircleList(list);
          setHasCircle(list.length > 0);
          if (list.length > 0) {
            const c = list[0];
            const taskList = await tasksApi.listByCircle(c.id);
            setActiveCircle(c);
            setPersona(circleToPersona(c, taskList));
          } else {
            setActiveCircle(null);
            setPersona(null);
          }
        } catch (err) {
          console.error('Failed to load circle data:', err);
          setPersona(null);
        }
      } else {
        setCircleList([]);
        setHasCircle(false);
        setActiveCircle(null);
        const data = await mockApi.getPersona(personaKey);
        setPersona(data);
      }
      setLoading(false);
    };
    load();
  }, [isAuthenticated, personaKey]);

  const refreshPersona = async () => {
    if (isAuthenticated) {
      try {
        const list = await circlesApi.list();
        setCircleList(list);
        setHasCircle(list.length > 0);
        if (list.length > 0) {
          const c = list[0];
          const taskList = await tasksApi.listByCircle(c.id);
          setActiveCircle(c);
          setPersona(circleToPersona(c, taskList));
        } else {
          setActiveCircle(null);
          setPersona(null);
        }
      } catch (err) {
        console.error('refreshPersona error:', err);
      }
    } else {
      const data = await mockApi.getPersona(personaKey);
      setPersona(data);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const signOut = async () => {
    await authSignOut();
  };

  // The currently logged-in member within the active persona/circle
  const currentMember = isAuthenticated && persona && session
    ? (persona.members.find(m => m.id === session.user.id) ?? persona.members[0])
    : persona?.members?.[0] ?? null;

  return (
    <AppContext.Provider value={{
      palette, paletteKey, setPaletteKey,
      persona, personaKey, setPersonaKey,
      openTask, setOpenTask,
      session, isAuthenticated, profile,
      signOut,
      activeTab, setActiveTab,
      loading, refreshPersona,
      activeCircle, circleList, hasCircle,
      currentMember,
      circles:      circlesApi,
      tasks:        tasksApi,
      profiles:     profilesApi,
      joinRequests: joinReqApi,
      toastMessage, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
