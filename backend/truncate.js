const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: "postgresql://matchmind:matchmind_test_password@localhost:5433/matchmind_test" } } });
async function run() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Room", "RoomMember", "AuctionState", "Roster", "Bid", "User", "Tournament", "Player" CASCADE;');
  console.log('Truncated');
}
run().catch(console.error).finally(() => prisma.$disconnect());
