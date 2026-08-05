const { createTestApp, createTestUser, createTestTournament } = require('./src/test-utils/e2e-setup');
const request = require('supertest');

async function main() {
  const { app, prisma } = await createTestApp();
  
  await prisma.user.upsert({
    where: { id: 'test-user-1' },
    update: {},
    create: createTestUser(),
  });
  
  await prisma.tournament.upsert({
    where: { id: 'fifa-wc-2026' },
    update: {},
    create: createTestTournament(),
  });
  
  const res = await request(app).post('/api/rooms').send({
    name: 'E2E Test Draft',
    tournamentId: 'fifa-wc-2026',
    format: 'SNAKE_DRAFT',
  }).set('Authorization', 'Bearer dummy-token'); // Mock auth requires a header usually, wait, e2e tests use api()
  
  // Wait, api() in test uses app, let me just require api from test setup if possible... no.
  // I will just use supertest.
  
  console.log('POST /api/rooms STATUS:', res.status, 'BODY:', res.body);
  
  if (res.body.id) {
    const getRes = await request(app).get('/api/rooms/' + res.body.id);
    console.log('GET /api/rooms/:id STATUS:', getRes.status, 'BODY:', getRes.body);
  }
}

main().catch(console.error).finally(() => process.exit(0));
