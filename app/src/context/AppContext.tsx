import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Persona, Circle, Member, Task } from '../types';
import { PERSONAS } from '../constants/personas';
import { api as mockApi } from '../services/mockApi';
import { circles as circlesApi } from '../services/circles';
import { tasks as tasksApi, circleToPersona } from '../services/tasks';
import { profiles as profilesApi } from '../services/profiles';
import { joinRequests as joinReqApi } from '../services/joinRequests';
import { getSession, onAuthStateChange, signOut as authSignOut } from '../services/auth';

interface AppContextValue {
  persona:         Persona | null;
  personaKey:      string;
  setPersonaKey:   (key: string) => void;
  openTask:        Task | null;
  setOpenTask:     (task: Task | null) => void;
  session:         Session | null;
  isAuthenticated: boolean;
  profile:         User | null;
  signOut:         () => Promise<void>;
  activeTab:       string;
  setActiveTab:    (tab: string) => void;
  loading:         boolean;
  refreshPersona:  () => Promise<void>;
  activeCircle:    Circle | null;
  circleList:      Circle[];
  hasCircle:       boolean;
  currentMember:   Member | null;
  circles:         typeof circlesApi;
  tasks:           typeof tasksApi;
  profiles:        typeof profilesApi;
  joinRequests:    typeof joinReqApi;
  toastMessage:    string | null;
  showToast:       (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [personaKey, setPersonaKey] = useState('flat');
  const [persona, setPersona]       = useState<Persona | null>(null);
  const [loading, setLoading]       = useState(true);

  const [openTask, setOpenTask]   = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [session, setSession]               = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile]               = useState<User | null>(null);

  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [circleList, setCircleList]     = useState<Circle[]>([]);
  const [hasCircle, setHasCircle]       = useState(false);

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const c = await circlesApi.getDefault();
          setHasCircle(!!c);
          setCircleList(c ? [c] : []);
          if (c) {
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
        const c = await circlesApi.getDefault();
        setHasCircle(!!c);
        setCircleList(c ? [c] : []);
        if (c) {
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const signOut = async () => { await authSignOut(); };

  const currentMember: Member | null = isAuthenticated && persona && session
    ? (persona.members.find(m => m.id === session.user.id) ?? persona.members[0])
    : (persona?.members?.[0] ?? null);

  return (
    <AppContext.Provider value={{
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

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
