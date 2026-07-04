import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createCheckoutSchema } from '../config/schemas'
import asyncHandler from '../middleware/asyncHandler'
import logger from '../utils/logger'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout Session for Pro subscription
 */
router.post('/create-checkout', authenticateToken, validate(createCheckoutSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { plan } = req.body as { plan: string } // 'monthly' | 'annual'

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } })

  // If user already has a Stripe customer, reuse it
  const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } })

  let stripe: any
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  } catch {
    // Stripe not configured — return direct link for testing
    logger.info({ event: 'stripe.not_configured', userId: req.userId }, 'Stripe API key not configured, returning mock URL')
    return res.json({
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/me/settings?pro=activated`,
    })
  }

  const priceId = plan === 'annual'
    ? process.env.STRIPE_PRICE_ANNUAL
    : process.env.STRIPE_PRICE_MONTHLY

  if (!priceId) {
    return res.status(500).json({ error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe price ID not configured' } })
  }

  const session = await stripe.checkout.sessions.create({
    customer: existingSub?.stripeCustomerId || undefined,
    customer_email: existingSub ? undefined : user.email,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/me/settings?pro=activated`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
    metadata: { userId: user.id },
    ...(existingSub?.stripeCustomerId ? {} : {
      customer_creation: 'always',
    }),
  })

  res.json({ url: session.url })
}))

/**
 * POST /api/stripe/webhook
 * Stripe webhook handler — listens for subscription lifecycle events
 */
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  let event: any

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const body = Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body)
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    logger.error({ event: 'stripe.webhook_verification_failed', err: err.message }, 'Stripe webhook signature verification failed')
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const prisma = req.app.get('prisma')

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      if (!userId) break

      const subscriptionId = session.subscription
      const customerId = session.customer

      if (subscriptionId && customerId) {
        try {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
          const sub = await stripe.subscriptions.retrieve(subscriptionId)

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              plan: sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly',
              status: 'ACTIVE',
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
            update: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              plan: sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly',
              status: 'ACTIVE',
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          })

          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              proExpiresAt: new Date(sub.current_period_end * 1000),
            },
          })
        } catch (err: any) {
          logger.error({ event: 'stripe.subscription_creation_failed', err: err.message }, 'Failed to process subscription')
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const subscriptionId = sub.id

      try {
        const existing = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } })
        if (!existing) break

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'past_due' ? 'PAST_DUE' : 'CANCELLED',
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })

        if (sub.status === 'active') {
          await prisma.user.update({
            where: { id: existing.userId },
            data: {
              isPro: true,
              proExpiresAt: new Date(sub.current_period_end * 1000),
            },
          })
        } else if (sub.status === 'past_due' || sub.status === 'canceled' || sub.status === 'unpaid') {
          await prisma.user.update({
            where: { id: existing.userId },
            data: { isPro: false, proExpiresAt: null },
          })
        }
      } catch (err: any) {
        logger.error({ event: 'stripe.subscription_update_failed', err: err.message }, 'Subscription update failed')
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const subscriptionId = sub.id

      try {
        const existing = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } })
        if (!existing) break

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: 'CANCELLED', cancelAtPeriodEnd: true },
        })

        await prisma.user.update({
          where: { id: existing.userId },
          data: { isPro: false, proExpiresAt: null },
        })
      } catch (err: any) {
        logger.error({ event: 'stripe.subscription_deletion_failed', err: err.message }, 'Subscription deletion failed')
      }
      break
    }

    default:
      logger.warn({ event: 'stripe.unhandled_event', eventType: event.type }, `Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

/**
 * POST /api/stripe/create-portal-session
 * Creates a Stripe Customer Portal session for managing billing
 */
router.post('/create-portal-session', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const sub = await prisma.subscription.findUnique({ where: { userId: req.userId } })

  if (!sub?.stripeCustomerId) {
    return res.status(400).json({ error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' } })
  }

  let stripe: any
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  } catch {
    return res.json({ url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing` })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/me/settings`,
  })

  res.json({ url: portalSession.url })
}))

/**
 * GET /api/stripe/status
 * Returns the current user's subscription status
 */
router.get('/status', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      isPro: true,
      proExpiresAt: true,
      subscription: true,
    },
  })

  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } })

  res.json({
    isPro: user.isPro,
    proExpiresAt: user.proExpiresAt,
    subscription: user.subscription
      ? {
          plan: user.subscription.plan,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        }
      : null,
  })
}))

export default router
