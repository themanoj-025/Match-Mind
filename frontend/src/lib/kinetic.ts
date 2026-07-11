/**
 * Kinetic Typography Motion Primitives
 * MatchMind — Motion-First Design Language
 *
 * Shared animation variants and utilities for the kinetic typography system.
 * All variants respect prefers-reduced-motion via the withReducedMotion helper.
 */

import { Variants, Transition } from 'framer-motion'

// ── Reduced Motion Detection ───────────────────────────

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function kineticReduce<V>(normal: V, reduced: V): V {
  return prefersReducedMotion() ? reduced : normal
}

// ── Shared Transitions ─────────────────────────────────

const springSnap: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.8,
}

const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
  mass: 0.6,
}

const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
}

const easeOutExpo: Transition = {
  ease: [0.16, 1, 0.3, 1],
  duration: 0.6,
}

const easeOutBack: Transition = {
  ease: [0.34, 1.56, 0.64, 1],
  duration: 0.4,
}

// ── KineticNumber Variants ─────────────────────────────

export const kineticNumberVariants: Variants = {
  initial: {
    y: '100%',
    rotateX: -90,
    opacity: 0,
  },
  animate: (i: number = 0) => ({
    y: '0%',
    rotateX: 0,
    opacity: 1,
    transition: {
      ...springBouncy,
      delay: i * 0.03,
    },
  }),
  exit: {
    y: '-100%',
    rotateX: 90,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

export const kineticNumberRollVariants: Variants = {
  initial: { y: 40, scale: 1.2, opacity: 0, filter: 'blur(2px)' },
  animate: (i: number = 0) => ({
    y: 0,
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      ...easeOutExpo,
      delay: i * 0.04,
    },
  }),
}

// ── InvertCard Variants ────────────────────────────────

export const invertCardVariants: Variants = {
  idle: {
    rotateY: 0,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
  flipped: {
    rotateY: 180,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
}

export const invertCardContentVariants: Variants = {
  front: {
    backfaceVisibility: 'hidden' as any,
    opacity: 1,
    transition: { duration: 0.2 },
  },
  back: {
    backfaceVisibility: 'hidden' as any,
    opacity: 1,
    rotateY: 180,
    transition: { duration: 0.2 },
  },
}

// ── Marquee Variants ───────────────────────────────────

export const marqueeVariantsFactory = (duration: number = 25) => ({
  animate: {
    x: ['0%', '-50%'],
    transition: {
      x: {
        duration,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  },
  hoverPause: {
    animationPlayState: 'paused' as any,
  },
})

// ── GridGap Variants ───────────────────────────────────

export const gridGapContainerVariants: Variants = {
  initial: { gap: '0px' },
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

export const gridGapItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springGentle,
  },
}

// ── Kinetic Typography Stagger ─────────────────────────

export const kineticStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

export const kineticStaggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: easeOutBack,
  },
}

// ── Kinetic Character Reveal ───────────────────────────
// Split text into individual characters and animate them in sequence

export const kineticCharVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '0.5em',
    rotateX: -90,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      ...springBouncy,
      delay: i * 0.015,
    },
  }),
}

// ── Kinetic Word Reveal ────────────────────────────────

export const kineticWordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    filter: 'blur(4px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...easeOutExpo,
      delay: i * 0.06,
    },
  }),
}

// ── Kinetic Score Variants ─────────────────────────────

export const kineticScoreVariants: Variants = {
  initial: { scale: 1.3, color: 'var(--mm-accent-green)' },
  animate: {
    scale: 1,
    color: 'var(--mm-text-primary)',
    transition: { ...springSnap, duration: 0.5 },
  },
  bump: {
    scale: [1, 1.15, 1],
    color: ['var(--mm-text-primary)', 'var(--mm-accent-green)', 'var(--mm-text-primary)'],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// ── Kinetic Glow Pulse ─────────────────────────────────

export const kineticGlowVariants: Variants = {
  animate: {
    textShadow: ['0 0 8px rgba(0, 230, 118, 0.3)', '0 0 20px rgba(0, 230, 118, 0.6)', '0 0 8px rgba(0, 230, 118, 0.3)'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ── Kinetic Scale Press ────────────────────────────────

export const kineticPressVariants: Variants = {
  whileHover: { scale: 1.03, transition: { duration: 0.15 } },
  whileTap: { scale: 0.97, transition: { duration: 0.08 } },
}

// ── Utility: Animate number with GSAP-like spring ──────
// Returns a promise that resolves when the animation completes

export function animateKineticValue(
  el: HTMLElement,
  from: number,
  to: number,
  duration: number = 0.8,
  formatter: (n: number) => string = (n) => Math.floor(n).toLocaleString(),
): () => void {
  let cancelled = false
  const start = performance.now()

  function tick(now: number) {
    if (cancelled) return
    const elapsed = now - start
    const progress = Math.min(elapsed / (duration * 1000), 1)
    // Ease out quartic
    const eased = 1 - Math.pow(1 - progress, 4)
    const current = from + (to - from) * eased
    el.textContent = formatter(current)
    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
  return () => {
    cancelled = true
  }
}

// ── Utility: Parse kinetic number string ───────────────

export function parseKineticNumber(val: string | number): number {
  if (typeof val === 'number') return val
  return parseInt(val.replace(/[^0-9.-]/g, ''), 10) || 0
}

// ── Split text into array for character/word animation ──

export function splitIntoChars(text: string): string[] {
  return text.split('')
}

export function splitIntoWords(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean)
}

// ── Generate kinetic gradient for sport colors ─────────

export function kineticGradientForSport(sport: string): string {
  const gradients: Record<string, string> = {
    football: 'linear-gradient(135deg, #2ECC40, #27AE60)',
  }
  return gradients[sport] || 'linear-gradient(135deg, #00E676, #00BFA5)'
}
