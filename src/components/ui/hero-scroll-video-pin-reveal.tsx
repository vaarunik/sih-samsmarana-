"use client";

// SAMSMARANA — Hero scroll-reveal (adapted from 21st.dev pattern).
//
// PERFORMANCE ARCHITECTURE (no more scroll jank):
//   - GSAP ScrollTrigger + NATIVE browser scrolling only.
//   - Lenis REMOVED — it fought native scroll and caused stutter.
//   - Single timeline per section, proper cleanup on unmount.
//   - Only GPU-friendly properties animated (transform, opacity, clip-path).
//   - will-change scoped to animated elements only.
//   - prefers-reduced-motion → no pin/scrub, content shown immediately.
//
// Visual concept preserved: kinetic word reveal + staggered clip-path
// tag badges + pinned clip-path circle image reveal.

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface TagItem {
  id?: string;
  text: string;
  background: string;
  color?: string;
}

export interface HeroScrollRevealProps {
  topText?: React.ReactNode;
  headingText?: React.ReactNode;
  tags?: TagItem[];
  subText?: string;
  imageSrc?: string;
  imageAlt?: string;
  bottomText?: React.ReactNode;
  className?: string;
  cta?: React.ReactNode;
}

const DEFAULT_TAGS: TagItem[] = [
  { text: "Personalized", background: "oklch(0.46 0.09 162)", color: "#ffffff" },
  { text: "Culturally familiar", background: "oklch(0.60 0.07 190)", color: "#ffffff" },
  { text: "Offline-first", background: "oklch(0.93 0.03 165)", color: "#1b3a2a" },
  { text: "Elder-friendly", background: "oklch(0.34 0.05 240)", color: "#ffffff" },
];

