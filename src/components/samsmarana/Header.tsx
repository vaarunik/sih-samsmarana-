"use client";

import { useState } from "react";
import { Menu, X, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { ConnectivityBar } from "./ConnectivityBar";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ViewKey } from "@/lib/types";

const LANDING_LINKS: { label: string; href: string }[] = [
  { label: "How it works", href: "#how" },
  { label: "Activities", href: "#activities" },
  { label: "AI Video", href: "#video" },
  { label: "Offline-first", href: "#offline" },
  { label: "Privacy & Security", href: "#privacy" },
  { label: "Validation", href: "#validation" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Healthcare", href: "#healthcare" },
];

export function Header() {
  const view = useApp((s) => s.view);
  const profile = useApp((s) => s.profile);
  const setView = useApp((s) => s.setView);
  const mode = useApp((s) => s.mode);
  const switchRole = useApp((s) => s.switchRole);
  const [open, setOpen] = useState(false);

  const go = (v: ViewKey) => {
    setView(v);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => setView(profile ? (mode === "caregiver" ? "caregiver" : "elder") : "landing")}
          className="flex items-center"
          aria-label="Samsmarana home"
        >
          <Logo size={36} />
        </button>

        {view === "landing" && (
          <nav className="hidden items-center gap-1 lg:flex">
            {LANDING_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {profile && view !== "landing" && view !== "onboarding" && (
            <div className="hidden items-center gap-1 sm:flex">
              <ModeTab active={mode === "elder"} onClick={() => go("elder")}>
                Elder
              </ModeTab>
              <ModeTab active={mode === "caregiver"} onClick={() => go("caregiver")}>
                Caregiver
              </ModeTab>
              <ModeTab active={mode === "family"} onClick={() => go("family")}>
                Family
              </ModeTab>
            </div>
          )}

          {profile && view !== "landing" && view !== "onboarding" && (
            <div className="hidden md:block">
              <ConnectivityBar />
            </div>
          )}

          {view === "landing" && (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              onClick={() => setView("onboarding")}
            >
              Get Started
            </Button>
          )}

          {profile && view !== "landing" && view !== "onboarding" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={switchRole}
              title="Switch between Elder and Caregiver without logging out"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                Switch to {mode === "elder" ? "Caregiver" : "Elder Mode"}
              </span>
              <span className="sm:hidden">Switch</span>
            </Button>
          )}

          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-3 lg:hidden">
          {view === "landing" ? (
            <div className="flex flex-col gap-1">
              {LANDING_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <ModeTab active={mode === "elder"} onClick={() => go("elder")} mobile>
                Elder Mode
              </ModeTab>
              <ModeTab active={mode === "caregiver"} onClick={() => go("caregiver")} mobile>
                Caregiver Mode
              </ModeTab>
              <ModeTab active={mode === "family"} onClick={() => go("family")} mobile>
                Family Engagement
              </ModeTab>
              <div className="mt-2">
                <ConnectivityBar />
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function ModeTab({
  children,
  active,
  onClick,
  mobile,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  mobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        mobile && "px-2 py-2 text-left",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
