// @ts-nocheck
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
    >
      <Helmet>
        <title>404 — Page Not Found | MatchMind</title>
      </Helmet>

      <div className="text-center max-w-md">
        {/* Animated SVG illustration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-fluid-hero mb-6"
        >
          ⚽
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="display-l mb-3">OFFSIDE.</h1>
          <p className="heading-2 text-[var(--mm-accent-red)] mb-4">PAGE NOT FOUND.</p>
          <p className="body-large text-[var(--mm-text-secondary)] mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-6 py-3 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all"
            >
              <Home size={16} /> Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 border border-[var(--border-subtle)] text-[var(--mm-text-primary)] body font-medium px-6 py-3 rounded-[var(--radius-md)] hover:border-[var(--border-default)] transition-all"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

