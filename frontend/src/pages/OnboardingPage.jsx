import React, { useState, useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Camera, Upload, Users } from 'lucide-react'
import { stepSlideVariants } from '../lib/animation/variants'

const sports = [
  { id: 'FOOTBALL', icon: '⚽', name: 'Football' },
  { id: 'BASKETBALL', icon: '🏀', name: 'Basketball' },
  { id: 'AMERICAN_FOOTBALL', icon: '🏈', name: 'American Football' },
  { id: 'TENNIS', icon: '🎾', name: 'Tennis' },
  { id: 'CRICKET', icon: '🏏', name: 'Cricket' },
  { id: 'HOCKEY', icon: '🏒', name: 'Hockey' },
]

const suggestedUsers = [
  { name: 'SportsKing', accuracy: 78, sport: '⚽' },
  { name: 'GoalPredictor', accuracy: 74, sport: '⚽' },
  { name: 'HoopsMaster', accuracy: 71, sport: '🏀' },
  { name: 'GridironGuru', accuracy: 69, sport: '🏈' },
  { name: 'AcePredictor', accuracy: 72, sport: '🎾' },
  { name: 'Fanatico', accuracy: 65, sport: '🏏' },
  { name: 'GameDayPro', accuracy: 68, sport: '🏒' },
  { name: 'SportsFan42', accuracy: 63, sport: '⚽' },
  { name: 'PredictMaster', accuracy: 70, sport: '🏀' },
  { name: 'SportyMind', accuracy: 67, sport: '🏈' },
]

