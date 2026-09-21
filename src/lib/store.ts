// SAMSMARANA — client state (Zustand)
// Holds UI state + cached data. Heavy/offline data is persisted in
// IndexedDB (see idb.ts). The store coordinates idb + API calls.

import { create } from "zustand";
import type {
  AttemptRecord,
  FamilyMessageItem,
  Profile,
  ReminderItem,
  Role,
  ViewKey,
  VideoState,
  ActivityCategory,
} from "./types";

type Mode = "elder" | "caregiver" | "family";
type SyncStatus = "synced" | "syncing" | "pending" | "offline";

interface AppState {
  // routing
  view: ViewKey;
  mode: Mode;
  // session
  profile: Profile | null;
  loadingProfile: boolean;
  // connectivity
  online: boolean;
  simulateOffline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  // data
  attempts: AttemptRecord[];
  reminders: ReminderItem[];
  family: FamilyMessageItem[];
  videos: VideoState[];
  // current activity in progress
  activeActivityId: string | null;
  // actions
  setView: (v: ViewKey) => void;
  setMode: (m: Mode) => void;
  switchRole: () => void;
  setProfile: (p: Profile | null) => void;
  setLoadingProfile: (b: boolean) => void;
  setOnline: (b: boolean) => void;
  setSimulateOffline: (b: boolean) => void;
  setSyncStatus: (s: SyncStatus) => void;
  setPendingCount: (n: number) => void;
  setAttempts: (a: AttemptRecord[]) => void;
  addAttempt: (a: AttemptRecord) => void;
  setReminders: (r: ReminderItem[]) => void;
  upsertReminder: (r: ReminderItem) => void;
  removeReminder: (id: string) => void;
  setFamily: (f: FamilyMessageItem[]) => void;
  addFamily: (f: FamilyMessageItem) => void;
  setVideos: (v: VideoState[]) => void;
  upsertVideo: (v: VideoState) => void;
  setActiveActivity: (id: string | null) => void;
  reset: () => void;
  // derived helpers
  effectiveOnline: () => boolean;
  recommendedCategory: () => ActivityCategory;
}

export const useApp = create<AppState>((set, get) => ({
  view: "landing",
  mode: "elder",
  profile: null,
  loadingProfile: true,
  online: true,
  simulateOffline: false,
  syncStatus: "synced",
  pendingCount: 0,
  attempts: [],
  reminders: [],
  family: [],
  videos: [],
  activeActivityId: null,

  setView: (v) => set({ view: v }),
  setMode: (m) => set({ mode: m }),
  switchRole: () =>
    set((s) => {
      const newMode = s.mode === "elder" ? "caregiver" : "elder";
      return { mode: newMode, view: newMode };
    }),
  setProfile: (p) => set({ profile: p }),
  setLoadingProfile: (b) => set({ loadingProfile: b }),
  setOnline: (b) => set({ online: b }),
  setSimulateOffline: (b) =>
    set({
      simulateOffline: b,
      syncStatus: b ? "offline" : get().pendingCount > 0 ? "pending" : "synced",
    }),
  setSyncStatus: (s) => set({ syncStatus: s }),
  setPendingCount: (n) => set({ pendingCount: n }),
  setAttempts: (a) => set({ attempts: a }),
  addAttempt: (a) =>
    set((s) => {
      const attempts = [a, ...s.attempts];
      const pending = a.syncState === "pending";
      return {
        attempts,
        pendingCount: s.pendingCount + (pending ? 1 : 0),
        syncStatus: get().effectiveOnline()
          ? s.syncStatus
          : "offline",
      };
    }),
  setReminders: (r) => set({ reminders: r }),
  upsertReminder: (r) =>
    set((s) => {
      const exists = s.reminders.some((x) => x.id === r.id);
      return {
        reminders: exists
          ? s.reminders.map((x) => (x.id === r.id ? r : x))
          : [r, ...s.reminders],
      };
    }),
  removeReminder: (id) =>
    set((s) => ({ reminders: s.reminders.filter((x) => x.id !== id) })),
  setFamily: (f) => set({ family: f }),
  addFamily: (f) => set((s) => ({ family: [f, ...s.family] })),
  setVideos: (v) => set({ videos: v }),
  upsertVideo: (v) =>
    set((s) => {
      const exists = s.videos.some((x) => x.id === v.id);
      return {
        videos: exists ? s.videos.map((x) => (x.id === v.id ? v : x)) : [v, ...s.videos],
      };
    }),
  setActiveActivity: (id) => set({ activeActivityId: id }),
  reset: () =>
    set({
      view: "landing",
      mode: "elder",
      profile: null,
      attempts: [],
      reminders: [],
      family: [],
      videos: [],
      activeActivityId: null,
      loadingProfile: false,
    }),

  effectiveOnline: () => {
    const s = get();
    return s.online && !s.simulateOffline;
  },

  recommendedCategory: () => {
    const s = get();
    if (!s.attempts.length) return "recognition";
    const last = s.attempts[0];
    return last.category;
  },
}));
