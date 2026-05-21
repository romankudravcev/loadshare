import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Share,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import {
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SecureStore from "expo-secure-store";

import { AppProvider, useApp } from "./src/context/AppContext";
import { COLORS } from "./src/colors";
import { ProfileSetupScreen } from "./src/screens/ProfileSetupScreen";
import { AppIntroScreen } from "./src/screens/AppIntroScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { CreateScreen } from "./src/screens/CreateScreen";
import { InboxScreen } from "./src/screens/InboxScreen";
import { StartupScreen } from "./src/screens/StartupScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { CircleOnboardingScreen } from "./src/screens/CircleOnboardingScreen";
import { TaskSheet } from "./src/components/TaskSheet";
import { Feather } from "@expo/vector-icons";
import { Avatar } from "./src/components/Avatar";
import { Toast } from "./src/components/Toast";
import type { JoinRequest } from "./src/types";

interface TabBarProps {
  active: string;
  onChange: (tab: string) => void;
}

function FloatingTabBar({ active, onChange }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "create", label: "Create", icon: "plus" },
    { id: "inbox", label: "Inbox", icon: "inbox" },
  ];
  return (
    <View
      className="absolute left-0 right-0 bottom-0 px-3.5 pt-2"
      style={{ paddingBottom: insets.bottom + 6 }}
      pointerEvents="box-none"
    >
      <View
        className="flex-row gap-1.5 px-3 py-2.5 rounded-[28px] border-half border-line"
        style={{
          backgroundColor: "rgba(251,247,242,0.9)",
          shadowColor: "#000",
          shadowOpacity: 0.09,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 5 },
          elevation: 10,
        }}
      >
        {tabs.map((tab) => {
          const isFocused = active === tab.id;
          const isCreate = tab.id === "create";
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.75}
              className="flex-1 items-center gap-0.5 py-1"
            >
              {isCreate ? (
                <View
                  className="w-10 h-10 rounded-full bg-ink items-center justify-center -mt-1"
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 5,
                  }}
                >
                  <Feather name="plus" size={20} color={COLORS.surface} />
                </View>
              ) : (
                <Feather
                  name={tab.icon as any}
                  size={22}
                  color={isFocused ? COLORS.ink : COLORS.muted}
                />
              )}
              <Text
                className="font-sans-md text-2xs"
                style={{
                  letterSpacing: 0.2,
                  color: isFocused && !isCreate ? COLORS.ink : COLORS.muted,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function PendingRequests({ circleId }: { circleId: string }) {
  const { joinRequests } = useApp();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    joinRequests
      .listPending(circleId)
      .then(setRequests)
      .catch(() => {});
  }, [circleId]);

  async function handleAccept(req: JoinRequest) {
    setBusy(req.id);
    try {
      await joinRequests.accept(req.id, req.circle_id, req.requester_id);
      setRequests((r) => r.filter((x) => x.id !== req.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(req: JoinRequest) {
    setBusy(req.id);
    try {
      await joinRequests.reject(req.id);
      setRequests((r) => r.filter((x) => x.id !== req.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <View className="mt-1">
      <Text className="font-sans-md text-2xs tracking-kicker-lg uppercase text-muted mb-2.5">
        Join Requests
      </Text>
      {requests.map((req) => (
        <View
          key={req.id}
          className="flex-row items-center gap-2.5 rounded-xl border-half border-line-strong bg-surface-alt p-3 mb-2"
        >
          {req.requester && (
            <Avatar
              member={{
                id: req.requester_id,
                name: req.requester.name ?? "",
                short: (req.requester.name ?? "?")[0],
                hue: req.requester.hue ?? 200,
              }}
              size={28}
            />
          )}
          <Text className="flex-1 font-sans-md text-md text-ink">
            {req.requester?.name ?? "Unknown"}
          </Text>
          {busy === req.id ? (
            <ActivityIndicator size="small" color={COLORS.muted} />
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleAccept(req)}
                className="px-3.5 py-2 rounded-2xl bg-ink"
              >
                <Text className="font-sans-md text-sm text-surface">
                  Accept
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReject(req)}
                className="px-3.5 py-2 rounded-2xl border-half border-line-strong"
              >
                <Text className="font-sans-md text-sm text-muted">Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function SettingsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { personaKey, setPersonaKey, isAuthenticated, activeCircle, session } =
    useApp();
  const insets = useSafeAreaInsets();
  const personas = [
    { key: "couple", label: "Couple · Mira & Theo" },
    { key: "family", label: "Family · Okafors" },
    { key: "flat", label: "Flat · Cedar St." },
  ];
  const isOwner = activeCircle && session?.user?.id === activeCircle.owner_id;

  function shareCircleId() {
    if (!activeCircle) return;
    Share.share({
      message: `Join my LoadShare circle!\nCircle ID: ${activeCircle.id}`,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/30">
        <TouchableOpacity
          className="absolute inset-0"
          onPress={onClose}
          activeOpacity={1}
        />
        <View
          className="rounded-t-[22px] bg-surface p-5"
          style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        >
          <View className="w-9 h-1 rounded-full bg-line-strong self-center mb-5" />
          <Text className="font-serif text-3xl text-ink mb-5">Settings</Text>

          {!isAuthenticated && (
            <>
              <Text className="font-sans-md text-2xs tracking-kicker-lg uppercase text-muted mb-2.5">
                Demo household
              </Text>
              <View className="gap-1.5 mb-5">
                {personas.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setPersonaKey(p.key)}
                    className={`px-4 py-3 rounded-xl border-half ${p.key === personaKey ? "bg-ink border-ink" : "border-line-strong"}`}
                  >
                    <Text
                      className={`font-sans-md text-md ${p.key === personaKey ? "text-surface" : "text-ink"}`}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {isAuthenticated && activeCircle && (
            <>
              <Text className="font-sans-md text-2xs tracking-kicker-lg uppercase text-muted mb-2.5">
                Your circle
              </Text>
              <TouchableOpacity
                onPress={shareCircleId}
                activeOpacity={0.7}
                className="rounded-xl border-half border-line-strong bg-surface-alt p-3.5 mb-4"
              >
                <Text
                  className="font-sans-md text-2xs text-muted mb-1"
                  style={{ letterSpacing: 0.8 }}
                >
                  Circle ID · tap to share
                </Text>
                <Text
                  className="font-sans text-sm text-ink-soft"
                  numberOfLines={1}
                >
                  {activeCircle.id}
                </Text>
              </TouchableOpacity>
              {isOwner && <PendingRequests circleId={activeCircle.id} />}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function AppShell() {
  const { persona, openTask, setOpenTask, activeTab, setActiveTab, loading } =
    useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading || !persona) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator color={COLORS.muted} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      {activeTab === "dashboard" && <DashboardScreen />}
      {activeTab === "create" && <CreateScreen />}
      {activeTab === "inbox" && <InboxScreen />}

      <FloatingTabBar active={activeTab} onChange={setActiveTab} />

      <TaskSheet
        task={openTask}
        persona={persona}
        onClose={() => setOpenTask(null)}
      />
      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <Toast />

      <TouchableOpacity
        onPress={() => setSettingsOpen(true)}
        className="absolute right-4 bg-surface border-half border-line rounded-full w-9 h-9 items-center justify-center"
        style={{
          bottom: 110,
          shadowColor: "#000",
          shadowOpacity: 0.07,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <Feather name="more-horizontal" size={18} color={COLORS.muted} />
      </TouchableOpacity>
    </View>
  );
}

function AppRouter() {
  const { isAuthenticated, profile, loading, hasCircle } = useApp();
  const [startupDone, setStartupDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [introChecked, setIntroChecked] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("@intro_done")
      .then((v) => {
        if (v === "true") setIntroDone(true);
      })
      .catch(() => {})
      .finally(() => setIntroChecked(true));
  }, []);

  const handleIntroComplete = async () => {
    await SecureStore.setItemAsync("@intro_done", "true").catch(() => {});
    setIntroDone(true);
  };

  if (!startupDone || !introChecked)
    return <StartupScreen onComplete={() => setStartupDone(true)} />;
  if (!introDone) return <AppIntroScreen onComplete={handleIntroComplete} />;
  if (!isAuthenticated) return <AuthScreen />;
  if (!profile) return <ProfileSetupScreen />;
  if (loading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  if (!hasCircle) return <CircleOnboardingScreen />;
  return <AppShell />;
}

export default function Root() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    DMSans_400Regular,
    DMSans_400Regular_Italic,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </SafeAreaProvider>
  );
}
