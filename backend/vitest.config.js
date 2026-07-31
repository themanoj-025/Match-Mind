import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-utils/setup-env.ts'],
    envPrefix: [''],
    include: ['src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}'],
    exclude: ['node_modules', 'dist', 'src/e2e/**'],
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
    fileParallelism: false,
  },
})
