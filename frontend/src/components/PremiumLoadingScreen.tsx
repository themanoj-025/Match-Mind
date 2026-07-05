import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LOADING_MESSAGES = [
  'Preparing the stadium...',
  'Warming up the players...',
  'Setting up the scoreboard...',
  'Opening the chat rooms...',
  'Tuning the live feed...',
  'Loading predictions...',
  'Checking the leaderboard...',
  'Getting the latest scores...',
  '⚡ Almost ready...',
]

export default function PremiumLoadingScreen({ isLoading = true, minDisplay = 800 }) {
  const [show, setShow] = useState(true)
  const [messageIdx, setMessageIdx] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShow(false), minDisplay)
      return () => clearTimeout(timer)
    }
  }, [isLoading, minDisplay])

  // Cycle through messages
  useEffect(() => {
    if (!show) return
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center"
          style={{ background: 'var(--mm-bg-primary)' }}
        >
          {/* Particle Field */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `rgba(0, 230, 118, ${0.1 + Math.random() * 0.3})`,
                  boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(0, 230, 118, ${0.1 + Math.random() * 0.2})`,
                }}
                animate={{
                  y: [0, -30 - Math.random() * 40, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Stadium Spotlight Effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse at 50% 0%, rgba(0, 230, 118, 0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 50% 100%, rgba(79, 195, 247, 0.04) 0%, transparent 50%)
              `,
            }}
          />

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-[var(--gradient-live)] flex items-center justify-center shadow-[var(--shadow-glow-green)]">
                <span className="text-[var(--mm-text-inverse)] font-bold text-3xl font-[var(--font-display)] tracking-wider">MM</span>
              </div>
              {/* Ring animation */}
              <motion.div
                className="absolute -inset-3 rounded-[var(--radius-2xl)] border border-[var(--mm-accent-green)]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute -inset-1 rounded-[var(--radius-2xl)] border border-[var(--mm-accent-green)]/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* Loading Animation */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-[var(--mm-accent-green)]"
                  animate={{
                    y: [0, -12, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Rotating messages */}
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="body text-[var(--mm-text-secondary)] text-center"
              >
                {LOADING_MESSAGES[messageIdx]}
              </motion.p>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--gradient-live)] rounded-full"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
