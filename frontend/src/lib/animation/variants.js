/**
 * Framer Motion Animation Variants
 * MatchMind v3.0 — Design System Animations
 *
 * All variants are designed to work with AnimatePresence and respect prefers-reduced-motion.
 */

// Page enter/exit — wraps every <Route> in AnimatePresence
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
}

// Cards stagger in on page load
export const cardStaggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

export const cardStaggerItem = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

// Modal overlay + content
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
}

// Sidebar slide
export const sidebarVariants = {
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
  open: { x: '0%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
}

// Goal celebration overlay
export const goalOverlayVariants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.4, delay: 1.2 } },
}

// Score digit flip
export const scoreFlipVariants = {
  initial: { rotateX: -90, opacity: 0 },
  animate: { rotateX: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { rotateX: 90, opacity: 0, transition: { duration: 0.15 } },
}

// Toast notification
export const toastVariants = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 35 } },
  exit: { x: 80, opacity: 0, transition: { duration: 0.2 } },
}

// Bottom sheet (mobile chat)
export const bottomSheetVariants = {
  closed: { y: '100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
  open: { y: '0%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
}

// Leaderboard rank change
export const rankBumpVariants = {
  bump: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

// Fade in from bottom
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// Scale press effect for buttons
export const pressVariants = {
  whileHover: { scale: 1.02, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}

// Accordion expand/collapse
export const accordionVariants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  expanded: { height: 'auto', opacity: 1, overflow: 'hidden', transition: { duration: 0.3, ease: 'easeOut' } },
}

// Confetti particle fall
export const confettiVariants = {
  initial: { y: -20, opacity: 1, rotate: 0 },
  animate: (i) => ({
    y: '100vh',
    opacity: 0,
    rotate: 720,
    transition: { duration: 2 + Math.random(), delay: i * 0.02, ease: 'easeIn' },
  }),
}

// Onboarding step slide
export const stepSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  }),
}

// Chat message slide in
export const chatMessageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

// Reaction badge pop
export const reactionPopVariants = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  tap: { scale: 1.2, transition: { duration: 0.1 } },
}
