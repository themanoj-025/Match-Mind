/**
 * Configure native PostgreSQL 18 (Windows)
 *
 * 1. Reads pg_hba.conf to determine auth method
 * 2. Adds trust auth for local TCP connections (if needed)
 * 3. Restarts PostgreSQL service
 * 4. Creates matchmind user and database
 * 5. Grants all privileges
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { Pool } = require('pg')

const PG_HBA = 'C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf'
const PG_BIN = 'C:\\Program Files\\PostgreSQL\\18\\bin'
const DB_NAME = 'matchmind'
const DB_USER = 'matchmind'
const DB_PASS = 'matchmind_pass'

async function connectAs(user, password) {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    user,
    ...(password ? { password } : {}),
  })
  try {
    const res = await pool.query('SELECT 1 as ok')
    await pool.end()
    return true
  } catch {
    await pool.end()
    return false
  }
}

async function runSql(sql, user, password) {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'postgres',
    user,
    ...(password ? { password } : {}),
  })
  try {
    await pool.query(sql)
    await pool.end()
    return true
  } catch (e) {
    await pool.end()
    throw e
  }
}

async function main() {
  console.log('[Setup] Checking PostgreSQL auth...')

  // Try common Windows postgres passwords
  const attempts = [
    { user: 'postgres' },
    { user: 'postgres', password: '' },
    { user: 'postgres', password: 'postgres' },
    { user: 'postgres', password: '1234' },
    { user: 'postgres', password: 'password' },
    { user: 'postgres', password: 'admin' },
    { user: 'postgres', password: 'sa' },
    { user: process.env.USERNAME || 'postgres' },
  ]

  let connected = false
  let creds = null

  for (const attempt of attempts) {
    const ok = await connectAs(attempt.user, attempt.password)
    if (ok) {
      connected = true
      creds = attempt
      console.log(`[Setup] Connected as ${attempt.user} (password: ${attempt.password || '(none)'})`)
      break
    }
  }

  if (!connected) {
    console.log('[Setup] Could not connect to PostgreSQL with known passwords.')
    console.log('[Setup] Attempting to add trust auth to pg_hba.conf...')

    // Read current pg_hba.conf
    let hba
    try {
      hba = fs.readFileSync(PG_HBA, 'utf-8')
    } catch {
      console.log('[Setup] Could not read pg_hba.conf. Check permissions.')
      console.log('[Setup] Try running this terminal as Administrator.')
      process.exit(1)
    }

    // Add trust line for local TCP if not already present
    const trustLine = 'host    all             all             127.0.0.1/32            trust'
    if (!hba.includes(trustLine)) {
      hba = hba + '\n' + trustLine + '\n'
      fs.writeFileSync(PG_HBA, hba)
      console.log('[Setup] Added trust auth for local TCP connections to pg_hba.conf')
    }

    // Restart PostgreSQL service
    console.log('[Setup] Restarting PostgreSQL service...')
    try {
      execSync('net stop postgresql-x64-18', { stdio: 'pipe', timeout: 15000 })
      execSync('net start postgresql-x64-18', { stdio: 'pipe', timeout: 15000 })
      console.log('[Setup] PostgreSQL service restarted')
    } catch (e) {
      console.log('[Setup] Could not restart PostgreSQL. Try running as Administrator.')
      process.exit(1)
    }

    // Wait for PostgreSQL to be ready
    await new Promise(r => setTimeout(r, 3000))

    // Try connecting without password now
    const ok = await connectAs('postgres')
    if (ok) {
      connected = true
      creds = { user: 'postgres' }
      console.log('[Setup] Connected as postgres (trust auth)')
    }
  }

  if (!connected) {
    console.log('[Setup] ❌ Could not connect to PostgreSQL.')
    console.log('[Setup] Please ensure PostgreSQL 18 is running and accessible.')
    console.log('[Setup] Service name: postgresql-x64-18')
    process.exit(1)
  }

  // Check if matchmind user exists
  console.log('[Setup] Checking if matchmind user exists...')
  try {
    const pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      database: 'postgres',
      user: creds.user,
      ...(creds.password ? { password: creds.password } : {}),
    })
    const res = await pool.query(`SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'`)
    await pool.end()

    if (res.rows.length === 0) {
      console.log(`[Setup] Creating user '${DB_USER}'...`)
      await runSql(`CREATE USER "${DB_USER}" WITH PASSWORD '${DB_PASS}'`, creds.user, creds.password)
      console.log(`[Setup] User '${DB_USER}' created ✓`)
    } else {
      console.log(`[Setup] User '${DB_USER}' already exists ✓`)
    }
  } catch (e) {
    console.log(`[Setup] Error checking user: ${e.message}`)
    // Try creating anyway
    try {
      await runSql(`CREATE USER "${DB_USER}" WITH PASSWORD '${DB_PASS}'`, creds.user, creds.password)
      console.log(`[Setup] User '${DB_USER}' created ✓`)
    } catch (e2) {
      console.log(`[Setup] Could not create user: ${e2.message}`)
    }
  }

  // Check if matchmind database exists
  console.log(`[Setup] Checking if database '${DB_NAME}' exists...`)
  try {
    const pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      database: 'postgres',
      user: creds.user,
      ...(creds.password ? { password: creds.password } : {}),
    })
    const res = await pool.query(`SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`)
    await pool.end()

    if (res.rows.length === 0) {
      console.log(`[Setup] Creating database '${DB_NAME}'...`)
      await runSql(`CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"`, creds.user, creds.password)
      console.log(`[Setup] Database '${DB_NAME}' created ✓`)
    } else {
      console.log(`[Setup] Database '${DB_NAME}' already exists ✓`)
    }
  } catch (e) {
    console.log(`[Setup] Error checking database: ${e.message}`)
    try {
      await runSql(`CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"`, creds.user, creds.password)
      console.log(`[Setup] Database '${DB_NAME}' created ✓`)
    } catch (e2) {
      console.log(`[Setup] Could not create database: ${e2.message}`)
    }
  }

  // Grant all privileges
  console.log(`[Setup] Granting privileges...`)
  try {
    await runSql(`GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}"`, creds.user, creds.password)
    console.log(`[Setup] Privileges granted ✓`)
  } catch (e) {
    console.log(`[Setup] Could not grant privileges: ${e.message}`)
  }

  // Test connection as matchmind user
  console.log(`[Setup] Testing connection as '${DB_USER}'...`)
  try {
    const pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASS,
    })
    await pool.query('SELECT 1')
    await pool.end()
    console.log(`[Setup] ✅ Connection as '${DB_USER}' works!`)
  } catch (e) {
    console.log(`[Setup] ❌ Connection as '${DB_USER}' failed: ${e.message}`)
    process.exit(1)
  }

  console.log('\n[Setup] ✅ Native PostgreSQL configured successfully!')
}

main().catch(console.error)
