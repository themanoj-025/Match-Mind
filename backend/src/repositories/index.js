/**
 * Bridge file — re-exports from TypeScript source.
 * tsx (registered in vitest poolOptions) handles the .ts file transformation.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require('./index.ts')
module.exports = mod
