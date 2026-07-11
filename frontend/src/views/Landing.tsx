import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Code, Zap, Layers, Terminal, ArrowRight } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

export const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 0.95])
  const y = useTransform(scrollY, [0, 400], [0, 100])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
    }
  }

  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden text-foreground selection:bg-accent/30">
      <div className="absolute inset-0 bg-grid-overlay opacity-20 pointer-events-none" />

      {/* Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1400px] bg-accent/25 blur-[150px] rounded-full pointer-events-none opacity-50 z-0 animate-pulse" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050506]/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-accent" />
            <span className="font-semibold tracking-tight text-lg">MatchMind Drafts</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="px-4 cursor-pointer" onClick={() => navigate('/login')}>Log in</Button>
            <Button className="px-5 cursor-pointer" onClick={() => navigate('/login')}>Sign up</Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <motion.section 
          style={{ opacity, scale, y }}
          className="container mx-auto px-6 py-16 md:py-32 flex flex-col items-center text-center max-w-4xl"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="text-xs font-mono tracking-widest text-accent-bright">LIVE DRAFT ARENA V2.0</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-tight mb-6">
              <span className="text-gradient">Real-Time Auctions</span><br/>
              <span className="text-gradient-accent pb-2 block">Built for draft managers.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-base md:text-lg lg:text-xl text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              MatchMind brings high-concurrency auction bidding, real-time draft updates, and AI-powered roster suggestions together in a premium layout.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 justify-center w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 py-4 text-base cursor-pointer" onClick={() => navigate('/login')}>
                Enter Lobby <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Features Bento Grid */}
        <section className="container mx-auto px-6 py-24 md:py-32 border-t border-white/[0.02]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center bg-white/[0.03] mb-4">
                <Terminal className="w-5 h-5 text-accent-bright" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight mb-2">Real-Time Bids</h3>
                <p className="text-sm text-foreground-muted">Fully synced bidding console with WebSocket push state updates.</p>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center bg-white/[0.03] mb-4">
                <Zap className="w-5 h-5 text-accent-bright" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight mb-2">AI Strategy Advisor</h3>
                <p className="text-sm text-foreground-muted">Get optimal recommendations based on remaining budget and needs.</p>
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center bg-white/[0.03] mb-4">
                <Layers className="w-5 h-5 text-accent-bright" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight mb-2">Leaderboard Standing</h3>
                <p className="text-sm text-foreground-muted">Compare rankings with global managers after every completed draft.</p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#050506] relative z-10 pt-12 pb-8">
        <div className="container mx-auto px-6 text-center text-xs text-foreground-muted">
          <p>© {new Date().getFullYear()} MatchMind. Designed for draft enthusiasts.</p>
        </div>
      </footer>
    </div>
  )
}
