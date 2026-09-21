// SAMSMARANA — sync coordinator (client)
// Drains the IndexedDB pending-sync queue to the backend when the
// app is effectively online. Idempotent (uses syncId) so retries never
// duplicate records.

import { idbGetPending, idbMarkSynced } from "./idb";
import { useApp } from "./store";
import type { AttemptRecord } from "./types";

let syncing = false;

export async function syncPending(): Promise<{ ok: number; failed: number }> {
  if (syncing) return { ok: 0, failed: 0 };
  const { effectiveOnline, setSyncStatus, setPendingCount } = useApp.getState();
  if (!effectiveOnline()) {
    setSyncStatus("offline");
    return { ok: 0, failed: 0 };
  }

  const pending = await idbGetPending().catch(() => [] as AttemptRecord[]);
  if (pending.length === 0) {
    setSyncStatus("synced");
    setPendingCount(0);
    return { ok: 0, failed: 0 };
  }

  syncing = true;
  setSyncStatus("syncing");
  let ok = 0;
  let failed = 0;

  for (const a of pending) {
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      if (res.ok) {
        await idbMarkSynced(a.syncId);
        ok++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  syncing = false;
  const remaining = await idbGetPending().catch(() => [] as AttemptRecord[]);
  setPendingCount(remaining.length);
  setSyncStatus(remaining.length > 0 ? "pending" : "synced");
  return { ok, failed };
}

/** Record an attempt locally first, then attempt immediate sync. */
export async function recordAttempt(a: AttemptRecord): Promise<void> {
  const { effectiveOnline } = useApp.getState();
  const online = effectiveOnline();
  const rec: AttemptRecord = { ...a, syncState: online ? "synced" : "pending" };

  // store in zustand immediately for responsive UI
  useApp.getState().addAttempt(rec);

  // persist locally regardless (offline-first)
  const { idbPutAttempt } = await import("./idb");
  await idbPutAttempt(rec).catch(() => {});

  if (online) {
    // try server; if it fails, mark pending for later sync
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rec),
      });
      if (!res.ok) throw new Error("sync failed");
    } catch {
      await idbPutAttempt({ ...rec, syncState: "pending" }).catch(() => {});
      useApp.getState().setSyncStatus("pending");
    }
  } else {
    useApp.getState().setSyncStatus("offline");
  }
}
