import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  gridGapContainerVariants,
  gridGapItemVariants,
  prefersReducedMotion,
} from '../../lib/kinetic'

interface GridGapProps {
  /** Grid items */
  children: React.ReactNode
  /** Grid columns (responsive) */
  columns?: { default: number; sm?: number; md?: number; lg?: number; xl?: number }
  /** Gap between items */
  gap?: string
  /** Animation mode */
  mode?: 'stagger' | 'reveal' | 'none'
  /** Stagger delay between children */
  staggerDelay?: number
  /** Only animate once */
  once?: boolean
  /** Additional className */
  className?: string
  /** Minimum gap during initial animation (for gap transition) */
  initialGap?: string
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch'
}

/**
 * GridGap — Kinetic grid layout with staggered entry animations
 *
 * Animates children into view with a cascade effect, perfect for
 * showing cards, stats, or any grid-based content with kinetic energy.
 *
 * Usage:
 *   <GridGap columns={{ default: 1, md: 2, lg: 3 }} gap="1.5rem" mode="stagger">
 *     <Card />
 *     <Card />
 *     <Card />
 *   </GridGap>
 */
export default function GridGap({
  children,
  columns = { default: 1 },
  gap = 'var(--kinetic-grid-gap-md, 1rem)',
  mode = 'stagger',
  staggerDelay = 0.04,
  once = true,
  className = '',
  initialGap = '0.5rem',
  align = 'stretch',
}: GridGapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-50px' })
  const reduced = prefersReducedMotion()

  // Build grid template column count per breakpoint
  // We use a single column count and rely on the wrapping page's responsive grid
  const gridColumnCount = columns.default
  const gridTemplateColumns = `repeat(${gridColumnCount}, 1fr)`

  // If reduced motion or mode is 'none', render without animations
  if (reduced || mode === 'none') {
    return (
      <div
        ref={ref}
        className={`grid-gap ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns,
          gap,
          alignItems: align,
        }}
      >
        {children}
      </div>
    )
  }

  const childrenArray = React.Children.toArray(children)

  return (
    <motion.div
      ref={ref}
      className={`grid-gap ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        alignItems: align,
      }}
      variants={gridGapContainerVariants}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
    >
      {childrenArray.map((child, i) => (
        <motion.div
          key={i}
          className="grid-gap__item"
          variants={gridGapItemVariants}
          custom={{ delay: i * staggerDelay }}
          style={{ width: '100%' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

