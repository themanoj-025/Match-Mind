/**
 * Database setup script — delegates to working scripts
 *
 * Steps:
 *   1. generate — prisma generate (works with top-level datasourceUrl config)
 *   2. push — push-schema.js (docker exec workaround for Prisma 7 bug)
 *   3. seed — seed-db.js (docker exec workaround for Prisma 7 bug)
 *
 * Usage: node scripts/setup-db.js [generate|push|seed|all]
 */

const { execSync } = require('child_process')
const path = require('path')

const ROOT = path.join(__dirname, '..')

function run(cmd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: ROOT })
}

async function main() {
  const command = process.argv[2] || 'all'

  if (command === 'generate' || command === 'all') {
    console.log('[Setup] Generating Prisma client...')
    run('npx prisma generate')
  }

  if (command === 'push' || command === 'all') {
    console.log('\n[Setup] Pushing schema to database...')
    run('node scripts/push-schema.js')
  }

  if (command === 'seed' || command === 'all') {
    console.log('\n[Setup] Seeding database...')
    run('node scripts/seed-db.js')
  }

  if (command === 'all') {
    console.log('\n[Setup] ✅ All done!')
    console.log('    Frontend: http://localhost:3000')
    console.log('    Backend:  http://localhost:4000')
    console.log('    Demo:     demo@matchmind.gg / password123')
  }
}

main().catch((err) => {
  console.error('[Setup] Failed:', err.message)
  process.exit(1)
})
