"use client";

// Motion-primitives-style helpers (subtle, calm, accessible).
// Uses whileInView for scroll-triggered reveals. A safety fallback
// ensures content is never stuck invisible (e.g. in screenshot tools
// where IntersectionObserver may not fire).

import { motion, useInView, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [safe, setSafe] = useState(false);
  // Safety: if not in view after 2s, show anyway
  useEffect(() => {
    if (!inView) {
      const t = setTimeout(() => setSafe(true), 2000);
      return () => clearTimeout(t);
    }
  }, [inView]);
  const show = inView || safe;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [safe, setSafe] = useState(false);
  useEffect(() => {
    if (!inView) {
      const t = setTimeout(() => setSafe(true), 2000);
      return () => clearTimeout(t);
    }
  }, [inView]);
  const show = inView || safe;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={show ? "show" : "hidden"}
    >
      {Array.isArray(children)
        ? children.map((c, i) => (
            <motion.div key={i} variants={item}>
              {c}
            </motion.div>
          ))
        : <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  );
}

export function TextEffect({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: delay + i * 0.06 }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease }}
    >
      {children}
    </motion.div>
  );
}
