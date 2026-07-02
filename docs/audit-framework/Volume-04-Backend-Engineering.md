# VOLUME 4 — BACKEND ENGINEERING

**Volume**: 4 of 25
**Title**: Backend Engineering
**Assigned Personas**: Staff Backend Engineer (#2), Principal Architect (#1), QA Lead (#9)
**Estimated Checkpoints**: 400
**Weight in Aggregate Scoring**: 1.5x (core backend volume)
**Dependencies**: Volume 1 (Foundations), Volume 3 (Architecture), Volume 8 (Security Engineering)

---

## Volume Introduction

Backend engineering is where architecture meets implementation. The patterns defined in Volume 3 are realized here — or violated. A controller that directly queries the database, a service that sends HTTP responses, a repository that performs business validation — each is a boundary violation that makes the codebase harder to test, harder to change, and more dangerous to refactor.

This volume covers 12 domains:
1. **Controllers** (§4.1) — request parsing, response formatting, thin controller enforcement.
2. **Services** (§4.2) — business logic organization, service granularity, orchestration.
3. **Repositories** (§4.3) — data access abstraction, query isolation, testability.
4. **Middlewares** (§4.4) — cross-cutting concerns, middleware ordering, error propagation.
5. **Workers & Queues** (§4.5) — background job design, idempotency, retry logic, DLQ.
6. **Caching** (§4.6) — strategy selection, invalidation patterns, thundering herd prevention.
7. **Authentication Integration** (§4.7) — how backend integrates with auth (cross-ref Vol 8).
8. **Authorization (RBAC/ABAC)** (§4.8) — permission models, policy enforcement points.
9. **Error Handling** (§4.9) — consistent error shapes, error categorization, boundaries.
10. **Validation** (§4.10) — input validation layers, schema validation, sanitization.
11. **Transactions** (§4.11) — boundaries, isolation levels, deadlock detection, sagas.
12. **Concurrency** (§4.12) — race conditions, idempotent retries, optimistic/pessimistic locking.

---

## 4.1 Controllers

**CHECKPOINT [04.01.001]**
**Title**: Verify controllers contain no business logic
**Severity if failed**: 🟠 High
**Applies to**: Universal

**Why this matters**: Business logic in controllers is untestable without HTTP calls and unreusable across contexts (web, worker, CLI). Every line of business logic in a controller is a refactoring liability.

**Bad pattern**: Controller that queries DB, validates business rules, and updates scores directly.
**Good pattern**: Controller parses request → calls service → formats response.

```javascript
// BAD
router.post('/predictions', async (req, res) => {
  const match = await db.query('SELECT * FROM matches WHERE id = $1', [req.body.matchId]);
  if (!match) return res.status(404).json({ error: 'Not found' });
  if (match.status !== 'PENDING') return res.status(400).json({ error: 'Match started' });
  await db.query('INSERT INTO predictions ...');
  res.status(201).json({ success: true });
});

// GOOD
router.post('/predictions', asyncHandler(async (req, res) => {
  const result = await predictionService.createPrediction(req.user.id, req.body);
  res.status(201).json(result);
}));
```

**CHECKPOINT [04.01.002]**
**Title**: Verify controllers forward errors to centralized middleware
**Severity if failed**: 🟡 Medium
**Applies to**: Express/Fastify/Koa

**Good pattern**: `asyncHandler` wrapper + centralized error middleware (see 04.09.001).

---

## 4.2 Services

**CHECKPOINT [04.02.001]**
**Title**: Verify each service has a single responsibility (<= 4 injected dependencies)
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Bad pattern**: `UserService` with 5+ dependencies (db, email, reports, subscriptions, auth).
**Good pattern**: Separate `UserProfileService` and `UserNotificationService`.

**CHECKPOINT [04.02.002]**
**Title**: Verify services don't reference HTTP concerns (req, res, status codes)
**Severity if failed**: 🟠 High
**Applies to**: Universal

**Bad pattern**: `async getMatch(req, res) { res.json(...) }` — tight coupling to HTTP.
**Good pattern**: `async getMatch(matchId)` — pure domain callable from any entry point.

**CHECKPOINT [04.02.003]**
**Title**: Verify service methods return domain objects, not database entities
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

---

## 4.3 Repositories

**CHECKPOINT [04.03.001]**
**Title**: Verify repositories abstract the data source
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [04.03.002]**
**Title**: Verify repository methods don't contain business logic or validation
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [04.03.003]**
**Title**: Verify repository returns null for not-found (not throwing NotFound)
**Severity if failed**: 🟢 Low
**Applies to**: Universal

---

## 4.4 Middlewares

**CHECKPOINT [04.04.001]**
**Title**: Verify middleware execution order: rate limiter → auth → validation → routes → error handler
**Severity if failed**: 🟠 High
**Applies to**: Express/Fastify/Koa

**CHECKPOINT [04.04.002]**
**Title**: Verify cross-cutting concerns are in middleware, not duplicated in controllers
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

---

## 4.5 Workers & Queues

**CHECKPOINT [04.05.001]**
**Title**: Verify every worker is idempotent
**Severity if failed**: 🔴 Critical
**Applies to**: Background job systems

**Why this matters**: Queues deliver "at least once." Duplicate processing of non-idempotent workers causes double charges, double notifications, etc.

**Bad pattern**: `INSERT INTO scores ...` — duplicate on retry.
**Good pattern**: `INSERT ... ON CONFLICT DO UPDATE` or check-then-insert.

**CHECKPOINT [04.05.002]**
**Title**: Verify worker failure has retry with backoff + dead letter queue
**Severity if failed**: 🔴 Critical
**Applies to**: Background job systems

**CHECKPOINT [04.05.003]**
**Title**: Verify job timeout reflects expected processing time (with buffer)
**Severity if failed**: 🟡 Medium
**Applies to**: Background job systems

---

## 4.6 Caching

**CHECKPOINT [04.06.001]**
**Title**: Verify cache invalidation strategy is documented
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [04.06.002]**
**Title**: Verify cache-aside uses distributed lock to prevent thundering herd
**Severity if failed**: 🟡 Medium
**Applies to**: Redis/Memcached

---

## 4.7 Authentication Integration

**CHECKPOINT [04.07.001]**
**Title**: Verify auth middleware extracts user identity and attaches to request context
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

---

## 4.8 Authorization (RBAC/ABAC)

**CHECKPOINT [04.08.001]**
**Title**: Verify authorization checks reference the authenticated user, not request body
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

---

## 4.9 Error Handling

**CHECKPOINT [04.09.001]**
**Title**: Verify every async route handler has an error boundary
**Severity if failed**: 🔴 Critical
**Applies to**: Node.js

**CHECKPOINT [04.09.002]**
**Title**: Verify error categories map consistently to HTTP status codes
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [04.09.003]**
**Title**: Verify errors don't leak stack traces in production
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## 4.10 Validation

**CHECKPOINT [04.10.001]**
**Title**: Verify every input is validated at API boundary (controller) AND service boundary
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

---

## 4.11 Transactions

**CHECKPOINT [04.11.001]**
**Title**: Verify transaction boundaries are at the service layer, not the repository
**Severity if failed**: 🟠 High
**Applies to**: RDBMS

**CHECKPOINT [04.11.002]**
**Title**: Verify isolation level is appropriate (not always SERIALIZABLE)
**Severity if failed**: 🟡 Medium
**Applies to**: RDBMS

---

## 4.12 Concurrency

**CHECKPOINT [04.12.001]**
**Title**: Verify optimistic locking for read-then-write contention scenarios
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [04.12.002]**
**Title**: Verify no unbounded concurrent operations (goroutines/promises limited)
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## Non-Checkpoint Deliverables

### A. Layered-Architecture Violation Detector Checklist

**Controller violations:**
- [ ] Controller calls `db.query()` or ORM methods directly?
- [ ] Controller contains if/else on business rules?
- [ ] Controller has > 5 lines beyond validation + service call + response?

**Service violations:**
- [ ] Service imports req, res, request, or response?
- [ ] Service directly accesses database (not through repository)?
- [ ] Service constructor has > 4 dependencies?
- [ ] Service returns raw DB row instead of domain object?

**Repository violations:**
- [ ] Repository contains business validation?
- [ ] Repository manages its own transactions?
- [ ] Repository throws domain exceptions (NotFoundError)?
- [ ] Repository returns ORM-annotated entity?

### B. Transaction-Boundary Decision Guide

| Use Case | Isolation Level | Rationale |
|---|---|---|
| Read-only reports | READ COMMITTED | Max concurrency |
| Financial reconciliation | SERIALIZABLE | Prevent write skew |
| Create record (INSERT only) | READ COMMITTED | No conflicting reads |
| Read-then-write update | REPEATABLE READ | Prevent lost update |

---

## Volume Scorecard Template

| Subsection | Score (0-10) | Top 3 Findings | Evidence |
|---|---|---|---|
| 4.1 Controllers | | | Controller files, error middleware |
| 4.2 Services | | | Service files, DI config |
| 4.3 Repositories | | | Repository files, query patterns |
| 4.4 Middlewares | | | Middleware order, cross-cutting |
| 4.5 Workers/Queues | | | Idempotency, retry, DLQ |
| 4.6 Caching | | | Cache strategy, invalidation |
| 4.7 Auth Integration | | | Auth middleware, user extraction |
| 4.8 Authorization | | | RBAC/ABAC, permission checks |
| 4.9 Error Handling | | | Error middleware, classification |
| 4.10 Validation | | | Validation schemas, multi-layer |
| 4.11 Transactions | | | Boundaries, isolation levels |
| 4.12 Concurrency | | | Locking, unbounded ops |

---

## Reusable Prompts

**PROMPT [BACKEND.001] — Layered Architecture Violation Audit**
Scan controllers, services, and repositories for boundary violations using the violation detector checklist. Report each with file:line and severity.

**PROMPT [BACKEND.002] — Transaction Boundary Analysis**
Review all transactions for correct boundaries, appropriate isolation levels, deadlock risk, and saga vs. transaction decisions.

**PROMPT [BACKEND.003] — Queue Worker Safety Audit**
Audit background job handlers for idempotency, retry/backoff, DLQ setup, timeout sizing, and concurrency limits.

**PROMPT [BACKEND.004] — Error Handling Consistency Review**
Audit error handling across all layers for boundaries, error envelope consistency, and production leakage.

---

## Closing Checklist

- [ ] 04.01.001 — Controllers have no business logic (thin controller)
- [ ] 04.01.002 — Controllers forward errors to centralized middleware
- [ ] 04.02.001 — Services have single responsibility (<= 4 dependencies)
- [ ] 04.02.002 — Services don't reference HTTP concerns
- [ ] 04.03.001 — Repositories abstract data source
- [ ] 04.04.001 — Middleware order: rate limiter → auth → validation → routes → error handler
- [ ] 04.05.001 — Workers are idempotent
- [ ] 04.05.002 — Workers have retry with backoff + DLQ
- [ ] 04.06.001 — Cache invalidation strategy documented
- [ ] 04.09.001 — Async route handlers have error boundaries
- [ ] 04.10.001 — Input validated at controller AND service boundaries
- [ ] 04.11.001 — Transaction boundaries at service layer
- [ ] 04.12.001 — Optimistic locking for read-then-write operations
- [ ] 04.12.002 — No unbounded concurrent operations

---

*End of Volume 4*