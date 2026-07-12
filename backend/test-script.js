const { PrismaClient } = require('@prisma/client');
async function test() {
  const p1 = new PrismaClient({ datasources: { db: { url: 'postgresql://matchmind:matchmind_test_password@localhost:5433/matchmind_test' } } });
  try { await p1.$connect(); console.log('p1 works'); } catch (e) { console.error('p1 fail:', e.message); }
  const p2 = new PrismaClient({ datasources: { db: { url: 'postgresql://matchmind:matchmind_pass@localhost:5433/matchmind' } } });
  try { await p2.$connect(); console.log('p2 works'); } catch (e) { console.error('p2 fail:', e.message); }
}
test();
