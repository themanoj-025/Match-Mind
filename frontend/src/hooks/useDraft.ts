/**
 * useDraft — React Query hooks for Draft Mode (§1, §2)
 *
 * All draft API endpoints wrapped in typed hooks following the
 * same pattern as useApi.ts (authed fetch, credential inclusion, etc.).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJSON, authedHeaders, keys as baseKeys } from './useApi'
import type {
  DraftSession,
  DraftPick,
  Player,
  Formation,
  FormationName,
  DraftTicketInfo,
  DraftRunResult,
  DraftRunRoundEntry,
  DraftRunState,
} from '../lib/types'

// ─── Extended Query Keys ────────────────────────────────

export const draftKeys = {
  all: (): readonly string[] => ['draft'] as const,
  sessions: (): readonly string[] => ['draft', 'sessions'] as const,
  session: (id?: string): readonly string[] => ['draft', 'sessions', id ?? ''] as const,
  formations: (): readonly string[] => ['draft', 'formations'] as const,
  nextRound: (id?: string): readonly string[] => ['draft', 'sessions', id ?? '', 'next-round'] as const,
  tickets: (tournamentId?: string): readonly string[] =>
    tournamentId ? (['draft', 'tickets', tournamentId] as const) : (['draft', 'tickets'] as const),
  runStatus: (sessionId?: string): readonly string[] =>
    ['draft', 'runs', sessionId ?? '', 'status'] as const,
}

// ─── Formation Types (matching API) ─────────────────────

interface SlotDef {
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  count: number
}

interface FormationFromApi {
  id: string
  name: string
  slots: SlotDef[]
  benchSlots: number
}

// ─── Draft Start ─────────────────────────────────────────

const HEADERS = () => authedHeaders()

interface StartDraftResult {
  session: DraftSession
  nextRound: {
    slotIndex: number
    position: string
    playerIds: string[]
    players: Array<{
      id: string
      name: string
      position: string
      club: string
      nationality: string
      basePrice: number
      rarityTier: string
      photoUrl?: string
    }>
    expiresAt: string
  }
}

export function useStartDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { tournamentId: string; formation: string }) =>
      fetchJSON<StartDraftResult>('/api/draft/start', {
        method: 'POST',
        headers: HEADERS(),
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: draftKeys.sessions() })
      qc.invalidateQueries({ queryKey: draftKeys.tickets() })
      if (result?.session?.id) {
        qc.setQueryData(draftKeys.session(result.session.id), result.session)
      }
    },
  })
}

// ─── List Formations ────────────────────────────────────

export function useFormations() {
  return useQuery<FormationFromApi[]>({
    queryKey: draftKeys.formations(),
    queryFn: () => fetchJSON<FormationFromApi[]>('/api/draft/formations'),
    staleTime: 600000, // formations rarely change
  })
}

// ─── My Draft Sessions ──────────────────────────────────

export function useMyDraftSessions() {
  return useQuery<DraftSession[]>({
    queryKey: draftKeys.sessions(),
    queryFn: () => fetchJSON<DraftSession[]>('/api/draft/mine', { headers: HEADERS() }),
    staleTime: 15000,
  })
}

// ─── Get Session State ──────────────────────────────────

interface SessionStateResponse {
  session: DraftSession
  picks: DraftPick[]
  squad: Array<{
    playerId: string
    position: string
    slotIndex: number
    isAutoPicked: boolean
    rarityTier: string
    player: Player | null
  }>
}

export function useDraftSession(sessionId?: string) {
  return useQuery<SessionStateResponse>({
    queryKey: draftKeys.session(sessionId),
    queryFn: () => fetchJSON<SessionStateResponse>(`/api/draft/${sessionId}`, { headers: HEADERS() }),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      return data.session.status === 'DRAFTING' ? 5000 : false
    },
    staleTime: 5000,
  })
}

// ─── Get Next Round ─────────────────────────────────────

interface NextRoundResponse {
  round: {
    slotIndex: number
    position: string
    playerIds: string[]
    players: Array<{
      id: string
      name: string
      position: string
      club: string
      nationality: string
      basePrice: number
      rarityTier: string
      photoUrl?: string
    }>
    expiresAt: string
  } | null
  session: DraftSession
  complete: boolean
}

export function useNextRound(sessionId?: string) {
  return useQuery<NextRoundResponse>({
    queryKey: draftKeys.nextRound(sessionId),
    queryFn: () => fetchJSON<NextRoundResponse>(`/api/draft/${sessionId}/next-round`, { headers: HEADERS() }),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.complete || (!data.round && data.session.status !== 'DRAFTING')) return false
      return 3000
    },
    staleTime: 0,
  })
}

// ─── Make a Pick ────────────────────────────────────────

interface PickResult {
  success: boolean
  nextRound: NextRoundResponse['round']
  session: DraftSession
  complete: boolean
}

export function useMakePick() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      sessionId,
      slotIndex,
      pickedPlayerId,
    }: {
      sessionId: string
      slotIndex: number
      pickedPlayerId: string
    }) =>
      fetchJSON<PickResult>(`/api/draft/${sessionId}/pick`, {
        method: 'POST',
        headers: HEADERS(),
        body: JSON.stringify({ slotIndex, pickedPlayerId }),
      }),
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: draftKeys.session(vars.sessionId) })
      qc.invalidateQueries({ queryKey: draftKeys.nextRound(vars.sessionId) })
      if (result.complete) {
        qc.invalidateQueries({ queryKey: draftKeys.sessions() })
      }
    },
  })
}

// ─── Commit Squad ───────────────────────────────────────

interface CommitResult {
  success: boolean
  session: DraftSession
  synergyScore: number
  formationBonus: number
  squad: Array<{ playerId: string; position: string; slotIndex: number; isAutoPicked: boolean; rarityTier: string }>
}

export function useCommitSquad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      fetchJSON<CommitResult>(`/api/draft/${sessionId}/commit`, {
        method: 'POST',
        headers: HEADERS(),
      }),
    onSuccess: (_data, sessionId) => {
      qc.invalidateQueries({ queryKey: draftKeys.session(sessionId) })
      qc.invalidateQueries({ queryKey: draftKeys.sessions() })
    },
  })
}

// ─── Ticket Balance ─────────────────────────────────────

export function useDraftTickets(tournamentId?: string) {
  const params = tournamentId ? `?tournamentId=${tournamentId}` : ''
  return useQuery<DraftTicketInfo | DraftTicketInfo[]>({
    queryKey: draftKeys.tickets(tournamentId),
    queryFn: () => fetchJSON(`/api/draft/tickets${params}`, { headers: HEADERS() }),
    staleTime: 10000,
  })
}

// ─── Enter Draft Run ────────────────────────────────────

interface EnterRunResult {
  success: boolean
  result: DraftRunResult
}

export function useEnterRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      fetchJSON<EnterRunResult>(`/api/draft/${sessionId}/enter-run`, {
        method: 'POST',
        headers: HEADERS(),
      }),
    onSuccess: (_data, sessionId) => {
      qc.invalidateQueries({ queryKey: draftKeys.runStatus(sessionId) })
      qc.invalidateQueries({ queryKey: draftKeys.session(sessionId) })
    },
  })
}

// ─── Get Run Status ─────────────────────────────────────

export function useRunStatus(sessionId?: string) {
  return useQuery<DraftRunState>({
    queryKey: draftKeys.runStatus(sessionId),
    queryFn: () => fetchJSON<DraftRunState>(`/api/draft/${sessionId}/run-status`, { headers: HEADERS() }),
    enabled: !!sessionId,
    refetchInterval: 30000,
    staleTime: 10000,
  })
}

// ─── Resolve Next Matchday ──────────────────────────────

interface ResolveMatchdayResult {
  success: boolean
  round: DraftRunRoundEntry
  state: DraftRunState
}

export function useResolveMatchday() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) =>
      fetchJSON<ResolveMatchdayResult>(`/api/draft/${sessionId}/resolve-matchday`, {
        method: 'POST',
        headers: HEADERS(),
      }),
    onSuccess: (_data, sessionId) => {
      qc.invalidateQueries({ queryKey: draftKeys.runStatus(sessionId) })
    },
  })
}
