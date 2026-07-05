/**
 * patchDraftPool.ts — Adds targeted players to close remaining validation gaps.
 *
 * Run AFTER seedDraftPlayers.ts, then re-run computeRarityTiers.ts.
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'src', 'data')
const PLAYERS_PATH = path.join(DATA_DIR, 'players.json')

function main() {
  const data = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'))
  const existing = new Set(data.map((p: any) => p.id))

  let idCounter = data.length + 1
  function addRecord(tournamentId: string, name: string, club: string, nationality: string, position: 'GK' | 'DEF' | 'MID' | 'FWD', basePrice: number) {
    const id = `patch-${idCounter++}`
    if (!existing.has(id)) {
      data.push({ id, tournamentId, name, club, nationality, position, basePrice })
      existing.add(id)
    }
  }

  // ── WC: Add 10 more DEFs at price 46-52 to push GOLD/DEF to 8 ──
  addRecord('fifa-wc-2026', 'Jarrad Branthwaite', 'Everton', 'GB', 'DEF', 52)
  addRecord('fifa-wc-2026', 'Ousmane Diomande', 'Sporting CP', 'CI', 'DEF', 52)
  addRecord('fifa-wc-2026', 'Gonçalo Inácio', 'Sporting CP', 'PT', 'DEF', 50)
  addRecord('fifa-wc-2026', 'Trevoh Chalobah', 'Chelsea', 'GB', 'DEF', 50)
  addRecord('fifa-wc-2026', 'Maxence Lacroix', 'Crystal Palace', 'FR', 'DEF', 50)
  addRecord('fifa-wc-2026', 'Lucas Beraldo', 'Paris Saint-Germain', 'BR', 'DEF', 48)
  addRecord('fifa-wc-2026', 'Jan Paul van Hecke', 'Brighton', 'GB', 'DEF', 48)
  addRecord('fifa-wc-2026', 'Cristian Romero', 'Tottenham', 'AR', 'DEF', 48)
  addRecord('fifa-wc-2026', 'Aymeric Laporte', 'Al Nassr', 'ES', 'DEF', 46)
  addRecord('fifa-wc-2026', 'Nico Tagliafico', 'Lyon', 'AR', 'DEF', 46)

  // ── WC: Add 3 more FWDs at price 46-52 ──
  addRecord('fifa-wc-2026', 'Mikkel Damsgaard', 'Brentford', 'DK', 'FWD', 50)
  addRecord('fifa-wc-2026', 'Ansu Fati', 'Barcelona', 'ES', 'FWD', 48)
  addRecord('fifa-wc-2026', 'Fábio Carvalho', 'Brentford', 'PT', 'FWD', 46)

  // ── WC: Add 4 more GKs at price 28-38 ──
  addRecord('fifa-wc-2026', 'Anatoliy Trubin', 'Benfica', 'UA', 'GK', 38)
  addRecord('fifa-wc-2026', 'Kevin Trapp', 'Eintracht Frankfurt', 'DE', 'GK', 34)
  addRecord('fifa-wc-2026', 'Robin Zentner', 'Mainz', 'DE', 'GK', 32)
  addRecord('fifa-wc-2026', 'Jesper Lindstrøm', 'Napoli', 'DK', 'GK', 28)

  // ── UCL: Add 10 more DEFs at price 46-52 ──
  addRecord('uefa-ucl-2026-27', 'Jarrad Branthwaite', 'Everton', 'GB', 'DEF', 52)
  addRecord('uefa-ucl-2026-27', 'Ousmane Diomande', 'Sporting CP', 'CI', 'DEF', 52)
  addRecord('uefa-ucl-2026-27', 'Gonçalo Inácio', 'Sporting CP', 'PT', 'DEF', 50)
  addRecord('uefa-ucl-2026-27', 'Trevoh Chalobah', 'Chelsea', 'GB', 'DEF', 50)
  addRecord('uefa-ucl-2026-27', 'Maxence Lacroix', 'Crystal Palace', 'FR', 'DEF', 50)
  addRecord('uefa-ucl-2026-27', 'Lucas Beraldo', 'Paris Saint-Germain', 'BR', 'DEF', 48)
  addRecord('uefa-ucl-2026-27', 'Jan Paul van Hecke', 'Brighton', 'GB', 'DEF', 48)
  addRecord('uefa-ucl-2026-27', 'Cristian Romero', 'Tottenham', 'AR', 'DEF', 48)
  addRecord('uefa-ucl-2026-27', 'Aymeric Laporte', 'Al Nassr', 'ES', 'DEF', 46)
  addRecord('uefa-ucl-2026-27', 'Nico Tagliafico', 'Lyon', 'AR', 'DEF', 46)

  // ── UCL: Add 4 more FWDs at price 46-52 ──
  addRecord('uefa-ucl-2026-27', 'Mikkel Damsgaard', 'Brentford', 'DK', 'FWD', 50)
  addRecord('uefa-ucl-2026-27', 'Ansu Fati', 'Barcelona', 'ES', 'FWD', 50)
  addRecord('uefa-ucl-2026-27', 'Fábio Carvalho', 'Brentford', 'PT', 'FWD', 48)
  addRecord('uefa-ucl-2026-27', 'Amad Diallo', 'Manchester United', 'CI', 'FWD', 46)

  // ── UCL: Add 4 more GKs at price 28-38 ──
  addRecord('uefa-ucl-2026-27', 'Anatoliy Trubin', 'Benfica', 'UA', 'GK', 38)
  addRecord('uefa-ucl-2026-27', 'Kevin Trapp', 'Eintracht Frankfurt', 'DE', 'GK', 34)
  addRecord('uefa-ucl-2026-27', 'Robin Zentner', 'Mainz', 'DE', 'GK', 32)
  addRecord('uefa-ucl-2026-27', 'Jesper Lindstrøm', 'Napoli', 'DK', 'GK', 28)

  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(data, null, 2), 'utf-8')

  for (const tid of ['fifa-wc-2026', 'uefa-ucl-2026-27']) {
    const tPlayers = data.filter((p: any) => p.tournamentId === tid)
    console.log(`  ${tid}: ${tPlayers.length} players total`)
  }

  console.log(`\n✅ Targeted players added to players.json`)
  console.log('   Run computeRarityTiers.ts next to assign rarity tiers.')
}

main()
