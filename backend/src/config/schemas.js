/**
 * Zod validation schemas — re-exported from TypeScript source.
 *
 * This file exists as a bridge during the JS→TS migration.
 * All schema definitions live in schemas.ts; this file re-exports them
 * so that existing require() imports continue to work.
 */
const schemas = require('./schemas')
module.exports = schemas
