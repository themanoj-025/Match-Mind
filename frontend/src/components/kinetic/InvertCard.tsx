import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { invertCardVariants, prefersReducedMotion } from '../../lib/kinetic'

interface InvertCardProps {
  /** Front face content */
  front: React.ReactNode
  /** Back face content (revealed on flip) */
  back: React.ReactNode
  /** Whether the card is flipped */
  flipped?: boolean
  /** Callback when flip state changes */
  onFlip?: (flipped: boolean) => void
  /** Flip trigger: 'click' | 'hover' | 'manual' */
  trigger?: 'click' | 'hover' | 'manual'
  /** Card dimensions */
  width?: string | number
  height?: string | number
  /** Border radius */
  radius?: string
  /** Additional className for the card wrapper */
  className?: string
  /** Custom background for both faces */
  background?: string
  /** Disable flip animation */
  disabled?: boolean
}

/**
 * InvertCard — Flip-to-reveal card component
 *
 * Usage:
 *   <InvertCard
 *     front={<div>Front Content</div>}
 *     back={<div>Back Content</div>}
 *     trigger="click"
 *   />
 */
export default function InvertCard({
  front,
  back,
  flipped: controlledFlipped,
  onFlip,
  trigger = 'click',
  width = '100%',
  height = 'auto',
  radius = 'var(--radius-lg)',
  className = '',
  background,
  disabled = false,
}: InvertCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const reduced = prefersReducedMotion()

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped
  const isManuallyFlipped = trigger === 'manual' ? (controlledFlipped || false) : isFlipped

  const handleFlip = useCallback(() => {
    if (disabled || trigger !== 'click') return
    const next = !internalFlipped
    setInternalFlipped(next)
    onFlip?.(next)
  }, [disabled, trigger, internalFlipped, onFlip])

  const handleHoverStart = useCallback(() => {
    if (disabled || trigger !== 'hover') return
    setIsHovered(true)
    setInternalFlipped(true)
    onFlip?.(true)
  }, [disabled, trigger, onFlip])

  const handleHoverEnd = useCallback(() => {
    if (disabled || trigger !== 'hover') return
    setIsHovered(false)
    setInternalFlipped(false)
    onFlip?.(false)
  }, [disabled, trigger, onFlip])

  // For reduced motion, just toggle content visibility
  if (reduced) {
    return (
      <div
        className={`invert-card invert-card--reduced ${className}`}
        style={{ width, height, cursor: trigger === 'click' ? 'pointer' : 'default' }}
        onClick={handleFlip}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        role={trigger === 'click' ? 'button' : undefined}
        tabIndex={trigger === 'click' ? 0 : undefined}
        onKeyDown={(e) => {
          if (trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handleFlip()
          }
        }}
      >
        {isManuallyFlipped ? back : front}
      </div>
    )
  }

  const effectiveFlipped = trigger === 'hover' ? isHovered : isManuallyFlipped

  return (
    <div
      className={`invert-card ${className}`}
      style={{
        width,
        height,
        perspective: '800px',
        cursor: trigger === 'click' && !disabled ? 'pointer' : 'default',
      }}
      onClick={handleFlip}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      role={trigger === 'click' ? 'button' : undefined}
      tabIndex={trigger === 'click' ? 0 : undefined}
      onKeyDown={(e) => {
        if (trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleFlip()
        }
      }}
    >
      <motion.div
        className="invert-card__inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          borderRadius: radius,
        }}
        variants={invertCardVariants}
        initial="idle"
        animate={effectiveFlipped ? 'flipped' : 'idle'}
      >
        {/* Front Face */}
        <div
          className="invert-card__face invert-card__face--front"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: radius,
            background: background || 'var(--mm-bg-secondary)',
            overflow: 'hidden',
          }}
        >
          {front}
        </div>

        {/* Back Face */}
        <div
          className="invert-card__face invert-card__face--back"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: radius,
            background: background || 'var(--mm-bg-tertiary)',
            overflow: 'hidden',
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}
