/**
 * Zod-based request validation middleware.
 *
 * Usage:
 *   router.post('/signup', validate(signupSchema), handler)
 *
 * The schema can validate `body`, `query`, or `params`.
 * On failure, returns 400 with a consistent error shape.
 */
const { z } = require('zod')

/**
 * Wraps a Zod schema (for body, query, or params) into Express middleware.
 * @param {z.ZodType} schema  — Zod schema to validate against
 * @param {'body'|'query'|'params'} source  — which part of the request to validate
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }))
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors,
        },
      })
    }
    // Replace original input with parsed/coerced data
    req[source] = result.data
    next()
  }
}

module.exports = { validate }
