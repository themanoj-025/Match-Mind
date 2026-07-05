import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, Trophy, BarChart3, Activity, AlertCircle, DollarSign, TrendingUp, Settings, Flag, MessageSquare, Search, ChevronDown, Trash2, Crown, Loader, Save, X, Edit3, Eye, Calendar, Target, Users2, Shield, Clock, UserX, Repeat, CheckCheck, Zap, ShieldCheck, RefreshCw } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { cardStaggerItem } from '../lib/animation/variants'
import { useAdminStats, useAdminUsers, useAdminMatches, useAdminReports, useAdminSettings, useTogglePro, useDeleteUser, useUpdateReport, useUpdateMatch, useAdminUserDetail, useAdminActivityLog, useAdminDraftPoolValidation, useAdminDraftIcons, useToggleDraftMode, useToggleIconEligibility, useRevalidateDraftPool } from '../hooks/useApi'

const adminTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'matches', label: 'Matches' },
  { id: 'reports', label: 'Reports' },
  { id: 'activity', label: 'Activity Log' },
  { id: 'settings', label: 'Settings' },
  { id: 'draft', label: 'Draft Mode' },
]

const kpiData = [
  { label: 'Total Users', value: '12,847', icon: Users, change: '+12%', changeType: 'up', color: 'var(--mm-accent-green)' },
  { label: 'Monthly Active', value: '8,234', icon: Activity, change: '+8%', changeType: 'up', color: 'var(--mm-accent-blue)' },
  { label: 'Active Auctions', value: '24', icon: Trophy, change: '+18%', changeType: 'up', color: 'var(--mm-accent-amber)' },
  { label: 'Pro Subscribers', value: '1,247', icon: TrendingUp, change: '+15%', changeType: 'up', color: 'var(--mm-accent-purple)' },
  { label: 'Revenue MTD', value: '$12,400', icon: DollarSign, change: '+8%', changeType: 'up', color: 'var(--mm-accent-green)' },
  { label: 'Error Rate', value: '0.12%', icon: AlertCircle, change: '-0.02%', changeType: 'down', color: 'var(--mm-accent-green)' },
]

const signupData = [
  { day: 'Mon', signups: 340, predictions: 12000 },
  { day: 'Tue', signups: 280, predictions: 15000 },
  { day: 'Wed', signups: 320, predictions: 11000 },
  { day: 'Thu', signups: 410, predictions: 18000 },
  { day: 'Fri', signups: 550, predictions: 22000 },
  { day: 'Sat', signups: 680, predictions: 28000 },
  { day: 'Sun', signups: 420, predictions: 19000 },
]

const sportData = [
  { name: 'Football', value: 100, color: '#2ECC40' },
]


// ─── Draft Mode Admin Tab ────────────────────────────────────
const DRAFT_SUB_TABS = [
  { id: 'pool', label: 'Pool Validation' },
  { id: 'icons', label: 'ICON Management' },
]

const RARITY_COLORS = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  ICON: '#FF6B6B',
}

