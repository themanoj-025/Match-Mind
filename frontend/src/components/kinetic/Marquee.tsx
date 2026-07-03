import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { prefersReducedMotion } from '../../lib/kinetic'

interface MarqueeItem {
  id: string | number
  content: React.ReactNode
}

interface MarqueeProps {
  /** Items to scroll through the marquee */
  items: MarqueeItem[]
  /** Speed in seconds for one full cycle */
  speed?: number
  /** Direction: 'left' | 'right' | 'up' | 'down' */
  direction?: 'left' | 'right'
  /** Pause animation on hover */
  pauseOnHover?: boolean
  /** Pause animation when element is in view (lazy marquee) */
  pauseWhenNotInView?: boolean
  /** Gap between duplicated items in px */
  gap?: number
  /** Additional className */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
  /** Custom render function for each item */
  renderItem?: (item: MarqueeItem, index: number) => React.ReactNode
  /** Children as alternative to items (wraps in single item) */
  children?: React.ReactNode
}

/**
 * Marquee — Continuous scrolling ticker with kinetic energy
 *
 * Features:
 * - Seamless infinite scroll via content duplication
 * - Pause on hover (for accessibility)
 * - Pause when not in view
 * - Respects prefers-reduced-motion
 *
 * Usage:
 *   <Marquee speed={20} direction="left" pauseOnHover>
 *     <YourContent />
 *   </Marquee>
 *
 *   <Marquee
 *     items={[{ id: 1, content: '⚽' }, { id: 2, content: '🏀' }]}
 *     speed={15}
 *   />
 */
export default function Marquee({
  items,
  speed = 25,
  direction = 'left',
  pauseOnHover = true,
  pauseWhenNotInView = false,
  gap = 24,
  className = '',
  style,
  renderItem,
  children,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const reduced = prefersReducedMotion()

  // Observer for viewport visibility
  useEffect(() => {
    if (!pauseWhenNotInView || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [pauseWhenNotInView])

  // Generate display items (duplicate for seamless loop)
  const displayContent = useCallback(() => {
    if (children) {
      return [children, children]
    }
    if (!items) return []
    return [...items, ...items]
  }, [children, items])

  // Determine if animation should run
  const shouldAnimate = !reduced && !(pauseOnHover && isHovered) && !(pauseWhenNotInView && !isVisible)
  const playState = shouldAnimate ? 'running' : 'paused'
  const translateX = direction === 'left' ? '-50%' : '0%'
  const originX = direction === 'left' ? '0%' : '-50%'

  return (
    <div
      ref={containerRef}
      className={`marquee ${className}`}
      style={{
        overflow: 'hidden',
        width: '100%',
        ...style,
      }}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      <motion.div
        className="marquee__track"
        style={{
          display: 'flex',
          gap: `${gap}px`,
          width: 'fit-content',
          animationPlayState: playState,
        }}
        animate={reduced ? {} : {
          x: [originX, translateX],
        }}
        transition={reduced ? {} : {
          x: {
            duration: speed,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        }}
      >
        {displayContent().map((item, idx) => (
          <div
            key={typeof item === 'object' && item !== null && 'id' in item ? (item as MarqueeItem).id : idx}
            className="marquee__item"
            style={{ flexShrink: 0 }}
          >
            {renderItem && typeof item === 'object' && item !== null && 'content' in item
              ? renderItem(item as MarqueeItem, idx)
              : typeof item === 'object' && item !== null && 'content' in item
              ? (item as MarqueeItem).content
              : item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
