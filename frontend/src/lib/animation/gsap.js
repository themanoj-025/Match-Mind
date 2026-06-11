/**
 * GSAP + ScrollTrigger Integration
 * MatchMind v3.0 — Scroll-Based Animations
 *
 * Import once in app root to register ScrollTrigger plugin.
 * Each export is a reusable animation function.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register once
gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll reveal — animates elements into view when they scroll into the viewport
 * @param {string|HTMLElement[]} selector - CSS selector or array of elements
 * @param {object} options - GSAP TweenVars overrides
 * @returns {object} { kill: () => void } — cleanup function
 */
export function useScrollReveal(selector, options = {}) {
  const els = gsap.utils.toArray(selector)
  const tweens = []

  els.forEach((el) => {
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        ...options,
      }
    )
    tweens.push(tween)
  })

  return {
    kill: () => {
      tweens.forEach((t) => t.kill())
      ScrollTrigger.getAll().forEach((t) => t.kill())
    },
  }
}

/**
 * Animate a counter from 0 to a target number
 * @param {HTMLElement} el - Element to update with the count
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in seconds
 * @param {function} formatter - Optional number formatter
 * @returns {gsap.core.Tween}
 */
export function animateCountUp(el, target, duration = 2, formatter = (n) => Math.floor(n).toLocaleString()) {
  return gsap.fromTo(
    { val: 0 },
    { val: 0 },
    {
      val: target,
      duration,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = formatter(this.targets()[0].val)
      },
    }
  )
}

/**
 * Stagger leaderboard rows on mount
 * @param {HTMLElement} containerEl - Parent container
 */
export function animateLeaderboard(containerEl) {
  const rows = containerEl.querySelectorAll('[data-row]')
  if (!rows.length) return

  return gsap.fromTo(
    rows,
    { opacity: 0, x: -20 },
    {
      opacity: 1,
      x: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: 'power2.out',
    }
  )
}

/**
 * Animate a stat bar fill
 * @param {HTMLElement} barEl - The bar element
 * @param {string} targetWidth - e.g. "55%"
 */
export function animateStatBar(barEl, targetWidth) {
  return gsap.fromTo(
    barEl,
    { width: '0%' },
    {
      width: targetWidth,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: barEl, start: 'top 90%' },
    }
  )
}

/**
 * Reveal timeline events with stagger
 * @param {HTMLElement} containerEl - Container with [data-event] elements
 */
export function animateTimeline(containerEl) {
  const events = containerEl.querySelectorAll('[data-event]')
  if (!events.length) return

  return gsap.fromTo(
    events,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.5)' }
  )
}

/**
 * Achievement badge unlock celebration
 * @param {HTMLElement} badgeEl - The badge element
 */
export function animateAchievementUnlock(badgeEl) {
  const tl = gsap.timeline()
  tl.fromTo(badgeEl, { scale: 0, rotation: -20 }, { scale: 1.2, rotation: 5, duration: 0.3, ease: 'back.out(2)' })
  tl.to(badgeEl, { scale: 1, rotation: 0, duration: 0.2, ease: 'power2.out' })
  return tl
}

/**
 * Podium entrance animation (leaderboard top 3)
 * @param {object} refs - Object with first, second, third element refs
 */
export function animatePodium(refs) {
  const tl = gsap.timeline()

  if (refs.second) {
    tl.fromTo(refs.second, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0)
  }
  if (refs.third) {
    tl.fromTo(refs.third, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.1)
  }
  if (refs.first) {
    tl.fromTo(refs.first, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.2)
  }

  return tl
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Kill all ScrollTrigger instances (call in useEffect cleanup)
 */
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill())
}
