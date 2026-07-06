// @ts-nocheck
/**
 * SoldStamp — MatchMind
 *
 * Framer Motion "SOLD!" stamp animation on player-sold event.
 * AnimatePresence handled by parent — this component renders when phase === 'SOLD'.
 */
import { motion } from 'framer-motion'

interface SoldStampProps {
  playerName: string
  price: number
  buyerId: string | null
}

export default function SoldStamp({ playerName, price, buyerId }: SoldStampProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      className="text-center"
    >
      <motion.div
        className="text-5xl mb-3"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        🎉
      </motion.div>
      <motion.h2
        className="display-l text-[var(--mm-accent-green)] mb-1"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        SOLD!
      </motion.h2>
      <motion.p
        className="body text-[var(--mm-text-secondary)]"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {playerName} — 🪙 ${price}
      </motion.p>
      <motion.p
        className="caption text-[var(--mm-text-muted)] mt-1"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Waiting for next player...
      </motion.p>
    </motion.div>
  )
}

