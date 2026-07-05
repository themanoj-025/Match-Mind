/**
 * seedDraftPlayers.ts — AuctionXI v4 §6.5
 *
 * Generates comprehensive seed player data for both LIVE tournaments
 * (fifa-wc-2026 and uefa-ucl-2026-27) to ensure the Draft Mode
 * seeding gate passes (§6.3).
 *
 * Creates ~160 players per tournament with realistic name, club,
 * nationality, position, and basePrice distributions so rarity tiers
 * are populated correctly.
 *
 * Usage:
 *   npx tsx scripts/seedDraftPlayers.ts
 *
 * This REPLACES the existing players.json with the complete seed data.
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'src', 'data')

// ─── Player Templates ────────────────────────────────────

interface PlayerTemplate {
  name: string
  club: string
  nationality: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  basePrice: number
  isEligibleForIcon?: boolean
}

// FIFA World Cup 2026 — 48 teams, ~160 players
const WC_PLAYERS: PlayerTemplate[] = [
  // ── GK (24) ──
  { name: 'Thibaut Courtois', club: 'Real Madrid', nationality: 'BE', position: 'GK', basePrice: 72 },
  { name: 'Alisson Becker', club: 'Liverpool', nationality: 'BR', position: 'GK', basePrice: 68 },
  { name: 'Ederson', club: 'Manchester City', nationality: 'BR', position: 'GK', basePrice: 62 },
  { name: 'Mike Maignan', club: 'AC Milan', nationality: 'FR', position: 'GK', basePrice: 60 },
  { name: 'Gianluigi Donnarumma', club: 'Paris Saint-Germain', nationality: 'IT', position: 'GK', basePrice: 58 },
  { name: 'Marc-André ter Stegen', club: 'Barcelona', nationality: 'DE', position: 'GK', basePrice: 56 },
  { name: 'Jan Oblak', club: 'Atlético Madrid', nationality: 'SI', position: 'GK', basePrice: 54 },
  { name: 'Emiliano Martínez', club: 'Aston Villa', nationality: 'AR', position: 'GK', basePrice: 52 },
  { name: 'Manuel Neuer', club: 'Bayern Munich', nationality: 'DE', position: 'GK', basePrice: 48 },
  { name: 'David Raya', club: 'Arsenal', nationality: 'ES', position: 'GK', basePrice: 46 },
  { name: 'Gregor Kobel', club: 'Borussia Dortmund', nationality: 'CH', position: 'GK', basePrice: 42 },
  { name: 'Diogo Costa', club: 'FC Porto', nationality: 'PT', position: 'GK', basePrice: 40 },
  { name: 'André Onana', club: 'Manchester United', nationality: 'CM', position: 'GK', basePrice: 38 },
  { name: 'Unai Simón', club: 'Athletic Bilbao', nationality: 'ES', position: 'GK', basePrice: 36 },
  { name: 'Jordan Pickford', club: 'Everton', nationality: 'GB', position: 'GK', basePrice: 34 },
  { name: 'Giorgi Mamardashvili', club: 'Valencia', nationality: 'GE', position: 'GK', basePrice: 32 },
  { name: 'Yassine Bounou', club: 'Al Hilal', nationality: 'MA', position: 'GK', basePrice: 30 },
  { name: 'Alex Remiro', club: 'Real Sociedad', nationality: 'ES', position: 'GK', basePrice: 28 },
  { name: 'Lunin Andriy', club: 'Real Madrid', nationality: 'UA', position: 'GK', basePrice: 26 },
  { name: 'Robert Sánchez', club: 'Chelsea', nationality: 'ES', position: 'GK', basePrice: 24 },
  { name: 'Alphonse Areola', club: 'West Ham', nationality: 'FR', position: 'GK', basePrice: 20 },
  { name: 'Mark Flekken', club: 'Brentford', nationality: 'NL', position: 'GK', basePrice: 16 },
  { name: 'Koen Casteels', club: 'Al Qadsiah', nationality: 'BE', position: 'GK', basePrice: 14 },
  { name: 'Mathew Ryan', club: 'AZ Alkmaar', nationality: 'AU', position: 'GK', basePrice: 10 },

  // ── DEF (44) ──
  { name: 'Virgil van Dijk', club: 'Liverpool', nationality: 'NL', position: 'DEF', basePrice: 55 },
  { name: 'Rúben Dias', club: 'Manchester City', nationality: 'PT', position: 'DEF', basePrice: 50 },
  { name: 'William Saliba', club: 'Arsenal', nationality: 'FR', position: 'DEF', basePrice: 45 },
  { name: 'Theo Hernández', club: 'AC Milan', nationality: 'FR', position: 'DEF', basePrice: 40 },
  { name: 'Achraf Hakimi', club: 'Paris Saint-Germain', nationality: 'MA', position: 'DEF', basePrice: 42 },
  { name: 'Antonio Rüdiger', club: 'Real Madrid', nationality: 'DE', position: 'DEF', basePrice: 44 },
  { name: 'Jules Koundé', club: 'Barcelona', nationality: 'FR', position: 'DEF', basePrice: 40 },
  { name: 'Daniel Carvajal', club: 'Real Madrid', nationality: 'ES', position: 'DEF', basePrice: 38 },
  { name: 'Josko Gvardiol', club: 'Manchester City', nationality: 'HR', position: 'DEF', basePrice: 43 },
  { name: 'Dayot Upamecano', club: 'Bayern Munich', nationality: 'FR', position: 'DEF', basePrice: 38 },
  { name: 'John Stones', club: 'Manchester City', nationality: 'GB', position: 'DEF', basePrice: 36 },
  { name: 'Ronald Araújo', club: 'Barcelona', nationality: 'UY', position: 'DEF', basePrice: 37 },
  { name: 'Trent Alexander-Arnold', club: 'Liverpool', nationality: 'GB', position: 'DEF', basePrice: 42 },
  { name: 'Kyle Walker', club: 'Manchester City', nationality: 'GB', position: 'DEF', basePrice: 34 },
  { name: 'Alphonso Davies', club: 'Bayern Munich', nationality: 'CA', position: 'DEF', basePrice: 39 },
  { name: 'Gabriel Magalhães', club: 'Arsenal', nationality: 'BR', position: 'DEF', basePrice: 35 },
  { name: 'Matthijs de Ligt', club: 'Manchester United', nationality: 'NL', position: 'DEF', basePrice: 33 },
  { name: 'Eder Militão', club: 'Real Madrid', nationality: 'BR', position: 'DEF', basePrice: 36 },
  { name: 'Micky van de Ven', club: 'Tottenham', nationality: 'NL', position: 'DEF', basePrice: 32 },
  { name: 'João Cancelo', club: 'Barcelona', nationality: 'PT', position: 'DEF', basePrice: 34 },
  { name: 'Alejandro Balde', club: 'Barcelona', nationality: 'ES', position: 'DEF', basePrice: 30 },
  { name: 'Ben Chilwell', club: 'Chelsea', nationality: 'GB', position: 'DEF', basePrice: 28 },
  { name: 'Nico Schlotterbeck', club: 'Borussia Dortmund', nationality: 'DE', position: 'DEF', basePrice: 30 },
  { name: 'Jonathan Tah', club: 'Bayer Leverkusen', nationality: 'DE', position: 'DEF', basePrice: 29 },
  { name: 'Pau Torres', club: 'Aston Villa', nationality: 'ES', position: 'DEF', basePrice: 28 },
  { name: 'Jurriën Timber', club: 'Arsenal', nationality: 'NL', position: 'DEF', basePrice: 27 },
  { name: 'Cristian Romero', club: 'Tottenham', nationality: 'AR', position: 'DEF', basePrice: 31 },
  { name: 'Noussair Mazraoui', club: 'Manchester United', nationality: 'MA', position: 'DEF', basePrice: 24 },
  { name: 'Reece James', club: 'Chelsea', nationality: 'GB', position: 'DEF', basePrice: 26 },
  { name: 'César Azpilicueta', club: 'Atlético Madrid', nationality: 'ES', position: 'DEF', basePrice: 22 },
  { name: 'Fikayo Tomori', club: 'AC Milan', nationality: 'GB', position: 'DEF', basePrice: 25 },
  { name: 'Luke Shaw', club: 'Manchester United', nationality: 'GB', position: 'DEF', basePrice: 24 },
  { name: 'David Alaba', club: 'Real Madrid', nationality: 'AT', position: 'DEF', basePrice: 26 },
  { name: 'Kim Min-jae', club: 'Bayern Munich', nationality: 'KR', position: 'DEF', basePrice: 23 },
  { name: 'Emerson Royal', club: 'Tottenham', nationality: 'BR', position: 'DEF', basePrice: 18 },
  { name: 'Sergi Cardona', club: 'Las Palmas', nationality: 'ES', position: 'DEF', basePrice: 12 },
  { name: 'Pervis Estupiñán', club: 'Brighton', nationality: 'EC', position: 'DEF', basePrice: 20 },
  { name: 'Marc Cucurella', club: 'Chelsea', nationality: 'ES', position: 'DEF', basePrice: 18 },
  { name: 'Nathan Aké', club: 'Manchester City', nationality: 'NL', position: 'DEF', basePrice: 22 },
  { name: 'Riccardo Calafiori', club: 'Bologna', nationality: 'IT', position: 'DEF', basePrice: 16 },
  { name: 'Jarrad Branthwaite', club: 'Everton', nationality: 'GB', position: 'DEF', basePrice: 14 },
  { name: 'Mario Hermoso', club: 'Roma', nationality: 'ES', position: 'DEF', basePrice: 15 },
  { name: 'Romain Saïss', club: 'Al Shabab', nationality: 'MA', position: 'DEF', basePrice: 10 },
  { name: 'Eric Dier', club: 'Bayern Munich', nationality: 'GB', position: 'DEF', basePrice: 13 },

  // ── MID (48) ──
  { name: 'Jude Bellingham', club: 'Real Madrid', nationality: 'GB', position: 'MID', basePrice: 80 },
  { name: 'Rodri', club: 'Manchester City', nationality: 'ES', position: 'MID', basePrice: 70 },
  { name: 'Declan Rice', club: 'Arsenal', nationality: 'GB', position: 'MID', basePrice: 55 },
  { name: 'Phil Foden', club: 'Manchester City', nationality: 'GB', position: 'MID', basePrice: 60 },
  { name: 'Jamal Musiala', club: 'Bayern Munich', nationality: 'DE', position: 'MID', basePrice: 65 },
  { name: 'Florian Wirtz', club: 'Bayer Leverkusen', nationality: 'DE', position: 'MID', basePrice: 60 },
  { name: 'Martin Ødegaard', club: 'Arsenal', nationality: 'NO', position: 'MID', basePrice: 55 },
  { name: 'Federico Valverde', club: 'Real Madrid', nationality: 'UY', position: 'MID', basePrice: 54 },
  { name: 'Eduardo Camavinga', club: 'Real Madrid', nationality: 'FR', position: 'MID', basePrice: 48 },
  { name: 'Aurélien Tchouaméni', club: 'Real Madrid', nationality: 'FR', position: 'MID', basePrice: 46 },
  { name: 'Pedri', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 52 },
  { name: 'Gavi', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 48 },
  { name: 'Ilkay Gündogan', club: 'Manchester City', nationality: 'DE', position: 'MID', basePrice: 42 },
  { name: 'Kevin De Bruyne', club: 'Manchester City', nationality: 'BE', position: 'MID', basePrice: 58 },
  { name: 'Bruno Fernandes', club: 'Manchester United', nationality: 'PT', position: 'MID', basePrice: 44 },
  { name: 'Cole Palmer', club: 'Chelsea', nationality: 'GB', position: 'MID', basePrice: 50 },
  { name: 'James Maddison', club: 'Tottenham', nationality: 'GB', position: 'MID', basePrice: 38 },
  { name: 'Enzo Fernández', club: 'Chelsea', nationality: 'AR', position: 'MID', basePrice: 40 },
  { name: 'Moises Caicedo', club: 'Chelsea', nationality: 'EC', position: 'MID', basePrice: 36 },
  { name: 'Alexis Mac Allister', club: 'Liverpool', nationality: 'AR', position: 'MID', basePrice: 39 },
  { name: 'Dominik Szoboszlai', club: 'Liverpool', nationality: 'HU', position: 'MID', basePrice: 37 },
  { name: 'Ryan Gravenberch', club: 'Liverpool', nationality: 'NL', position: 'MID', basePrice: 30 },
  { name: 'Khadija Shaw', club: 'Manchester City', nationality: 'JM', position: 'MID', basePrice: 28 },
  { name: 'Mason Mount', club: 'Manchester United', nationality: 'GB', position: 'MID', basePrice: 26 },
  { name: 'Kobbie Mainoo', club: 'Manchester United', nationality: 'GB', position: 'MID', basePrice: 34 },
  { name: 'Bernardo Silva', club: 'Manchester City', nationality: 'PT', position: 'MID', basePrice: 45 },
  { name: 'Frenkie de Jong', club: 'Barcelona', nationality: 'NL', position: 'MID', basePrice: 40 },
  { name: 'Isco', club: 'Real Betis', nationality: 'ES', position: 'MID', basePrice: 20 },
  { name: 'Dani Olmo', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 35 },
  { name: 'Warren Zaïre-Emery', club: 'Paris Saint-Germain', nationality: 'FR', position: 'MID', basePrice: 32 },
  { name: 'Vitinha', club: 'Paris Saint-Germain', nationality: 'PT', position: 'MID', basePrice: 30 },
  { name: 'Hakan Çalhanoğlu', club: 'Inter Milan', nationality: 'TR', position: 'MID', basePrice: 32 },
  { name: 'Nicolo Barella', club: 'Inter Milan', nationality: 'IT', position: 'MID', basePrice: 35 },
  { name: 'Joshua Kimmich', club: 'Bayern Munich', nationality: 'DE', position: 'MID', basePrice: 38 },
  { name: 'Leon Goretzka', club: 'Bayern Munich', nationality: 'DE', position: 'MID', basePrice: 30 },
  { name: 'Julian Brandt', club: 'Borussia Dortmund', nationality: 'DE', position: 'MID', basePrice: 24 },
  { name: 'Marcel Sabitzer', club: 'Borussia Dortmund', nationality: 'AT', position: 'MID', basePrice: 22 },
  { name: 'Exequiel Palacios', club: 'Bayer Leverkusen', nationality: 'AR', position: 'MID', basePrice: 25 },
  { name: 'Granit Xhaka', club: 'Bayer Leverkusen', nationality: 'CH', position: 'MID', basePrice: 24 },
  { name: 'Declan McAtee', club: 'Manchester City', nationality: 'GB', position: 'MID', basePrice: 14 },
  { name: 'Amadou Onana', club: 'Aston Villa', nationality: 'BE', position: 'MID', basePrice: 22 },
  { name: 'Youri Tielemans', club: 'Aston Villa', nationality: 'BE', position: 'MID', basePrice: 20 },
  { name: 'Morgan Rogers', club: 'Aston Villa', nationality: 'GB', position: 'MID', basePrice: 16 },
  { name: 'Scott McTominay', club: 'Napoli', nationality: 'GB', position: 'MID', basePrice: 18 },
  { name: 'Sandro Tonali', club: 'Newcastle', nationality: 'IT', position: 'MID', basePrice: 28 },
  { name: 'Bruno Guimarães', club: 'Newcastle', nationality: 'BR', position: 'MID', basePrice: 30 },
  { name: 'Conor Gallagher', club: 'Atlético Madrid', nationality: 'GB', position: 'MID', basePrice: 20 },
  { name: 'Arda Güler', club: 'Real Madrid', nationality: 'TR', position: 'MID', basePrice: 28 },

  // ── FWD (44) ──
  { name: 'Kylian Mbappé', club: 'Real Madrid', nationality: 'FR', position: 'FWD', basePrice: 85, isEligibleForIcon: true },
  { name: 'Erling Haaland', club: 'Manchester City', nationality: 'NO', position: 'FWD', basePrice: 90, isEligibleForIcon: true },
  { name: 'Vinícius Jr.', club: 'Real Madrid', nationality: 'BR', position: 'FWD', basePrice: 75, isEligibleForIcon: true },
  { name: 'Bukayo Saka', club: 'Arsenal', nationality: 'GB', position: 'FWD', basePrice: 65, isEligibleForIcon: true },
  { name: 'Lamine Yamal', club: 'Barcelona', nationality: 'ES', position: 'FWD', basePrice: 70, isEligibleForIcon: true },

  { name: 'Antoine Griezmann', club: 'Atlético Madrid', nationality: 'FR', position: 'FWD', basePrice: 50 },
  { name: 'Rodrygo', club: 'Real Madrid', nationality: 'BR', position: 'FWD', basePrice: 55 },
  { name: 'Harry Kane', club: 'Bayern Munich', nationality: 'GB', position: 'FWD', basePrice: 58 },
  { name: 'Mohamed Salah', club: 'Liverpool', nationality: 'EG', position: 'FWD', basePrice: 60 },
  { name: 'Lautaro Martínez', club: 'Inter Milan', nationality: 'AR', position: 'FWD', basePrice: 52 },
  { name: 'Ousmane Dembélé', club: 'Paris Saint-Germain', nationality: 'FR', position: 'FWD', basePrice: 48 },
  { name: 'Raphinha', club: 'Barcelona', nationality: 'BR', position: 'FWD', basePrice: 45 },
  { name: 'Gabriel Martinelli', club: 'Arsenal', nationality: 'BR', position: 'FWD', basePrice: 42 },
  { name: 'Marcus Rashford', club: 'Manchester United', nationality: 'GB', position: 'FWD', basePrice: 36 },
  { name: 'Rasmus Højlund', club: 'Manchester United', nationality: 'DK', position: 'FWD', basePrice: 32 },
  { name: 'Nicolas Jackson', club: 'Chelsea', nationality: 'SN', position: 'FWD', basePrice: 30 },
  { name: 'Christopher Nkunku', club: 'Chelsea', nationality: 'FR', position: 'FWD', basePrice: 34 },
  { name: 'Darwin Núñez', club: 'Liverpool', nationality: 'UY', position: 'FWD', basePrice: 35 },
  { name: 'Julian Álvarez', club: 'Atlético Madrid', nationality: 'AR', position: 'FWD', basePrice: 40 },
  { name: 'Victor Osimhen', club: 'Galatasaray', nationality: 'NG', position: 'FWD', basePrice: 44 },
  { name: 'Kingsley Coman', club: 'Bayern Munich', nationality: 'FR', position: 'FWD', basePrice: 38 },
  { name: 'Leroy Sané', club: 'Bayern Munich', nationality: 'DE', position: 'FWD', basePrice: 40 },
  { name: 'Serge Gnabry', club: 'Bayern Munich', nationality: 'DE', position: 'FWD', basePrice: 32 },
  { name: 'Donyell Malen', club: 'Borussia Dortmund', nationality: 'NL', position: 'FWD', basePrice: 26 },
  { name: 'Karim Adeyemi', club: 'Borussia Dortmund', nationality: 'DE', position: 'FWD', basePrice: 28 },
  { name: 'Álvaro Morata', club: 'AC Milan', nationality: 'ES', position: 'FWD', basePrice: 30 },
  { name: 'Olivier Giroud', club: 'Los Angeles FC', nationality: 'FR', position: 'FWD', basePrice: 24 },
  { name: 'Cody Gakpo', club: 'Liverpool', nationality: 'NL', position: 'FWD', basePrice: 33 },
  { name: 'Luis Díaz', club: 'Liverpool', nationality: 'CO', position: 'FWD', basePrice: 37 },
  { name: 'Raheem Sterling', club: 'Chelsea', nationality: 'GB', position: 'FWD', basePrice: 28 },
  { name: 'Jérémy Doku', club: 'Manchester City', nationality: 'BE', position: 'FWD', basePrice: 34 },
  { name: 'Jack Grealish', club: 'Manchester City', nationality: 'GB', position: 'FWD', basePrice: 30 },
  { name: 'Takefusa Kubo', club: 'Real Sociedad', nationality: 'JP', position: 'FWD', basePrice: 22 },
  { name: 'Andriy Yarmolenko', club: 'Dynamo Kyiv', nationality: 'UA', position: 'FWD', basePrice: 12 },
  { name: 'Moussa Diaby', club: 'Aston Villa', nationality: 'FR', position: 'FWD', basePrice: 26 },
  { name: 'Leon Bailey', club: 'Aston Villa', nationality: 'JM', position: 'FWD', basePrice: 22 },
  { name: 'Aleksander Mitrović', club: 'Al Hilal', nationality: 'RS', position: 'FWD', basePrice: 25 },
  { name: 'Richarlison', club: 'Tottenham', nationality: 'BR', position: 'FWD', basePrice: 24 },
  { name: 'Brennan Johnson', club: 'Tottenham', nationality: 'GB', position: 'FWD', basePrice: 18 },
  { name: 'Dejan Kulusevski', club: 'Tottenham', nationality: 'SE', position: 'FWD', basePrice: 28 },
  { name: 'Nico Williams', club: 'Athletic Bilbao', nationality: 'ES', position: 'FWD', basePrice: 32 },
  { name: 'Samuel Omorodion', club: 'Porto', nationality: 'ES', position: 'FWD', basePrice: 16 },
  { name: 'Gonçalo Ramos', club: 'Paris Saint-Germain', nationality: 'PT', position: 'FWD', basePrice: 30 },
  { name: 'Khvicha Kvaratskhelia', club: 'Napoli', nationality: 'GE', position: 'FWD', basePrice: 38 },
]

// UEFA Champions League 2026/27 — 36 teams, ~160 players
const UCL_PLAYERS: PlayerTemplate[] = [
  // ── GK (24) ──
  { name: 'Thibaut Courtois', club: 'Real Madrid', nationality: 'BE', position: 'GK', basePrice: 72 },
  { name: 'Alisson Becker', club: 'Liverpool', nationality: 'BR', position: 'GK', basePrice: 66 },
  { name: 'Ederson', club: 'Manchester City', nationality: 'BR', position: 'GK', basePrice: 60 },
  { name: 'Mike Maignan', club: 'AC Milan', nationality: 'FR', position: 'GK', basePrice: 58 },
  { name: 'Gianluigi Donnarumma', club: 'Paris Saint-Germain', nationality: 'IT', position: 'GK', basePrice: 56 },
  { name: 'Marc-André ter Stegen', club: 'Barcelona', nationality: 'DE', position: 'GK', basePrice: 54 },
  { name: 'Jan Oblak', club: 'Atlético Madrid', nationality: 'SI', position: 'GK', basePrice: 52 },
  { name: 'Manuel Neuer', club: 'Bayern Munich', nationality: 'DE', position: 'GK', basePrice: 50 },
  { name: 'David Raya', club: 'Arsenal', nationality: 'ES', position: 'GK', basePrice: 46 },
  { name: 'Gregor Kobel', club: 'Borussia Dortmund', nationality: 'CH', position: 'GK', basePrice: 42 },
  { name: 'Diogo Costa', club: 'FC Porto', nationality: 'PT', position: 'GK', basePrice: 40 },
  { name: 'André Onana', club: 'Manchester United', nationality: 'CM', position: 'GK', basePrice: 38 },
  { name: 'Unai Simón', club: 'Athletic Bilbao', nationality: 'ES', position: 'GK', basePrice: 36 },
  { name: 'Giorgi Mamardashvili', club: 'Valencia', nationality: 'GE', position: 'GK', basePrice: 34 },
  { name: 'Yann Sommer', club: 'Inter Milan', nationality: 'CH', position: 'GK', basePrice: 32 },
  { name: 'Lukáš Hrádecký', club: 'Bayer Leverkusen', nationality: 'FI', position: 'GK', basePrice: 30 },
  { name: 'Kepa Arrizabalaga', club: 'Bournemouth', nationality: 'ES', position: 'GK', basePrice: 26 },
  { name: 'Alex Meret', club: 'Napoli', nationality: 'IT', position: 'GK', basePrice: 24 },
  { name: 'Rui Patrício', club: 'Roma', nationality: 'PT', position: 'GK', basePrice: 22 },
  { name: 'Bart Verbruggen', club: 'Brighton', nationality: 'NL', position: 'GK', basePrice: 22 },
  { name: 'Péter Gulácsi', club: 'RB Leipzig', nationality: 'HU', position: 'GK', basePrice: 20 },
  { name: 'Marco Sportiello', club: 'AC Milan', nationality: 'IT', position: 'GK', basePrice: 18 },
  { name: 'Alexander Nübel', club: 'Stuttgart', nationality: 'DE', position: 'GK', basePrice: 16 },
  { name: 'Mile Svilar', club: 'Roma', nationality: 'RS', position: 'GK', basePrice: 14 },

  // ── DEF (44) ──
  { name: 'Virgil van Dijk', club: 'Liverpool', nationality: 'NL', position: 'DEF', basePrice: 52 },
  { name: 'Rúben Dias', club: 'Manchester City', nationality: 'PT', position: 'DEF', basePrice: 50 },
  { name: 'William Saliba', club: 'Arsenal', nationality: 'FR', position: 'DEF', basePrice: 46 },
  { name: 'Antonio Rüdiger', club: 'Real Madrid', nationality: 'DE', position: 'DEF', basePrice: 45 },
  { name: 'Jules Koundé', club: 'Barcelona', nationality: 'FR', position: 'DEF', basePrice: 42 },
  { name: 'Daniel Carvajal', club: 'Real Madrid', nationality: 'ES', position: 'DEF', basePrice: 40 },
  { name: 'Josko Gvardiol', club: 'Manchester City', nationality: 'HR', position: 'DEF', basePrice: 44 },
  { name: 'Dayot Upamecano', club: 'Bayern Munich', nationality: 'FR', position: 'DEF', basePrice: 40 },
  { name: 'John Stones', club: 'Manchester City', nationality: 'GB', position: 'DEF', basePrice: 38 },
  { name: 'Ronald Araújo', club: 'Barcelona', nationality: 'UY', position: 'DEF', basePrice: 39 },
  { name: 'Trent Alexander-Arnold', club: 'Liverpool', nationality: 'GB', position: 'DEF', basePrice: 44 },
  { name: 'Kyle Walker', club: 'Manchester City', nationality: 'GB', position: 'DEF', basePrice: 34 },
  { name: 'Alphonso Davies', club: 'Bayern Munich', nationality: 'CA', position: 'DEF', basePrice: 40 },
  { name: 'Gabriel Magalhães', club: 'Arsenal', nationality: 'BR', position: 'DEF', basePrice: 36 },
  { name: 'Matthijs de Ligt', club: 'Manchester United', nationality: 'NL', position: 'DEF', basePrice: 34 },
  { name: 'Eder Militão', club: 'Real Madrid', nationality: 'BR', position: 'DEF', basePrice: 38 },
  { name: 'Dani Vivian', club: 'Athletic Bilbao', nationality: 'ES', position: 'DEF', basePrice: 26 },
  { name: 'Robin Le Normand', club: 'Atlético Madrid', nationality: 'FR', position: 'DEF', basePrice: 28 },
  { name: 'Lucas Hernández', club: 'Paris Saint-Germain', nationality: 'FR', position: 'DEF', basePrice: 32 },
  { name: 'Nuno Mendes', club: 'Paris Saint-Germain', nationality: 'PT', position: 'DEF', basePrice: 30 },
  { name: 'Milan Škriniar', club: 'Paris Saint-Germain', nationality: 'SK', position: 'DEF', basePrice: 30 },
  { name: 'Federico Dimarco', club: 'Inter Milan', nationality: 'IT', position: 'DEF', basePrice: 32 },
  { name: 'Alessandro Bastoni', club: 'Inter Milan', nationality: 'IT', position: 'DEF', basePrice: 34 },
  { name: 'Benjamin Pavard', club: 'Inter Milan', nationality: 'FR', position: 'DEF', basePrice: 30 },
  { name: 'Danilo', club: 'Juventus', nationality: 'BR', position: 'DEF', basePrice: 26 },
  { name: 'Bremer', club: 'Juventus', nationality: 'BR', position: 'DEF', basePrice: 32 },
  { name: 'Federico Gatti', club: 'Juventus', nationality: 'IT', position: 'DEF', basePrice: 22 },
  { name: 'Edmond Tapsoba', club: 'Bayer Leverkusen', nationality: 'BF', position: 'DEF', basePrice: 28 },
  { name: 'Jonathan Tah', club: 'Bayer Leverkusen', nationality: 'DE', position: 'DEF', basePrice: 30 },
  { name: 'Josip Stanišić', club: 'Bayern Munich', nationality: 'HR', position: 'DEF', basePrice: 24 },
  { name: 'Nico Schlotterbeck', club: 'Borussia Dortmund', nationality: 'DE', position: 'DEF', basePrice: 32 },
  { name: 'Julian Ryerson', club: 'Borussia Dortmund', nationality: 'NO', position: 'DEF', basePrice: 22 },
  { name: 'Ramy Bensebaini', club: 'Borussia Dortmund', nationality: 'DZ', position: 'DEF', basePrice: 18 },
  { name: 'Jurriën Timber', club: 'Arsenal', nationality: 'NL', position: 'DEF', basePrice: 28 },
  { name: 'Ben White', club: 'Arsenal', nationality: 'GB', position: 'DEF', basePrice: 30 },
  { name: 'Reece James', club: 'Chelsea', nationality: 'GB', position: 'DEF', basePrice: 26 },
  { name: 'Wesley Fofana', club: 'Chelsea', nationality: 'FR', position: 'DEF', basePrice: 24 },
  { name: 'Leny Yoro', club: 'Manchester United', nationality: 'FR', position: 'DEF', basePrice: 28 },
  { name: 'Diogo Dalot', club: 'Manchester United', nationality: 'PT', position: 'DEF', basePrice: 24 },
  { name: 'Jorrel Hato', club: 'Ajax', nationality: 'NL', position: 'DEF', basePrice: 22 },
  { name: 'David Hancko', club: 'Feyenoord', nationality: 'SK', position: 'DEF', basePrice: 18 },
  { name: 'Stefan de Vrij', club: 'Inter Milan', nationality: 'NL', position: 'DEF', basePrice: 20 },
  { name: 'Neal Maupay', club: 'Marseille', nationality: 'FR', position: 'DEF', basePrice: 12 },
  { name: 'Tyler Dibling', club: 'Southampton', nationality: 'GB', position: 'DEF', basePrice: 14 },

  // ── MID (48) ──
  { name: 'Jude Bellingham', club: 'Real Madrid', nationality: 'GB', position: 'MID', basePrice: 85, isEligibleForIcon: true },
  { name: 'Rodri', club: 'Manchester City', nationality: 'ES', position: 'MID', basePrice: 75 },
  { name: 'Kevin De Bruyne', club: 'Manchester City', nationality: 'BE', position: 'MID', basePrice: 60 },
  { name: 'Declan Rice', club: 'Arsenal', nationality: 'GB', position: 'MID', basePrice: 58 },
  { name: 'Jamal Musiala', club: 'Bayern Munich', nationality: 'DE', position: 'MID', basePrice: 70 },
  { name: 'Florian Wirtz', club: 'Bayer Leverkusen', nationality: 'DE', position: 'MID', basePrice: 62 },
  { name: 'Federico Valverde', club: 'Real Madrid', nationality: 'UY', position: 'MID', basePrice: 56 },
  { name: 'Eduardo Camavinga', club: 'Real Madrid', nationality: 'FR', position: 'MID', basePrice: 50 },
  { name: 'Aurélien Tchouaméni', club: 'Real Madrid', nationality: 'FR', position: 'MID', basePrice: 48 },
  { name: 'Pedri', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 54 },
  { name: 'Gavi', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 50 },
  { name: 'Frenkie de Jong', club: 'Barcelona', nationality: 'NL', position: 'MID', basePrice: 42 },
  { name: 'Ilkay Gündogan', club: 'Manchester City', nationality: 'DE', position: 'MID', basePrice: 44 },
  { name: 'Phil Foden', club: 'Manchester City', nationality: 'GB', position: 'MID', basePrice: 58 },
  { name: 'Bruno Fernandes', club: 'Manchester United', nationality: 'PT', position: 'MID', basePrice: 46 },
  { name: 'Kobbie Mainoo', club: 'Manchester United', nationality: 'GB', position: 'MID', basePrice: 36 },
  { name: 'Cole Palmer', club: 'Chelsea', nationality: 'GB', position: 'MID', basePrice: 52 },
  { name: 'Enzo Fernández', club: 'Chelsea', nationality: 'AR', position: 'MID', basePrice: 42 },
  { name: 'Moises Caicedo', club: 'Chelsea', nationality: 'EC', position: 'MID', basePrice: 38 },
  { name: 'Alexis Mac Allister', club: 'Liverpool', nationality: 'AR', position: 'MID', basePrice: 40 },
  { name: 'Dominik Szoboszlai', club: 'Liverpool', nationality: 'HU', position: 'MID', basePrice: 38 },
  { name: 'Ryan Gravenberch', club: 'Liverpool', nationality: 'NL', position: 'MID', basePrice: 32 },
  { name: 'Bernardo Silva', club: 'Manchester City', nationality: 'PT', position: 'MID', basePrice: 46 },
  { name: 'Martin Ødegaard', club: 'Arsenal', nationality: 'NO', position: 'MID', basePrice: 52 },
  { name: 'James Maddison', club: 'Tottenham', nationality: 'GB', position: 'MID', basePrice: 36 },
  { name: 'Joshua Kimmich', club: 'Bayern Munich', nationality: 'DE', position: 'MID', basePrice: 40 },
  { name: 'Leon Goretzka', club: 'Bayern Munich', nationality: 'DE', position: 'MID', basePrice: 32 },
  { name: 'Warren Zaïre-Emery', club: 'Paris Saint-Germain', nationality: 'FR', position: 'MID', basePrice: 34 },
  { name: 'Vitinha', club: 'Paris Saint-Germain', nationality: 'PT', position: 'MID', basePrice: 32 },
  { name: 'Nicolo Barella', club: 'Inter Milan', nationality: 'IT', position: 'MID', basePrice: 36 },
  { name: 'Hakan Çalhanoğlu', club: 'Inter Milan', nationality: 'TR', position: 'MID', basePrice: 34 },
  { name: 'Henrikh Mkhitaryan', club: 'Inter Milan', nationality: 'AM', position: 'MID', basePrice: 24 },
  { name: 'Dani Olmo', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 36 },
  { name: 'Fermín López', club: 'Barcelona', nationality: 'ES', position: 'MID', basePrice: 28 },
  { name: 'Alejandro Garnacho', club: 'Manchester United', nationality: 'AR', position: 'MID', basePrice: 34 },
  { name: 'Mason Mount', club: 'Manchester United', nationality: 'GB', position: 'MID', basePrice: 26 },
  { name: 'Conor Gallagher', club: 'Atlético Madrid', nationality: 'GB', position: 'MID', basePrice: 22 },
  { name: 'Rodrigo De Paul', club: 'Atlético Madrid', nationality: 'AR', position: 'MID', basePrice: 30 },
  { name: 'Thomas Lemar', club: 'Atlético Madrid', nationality: 'FR', position: 'MID', basePrice: 20 },
  { name: 'Granit Xhaka', club: 'Bayer Leverkusen', nationality: 'CH', position: 'MID', basePrice: 26 },
  { name: 'Exequiel Palacios', club: 'Bayer Leverkusen', nationality: 'AR', position: 'MID', basePrice: 26 },
  { name: 'Julian Brandt', club: 'Borussia Dortmund', nationality: 'DE', position: 'MID', basePrice: 28 },
  { name: 'Marcel Sabitzer', club: 'Borussia Dortmund', nationality: 'AT', position: 'MID', basePrice: 24 },
  { name: 'Davy Klaassen', club: 'Inter Milan', nationality: 'NL', position: 'MID', basePrice: 16 },
  { name: 'Tijjani Reijnders', club: 'AC Milan', nationality: 'NL', position: 'MID', basePrice: 28 },
  { name: 'Christian Pulisic', club: 'AC Milan', nationality: 'US', position: 'MID', basePrice: 30 },
  { name: 'Ismaël Bennacer', club: 'AC Milan', nationality: 'DZ', position: 'MID', basePrice: 26 },
  { name: 'Dan Ndoye', club: 'Bologna', nationality: 'CH', position: 'MID', basePrice: 16 },

  // ── FWD (44) ──
  { name: 'Kylian Mbappé', club: 'Real Madrid', nationality: 'FR', position: 'FWD', basePrice: 92, isEligibleForIcon: true },
  { name: 'Erling Haaland', club: 'Manchester City', nationality: 'NO', position: 'FWD', basePrice: 95, isEligibleForIcon: true },
  { name: 'Vinícius Jr.', club: 'Real Madrid', nationality: 'BR', position: 'FWD', basePrice: 80, isEligibleForIcon: true },
  { name: 'Harry Kane', club: 'Bayern Munich', nationality: 'GB', position: 'FWD', basePrice: 82, isEligibleForIcon: true },
  { name: 'Lamine Yamal', club: 'Barcelona', nationality: 'ES', position: 'FWD', basePrice: 78, isEligibleForIcon: true },
  { name: 'Mohamed Salah', club: 'Liverpool', nationality: 'EG', position: 'FWD', basePrice: 62 },
  { name: 'Bukayo Saka', club: 'Arsenal', nationality: 'GB', position: 'FWD', basePrice: 66 },
  { name: 'Ousmane Dembélé', club: 'Paris Saint-Germain', nationality: 'FR', position: 'FWD', basePrice: 50 },
  { name: 'Raphinha', club: 'Barcelona', nationality: 'BR', position: 'FWD', basePrice: 48 },
  { name: 'Rodrygo', club: 'Real Madrid', nationality: 'BR', position: 'FWD', basePrice: 56 },
  { name: 'Lautaro Martínez', club: 'Inter Milan', nationality: 'AR', position: 'FWD', basePrice: 54 },
  { name: 'Marcus Rashford', club: 'Manchester United', nationality: 'GB', position: 'FWD', basePrice: 38 },
  { name: 'Christopher Nkunku', club: 'Chelsea', nationality: 'FR', position: 'FWD', basePrice: 36 },
  { name: 'Nicolas Jackson', club: 'Chelsea', nationality: 'SN', position: 'FWD', basePrice: 32 },
  { name: 'Darwin Núñez', club: 'Liverpool', nationality: 'UY', position: 'FWD', basePrice: 36 },
  { name: 'Luis Díaz', club: 'Liverpool', nationality: 'CO', position: 'FWD', basePrice: 38 },
  { name: 'Cody Gakpo', club: 'Liverpool', nationality: 'NL', position: 'FWD', basePrice: 34 },
  { name: 'Gabriel Martinelli', club: 'Arsenal', nationality: 'BR', position: 'FWD', basePrice: 42 },
  { name: 'Kingsley Coman', club: 'Bayern Munich', nationality: 'FR', position: 'FWD', basePrice: 40 },
  { name: 'Leroy Sané', club: 'Bayern Munich', nationality: 'DE', position: 'FWD', basePrice: 42 },
  { name: 'Serge Gnabry', club: 'Bayern Munich', nationality: 'DE', position: 'FWD', basePrice: 34 },
  { name: 'Donyell Malen', club: 'Borussia Dortmund', nationality: 'NL', position: 'FWD', basePrice: 28 },
  { name: 'Karim Adeyemi', club: 'Borussia Dortmund', nationality: 'DE', position: 'FWD', basePrice: 30 },
  { name: 'Julian Álvarez', club: 'Atlético Madrid', nationality: 'AR', position: 'FWD', basePrice: 42 },
  { name: 'Antoine Griezmann', club: 'Atlético Madrid', nationality: 'FR', position: 'FWD', basePrice: 48 },
  { name: 'Victor Osimhen', club: 'Galatasaray', nationality: 'NG', position: 'FWD', basePrice: 46 },
  { name: 'Khvicha Kvaratskhelia', club: 'Napoli', nationality: 'GE', position: 'FWD', basePrice: 40 },
  { name: 'Raheem Sterling', club: 'Chelsea', nationality: 'GB', position: 'FWD', basePrice: 28 },
  { name: 'Jérémy Doku', club: 'Manchester City', nationality: 'BE', position: 'FWD', basePrice: 36 },
  { name: 'Jack Grealish', club: 'Manchester City', nationality: 'GB', position: 'FWD', basePrice: 32 },
  { name: 'Nico Williams', club: 'Athletic Bilbao', nationality: 'ES', position: 'FWD', basePrice: 34 },
  { name: 'Álvaro Morata', club: 'AC Milan', nationality: 'ES', position: 'FWD', basePrice: 32 },
  { name: 'Samuel Chukwueze', club: 'AC Milan', nationality: 'NG', position: 'FWD', basePrice: 24 },
  { name: 'Christian Pulisic', club: 'AC Milan', nationality: 'US', position: 'FWD', basePrice: 28 },
  { name: 'Noah Okafor', club: 'AC Milan', nationality: 'CH', position: 'FWD', basePrice: 20 },
  { name: 'Dejan Kulusevski', club: 'Tottenham', nationality: 'SE', position: 'FWD', basePrice: 30 },
  { name: 'Brennan Johnson', club: 'Tottenham', nationality: 'GB', position: 'FWD', basePrice: 20 },
  { name: 'Gonçalo Ramos', club: 'Paris Saint-Germain', nationality: 'PT', position: 'FWD', basePrice: 32 },
  { name: 'Bradley Barcola', club: 'Paris Saint-Germain', nationality: 'FR', position: 'FWD', basePrice: 34 },
  { name: 'Randal Kolo Muani', club: 'Paris Saint-Germain', nationality: 'FR', position: 'FWD', basePrice: 30 },
  { name: 'Mathys Tel', club: 'Bayern Munich', nationality: 'FR', position: 'FWD', basePrice: 26 },
  { name: 'Michael Olise', club: 'Bayern Munich', nationality: 'FR', position: 'FWD', basePrice: 32 },
  { name: 'Jamie Bynoe-Gittens', club: 'Borussia Dortmund', nationality: 'GB', position: 'FWD', basePrice: 18 },
  { name: 'Endrick', club: 'Real Madrid', nationality: 'BR', position: 'FWD', basePrice: 28 },
]

// ─── Main ───────────────────────────────────────────────

function generatePlayers(): any[] {
  const players: any[] = []
  let idCounter = 1

  // Add WC players
  for (const template of WC_PLAYERS) {
    players.push({
      id: `player-${idCounter++}`,
      tournamentId: 'fifa-wc-2026',
      ...template,
    })
  }

  // Add UCL players
  for (const template of UCL_PLAYERS) {
    players.push({
      id: `player-${idCounter++}`,
      tournamentId: 'uefa-ucl-2026-27',
      ...template,
    })
  }

  return players
}

function main() {
  const players = generatePlayers()

  const wcCount = players.filter((p) => p.tournamentId === 'fifa-wc-2026').length
  const uclCount = players.filter((p) => p.tournamentId === 'uefa-ucl-2026-27').length

  console.log(`📊 Generating ${players.length} total players...`)
  console.log(`   FIFA WC 2026: ${wcCount} players`)
  console.log(`   UCL 2026/27: ${uclCount} players`)

  // Position breakdown per tournament
  const wcPositions: Record<string, number> = {}
  const uclPositions: Record<string, number> = {}
  for (const p of players) {
    const dest = p.tournamentId === 'fifa-wc-2026' ? wcPositions : uclPositions
    dest[p.position] = (dest[p.position] || 0) + 1
  }

  console.log(`\n  FIFA WC 2026 breakdown:`)
  for (const [pos, count] of Object.entries(wcPositions)) {
    console.log(`    ${pos}: ${count}`)
  }

  console.log(`\n  UCL 2026/27 breakdown:`)
  for (const [pos, count] of Object.entries(uclPositions)) {
    console.log(`    ${pos}: ${count}`)
  }

  // Write file
  const outputPath = path.join(DATA_DIR, 'players.json')
  atomicWrite(outputPath, players)

  console.log(`\n✅ ${players.length} players written to ${outputPath}`)
}

function atomicWrite(filePath: string, data: any): void {
  const tmpPath = filePath + '.tmp'
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  fs.renameSync(tmpPath, filePath)
}

main()
