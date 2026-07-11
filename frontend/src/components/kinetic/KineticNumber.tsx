import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { kineticNumberRollVariants, prefersReducedMotion } from '../../lib/kinetic'

type AnimationMode = 'roll' | 'flip' | 'count' | 'scale'

interface KineticNumberProps {
  value: number
  mode?: AnimationMode
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  formatter?: (n: number) => string
  className?: string
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p'
  onComplete?: () => void
  children?: React.ReactNode
  animateOnMount?: boolean
  /** Fixed number of digits to display (pads with leading zeros) */
  padDigits?: number
}

/**
 * KineticNumber — Animated number primitive
 *
 * Modes:
 * - roll:    Each digit rolls in from above with 3D rotation
 * - flip:    Classic split-flap animation (same as roll)
 * - count:   Smooth counting up/down using requestAnimationFrame
 * - scale:   Pops in with scale + blur reveal
 *
 * Usage:
 *   <KineticNumber value={8420} mode="roll" prefix="🪙 " />
 *   <KineticNumber value={99} mode="count" suffix="%" />
 */
export default function KineticNumber({
  value,
  mode = 'roll',
  duration = 0.8,
  delay = 0,
  prefix = '',
  suffix = '',
  formatter,
  className = '',
  as: Tag = 'span',
  onComplete,
  children,
  animateOnMount = true,
  padDigits,
}: KineticNumberProps) {
  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : value)
  const [digitsReady, setDigitsReady] = useState(!animateOnMount)

  // Refs for count mode animation state — avoids render-loop
  const animRef = useRef<{
    raf: number | null
    from: number
    startTime: number
    started: boolean
  }>({ raf: null, from: 0, startTime: 0, started: false })

  const mountedRef = useRef(false)
  const reduced = prefersReducedMotion()

  const defaultFormatter = useCallback((n: number) => Math.floor(n).toLocaleString(), [])
  const fmt = formatter || defaultFormatter

  // ── Cleanup rAF on unmount ──
  useEffect(() => {
    return () => {
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf)
    }
  }, [])

  // ── Count mode: smooth interpolation using rAF ──
  useEffect(() => {
    if (mode !== 'count') return
    if (reduced) {
      setDisplayValue(value)
      setDigitsReady(true)
      return
    }

    // Cancel any in-flight animation
    if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf)

    const from = animateOnMount && !mountedRef.current ? 0 : displayValue
    const to = value
    const startDelay = delay * 1000

    animRef.current = {
      raf: null,
      from,
      startTime: performance.now() + startDelay,
      started: false,
    }

    function tick(now: number) {
      if (now < animRef.current.startTime) {
        animRef.current.raf = requestAnimationFrame(tick)
        return
      }
      if (!animRef.current.started) {
        animRef.current.started = true
        mountedRef.current = true
        setDigitsReady(true)
      }

      const elapsed = now - animRef.current.startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = animRef.current.from + (to - animRef.current.from) * eased
      setDisplayValue(current)

      if (progress < 1) {
        animRef.current.raf = requestAnimationFrame(tick)
      } else {
        setDisplayValue(to)
        onComplete?.()
      }
    }

    animRef.current.raf = requestAnimationFrame(tick)
    // Cleanup handled by the mount effect above
  }, [value, mode, duration, delay, reduced, animateOnMount, onComplete])

  // ── Non-count modes: trigger mount animation ──
  useEffect(() => {
    if (mode === 'count') return

    if (!animateOnMount || mountedRef.current) {
      setDisplayValue(value)
      setDigitsReady(true)
      return
    }

    mountedRef.current = true
    const timer = setTimeout(() => {
      setDisplayValue(value)
      setDigitsReady(true)
      setTimeout(() => onComplete?.(), 500)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [value, mode, delay, animateOnMount, onComplete])

  // ── Stable digit array with fixed positions ──
  const digits = useMemo(() => {
    const numStr = String(Math.floor(displayValue))
    if (padDigits !== undefined) {
      return numStr
        .padStart(padDigits, '0')
        .split('')
        .map((d, i) => ({
          char: d,
          pos: i,
          key: `dig-${i}`,
        }))
    }
    return numStr.split('').map((d, i) => ({
      char: d,
      pos: i,
      key: `dig-${i}`,
    }))
  }, [displayValue, padDigits])

  // ── Render digits with roll animation ──
  const renderDigits = () => (
    <span className="kinetic-number-digits" style={{ display: 'inline-flex', overflow: 'hidden' }}>
      {digits.map(({ char, key }) => (
        <motion.span
          key={key}
          variants={kineticNumberRollVariants}
          initial={digitsReady ? false : 'initial'}
          animate="animate"
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            minWidth: '0.6em',
            textAlign: 'center',
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )

  // ── Content ──
  let content: React.ReactNode

  if (mode === 'count' || reduced) {
    content = <>{fmt(displayValue)}</>
  } else {
    content = renderDigits()
  }

  return (
    <Tag
      className={`kinetic-number ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.1em' }}
    >
      {prefix && <span className="kinetic-number-prefix">{prefix}</span>}
      {content}
      {suffix && <span className="kinetic-number-suffix">{suffix}</span>}
      {children}
    </Tag>
  )
}
