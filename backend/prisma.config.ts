import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: {
    datasource: {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/matchmind',
    },
  },
})