export const HeroScrollReveal: React.FC<HeroScrollRevealProps> = ({
  topText = (
    <>
      A little memory.
      <br />A little connection.
    </>
  ),
  headingText = (
    <>
      Memories deserve <br /> to be nurtured.
    </>
  ),
  tags = DEFAULT_TAGS,
  subText = "Samsmarana creates personalized, culturally familiar activities that help older adults stay engaged, connected and curious.",
  imageSrc = "/images/hero/hero.png",
  imageAlt = "An elder's hands holding a tablet showing a family photograph, beside a brass lamp and a cup of tea",
  bottomText = (
    <>
      Where every scroll feels
      <br />
      intentional
    </>
  ),
  className = "",
  cta,
}) => {
  const benefitRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      if (imageBoxRef.current) {
        imageBoxRef.current.style.clipPath = "circle(150% at 50% 50%)";
      }
      if (paraRef.current) paraRef.current.style.opacity = "1";
      tagRefs.current.forEach((t) => {
        if (t) {
          t.style.opacity = "1";
          t.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        }
      });
      return;
    }

    // ── Word-split kinetic reveal (manual, no SplitText plugin) ──
    const words: HTMLElement[] = [];
    if (paraRef.current) {
      const text = paraRef.current.textContent ?? "";
      paraRef.current.textContent = "";
      text.split(/(\s+)/).forEach((w) => {
        if (w.trim() === "") {
          paraRef.current!.appendChild(document.createTextNode(w));
          return;
        }
        const span = document.createElement("span");
        span.textContent = w;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity";
        span.className = "reveal-word";
        paraRef.current!.appendChild(span);
        words.push(span);
      });
    }

    const ctx = gsap.context(() => {
      if (words.length) {
        gsap.set(words, { opacity: 0, rotate: 6, yPercent: 30 });
      }

      // ── Reveal timeline (headline + tags) ──
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: benefitRef.current,
          start: "top 70%",
          end: "top -10%",
          scrub: 1.5,
        },
      });

      if (words.length) {
        revealTl.to(words, {
          stagger: 0.04,
          opacity: 1,
          rotate: 0,
          yPercent: 0,
          ease: "power1.inOut",
        });
      }

      tagRefs.current.forEach((tagEl) => {
        if (tagEl) {
          revealTl.to(
            tagEl,
            {
              duration: 1,
              opacity: 1,
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              ease: "circ.out",
            },
            ">-0.4"
          );
        }
      });

      // ── Responsive clip-path circle reveal (native scroll, no Lenis) ──
      const mm = gsap.matchMedia();
      const setup = (startRadius: string, end: string) => {
        gsap.set(imageBoxRef.current, { clipPath: `circle(${startRadius} at 50% 50%)` });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end,
            scrub: 1.3,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
        tl.fromTo(
          imageBoxRef.current,
          { clipPath: `circle(${startRadius} at 50% 50%)` },
          { clipPath: "circle(150% at 50% 50%)", ease: "none" }
        );
      };

      mm.add("(max-width: 639.9px)", () => setup("18%", "+=1500"));
      mm.add("(min-width: 640px) and (max-width: 1023.9px)", () => setup("14%", "+=2000"));
      mm.add("(min-width: 1024px)", () => setup("10%", "+=2200"));
    });

    return () => {
      ctx.revert(); // reverts word split + kills all timelines/triggers in context
    };
  }, []);

  return (
    <div
      className={`w-full bg-gradient-to-b from-emerald-50 via-background to-teal-50 text-foreground font-sans overflow-x-hidden ${className}`}
    >
      {/* ── Section 1: Intro text ──────────────────────────────────── */}
      <section className="flex min-h-[70vh] w-full items-center justify-center px-4 py-12 text-center sm:px-8">
        <div className="max-w-3xl">
          <p className="text-[clamp(1.6rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-foreground">
            {topText}
          </p>
          {cta && <div className="mt-8 flex flex-wrap justify-center gap-3">{cta}</div>}
        </div>
      </section>

      {/* ── Section 2: Benefit & headline + pinned image reveal ────── */}
      <section ref={benefitRef} className="relative w-full pb-16 md:pb-20">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 md:py-24">
          <div className="mb-8 w-full sm:mb-12 md:mb-14">
            <p
              ref={paraRef}
              className="overflow-visible text-[clamp(1.8rem,4.5vw,4rem)] font-extrabold leading-tight tracking-tight text-foreground"
            >
              {headingText}
            </p>
          </div>

          <div className="mx-auto my-4 mb-8 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-4 sm:mb-14">
            {tags.map((tag, idx) => (
              <div
                key={tag.id || `tag-${idx}`}
                ref={(el) => {
                  tagRefs.current[idx] = el;
                }}
                className="will-change-[clip-path,opacity] rounded-full px-5 py-2.5 text-[clamp(0.85rem,1.6vw,1.25rem)] font-semibold tracking-tight opacity-0 shadow-soft sm:px-7 sm:py-3.5"
                style={{
                  backgroundColor: tag.background,
                  color: tag.color || "#ffffff",
                  clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
                }}
              >
                {tag.text}
              </div>
            ))}
          </div>

          {subText && (
            <p className="mx-auto mt-2 max-w-xl px-4 text-[clamp(0.95rem,1.4vw,1.2rem)] text-muted-foreground">
              {subText}
            </p>
          )}
        </div>

        {/* ── Pinned image reveal ──────────────────────────────────── */}
        <div className="relative w-full">
          <div
            ref={wrapperRef}
            className="relative flex h-screen w-full items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100" />
            <div
              ref={imageBoxRef}
              className="relative flex h-full w-full items-center justify-center overflow-hidden will-change-[clip-path]"
            >
              { }
              <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Outro text ──────────────────────────────────── */}
      <section className="flex min-h-[50vh] w-full items-center justify-center px-4 py-12 text-center sm:px-8">
        <p className="text-[clamp(1.6rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-foreground">
          {bottomText}
        </p>
      </section>
    </div>
  );
};

export default HeroScrollReveal;
