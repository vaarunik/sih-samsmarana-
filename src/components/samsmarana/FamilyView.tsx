"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Mic,
  Image as ImageIcon,
  Gift,
  Heart,
  StickyNote,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackButton } from "./BackButton";
import { FadeIn } from "./motion";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import type { FamilyMessageItem } from "@/lib/types";

const TYPE_META: Record<
  FamilyMessageItem["type"],
  { label: string; icon: typeof MessageSquare; tone: string }
> = {
  text: { label: "Message", icon: MessageSquare, tone: "bg-emerald-50 text-emerald-700" },
  voice: { label: "Voice message", icon: Mic, tone: "bg-teal-50 text-teal-700" },
  photo: { label: "Photo", icon: ImageIcon, tone: "bg-sky-50 text-sky-700" },
  clip: { label: "Short clip", icon: ImageIcon, tone: "bg-sky-50 text-sky-700" },
  occasion: { label: "Occasion", icon: Gift, tone: "bg-amber-50 text-amber-700" },
  note: { label: "Family note", icon: StickyNote, tone: "bg-emerald-50 text-emerald-700" },
};

export function FamilyView() {
  const profile = useApp((s) => s.profile);
  const family = useApp((s) => s.family);
  const setFamily = useApp((s) => s.setFamily);
  const addFamily = useApp((s) => s.addFamily);
  const setView = useApp((s) => s.setView);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ type: "text" as FamilyMessageItem["type"], fromName: "", content: "" });

  useEffect(() => {
    fetch("/api/family", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setFamily(d.messages ?? []))
      .catch(() => {});
  }, [setFamily]);

  async function send() {
    if (!form.content.trim()) return;
    const res = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, fromName: form.fromName || profile?.caregiverName || "Family" }),
    });
    const json = await res.json();
    if (json.message) {
      addFamily(json.message);
      setForm({ type: "text", fromName: form.fromName, content: "" });
      setComposing(false);
      toast.success("Sent to family.");
    }
  }

  const occasions = family.filter((f) => f.type === "occasion");
  const memories = family.filter((f) => f.type === "photo" || f.type === "clip" || f.type === "note");
  const messages = family.filter((f) => f.type === "text" || f.type === "voice");

  return (
    <main className="flex-1 bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <BackButton label="Back" onClick={() => setView(profile ? "caregiver" : "landing")} />
        <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Family Engagement</h1>
            <p className="text-sm text-muted-foreground">
              Warm moments for {profile?.name} — separate from caregiver analytics.
            </p>
          </div>
          <Button className="gap-1.5 bg-primary text-primary-foreground" onClick={() => setComposing((c) => !c)}>
            <Send className="h-4 w-4" /> Share a moment
          </Button>
        </div>

        {composing && (
          <FadeIn>
            <Card className="mb-6 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>From</Label>
                  <Input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as FamilyMessageItem["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(TYPE_META) as FamilyMessageItem["type"][]).map((t) => (
                        <SelectItem key={t} value={t}>{TYPE_META[t].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>&nbsp;</Label>
                  <Button className="w-full bg-primary text-primary-foreground" onClick={send}>Send</Button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Label>Message</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write something warm…"
                  rows={3}
                />
              </div>
            </Card>
          </FadeIn>
        )}

        {family.length === 0 ? (
          <Card className="p-10 text-center">
            <Heart className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-3 text-muted-foreground">No family moments yet. Share the first one.</p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Section title="Messages from family" icon={MessageSquare}>
                <div className="space-y-2">
                  {messages.map((m) => <MessageCard key={m.id} m={m} />)}
                  {messages.length === 0 && <Empty text="No messages yet." />}
                </div>
              </Section>

              <Section title="Shared memories" icon={ImageIcon}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {memories.map((m) => <MemoryCard key={m.id} m={m} />)}
                  {memories.length === 0 && <Empty text="No shared memories yet." />}
                </div>
              </Section>
            </div>

            <div className="space-y-6">
              <Section title="Upcoming occasions" icon={Gift}>
                <div className="space-y-2">
                  {occasions.map((m) => <MessageCard key={m.id} m={m} />)}
                  {occasions.length === 0 && <Empty text="No upcoming occasions." />}
                </div>
              </Section>

              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <Heart className="h-6 w-6 text-emerald-700" />
                <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">Family stays connected</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Messages, voice notes, photos and occasion wishes keep {profile?.name} close to family —
                  without exposing caregiver performance data.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof MessageSquare;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function MessageCard({ m }: { m: FamilyMessageItem }) {
  const meta = TYPE_META[m.type];
  const Icon = meta.icon;
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground">{m.fromName}</span>
          <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="mt-0.5 text-sm text-foreground">{m.content}</p>
        {m.caption && <p className="mt-1 text-xs text-muted-foreground">{m.caption}</p>}
      </div>
    </Card>
  );
}

function MemoryCard({ m }: { m: FamilyMessageItem }) {
  const meta = TYPE_META[m.type];
  const Icon = meta.icon;
  return (
    <Card className="overflow-hidden">
      <div className={`flex h-24 items-center justify-center ${meta.tone}`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">{m.fromName}</span>
          <Badge variant="secondary" className="text-[10px]">{meta.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-foreground">{m.content}</p>
        {m.caption && <p className="mt-0.5 text-xs text-muted-foreground">{m.caption}</p>}
      </div>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">{text}</p>;
}
