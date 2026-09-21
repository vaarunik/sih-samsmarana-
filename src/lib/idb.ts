// SAMSMARANA — offline-first persistence (IndexedDB)
// Stores attempts (with sync state), cached video blobs, and key-value
// cache (profile, reminders, family). Sync queue drains to the backend
// when connectivity returns (see sync.ts).

import type {
  AttemptRecord,
  FamilyMessageItem,
  Profile,
  ReminderItem,
} from "./types";

const DB_NAME = "samsmarana";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("attempts")) {
        const s = db.createObjectStore("attempts", { keyPath: "syncId" });
        s.createIndex("syncState", "syncState", { unique: false });
        s.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const req = fn(s);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

// ── Attempts ────────────────────────────────────────────────
export async function idbPutAttempt(a: AttemptRecord): Promise<void> {
  await tx("attempts", "readwrite", (s) => s.put(a));
}

export async function idbGetAttempts(): Promise<AttemptRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction("attempts", "readonly");
    const s = t.objectStore("attempts");
    const req = s.getAll();
    req.onsuccess = () => {
      const all = (req.result as AttemptRecord[]) ?? [];
      all.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetPending(): Promise<AttemptRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction("attempts", "readonly");
    const s = t.objectStore("attempts");
    const idx = s.index("syncState");
    const req = idx.getAll("pending");
    req.onsuccess = () => resolve((req.result as AttemptRecord[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbMarkSynced(syncId: string): Promise<void> {
  const db = await openDB();
  const t = db.transaction("attempts", "readwrite");
  const s = t.objectStore("attempts");
  const getReq = s.get(syncId);
  await new Promise<void>((resolve, reject) => {
    getReq.onsuccess = () => {
      const rec = getReq.result as AttemptRecord | undefined;
      if (rec) {
        rec.syncState = "synced";
        s.put(rec);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// ── Videos (cached blobs for offline replay) ────────────────
export interface CachedVideo {
  id: string;
  blob: Blob;
  url: string;
  prompt: string;
  category: string;
  createdAt: string;
}

export async function idbPutVideo(v: CachedVideo): Promise<void> {
  await tx("videos", "readwrite", (s) => s.put(v));
}

export async function idbGetVideo(id: string): Promise<CachedVideo | undefined> {
  return tx<CachedVideo | undefined>("videos", "readonly", (s) => s.get(id));
}

export async function idbAllVideos(): Promise<CachedVideo[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction("videos", "readonly");
    const req = t.objectStore("videos").getAll();
    req.onsuccess = () => resolve((req.result as CachedVideo[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

// ── Key-value cache (profile, reminders, family) ────────────
export async function idbSetKV(key: string, value: unknown): Promise<void> {
  await tx("kv", "readwrite", (s) => s.put({ key, value }));
}

export async function idbGetKV<T>(key: string): Promise<T | undefined> {
  const rec = await tx<{ key: string; value: T } | undefined>(
    "kv",
    "readonly",
    (s) => s.get(key)
  );
  return rec?.value;
}

export async function idbCacheProfile(p: Profile): Promise<void> {
  await idbSetKV("profile", p);
}
export async function idbGetCachedProfile(): Promise<Profile | undefined> {
  return idbGetKV<Profile>("profile");
}

export async function idbCacheReminders(r: ReminderItem[]): Promise<void> {
  await idbSetKV("reminders", r);
}
export async function idbGetCachedReminders(): Promise<ReminderItem[] | undefined> {
  return idbGetKV<ReminderItem[]>("reminders");
}

export async function idbCacheFamily(f: FamilyMessageItem[]): Promise<void> {
  await idbSetKV("family", f);
}
export async function idbGetCachedFamily(): Promise<FamilyMessageItem[] | undefined> {
  return idbGetKV<FamilyMessageItem[]>("family");
}