const defaultAvatars = ['🎯', '🏆', '⚡', '🔥', '💪', '👑', '🌟', '💎', '🚀', '🎪', '🏅', '🎮']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedSports, setSelectedSports] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])
  const [following, setFollowing] = useState([])
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  const toggleTeam = (teamName) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]
    )
  }

  const totalSteps = 4
  const progress = ((step + 1) / totalSteps) * 100

  const nextStep = useCallback(() => {
    if (step < totalSteps - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }, [step])

  const prevStep = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  const handleFinish = async () => {
    try {
      await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          avatar: selectedAvatar ? `https://api.dicebear.com/9.x/initials/svg?seed=${displayName}` : null,
          favouriteSports: selectedSports,
          favouriteTeams: selectedTeams,
        }),
      })
    } catch (err) {
      // Continue to feed even if onboarding save fails
    }
    navigate('/feed')
  }

  const toggleSport = (sportId) => {
    setSelectedSports((prev) =>
      prev.includes(sportId) ? prev.filter((s) => s !== sportId) : [...prev, sportId]
    )
  }

  const toggleFollow = (name) => {
    setFollowing((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  return (
    <div className="min-h-screen bg-[var(--mm-bg-primary)] flex flex-col">
      <Helmet>
        <title>Set Up Your Profile — MatchMind</title>
      </Helmet>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          {step > 0 && (
            <button
              onClick={prevStep}
              className="flex items-center gap-1 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body transition-colors"
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--gradient-live)] flex items-center justify-center">
            <span className="text-[var(--mm-text-inverse)] font-bold text-sm">MM</span>
          </div>
        </div>
        <div>
          {step >= 2 && (
            <button onClick={() => navigate('/feed')} className="caption text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)] transition-colors">
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="h-1 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--gradient-live)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="caption text-[var(--mm-text-muted)] mt-1 block text-center">
          Step {step + 1} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="h-full overflow-y-auto px-4 pb-24"
          >
            <div className="max-w-2xl mx-auto">
              {/* Step 1: Sports */}
              {step === 0 && (
                <div>
                  <h1 className="display-l mb-2">WHAT SPORT DO YOU LOVE?</h1>
                  <p className="body-large text-[var(--mm-text-secondary)] mb-8">
                    Pick at least one to personalize your experience.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sports.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => toggleSport(sport.id)}
                        className={`flex flex-col items-center gap-3 p-5 rounded-[var(--radius-lg)] border-2 transition-all duration-200 ${
                          selectedSports.includes(sport.id)
                            ? 'border-[var(--border-active)] bg-[var(--mm-accent-green)]/5 shadow-[var(--shadow-glow-green)]'
                            : 'border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <span className="text-4xl">{sport.icon}</span>
                        <span className="body font-semibold">{sport.name}</span>
                        {selectedSports.includes(sport.id) && (
                          <div className="w-6 h-6 rounded-full bg-[var(--mm-accent-green)] flex items-center justify-center">
                            <Check size={14} className="text-[var(--mm-text-inverse)]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Teams */}
              {step === 1 && (
                <div>
                  <h1 className="display-l mb-2">PICK YOUR TEAMS</h1>
                  <p className="body-large text-[var(--mm-text-secondary)] mb-8">
                    Select your favourite teams to follow.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Manchester City', league: 'Premier League', icon: '🔵' },
                      { name: 'Arsenal', league: 'Premier League', icon: '🔴' },
                      { name: 'Liverpool', league: 'Premier League', icon: '❤️' },
                      { name: 'LA Lakers', league: 'NBA', icon: '🟣' },
                      { name: 'Boston Celtics', league: 'NBA', icon: '🟢' },
                      { name: 'Kansas City Chiefs', league: 'NFL', icon: '🔴' },
                      { name: 'San Francisco 49ers', league: 'NFL', icon: '🔶' },
                      { name: 'Mumbai Indians', league: 'IPL', icon: '💙' },
                      { name: 'Chennai Super Kings', league: 'IPL', icon: '💛' },
                    ].map((team, i) => (
                      <button
                        key={i}
                        onClick={() => toggleTeam(team.name)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border-2 transition-all duration-200 ${
                          selectedTeams.includes(team.name)
                            ? 'border-[var(--border-active)] bg-[var(--mm-accent-green)]/5'
                            : 'border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)] hover:border-[var(--border-default)]'
                        }`}
                      >
                        <span className="text-3xl">{team.icon}</span>
                        <span className="body font-semibold text-center">{team.name}</span>
                        <span className="caption text-[var(--mm-text-muted)]">{team.league}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Follow */}
              {step === 2 && (
                <div>
                  <h1 className="display-l mb-2">FOLLOW TOP PREDICTORS</h1>
                  <p className="body-large text-[var(--mm-text-secondary)] mb-8">
                    Suggested people to follow this week
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {suggestedUsers.map((user, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border transition-all duration-200 ${
                          following.includes(user.name)
                            ? 'border-[var(--border-active)] bg-[var(--mm-bg-tertiary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center shrink-0">
                          <span className="font-bold text-[var(--mm-text-inverse)]">{user.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="body font-semibold truncate">{user.name}</p>
                          <p className="caption text-[var(--mm-text-muted)]">{user.sport} · 🎯 {user.accuracy}%</p>
                        </div>
                        <button
                          onClick={() => toggleFollow(user.name)}
                          className={`px-3 py-1.5 rounded-[var(--radius-sm)] caption font-semibold transition-all ${
                            following.includes(user.name)
                              ? 'bg-[var(--mm-bg-hover)] text-[var(--mm-text-primary)]'
                              : 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)]'
                          }`}
                        >
                          {following.includes(user.name) ? 'Following' : '+ Follow'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Profile */}
              {step === 3 && (
                <div>
                  <h1 className="display-l mb-2">ALMOST THERE</h1>
                  <p className="body-large text-[var(--mm-text-secondary)] mb-8">
                    Make it yours — set up your profile
                  </p>

                  {/* Avatar selection */}
                  <div className="mb-6">
                    <label className="caption font-medium text-[var(--mm-text-secondary)] block mb-3">
                      Choose your avatar
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {defaultAvatars.map((avatar, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                            selectedAvatar === avatar
                              ? 'border-[var(--border-active)] bg-[var(--mm-accent-green)]/10 scale-110'
                              : 'border-[var(--border-subtle)] bg-[var(--mm-bg-tertiary)] hover:border-[var(--border-default)]'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display name */}
                  <div className="mb-4">
                    <label htmlFor="displayName" className="caption font-medium text-[var(--mm-text-secondary)] block mb-1.5">
                      Display name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      maxLength={50}
                      className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
                    />
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <label htmlFor="bio" className="caption font-medium text-[var(--mm-text-secondary)] block mb-1.5">
                      Bio <span className="text-[var(--mm-text-muted)]">({160 - bio.length} chars left)</span>
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the world about your sports passion..."
                      maxLength={160}
                      rows={3}
                      className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--mm-bg-primary)] border-t border-[var(--border-subtle)] px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={nextStep}
            disabled={step === 0 && selectedSports.length === 0}
            className="w-full bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] body font-bold py-3.5 rounded-[var(--radius-md)] disabled:opacity-50 hover:shadow-[var(--shadow-glow-green)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            {step === totalSteps - 1 ? (
              <>Finish Setup 🎉</>
            ) : (
              <>Continue <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
