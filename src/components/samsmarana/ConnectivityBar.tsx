"use client";

import { useEffect } from "react";
import { CloudOff, RefreshCw, Check, Cloud, WifiOff } from "lucide-react";
import { useApp } from "@/lib/store";
import { syncPending } from "@/lib/sync";
import { cn } from "@/lib/utils";

export function ConnectivityBar() {
  const online = useApp((s) => s.online);
  const simulateOffline = useApp((s) => s.simulateOffline);
  const syncStatus = useApp((s) => s.syncStatus);
  const pendingCount = useApp((s) => s.pendingCount);
  const setOnline = useApp((s) => s.setOnline);
  const setSimulateOffline = useApp((s) => s.setSimulateOffline);

  const effectiveOnline = online && !simulateOffline;

  // Listen to real browser connectivity.
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, [setOnline]);

  // When effectively online, try to drain the sync queue.
  useEffect(() => {
    if (effectiveOnline && pendingCount > 0) {
      const t = setTimeout(() => syncPending(), 800);
      return () => clearTimeout(t);
    }
  }, [effectiveOnline, pendingCount]);

  const label = !effectiveOnline
    ? "Offline"
    : syncStatus === "syncing"
      ? "Syncing…"
      : syncStatus === "pending"
        ? "Sync pending"
        : "Synced";

  const Icon = !effectiveOnline
    ? CloudOff
    : syncStatus === "syncing"
      ? RefreshCw
      : syncStatus === "pending"
        ? WifiOff
        : Check;

  const tone = !effectiveOnline
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : syncStatus === "syncing"
      ? "text-sky-700 bg-sky-50 border-sky-200"
      : syncStatus === "pending"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
          tone
        )}
        title={
          !effectiveOnline
            ? "You are offline. Activities still work and records will sync later."
            : syncStatus === "pending"
              ? "Sync pending. We'll retry when you're connected."
              : "All records are synced."
        }
      >
        <Icon
          className={cn("h-3.5 w-3.5", syncStatus === "syncing" && "animate-spin")}
        />
        {label}
        {pendingCount > 0 && effectiveOnline && (
          <span className="opacity-70">· {pendingCount}</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => setSimulateOffline(!simulateOffline)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
          simulateOffline
            ? "border-amber-300 bg-amber-100 text-amber-800"
            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
        )}
        title="Demo control: simulate being offline to test offline-first behaviour"
      >
        {simulateOffline ? <CloudOff className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
        {simulateOffline ? "Stop simulating" : "Simulate offline"}
      </button>
    </div>
  );
}
