# VOLUME 7 — API ENGINEERING

**Volume**: 7 of 25
**Title**: API Engineering
**Assigned Personas**: API Design Reviewer (#12), Staff Backend Engineer (#2), Security Engineer (AppSec) (#4)
**Estimated Checkpoints**: 380
**Weight in Aggregate Scoring**: 1.5x (core API volume)
**Dependencies**: Volume 1 (Foundations), Volume 8 (Security Engineering)

---

## Volume Introduction

APIs are the contract between a service and its consumers. A well-designed API communicates intent, prevents misuse, and evolves without breaking consumers. This volume covers REST, GraphQL, gRPC, WebSocket, SSE, versioning/pagination/filtering, and cross-cutting concerns (auth, rate limiting, idempotency, OpenAPI).

---

## 7.1 REST

**CHECKPOINT [07.01.001]**
**Title**: Verify endpoints use nouns, not verbs, in resource paths
**Severity if failed**: 🟡 Medium
**Applies to**: REST APIs

**Bad pattern**: `/api/getUsers`, `/api/createMatch`, `/api/deletePrediction/:id`
**Good pattern**: `/api/users` (GET), `/api/matches` (POST), `/api/predictions/:id` (DELETE)

**CHECKPOINT [07.01.002]**
**Title**: Verify HTTP verbs are semantically correct for the operation
**Severity if failed**: 🟡 Medium
**Applies to**: REST APIs

| Operation | Verb | Success | Idempotent | Safe |
|---|---|---|---|---|
| List | GET | 200 | Yes | Yes |
| Read | GET /{id} | 200 | Yes | Yes |
| Create | POST | 201 | No | No |
| Replace | PUT /{id} | 200 | Yes | No |
| Partial Update | PATCH /{id} | 200 | Not always | No |
| Delete | DELETE /{id} | 204 | Yes | No |

**CHECKPOINT [07.01.003]**
**Title**: Verify error responses follow a consistent JSON envelope
**Severity if failed**: 🟡 Medium
**Applies to**: REST APIs

**Good pattern**: RFC 7807 Problem Details — `{ type, title, status, detail, instance, timestamp }`

**CHECKPOINT [07.01.004]**
**Title**: Verify 401 and 403 are used correctly
**Severity if failed**: 🟡 Medium
**Applies to**: REST APIs

- 401: Not authenticated (missing/invalid credentials)
- 403: Authenticated but not authorized (insufficient permissions)

---

## 7.2 GraphQL

**CHECKPOINT [07.02.001]**
**Title**: Verify N+1 query problem is prevented with Dataloader
**Severity if failed**: 🔴 Critical
**Applies to**: GraphQL APIs

**Why this matters**: Without batching, a query returning 100 matches × 100 predictions fires 10,100 SQL queries.

**Good pattern**: `const predictionLoader = new DataLoader(async (matchIds) => { ... });`

**CHECKPOINT [07.02.002]**
**Title**: Verify query complexity/cost analysis is configured
**Severity if failed**: 🟠 High
**Applies to**: GraphQL APIs

**CHECKPOINT [07.02.003]**
**Title**: Verify field-level authorization is enforced in resolvers, not schema directives alone
**Severity if failed**: 🔴 Critical
**Applies to**: GraphQL APIs

**CHECKPOINT [07.02.004]**
**Title**: Verify introspection is disabled in production
**Severity if failed**: 🟡 Medium
**Applies to**: GraphQL APIs

---

## 7.3 gRPC

**CHECKPOINT [07.03.001]**
**Title**: Verify all RPCs have defined deadlines/timeouts
**Severity if failed**: 🔴 Critical
**Applies to**: gRPC

**Why this matters**: gRPC defaults to no deadline. A stuck RPC holds resources indefinitely.

**CHECKPOINT [07.03.002]**
**Title**: Verify error codes follow gRPC canonical error model
**Severity if failed**: 🟡 Medium
**Applies to**: gRPC

---

## 7.4 WebSocket

**CHECKPOINT [07.04.001]**
**Title**: Verify heartbeat/ping-pong is implemented
**Severity if failed**: 🟠 High
**Applies to**: WebSocket APIs

**CHECKPOINT [07.04.002]**
**Title**: Verify message size limit is configured
**Severity if failed**: 🟠 High
**Applies to**: WebSocket APIs

---

## 7.5 Server-Sent Events

**CHECKPOINT [07.05.001]**
**Title**: Verify Content-Type: text/event-stream and proper SSE message format
**Severity if failed**: 🟡 Medium
**Applies to**: SSE APIs

---

## 7.6 Versioning, Pagination & Filtering

**CHECKPOINT [07.06.001]**
**Title**: Verify a versioning strategy exists and is documented
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [07.06.002]**
**Title**: Verify cursor-based pagination for large collections instead of offset-based
**Severity if failed**: 🟡 Medium
**Applies to**: REST, GraphQL

**Why this matters**: `OFFSET 1000000 LIMIT 20` scans 1,000,020 rows. Cursor-based uses indexed WHERE cursor queries.

**CHECKPOINT [07.06.003]**
**Title**: Verify filter parameters are validated against an allowlist
**Severity if failed**: 🔴 Critical
**Applies to**: REST, GraphQL

**Bad pattern**: `db.matches.find(req.query)` — full query injection possible.
**Good pattern**: `ALLOWED_FILTERS` map with type validation per parameter.

---

## 7.7 Cross-Cutting

**CHECKPOINT [07.07.001]**
**Title**: Verify auth header format is documented and validated consistently
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [07.07.002]**
**Title**: Verify rate limiting applies to all endpoints, not just auth
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [07.07.003]**
**Title**: Verify idempotency key support for payment, creation, and mutation endpoints
**Severity if failed**: 🔴 Critical
**Applies to**: REST APIs

**Idempotency pattern**: Client sends `Idempotency-Key: <uuid>` header. Server checks Redis cache before processing; caches response after processing with 24h TTL.

**CHECKPOINT [07.07.004]**
**Title**: Verify OpenAPI/Swagger spec exists, is validated, and matches implementation
**Severity if failed**: 🟡 Medium
**Applies to**: REST APIs

**CHECKPOINT [07.07.005]**
**Title**: Verify HTTPS (TLS) in all non-local environments
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

---

## Non-Checkpoint Deliverables

### REST Verb/Status-Code Matrix

| Operation | Verb | Success | Idempotent | Safe |
|---|---|---|---|---|
| List | GET | 200 | Yes | Yes |
| Read | GET /{id} | 200 | Yes | Yes |
| Create | POST | 201 | No | No |
| Full replace | PUT /{id} | 200 | Yes | No |
| Partial update | PATCH /{id} | 200 | Not always | No |
| Delete | DELETE /{id} | 204 | Yes | No |

### Error Code Ranges

| Code | Meaning | Example |
|---|---|---|
| 400 | Bad request | Missing required field |
| 401 | Unauthenticated | Invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not found | Resource ID not exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Email format invalid |
| 429 | Rate limited | Too many requests |
| 500 | Internal error | Unhandled exception |

### Idempotency Key Pattern

1. Client sends `Idempotency-Key: <uuid>` header
2. Server validates UUID format
3. Server checks Redis: `GET idempotency:<key>` → if found, return cached response
4. If not found, process request, then `SET idempotency:<key> <response> EX 86400`
5. Use `SETNX` for concurrent request deduplication

---

## Volume Scorecard Template

| Subsection | Score (0–10) | Top 3 Findings | Evidence Required |
|---|---|---|---|
| 7.1 REST | | | Route definitions, error samples |
| 7.2 GraphQL | | | Dataloader, cost analysis, introspection |
| 7.3 gRPC | | | Deadlines, error model, TLS |
| 7.4 WebSocket | | | Heartbeat, message size |
| 7.5 SSE | | | Content-Type, format |
| 7.6 Versioning | | | Strategy doc, pagination, filter validation |
| 7.7 Cross-Cutting | | | Auth, rate limiting, idempotency, OpenAPI |

---

## Reusable Prompts

**PROMPT [API.001] — REST API Design Audit**
Audit REST API for resource naming, verb correctness, status codes, error envelope consistency.

**PROMPT [API.002] — GraphQL Health Check**
Audit GraphQL API for N+1 prevention, cost analysis, authorization, introspection, depth limits.

**PROMPT [API.003] — API Security Hardening**
Audit auth consistency, rate limiting coverage, idempotency keys, HTTPS, security headers, CORS.

**PROMPT [API.004] — Pagination & Filtering Audit**
Audit pagination strategy, filter injection prevention, sort allowlisting, max page size.

---

## Closing Checklist

- [ ] 07.01.001 — Noun-based resource paths
- [ ] 07.01.002 — HTTP verb correctness per matrix
- [ ] 07.01.003 — Consistent error envelope
- [ ] 07.02.001 — N+1 prevention with Dataloader
- [ ] 07.02.002 — Query complexity/cost analysis
- [ ] 07.02.004 — Introspection disabled in production
- [ ] 07.03.001 — Deadlines on all RPCs
- [ ] 07.04.001 — WebSocket heartbeat
- [ ] 07.06.002 — Cursor-based pagination
- [ ] 07.06.003 — Filter parameter allowlist
- [ ] 07.07.002 — Rate limiting on all endpoints
- [ ] 07.07.003 — Idempotency keys on mutations
- [ ] 07.07.005 — HTTPS in production

---

*End of Volume 7*
