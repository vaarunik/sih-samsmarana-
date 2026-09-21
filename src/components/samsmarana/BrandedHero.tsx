"use client";

// SAMSMARANA — Branded opening hero.
//
// The first thing visible: logo → brand name → headline → supporting
// text → CTAs → realistic visual. Staggered entrance (0.6–1.5s total).
// Balanced two-column on desktop (text left, visual right), stacked on
// mobile. Green/blue palette, large premium buttons.

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { Waves } from "./Waves";

const ease = [0.22, 1, 0.36, 1] as const;

export function BrandedHero({
  onGetStarted,
  onExplore,
}: {
  onGetStarted: () => void;
  onExplore: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-background to-teal-50/40">
      <div className="absolute inset-0 bg-aurora opacity-70" aria-hidden />
      <div className="absolute inset-x-0 bottom-0">
        <Waves className="h-40 w-full opacity-50" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-20">
        {/* ── Left: brand + headline + CTAs ── */}
        <div className="text-center lg:text-left">
          {/* Brand lockup */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center justify-center lg:justify-start"
          >
            <Logo size={48} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700"
          >
            Personalized cognitive engagement for older adults
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl"
          >
            Memories deserve to be nurtured.
          </motion.h1>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.35 }}
            className="mx-auto mt-5 max-w-xl text-lg text-pretty text-muted-foreground lg:mx-0"
          >
            Samsmarana creates personalized, culturally familiar activities that
            help older adults stay engaged, connected and curious.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Button
              size="lg"
              className="h-14 gap-2 rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground"
              onClick={onGetStarted}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 gap-2 rounded-2xl px-7 text-base font-semibold"
              onClick={onExplore}
            >
              Explore Samsmarana
            </Button>
          </motion.div>

          {/* trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease, delay: 0.7 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground lg:justify-start"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Voice-guided visual activities
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> 10 languages incl. NER
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Offline-first
            </span>
          </motion.div>
        </div>

        {/* ── Right: realistic hero visual ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-emerald-200/40 via-teal-200/30 to-sky-200/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-card shadow-lift">
            { }
            <img
              src="/images/hero/hero.png"
              alt="An elder's hands holding a tablet showing a family photograph, beside a brass lamp and a cup of tea"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent p-6 text-white">
              <p className="font-serif text-xl font-semibold drop-shadow">
                Familiar memories, gently nurtured
              </p>
              <p className="text-sm text-white/85 drop-shadow">
                A calm companion for everyday cognitive engagement.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
