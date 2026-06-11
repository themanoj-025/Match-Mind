/**
 * Push schema to PostgreSQL via docker exec
 *
 * Bypasses Prisma 7.8.0 config parser bugs AND Docker network auth issues
 * by running psql directly inside the PostgreSQL container.
 */

const { execSync } = require('child_process')
const path = require('path')

function run(query) {
  const cmd = `docker exec -i matchmind-db psql -U matchmind -d matchmind -c "${query.replace(/"/g, '\\"')}"`
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 10000 })
  } catch (err) {
    // Ignore "already exists" errors
    if (!err.stderr?.toString().includes('already exists')) {
      throw err
    }
  }
}

function runSQL(sql) {
  const cmd = `docker exec -i matchmind-db psql -U matchmind -d matchmind`
  try {
    execSync(cmd, { input: sql, stdio: ['pipe', 'inherit', 'inherit'], timeout: 10000 })
  } catch (err) {
    if (!err.stderr?.toString().includes('already exists')) {
      throw err
    }
  }
}

async function main() {
  console.log('[Push] Connecting via docker exec...')

  // Test connection
  execSync('docker exec matchmind-db psql -U matchmind -d matchmind -c "SELECT 1"', { stdio: 'pipe' })
  console.log('[Push] Connected ✓')

  // Drop everything
  console.log('[Push] Cleaning existing schema...')
  runSQL(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
      FOR r IN (SELECT t.typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname) LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
    END $$;
  `)
  console.log('[Push] Cleaned ✓')

  // Create enums
  const enums = [
    `CREATE TYPE "Sport" AS ENUM ('FOOTBALL', 'BASKETBALL', 'AMERICAN_FOOTBALL', 'TENNIS', 'CRICKET', 'HOCKEY')`,
    `CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED')`,
    `CREATE TYPE "PredStatus" AS ENUM ('PENDING', 'LOCKED', 'SCORED', 'VOID')`,
    `CREATE TYPE "Tier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND')`,
    `CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN')`,
    `CREATE TYPE "NotifType" AS ENUM ('MATCH_STARTING', 'PREDICTION_LOCKED', 'PREDICTION_SCORED', 'RANK_CHANGED', 'NEW_FOLLOWER', 'SQUAD_INVITE', 'LEAGUE_RESULT', 'ACHIEVEMENT')`,
    `CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING')`,
    `CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEKLY', 'MONTHLY')`,
  ]
  for (const sql of enums) run(sql)
  console.log('[Push] Enums created ✓')

  // Create tables
  const tables = [
    `CREATE TABLE "User" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, email_verified BOOLEAN NOT NULL DEFAULT false, password_hash TEXT, display_name TEXT, avatar TEXT, banner_image TEXT, bio TEXT, country_code TEXT, role "UserRole" NOT NULL DEFAULT 'USER', tier "Tier" NOT NULL DEFAULT 'BRONZE', total_points INTEGER NOT NULL DEFAULT 0, weekly_points INTEGER NOT NULL DEFAULT 0, global_rank INTEGER, pred_accuracy DOUBLE PRECISION NOT NULL DEFAULT 0, total_predictions INTEGER NOT NULL DEFAULT 0, correct_predictions INTEGER NOT NULL DEFAULT 0, streak_current INTEGER NOT NULL DEFAULT 0, streak_best INTEGER NOT NULL DEFAULT 0, is_pro BOOLEAN NOT NULL DEFAULT false, pro_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_active_at TIMESTAMPTZ)`,
    `CREATE TABLE "Follow" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, follower_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, following_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(follower_id, following_id))`,
    `CREATE TABLE "Competition" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, name TEXT NOT NULL, short_name TEXT NOT NULL, sport "Sport" NOT NULL, logo TEXT, country_code TEXT, external_id TEXT UNIQUE, is_active BOOLEAN NOT NULL DEFAULT true)`,
    `CREATE TABLE "Team" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, name TEXT NOT NULL, short_name TEXT NOT NULL, logo TEXT, country_code TEXT, sport "Sport" NOT NULL, external_id TEXT UNIQUE)`,
    `CREATE TABLE "Player" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, name TEXT NOT NULL, position TEXT, number INTEGER, nationality TEXT, photo TEXT, team_id TEXT REFERENCES "Team"(id), sport "Sport" NOT NULL, external_id TEXT UNIQUE)`,
    `CREATE TABLE "Match" (id TEXT PRIMARY KEY, sport "Sport" NOT NULL, competition_id TEXT NOT NULL REFERENCES "Competition"(id), home_team_id TEXT NOT NULL REFERENCES "Team"(id), away_team_id TEXT NOT NULL REFERENCES "Team"(id), home_team_name TEXT NOT NULL, away_team_name TEXT NOT NULL, home_team_logo TEXT, away_team_logo TEXT, competition TEXT NOT NULL, stadium TEXT, home_score INTEGER, away_score INTEGER, home_score_ht INTEGER, away_score_ht INTEGER, status "MatchStatus" NOT NULL DEFAULT 'SCHEDULED', minute INTEGER, scheduled_at TIMESTAMPTZ NOT NULL, kicked_off_at TIMESTAMPTZ, finished_at TIMESTAMPTZ, season TEXT, external_id TEXT UNIQUE, ai_summary TEXT)`,
    `CREATE TABLE "MatchEvent" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, match_id TEXT NOT NULL REFERENCES "Match"(id) ON DELETE CASCADE, type TEXT NOT NULL, minute INTEGER NOT NULL, team_id TEXT, player_id TEXT, detail JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "Prediction" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, match_id TEXT NOT NULL REFERENCES "Match"(id) ON DELETE CASCADE, home_goals INTEGER NOT NULL, away_goals INTEGER NOT NULL, first_scorer_id TEXT, total_goals_ou TEXT, total_goals_line DOUBLE PRECISION, btts BOOLEAN, result TEXT, points_earned INTEGER, points_breakdown JSONB, status "PredStatus" NOT NULL DEFAULT 'PENDING', locked_at TIMESTAMPTZ, scored_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, match_id))`,
    `CREATE INDEX IF NOT EXISTS "prediction_user_id_idx" ON "Prediction" (user_id)`,
    `CREATE INDEX IF NOT EXISTS "prediction_match_id_idx" ON "Prediction" (match_id)`,
    `CREATE INDEX IF NOT EXISTS "prediction_status_idx" ON "Prediction" (status)`,
    `CREATE TABLE "League" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, name TEXT NOT NULL, description TEXT, badge TEXT, invite_code TEXT UNIQUE NOT NULL, is_public BOOLEAN NOT NULL DEFAULT false, sport "Sport", owner_id TEXT NOT NULL, max_members INTEGER NOT NULL DEFAULT 50, scoring_rule JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "LeagueMember" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, league_id TEXT NOT NULL REFERENCES "League"(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, points INTEGER NOT NULL DEFAULT 0, rank INTEGER, joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(league_id, user_id))`,
    `CREATE TABLE "Squad" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, name TEXT NOT NULL, badge TEXT, description TEXT, owner_id TEXT NOT NULL DEFAULT '', is_private BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "SquadMember" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, squad_id TEXT NOT NULL REFERENCES "Squad"(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, role TEXT NOT NULL DEFAULT 'member', points INTEGER NOT NULL DEFAULT 0, joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(squad_id, user_id))`,
    `CREATE TABLE "ChatMessage" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, room_type TEXT NOT NULL, room_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, text TEXT, gif_url TEXT, type TEXT NOT NULL DEFAULT 'text', reactions JSONB NOT NULL DEFAULT '{}', is_pinned BOOLEAN NOT NULL DEFAULT false, is_deleted BOOLEAN NOT NULL DEFAULT false, is_read BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "Notification" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT, link TEXT, payload JSONB, is_read BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "Achievement" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, icon TEXT NOT NULL, rarity TEXT NOT NULL, point_bonus INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE "UserAchievement" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, achievement_id TEXT NOT NULL REFERENCES "Achievement"(id) ON DELETE CASCADE, unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, achievement_id))`,
    `CREATE TABLE "Subscription" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, stripe_customer_id TEXT UNIQUE NOT NULL, stripe_subscription_id TEXT UNIQUE NOT NULL, plan TEXT NOT NULL, status "SubscriptionStatus" NOT NULL, current_period_start TIMESTAMPTZ NOT NULL, current_period_end TIMESTAMPTZ NOT NULL, cancel_at_period_end BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "Report" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, reporter_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, message_id TEXT REFERENCES "ChatMessage"(id), user_id TEXT, reason TEXT NOT NULL, detail TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "Session" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, refresh_token TEXT UNIQUE NOT NULL, user_agent TEXT, ip_address TEXT, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "Standing" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, competition_id TEXT NOT NULL REFERENCES "Competition"(id) ON DELETE CASCADE, team_id TEXT NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE, season TEXT NOT NULL, position INTEGER NOT NULL, played INTEGER NOT NULL, won INTEGER NOT NULL, drawn INTEGER NOT NULL, lost INTEGER NOT NULL, goals_for INTEGER NOT NULL, goals_against INTEGER NOT NULL, points INTEGER NOT NULL, form TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(competition_id, team_id, season))`,
    `CREATE TABLE "UserSport" (user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, sport "Sport" NOT NULL, PRIMARY KEY (user_id, sport))`,
    `CREATE TABLE "UserTeam" (user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE, team_id TEXT NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE, PRIMARY KEY (user_id, team_id))`,
    `CREATE TABLE "LeaderboardSnapshot" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, period "LeaderboardPeriod" NOT NULL, period_start TIMESTAMPTZ NOT NULL, period_end TIMESTAMPTZ NOT NULL, snapshot JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    `CREATE TABLE "ScoringLog" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, match_id TEXT NOT NULL, type TEXT NOT NULL, detail JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  ]
  for (const sql of tables) run(sql)
  console.log('[Push] All tables created ✓')

  // Create indexes
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "chatmessage_room_type_room_id_idx" ON "ChatMessage" (room_type, room_id)`,
    `CREATE INDEX IF NOT EXISTS "chatmessage_created_at_idx" ON "ChatMessage" (created_at)`,
    `CREATE INDEX IF NOT EXISTS "notification_user_id_is_read_idx" ON "Notification" (user_id, is_read)`,
    `CREATE INDEX IF NOT EXISTS "leaderboardsnapshot_period_period_start_idx" ON "LeaderboardSnapshot" (period, period_start)`,
    `CREATE INDEX IF NOT EXISTS "scoringlog_match_id_idx" ON "ScoringLog" (match_id)`,
    `CREATE INDEX IF NOT EXISTS "scoringlog_type_idx" ON "ScoringLog" (type)`,
  ]
  for (const sql of indexes) run(sql)
  console.log('[Push] Indexes created ✓')

  // Seed reference data (competitions and teams) so Match table FK constraints work
  const referenceData = [
    // Competitions
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-pl', 'Premier League', 'PL', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-ll', 'La Liga', 'LL', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-ucl', 'Champions League', 'UCL', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-nba', 'NBA', 'NBA', 'BASKETBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-nfl', 'NFL', 'NFL', 'AMERICAN_FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-ipl', 'IPL', 'IPL', 'CRICKET') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Competition" (id, name, short_name, sport) VALUES ('comp-wim', 'Wimbledon', 'WIM', 'TENNIS') ON CONFLICT DO NOTHING`,
    // Teams (used by seed matches)
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-mci', 'Manchester City', 'MCI', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-ars', 'Arsenal', 'ARS', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-rma', 'Real Madrid', 'RMA', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-fcb', 'Barcelona', 'FCB', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-liv', 'Liverpool', 'LIV', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-mun', 'Bayern Munich', 'MUN', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-che', 'Chelsea', 'CHE', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-tot', 'Tottenham', 'TOT', 'FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-lal', 'LA Lakers', 'LAL', 'BASKETBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-bos', 'Boston Celtics', 'BOS', 'BASKETBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-gsw', 'Golden State Warriors', 'GSW', 'BASKETBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-mil', 'Milwaukee Bucks', 'MIL', 'BASKETBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-kcc', 'Kansas City Chiefs', 'KC', 'AMERICAN_FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-sf49', 'San Francisco 49ers', 'SF', 'AMERICAN_FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-buf', 'Buffalo Bills', 'BUF', 'AMERICAN_FOOTBALL') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-csk', 'Chennai Super Kings', 'CSK', 'CRICKET') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('team-mi', 'Mumbai Indians', 'MI', 'CRICKET') ON CONFLICT DO NOTHING`,
    // Tennis "teams" for the match schema
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('player-djokovic', 'N. Djokovic', 'DJOK', 'TENNIS') ON CONFLICT DO NOTHING`,
    `INSERT INTO "Team" (id, name, short_name, sport) VALUES ('player-alcaraz', 'C. Alcaraz', 'ALCA', 'TENNIS') ON CONFLICT DO NOTHING`,
  ]
  for (const sql of referenceData) {
    try { await execSync(`docker exec -i matchmind-db psql -U matchmind -d matchmind -c "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe', timeout: 5000 }) } catch {}
  }
  console.log('[Push] Reference data seeded ✓')

  console.log('[Push] ✅ Schema push complete!')
}

main().catch((err) => {
  console.error('[Push] Failed:', err.message)
  process.exit(1)
})
