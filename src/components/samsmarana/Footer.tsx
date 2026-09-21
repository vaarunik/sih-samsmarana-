"use client";

import { Logo } from "./Logo";

export function Footer({ onNavigate }: { onNavigate?: (id: string) => void }) {
  return (
    <footer className="mt-auto border-t border-border/60 bg-gradient-to-b from-background to-emerald-50/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size={36} />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              A calm, premium, human-centered platform that helps older adults
              stay engaged through familiar experiences — with meaningful,
              non-diagnostic visibility for caregivers and warm family
              connection.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["how", "How it works"],
                ["activities", "Cognitive activities"],
                ["video", "AI cognitive video"],
                ["offline", "Offline-first"],
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate?.(id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["privacy", "Privacy & Security"],
                ["validation", "Proposed Validation"],
                ["roadmap", "Roadmap"],
                ["healthcare", "Healthcare / Institution"],
              ].map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate?.(id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Samsmarana. Memory &amp; Cognitive Engagement.</p>
          <p>
            Non-diagnostic. For engagement and wellbeing support only. Built for
            SIH.
          </p>
        </div>
      </div>
    </footer>
  );
}
