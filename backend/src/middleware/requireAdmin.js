/**
 * Middleware: require ADMIN or SUPERADMIN role.
 * Extracted from matches.js and admin.js into a single shared module.
 */
async function requireAdmin(req, res, next) {
  try {
    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    })
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
      })
    }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { requireAdmin }
