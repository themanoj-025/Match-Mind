import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.js', 'src/**/*.spec.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/services/**', 'src/middleware/validate.js', 'src/utils/**'],
      thresholds: {
        branches: 40,
        functions: 40,
        lines: 40,
        statements: 40,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Use tsx to handle TypeScript files loaded via CommonJS require()
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: ['--import', 'tsx'],
      },
      threads: {
        execArgv: ['--import', 'tsx'],
      },
    },
  },
})
