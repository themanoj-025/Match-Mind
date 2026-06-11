import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  datasourceUrl: process.env.DATABASE_URL || 'postgresql://matchmind:matchmind_pass@localhost:5432/matchmind',
})
