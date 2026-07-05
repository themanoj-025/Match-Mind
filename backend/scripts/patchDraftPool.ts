/**
 * patchDraftPool.ts — Adds targeted players to close remaining validation gaps.
 *
 * Reads players.json, adds the minimum number of players at precise price points
 * to ensure every position×rarity combo meets the 8-player minimum.
 *
 * Run AFTER seedDraftPlayers.ts and computeRarityTiers.ts, then re-run compute.
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'src', 'data')
const PLAYERS_PATH = path.join(DATA_DIR, 'players.json')

interface Player {
  id: string
  tournamentId: string
  name: string
  club: string
  nationality: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  basePrice: number
  isEligibleForIcon?: boolean
}

// ─── Targeted additions ──────────────────────────

const PATCHES: Player[] = [
  // ── WC: GOLD/DEF (need 5 more at price 46+) ──
  { id: 'patch-1', tournamentId: 'fifa-wc-2026', name: 'Trevoh Chalobah', club: 'Chelsea', nationality: 'GB', position: 'DEF', basePrice: 48 },
  { id: 'patch-2', tournamentId: 'fifa-wc-2026', name: 'Maxence Lacroix', club: 'Crystal Palace', nationality: 'FR', position: 'DEF', basePrice: 48 },
  { id: 'patch-3', tournamentId: 'fifa-wc-2026', name: 'Ousmane Diomande', club: 'Sporting CP', nationality: 'CI', position: 'DEF', basePrice: 50 },
  { id: 'patch-4', tournamentId: 'fifa-wc-2026', name: 'Gonçalo Inácio', club: 'Sporting CP', nationality: 'PT', position: 'DEF', basePrice: 50 },
  { id: 'patch-5', tournamentId: 'fifa-wc-2026', name: 'Lucas Beraldo', club: 'Paris Saint-Germain', nationality: 'BR', position: 'DEF', basePrice: 48 },

  // ── WC: GOLD/FWD (need 1 more at price 46+) ──
  { id: 'patch-6', tournamentId: 'fifa-wc-2026', name: 'Mikkel Damsgaard', club: 'Brentford', nationality: 'DK', position: 'FWD', basePrice: 48 },

  // ── WC: SILVER/GK (need 2 more at price 28-38) ──
  { id: 'patch-7', tournamentId: 'fifa-wc-2026', name: 'Anatoliy Trubin', club: 'Benfica', nationality: 'UA', position: 'GK', basePrice: 34 },
  { id: 'patch-8', tournamentId: 'fifa-wc-2026', name: 'Michał Karbownik', club: 'PAOK', nationality: 'PL', position: 'GK', basePrice: 32 },

  // ── UCL: GOLD/DEF (need 4 more at price 46+) ──
  { id: 'patch-9', tournamentId: 'uefa-ucl-2026-27', name: 'Trevoh Chalobah', club: 'Chelsea', nationality: 'GB', position: 'DEF', basePrice: 50 },
  { id: 'patch-10', tournamentId: 'uefa-ucl-2026-27', name: 'Maxence Lacroix', club: 'Crystal Palace', nationality: 'FR', position: 'DEF', basePrice: 48 },
  { id: 'patch-11', tournamentId: 'uefa-ucl-2026-27', name: 'Gonçalo Inácio', club: 'Sporting CP', nationality: 'PT', position: 'DEF', basePrice: 50 },
  { id: 'patch-12', tournamentId: 'uefa-ucl-2026-27', name: 'Ousmane Diomande', club: 'Sporting CP', nationality: 'CI', position: 'DEF', basePrice: 50 },

  // ── UCL: GOLD/FWD (need 3 more at price 46+) ──
  { id: 'patch-13', tournamentId: 'uefa-ucl-2026-27', name: 'Mikkel Damsgaard', club: 'Brentford', nationality: 'DK', position: 'FWD', basePrice: 48 },
  { id: 'patch-14', tournamentId: 'uefa-ucl-2026-27', name: 'Ansu Fati', club: 'Barcelona', nationality: 'ES', position: 'FWD', basePrice: 50 },
  { id: 'patch-15', tournamentId: 'uefa-ucl-2026-27', name: 'Fábio Carvalho', club: 'Brentford', nationality: 'PT', position: 'FWD', basePrice: 46 },

  // ── UCL: SILVER/GK (need 4 more at price 28-38) ──
  { id: 'patch-16', tournamentId: 'uefa-ucl-2026-27', name: 'Anatoliy Trubin', club: 'Benfica', nationality: 'UA', position: 'GK', basePrice: 36 },
  { id: 'patch-17', tournamentId: 'uefa-ucl-2026-27', name: 'Robin Zentner', club: 'Mainz', nationality: 'DE', position: 'GK', basePrice: 32 },
  { id: 'patch-18', tournamentId: 'uefa-ucl-2026-27', name: 'Kevin Trapp', club: 'Eintracht Frankfurt', nationality: 'DE', position: 'GK', basePrice: 30 },
  { id: 'patch-19', tournamentId: 'uefa-ucl-2026-27', name: 'Jesper Lindstrøm', club: 'Napoli', nationality: 'DK', position: 'GK', basePrice: 28 },
]

function main() {
  const data = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'))
  const existing = new Set(data.map((p: Player) => p.id))

  // Filter out any patch IDs already present
  const toAdd = PATCHES.filter(p => !existing.has(p.id))

  if (toAdd.length === 0) {
    console.log('✅ All patch players already present. No changes needed.')
    return
  }

  data.push(...toAdd)
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(data, null, 2), 'utf-8')

  // Count by tournament
  for (const tid of ['fifa-wc-2026', 'uefa-ucl-2026-27']) {
    const tPlayers = data.filter((p: Player) => p.tournamentId === tid)
    console.log(`  ${tid}: ${tPlayers.length} players total`)
  }

  console.log(`\n✅ ${toAdd.length} targeted players added to players.json`)
  console.log('   Run computeRarityTiers.ts next to assign rarity tiers.')
}

main()
