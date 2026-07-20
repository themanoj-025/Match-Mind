import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-utils/setup-env.ts'],
    envPrefix: [''],
    include: ['src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/services/**', 'src/middleware/validate.js', 'src/utils/**'],
      thresholds: {
        branches: 45,
        functions: 35,
        lines: 45,
        statements: 45,
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