function AdminDraftModeTab() {
  const [subTab, setSubTab] = useState('pool')
  const [revalidating, setRevalidating] = useState(false)

  const { data: poolData, isLoading: poolLoading } = useAdminDraftPoolValidation()
  const { data: iconData, isLoading: iconsLoading } = useAdminDraftIcons()
  const toggleDraftMut = useToggleDraftMode()
  const toggleIconMut = useToggleIconEligibility()
  const revalidateMut = useRevalidateDraftPool()

  const tournaments = poolData?.tournaments || []
  const icons = iconData?.players || []
  const passedCount = tournaments.filter((t) => t.passed).length
  const enabledCount = tournaments.filter((t) => t.enabled).length

  const handleToggle = (tournamentId: string, action: 'enable' | 'disable') => {
    toggleDraftMut.mutate({ tournamentId, action })
  }

  const handleRevalidate = async () => {
    setRevalidating(true)
    try {
      await revalidateMut.mutateAsync(undefined)
    } finally {
      setRevalidating(false)
    }
  }

  const handleIconToggle = (playerId: string) => {
    toggleIconMut.mutate(playerId)
  }

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
          <span className="heading-2 text-[var(--mm-accent-green)]">{tournaments.length}</span>
          <span className="caption text-[var(--mm-text-muted)] block">Tournaments</span>
        </div>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
          <span className={`heading-2 ${passedCount === tournaments.length ? 'text-[var(--mm-accent-green)]' : 'text-[var(--mm-accent-red)]'}`}>{passedCount}/{tournaments.length}</span>
          <span className="caption text-[var(--mm-text-muted)] block">Pools Passed</span>
        </div>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
          <span className="heading-2 text-[var(--mm-accent-amber)]">{enabledCount}</span>
          <span className="caption text-[var(--mm-text-muted)] block">Draft Enabled</span>
        </div>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
          <span className="heading-2 text-[var(--mm-accent-purple)]">{icons.length}</span>
          <span className="caption text-[var(--mm-text-muted)] block">ICON Players</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-2 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)] w-fit">
        {DRAFT_SUB_TABS.map((tab) => (
          <button
            key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 rounded-[var(--radius-sm)] caption whitespace-nowrap transition-all ${
              subTab === tab.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Pool Validation Sub-tab ───────────────────────── */}
      {subTab === 'pool' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--mm-accent-green)]" />
              Tournament Pool Validation
            </h3>
            <button
              onClick={handleRevalidate}
              disabled={revalidating || revalidateMut.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] caption font-semibold rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={revalidating || revalidateMut.isPending ? 'animate-spin' : ''} />
              {revalidating ? 'Re-validating...' : 'Re-validate All'}
            </button>
          </div>

          {poolLoading ? (
            <div className="flex items-center justify-center py-12 text-[var(--mm-text-muted)]">
              <Loader size={20} className="animate-spin mr-2" /> Validating pools...
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12 text-[var(--mm-text-muted)]">
              <Zap size={32} className="mx-auto mb-2 opacity-30" />
              <p className="body">No tournaments loaded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((t) => {
                const isToggling = toggleDraftMut.isPending && toggleDraftMut.variables?.tournamentId === t.tournamentId
                return (
                  <div
                    key={t.tournamentId}
                    className={`bg-[var(--mm-bg-secondary)] border rounded-[var(--radius-lg)] p-5 transition-all ${
                      t.passed ? 'border-[var(--border-subtle)]' : 'border-[var(--mm-accent-red)]/30'
                    }`}
                  >
                    {/* Tournament header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${t.passed ? 'bg-[var(--mm-accent-green)]' : 'bg-[var(--mm-accent-red)]'}`} />
                        <div>
                          <span className="body font-semibold">{t.tournamentName}</span>
                          <span className="caption text-[var(--mm-text-muted)] ml-2">{t.shortName}</span>
                        </div>
                        <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] font-medium ${
                          t.status === 'LIVE' ? 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)]' :
                          t.status === 'ANNOUNCED' ? 'bg-[var(--mm-accent-amber)]/10 text-[var(--mm-accent-amber)]' :
                          'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]'
                        }`}>{t.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="caption text-[var(--mm-text-muted)]">{t.playerCount || 0} players</span>
                        <span className="caption text-[var(--mm-accent-purple)]">{t.iconCount || 0} ICONs</span>
                        {/* Enable/Disable toggle */}
                        <button
                          onClick={() => handleToggle(t.tournamentId, t.enabled ? 'disable' : 'enable')}
                          disabled={isToggling || (!t.passed && !t.enabled)}
                          title={!t.passed && !t.enabled ? 'Pool validation must pass first' : t.enabled ? 'Disable Draft Mode' : 'Enable Draft Mode'}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            t.enabled ? 'bg-[var(--mm-accent-green)]' : 'bg-[var(--mm-bg-tertiary)]'
                          } ${!t.passed && !t.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                          role="switch" aria-checked={t.enabled}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${t.enabled ? 'translate-x-5.5 left-[2px]' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Errors, warnings, infos */}
                    {t.errors.length > 0 && (
                      <div className="mb-2 p-3 bg-[var(--mm-accent-red)]/5 rounded-[var(--radius-md)] border border-[var(--mm-accent-red)]/20">
                        <span className="caption font-semibold text-[var(--mm-accent-red)] block mb-1">❌ {t.errors.length} Error(s)</span>
                        {t.errors.map((err, i) => (
                          <span key={i} className="caption text-[var(--mm-text-secondary)] block ml-3">• {err}</span>
                        ))}
                      </div>
                    )}
                    {t.warnings.length > 0 && (
                      <div className="mb-2 p-3 bg-[var(--mm-accent-amber)]/5 rounded-[var(--radius-md)] border border-[var(--mm-accent-amber)]/20">
                        <span className="caption font-semibold text-[var(--mm-accent-amber)] block mb-1">⚠️ {t.warnings.length} Warning(s)</span>
                        {t.warnings.map((w, i) => (
                          <span key={i} className="caption text-[var(--mm-text-secondary)] block ml-3">• {w}</span>
                        ))}
                      </div>
                    )}
                    {t.infos.length > 0 && (
                      <div className="p-3 bg-[var(--mm-accent-blue)]/5 rounded-[var(--radius-md)] border border-[var(--mm-accent-blue)]/20">
                        <span className="caption font-semibold text-[var(--mm-accent-blue)] block mb-1">ℹ️ Info</span>
                        {t.infos.map((info, i) => (
                          <span key={i} className="caption text-[var(--mm-text-secondary)] block ml-3">• {info}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ─── ICON Management Sub-tab ───────────────────────── */}
      {subTab === 'icons' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-3 flex items-center gap-2">
              <Crown size={18} className="text-[var(--mm-accent-purple)]" />
              ICON Player Management
              <span className="caption text-[var(--mm-text-muted)] font-normal">({icons.length} players)</span>
            </h3>
          </div>

          {iconsLoading ? (
            <div className="flex items-center justify-center py-12 text-[var(--mm-text-muted)]">
              <Loader size={20} className="animate-spin mr-2" /> Loading ICONs...
            </div>
          ) : icons.length === 0 ? (
            <div className="text-center py-12 text-[var(--mm-text-muted)]">
              <Crown size={32} className="mx-auto mb-2 opacity-30" />
              <p className="body">No ICON players found</p>
              <p className="caption mt-1">Run pool re-validation to compute rarity tiers first.</p>
            </div>
          ) : (
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Player</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Tournament</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Position</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Club</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Price</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Rarity</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Eligible</th>
                      <th className="py-3 px-3 caption text-[var(--mm-text-muted)] font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {icons.map((p) => {
                      const isPending = toggleIconMut.isPending && toggleIconMut.variables === p.id
                      const isIcon = p.rarityTier === 'ICON'
                      return (
                        <tr key={p.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)]/30">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-xs font-bold text-[var(--mm-text-muted)]">
                                  {p.name.charAt(0)}
                                </div>
                              )}
                              <span className="body">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 caption text-[var(--mm-text-secondary)]">{p.tournamentId}</td>
                          <td className="py-3 px-3">
                            <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] font-medium ${
                              p.position === 'GK' ? 'bg-blue-500/10 text-blue-400' :
                              p.position === 'DEF' ? 'bg-green-500/10 text-green-400' :
                              p.position === 'MID' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-red-500/10 text-red-400'
                            }`}>{p.position}</span>
                          </td>
                          <td className="py-3 px-3 body text-[var(--mm-text-secondary)]">{p.club}</td>
                          <td className="py-3 px-3 body text-[var(--mm-accent-amber)]">${p.basePrice}</td>
                          <td className="py-3 px-3">
                            <span className="caption font-bold" style={{ color: (RARITY_COLORS as Record<string, string>)[p.rarityTier] || '#fff' }}>
                              {p.rarityTier}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {p.isEligibleForIcon ? (
                              <span className="caption bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] px-2 py-0.5 rounded-[var(--radius-sm)] font-medium">Yes</span>
                            ) : (
                              <span className="caption bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] px-2 py-0.5 rounded-[var(--radius-sm)]">No</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleIconToggle(p.id)}
                              disabled={isPending}
                              className={`flex items-center gap-1 px-3 py-1.5 caption font-semibold rounded-[var(--radius-sm)] transition-all ${
                                isPending ? 'opacity-50 cursor-not-allowed' :
                                p.isEligibleForIcon
                                  ? 'bg-[var(--mm-accent-red)]/10 text-[var(--mm-accent-red)] hover:bg-[var(--mm-accent-red)]/20'
                                  : 'bg-[var(--mm-accent-purple)]/10 text-[var(--mm-accent-purple)] hover:bg-[var(--mm-accent-purple)]/20'
                              }`}
                            >
                              {isPending ? (
                                <Loader size={12} className="animate-spin" />
                              ) : p.isEligibleForIcon ? (
                                <>Demote</>
                              ) : (
                                <>Promote</>
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [reportStatus, setReportStatus] = useState('pending')
  const [matchStatus, setMatchStatus] = useState('')
  const [editingMatch, setEditingMatch] = useState<{
    id: string
    homeScore: number | null
    awayScore: number | null
    status: string
  } | null>(null)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  // Escape key closes the user detail modal
  React.useEffect(() => {
    if (!detailUserId) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetailUserId(null) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [detailUserId])

  const { data: adminStatsData } = useAdminStats()
  const { data: adminUsersData, isLoading: usersLoading } = useAdminUsers()
  const { data: adminMatchesData, isLoading: matchesLoading } = useAdminMatches()
  const { data: adminReportsData, isLoading: reportsLoading } = useAdminReports()
  const { data: adminSettingsData } = useAdminSettings()
  const { data: activityLogData, isLoading: activityLoading } = useAdminActivityLog()

  const toggleProMut = useTogglePro()
  const deleteUserMut = useDeleteUser()
  const updateReportMut = useUpdateReport()
  const updateMatchMut = useUpdateMatch()
  const { data: userDetailData, isLoading: userDetailLoading } = useAdminUserDetail(detailUserId || undefined)

  const users = adminUsersData?.users || []
  const usersTotal = adminUsersData?.total || 0
  const usersTotalPages = adminUsersData?.totalPages || 0
  const matches = adminMatchesData?.matches || []
  const reports = adminReportsData?.reports || []
  const settings = adminSettingsData?.settings || []
  const logs = activityLogData?.logs || []

  const apiStats = adminStatsData ? [
    { label: 'Total Users', value: adminStatsData.totalUsers?.toLocaleString() || '0', icon: Users, change: `+${adminStatsData.newUsersThisWeek || 0}`, changeType: 'up', color: 'var(--mm-accent-green)' },
    { label: 'Monthly Active', value: adminStatsData.monthlyActive?.toLocaleString() || '0', icon: Activity, change: `+${adminStatsData.mauGrowth || 0}%`, changeType: 'up', color: 'var(--mm-accent-blue)' },
    { label: 'Predictions Today', value: adminStatsData.predictionsToday?.toLocaleString() || '0', icon: Trophy, change: `+${adminStatsData.predGrowth || 0}%`, changeType: 'up', color: 'var(--mm-accent-amber)' },
    { label: 'Pro Subscribers', value: adminStatsData.proCount?.toLocaleString() || '0', icon: TrendingUp, change: `+${adminStatsData.proGrowth || 0}%`, changeType: 'up', color: 'var(--mm-accent-purple)' },
    { label: 'Revenue MTD', value: adminStatsData.revenue ? `$${adminStatsData.revenue.toLocaleString()}` : '$0', icon: DollarSign, change: `+${adminStatsData.revGrowth || 0}%`, changeType: 'up', color: 'var(--mm-accent-green)' },
    { label: 'Error Rate', value: adminStatsData.errorRate ? `${adminStatsData.errorRate}%` : '0%', icon: AlertCircle, change: `-${adminStatsData.errorRateChange || 0}%`, changeType: 'down', color: 'var(--mm-accent-green)' },
  ] : kpiData

  return (
    <motion.div className="min-h-screen pt-16 pb-20">
      <Helmet><title>Admin Dashboard — MatchMind</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="heading-1 mb-6">Admin Dashboard</h1>

        {/* Admin tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)] overflow-x-auto">
          {adminTabs.map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-[var(--radius-sm)] body whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpiData.map((kpi, i) => {
                const Icon = kpi.icon
                return (
                  <motion.div key={i} variants={cardStaggerItem} initial="initial" animate="animate" className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={18} className="text-[var(--mm-text-muted)]" />
                      <span className={`caption font-medium ${kpi.changeType === 'up' ? 'text-[var(--mm-accent-green)]' : 'text-[var(--mm-accent-red)]'}`}>
                        {kpi.change}
                      </span>
                    </div>
                    <span className="heading-2" style={{ color: kpi.color }}>{kpi.value}</span>
                    <span className="caption text-[var(--mm-text-muted)] block">{kpi.label}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Signups Chart */}
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">New Signups (7 days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={signupData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="day" stroke="var(--mm-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--mm-text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--mm-bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--mm-text-primary)' }} />
                    <Bar dataKey="signups" fill="var(--mm-accent-green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sports Breakdown */}
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Prediction Sport Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={sportData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {sportData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--mm-bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {sportData.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="caption text-[var(--mm-text-muted)]">{s.name} {s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <h3 className="heading-3 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-[var(--mm-accent-amber)]" /> Alerts</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[var(--mm-accent-red)]/5 rounded-[var(--radius-md)] border border-[var(--border-error)]/30">
                  <span className="body text-[var(--mm-text-secondary)]"><span className="text-[var(--mm-accent-red)] font-semibold">12</span> unresolved reports</span>
                  <button className="caption text-[var(--mm-accent-green)] font-medium hover:underline">View →</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--mm-accent-amber)]/5 rounded-[var(--radius-md)] border border-[var(--mm-accent-amber)]/20">
                  <span className="body text-[var(--mm-text-secondary)]">📡 Score sync stable</span>
                  <span className="caption text-[var(--mm-accent-green)]">OK</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="heading-3">User Management <span className="caption text-[var(--mm-text-muted)]">({usersTotal} total)</span></h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
                <input
                  type="text" value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUserPage(1) }}
                  placeholder="Search users..." className="bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-9 pr-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none w-48"
                />
              </div>
            </div>
            {usersLoading ? (
              <div className="flex items-center justify-center py-12 text-[var(--mm-text-muted)]">
                <Loader size={20} className="animate-spin mr-2" /> Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-[var(--mm-text-muted)]">No users found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)]">
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Username</th>
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Email</th>
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Role</th>
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Tier</th>
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Pro</th>
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Joined</th>
                        <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)]/30">
                          <td className="py-3 px-2">
                            <button
                              onClick={() => setDetailUserId(u.id)}
                              className="text-left hover:text-[var(--mm-accent-green)] transition-colors"
                            >
                              <span className="body">{u.displayName || u.username}</span>
                              <span className="caption text-[var(--mm-text-muted)] ml-1">@{u.username}</span>
                            </button>
                          </td>
                          <td className="py-3 px-2 body text-[var(--mm-text-secondary)]">{u.email}</td>
                          <td className="py-3 px-2">
                            <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] ${
                              u.role === 'ADMIN' || u.role === 'SUPERADMIN'
                                ? 'bg-[var(--mm-accent-purple)]/10 text-[var(--mm-accent-purple)]'
                                : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]'
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-3 px-2 body">{u.tier}</td>
                          <td className="py-3 px-2">
                            {u.isPro
                              ? <span className="caption bg-[var(--gradient-pro)] text-transparent bg-clip-text font-semibold">Pro</span>
                              : <span className="caption text-[var(--mm-text-muted)]">—</span>}
                          </td>
                          <td className="py-3 px-2 body text-[var(--mm-text-secondary)]">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleProMut.mutate(u.id)}
                                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-purple)] hover:bg-[var(--mm-accent-purple)]/10 transition-all"
                                title={u.isPro ? 'Revoke Pro' : 'Grant Pro'}
                              >
                                <Crown size={14} />
                              </button>
                              <button
                                onClick={() => { if (confirm('Delete this user?')) deleteUserMut.mutate(u.id) }}
                                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-red)] hover:bg-[var(--mm-accent-red)]/10 transition-all"
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage <= 1}
                      className="px-3 py-1.5 caption rounded-[var(--radius-sm)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] disabled:opacity-40 hover:bg-[var(--mm-bg-hover)] transition-all"
                    >
                      Prev
                    </button>
                    <span className="caption text-[var(--mm-text-muted)]">
                      Page {userPage} of {usersTotalPages}
                    </span>
                    <button
                      onClick={() => setUserPage(p => Math.min(usersTotalPages, p + 1))}
                      disabled={userPage >= usersTotalPages}
                      className="px-3 py-1.5 caption rounded-[var(--radius-sm)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] disabled:opacity-40 hover:bg-[var(--mm-bg-hover)] transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading-3 flex items-center gap-2">
                <Flag size={18} className="text-[var(--mm-accent-red)]" />
                Reports
              </h3>
              <div className="flex gap-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] p-0.5">
                {['pending', 'resolved', 'dismissed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReportStatus(s)}
                    className={`px-3 py-1 caption rounded-[var(--radius-sm)] capitalize transition-all ${
                      reportStatus === s
                        ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                        : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {reportsLoading ? (
              <div className="flex items-center justify-center py-12 text-[var(--mm-text-muted)]">
                <Loader size={20} className="animate-spin mr-2" /> Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-[var(--mm-text-muted)]">No {reportStatus} reports</div>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)]/50 border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[var(--mm-accent-red)]/10 flex items-center justify-center">
                        <Flag size={14} className="text-[var(--mm-accent-red)]" />
                      </span>
                      <div>
                        <p className="body">
                          <span className="font-semibold">@{r.reporter?.username || 'unknown'}</span>
                          {r.message ? (
                            <> reported a message: <span className="text-[var(--mm-text-secondary)]">"{r.message.text?.slice(0, 60)}"</span></>
                          ) : (
                            <> submitted a report</>
                          )}
                        </p>
                        <span className="caption text-[var(--mm-text-muted)]">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateReportMut.mutate({ id: r.id, status: 'resolved' })}
                        className="px-3 py-1.5 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] caption font-semibold rounded-[var(--radius-sm)] hover:opacity-90 transition-all"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => updateReportMut.mutate({ id: r.id, status: 'dismissed' })}
                        className="px-3 py-1.5 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] caption font-semibold rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Matches Tab — with inline editing */}
        {activeTab === 'matches' && (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="heading-3">Match Management <span className="caption text-[var(--mm-text-muted)]">({adminMatchesData?.total || 0} total)</span></h3>
              <div className="flex gap-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] p-0.5">
                {['', 'SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED'].map((s) => (
                  <button
                    key={s || 'all'}
                    onClick={() => { setMatchStatus(s); setEditingMatch(null) }}
                    className={`px-3 py-1 caption rounded-[var(--radius-sm)] capitalize transition-all ${
                      matchStatus === s
                        ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                        : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
                    }`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>
            {matchesLoading ? (
              <div className="flex items-center justify-center py-12 text-[var(--mm-text-muted)]">
                <Loader size={20} className="animate-spin mr-2" /> Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 text-[var(--mm-text-muted)]">No matches found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Match</th>
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Competition</th>
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Score</th>
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Status</th>
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Predictions</th>
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Date</th>
                      <th className="py-3 px-2 caption text-[var(--mm-text-muted)] font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => {
                      const isEditing = editingMatch?.id === m.id
                      return (
                        <tr key={m.id} className={`border-b border-[var(--border-subtle)] last:border-0 transition-colors ${
                          isEditing ? 'bg-[var(--mm-accent-green)]/5' : 'hover:bg-[var(--mm-bg-hover)]/30'
                        }`}>
                          <td className="py-3 px-2 body">
                            {m.homeTeamName} vs {m.awayTeamName}
                          </td>
                          <td className="py-3 px-2 body text-[var(--mm-text-secondary)] max-w-[120px] truncate">{m.competition || '—'}</td>
                          {/* Inline-editable Score */}
                          <td className="py-3 px-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number" min="0" max="99"
                                  className="w-10 h-8 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body text-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  value={editingMatch!.homeScore ?? ''}
                                  onChange={(e) => setEditingMatch({ ...editingMatch!, homeScore: e.target.value === '' ? null : Number(e.target.value) })}
                                  placeholder="—"
                                />
                                <span className="text-[var(--mm-text-muted)]">—</span>
                                <input
                                  type="number" min="0" max="99"
                                  className="w-10 h-8 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body text-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  value={editingMatch!.awayScore ?? ''}
                                  onChange={(e) => setEditingMatch({ ...editingMatch!, awayScore: e.target.value === '' ? null : Number(e.target.value) })}
                                  placeholder="—"
                                />
                              </div>
                            ) : (
                              <span className="body">
                                {m.homeScore != null || m.awayScore != null
                                  ? `${m.homeScore ?? '?'} — ${m.awayScore ?? '?'}`
                                  : '—'}
                              </span>
                            )}
                          </td>
                          {/* Inline-editable Status */}
                          <td className="py-3 px-2">
                            {isEditing ? (
                              <select
                                className="bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-sm)] border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none px-2 py-1.5"
                                value={editingMatch!.status}
                                onChange={(e) => setEditingMatch({ ...editingMatch!, status: e.target.value })}
                              >
                                {['SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED'].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] font-medium ${
                                m.status === 'LIVE' ? 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)]' :
                                m.status === 'FINISHED' ? 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]' :
                                m.status === 'HALFTIME' ? 'bg-[var(--mm-accent-amber)]/10 text-[var(--mm-accent-amber)]' :
                                'bg-[var(--mm-accent-blue)]/10 text-[var(--mm-accent-blue)]'
                              }`}>{m.status}</span>
                            )}
                          </td>
                          <td className="py-3 px-2 body text-[var(--mm-text-secondary)]">{m._count?.predictions ?? 0}</td>
                          <td className="py-3 px-2 body text-[var(--mm-text-secondary)] whitespace-nowrap">
                            {new Date(m.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    disabled={updateMatchMut.isPending}
                                    onClick={() => {
                                      updateMatchMut.mutate({
                                        id: m.id,
                                        homeScore: editingMatch!.homeScore,
                                        awayScore: editingMatch!.awayScore,
                                        status: editingMatch!.status,
                                      })
                                      setEditingMatch(null)
                                    }}
                                    className={`p-1.5 rounded-[var(--radius-sm)] transition-all ${
                                      updateMatchMut.isPending
                                        ? 'text-[var(--mm-text-muted)] cursor-not-allowed'
                                        : 'text-[var(--mm-accent-green)] hover:bg-[var(--mm-accent-green)]/10'
                                    }`}
                                    title="Save changes"
                                  >
                                    <Save size={14} className={updateMatchMut.isPending ? 'animate-spin' : ''} />
                                  </button>
                                  <button
                                    onClick={() => setEditingMatch(null)}
                                    className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-accent-red)] hover:bg-[var(--mm-accent-red)]/10 transition-all"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setEditingMatch({
                                    id: m.id,
                                    homeScore: m.homeScore,
                                    awayScore: m.awayScore,
                                    status: m.status,
                                  })}
                                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-blue)] hover:bg-[var(--mm-accent-blue)]/10 transition-all"
                                  title="Edit match"
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <h3 className="heading-3 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[var(--mm-accent-green)]" />
              Activity Log
              <span className="caption text-[var(--mm-text-muted)] font-normal">({activityLogData?.total || 0} entries)</span>
            </h3>
            {activityLoading ? (
              <div className="flex items-center justify-center py-12 text-[var(--mm-text-muted)]">
                <Loader size={20} className="animate-spin mr-2" /> Loading activity log...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-[var(--mm-text-muted)]">
                <Activity size={32} className="mx-auto mb-2 opacity-30" />
                <p className="body">No admin activity yet</p>
                <p className="caption mt-1">Actions like deleting users, toggling Pro, and resolving reports will appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log) => {
                  const actionConfig: Record<string, { icon: typeof Activity; color: string; bg: string; label: string }> = {
                    USER_DELETED: { icon: UserX, color: 'text-[var(--mm-accent-red)]', bg: 'bg-[var(--mm-accent-red)]/10', label: 'User Deleted' },
                    PRO_TOGGLED: { icon: Repeat, color: 'text-[var(--mm-accent-purple)]', bg: 'bg-[var(--mm-accent-purple)]/10', label: 'Pro Toggled' },
                    REPORT_RESOLVED: { icon: CheckCheck, color: 'text-[var(--mm-accent-green)]', bg: 'bg-[var(--mm-accent-green)]/10', label: 'Report Resolved' },
                    REPORT_DISMISSED: { icon: X, color: 'text-[var(--mm-text-muted)]', bg: 'bg-[var(--mm-bg-tertiary)]', label: 'Report Dismissed' },
                    MATCH_UPDATED: { icon: Edit3, color: 'text-[var(--mm-accent-blue)]', bg: 'bg-[var(--mm-accent-blue)]/10', label: 'Match Updated' },
                  }
                  const config = actionConfig[log.action] || { icon: Activity, color: 'text-[var(--mm-text-muted)]', bg: 'bg-[var(--mm-bg-tertiary)]', label: log.action }
                  const Icon = config.icon
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)]/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="body font-medium">{config.label}</span>
                        {log.targetId && (
                          <span className="caption text-[var(--mm-text-muted)] ml-1">
                            · {log.targetType}: {log.targetId.slice(0, 8)}...
                          </span>
                        )}
                        {log.detail && (
                          <span className="caption text-[var(--mm-text-muted)] block truncate">
                            {JSON.stringify(log.detail).slice(0, 80)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="caption text-[var(--mm-text-muted)] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <span className="p-1 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">
                          <Clock size={12} />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <h3 className="heading-3 mb-4 flex items-center gap-2"><Settings size={18} /> Feature Flags</h3>
            {settings.length === 0 ? (
              <div className="text-center py-8 text-[var(--mm-text-muted)]">No feature flags loaded</div>
            ) : (
              <div className="space-y-3">
                {settings.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)]">
                    <div>
                      <span className="body font-medium">{f.flag || f.key}</span>
                      <span className="caption text-[var(--mm-text-muted)] ml-2">{f.key}</span>
                    </div>
                    <button
                      className={`relative w-11 h-6 rounded-full transition-colors ${f.enabled ? 'bg-[var(--mm-accent-green)]' : 'bg-[var(--mm-bg-tertiary)]'}`}
                      role="switch" aria-checked={f.enabled}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-5.5 left-[2px]' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Draft Mode Tab */}
        {activeTab === 'draft' && <AdminDraftModeTab />}
      </div>

      {/* User Detail Modal */}
      {detailUserId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="User details"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 pb-8 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailUserId(null) }}
        >
          <div className="absolute inset-0 bg-[var(--mm-bg-overlay)] backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-2xl bg-[var(--mm-bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] max-h-[calc(100vh-8rem)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center text-[var(--mm-text-inverse)] font-bold">
                  {userDetailData?.user?.displayName?.charAt(0) || userDetailData?.user?.username?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="heading-3">{userDetailData?.user?.displayName || userDetailData?.user?.username || 'Loading...'}</h3>
                  <span className="caption text-[var(--mm-text-muted)]">@{userDetailData?.user?.username}</span>
                </div>
              </div>
              <button
                onClick={() => setDetailUserId(null)}
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)] hover:text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {userDetailLoading ? (
              <div className="flex items-center justify-center py-16 text-[var(--mm-text-muted)]">
                <Loader size={24} className="animate-spin mr-2" /> Loading user details...
              </div>
            ) : userDetailData?.user ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 border-b border-[var(--border-subtle)]">
                  {[
                    { icon: Target, label: 'Predictions', value: userDetailData.user._count?.predictions ?? 0 },
                    { icon: Users2, label: 'Followers', value: userDetailData.user._count?.followers ?? 0 },
                    { icon: Eye, label: 'Following', value: userDetailData.user._count?.following ?? 0 },
                    { icon: Shield, label: 'Leagues', value: userDetailData.user._count?.leagues ?? 0 },
                    { icon: Users, label: 'Squads', value: userDetailData.user._count?.squads ?? 0 },
                    { icon: Calendar, label: 'Joined', value: new Date(userDetailData.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                  ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                      <div key={i} className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                        <Icon size={16} className="mx-auto mb-1 text-[var(--mm-text-muted)]" />
                        <span className="block font-bold font-[var(--font-display)] text-lg text-[var(--mm-accent-green)]">{stat.value}</span>
                        <span className="caption text-[var(--mm-text-muted)]">{stat.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Info Fields */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Email</span>
                      <span className="body">{userDetailData.user.email || '—'}</span>
                    </div>
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Role</span>
                      <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] ${
                        userDetailData.user.role === 'ADMIN' || userDetailData.user.role === 'SUPERADMIN'
                          ? 'bg-[var(--mm-accent-purple)]/10 text-[var(--mm-accent-purple)]'
                          : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]'
                      }`}>{userDetailData.user.role}</span>
                    </div>
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Tier</span>
                      <span className="body">{userDetailData.user.tier || '—'}</span>
                    </div>
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Pro Status</span>
                      {userDetailData.user.isPro ? (
                        <span className="caption bg-[var(--gradient-pro)] text-transparent bg-clip-text font-semibold">
                          Pro {userDetailData.user.subscription?.status ? `· ${userDetailData.user.subscription.status}` : ''}
                        </span>
                      ) : (
                        <span className="body text-[var(--mm-text-muted)]">Free</span>
                      )}
                    </div>
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Total Points</span>
                      <span className="body text-[var(--mm-accent-amber)]">🪙 {(userDetailData.user.totalPoints || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Prediction Accuracy</span>
                      <span className="body text-[var(--mm-accent-green)]">🎯 {userDetailData.user.predAccuracy || 0}%</span>
                    </div>
                    <div>
                      <span className="caption text-[var(--mm-text-muted)] block mb-0.5">Last Active</span>
                      <span className="body">
                        {userDetailData.user.lastActiveAt
                          ? new Date(userDetailData.user.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                {userDetailData.user.subscription && (
                  <div className="px-5 pb-5">
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4 border border-[var(--border-subtle)]">
                      <h4 className="body font-semibold mb-2 flex items-center gap-2">
                        <DollarSign size={14} className="text-[var(--mm-accent-purple)]" />
                        Subscription
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="caption text-[var(--mm-text-muted)] block">Plan</span>
                          <span className="body capitalize">{userDetailData.user.subscription.planId || '—'}</span>
                        </div>
                        <div>
                          <span className="caption text-[var(--mm-text-muted)] block">Status</span>
                          <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] font-medium ${
                            userDetailData.user.subscription.status === 'ACTIVE'
                              ? 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)]'
                              : 'bg-[var(--mm-accent-amber)]/10 text-[var(--mm-accent-amber)]'
                          }`}>{userDetailData.user.subscription.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 px-5 pb-5">
                  <button
                    onClick={() => toggleProMut.mutate(userDetailData.user.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] body font-medium rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] hover:text-[var(--mm-accent-purple)] transition-all"
                  >
                    <Crown size={14} />
                    {userDetailData.user.isPro ? 'Revoke Pro' : 'Grant Pro'}
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this user?')) { deleteUserMut.mutate(userDetailData.user.id); setDetailUserId(null) } }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[var(--mm-bg-tertiary)] text-[var(--mm-accent-red)] body font-medium rounded-[var(--radius-md)] hover:bg-[var(--mm-accent-red)]/10 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete User
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-[var(--mm-text-muted)]">
                <p className="body">Failed to load user details</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
