import { motion } from 'framer-motion'

export default function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {icon && <div className="mb-4 text-[var(--mm-text-muted)] opacity-30">{icon}</div>}
      <h3 className="heading-3 text-[var(--mm-text-secondary)] mb-1">{title}</h3>
      {description && <p className="body text-[var(--mm-text-muted)] max-w-xs mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </motion.div>
  )
}
