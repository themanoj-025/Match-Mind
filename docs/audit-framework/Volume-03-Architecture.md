# VOLUME 3 — ARCHITECTURE

**Volume**: 3 of 25
**Title**: Architecture
**Assigned Personas**: Principal Architect (#1), Scalability Architect (#23), Staff Backend Engineer (#2)
**Estimated Checkpoints**: 380
**Weight in Aggregate Scoring**: 1.5x (core architecture volume)
**Dependencies**: Volume 1 (Foundations), Volume 2 (Project Discovery)

---

## Volume Introduction

Architecture is the most expensive dimension of software to get wrong and the hardest to fix after the fact. A bug in a controller can be fixed in 15 minutes; a missing layer boundary coupled across 200 files over 18 months takes weeks to untangle.

This volume covers 12 architecture patterns across three clusters:

**Layered patterns** (§3.1–3.4): Clean, Hexagonal, Onion, MVC
**Behavioral patterns** (§3.5–3.8): MVVM, CQRS, Event-Driven, DDD
**Deployment patterns** (§3.9–3.12): Modular Monolith, Microservices, Serverless, Plugin Architecture

For each pattern: definition, when it's the right choice, when it's over-engineering, and tell-tale signs of a poorly executed version.

---

## 3.1 Clean Architecture

**CHECKPOINT [03.01.001]**
**Title**: Verify the dependency rule points inward (outer layers depend on inner layers, never the reverse)
**Severity if failed**: 🔴 Critical
**Applies to**: Projects claiming Clean Architecture

**Why this matters**: The defining constraint of Clean Architecture is that dependencies point inward. When a domain entity imports a framework or database driver, the architecture is violated and testing becomes difficult.

**Bad pattern**: Domain entity imports `@nestjs/common` or `import { Entity, Column } from 'typeorm'`.
**Good pattern**: Domain entities import only standard library types and domain interfaces.

**CHECKPOINT [03.01.002]**
**Title**: Verify use case interactors don't reference framework constructs
**Severity if failed**: 🟠 High
**Applies to**: Projects claiming Clean Architecture

**Bad pattern**: `class CreateUserInteractor extends BaseController { ... }` — interactor inherits from framework class.
**Good pattern**: Interactor implements a domain-specific interface: `class CreateUserInteractor implements CreateUserUseCase`.

---

## 3.2 Hexagonal Architecture (Ports and Adapters)

**CHECKPOINT [03.02.001]**
**Title**: Verify ports are interfaces in the domain, not concrete classes
**Severity if failed**: 🔴 Critical
**Applies to**: Projects claiming Hexagonal Architecture

**Bad pattern**: Repository interface defined in the infrastructure layer, imported by domain.
**Good pattern**: Repository interface defined in the domain package; infrastructure adapter implements it.

**CHECKPOINT [03.02.002]**
**Title**: Verify adapters are replaceable without modifying domain code
**Severity if failed**: 🟠 High
**Applies to**: Projects claiming Hexagonal Architecture

**How to detect**: Check if swapping from PostgreSQL to MongoDB requires touching domain files.

---

## 3.3 Onion Architecture

**CHECKPOINT [03.03.001]**
**Title**: Verify the domain model has no dependency on infrastructure concerns
**Severity if failed**: 🔴 Critical
**Applies to**: Projects claiming Onion Architecture

---

## 3.4 MVC

**CHECKPOINT [03.04.001]**
**Title**: Verify controllers don't contain business logic
**Severity if failed**: 🟠 High
**Applies to**: Projects claiming MVC

**Bad pattern**: Controller doing database queries, validation, and response formatting in one method.
**Good pattern**: Controller parses request → calls service → formats response (thin controller, fat service).

**CHECKPOINT [03.04.002]**
**Title**: Verify models don't contain view logic (formatting, HTML generation)
**Severity if failed**: 🟡 Medium
**Applies to**: Projects claiming MVC

---

## 3.5 MVVM

**CHECKPOINT [03.05.001]**
**Title**: Verify the ViewModel doesn't reference the View directly
**Severity if failed**: 🟠 High
**Applies to**: Projects claiming MVVM (especially WPF, Android, iOS)

---

## 3.6 CQRS

**CHECKPOINT [03.06.001]**
**Title**: Verify command handlers don't return domain data
**Severity if failed**: 🟠 High
**Applies to**: Projects claiming CQRS

**Why this matters**: In CQRS, commands change state but don't return data (void). Returning data blurs the command/query separation.

**CHECKPOINT [03.06.002]**
**Title**: Verify read and write models are separate (not the same ORM entity used for both)
**Severity if failed**: 🟡 Medium
**Applies to**: Projects claiming CQRS

---

## 3.7 Event-Driven

**CHECKPOINT [03.07.001]**
**Title**: Verify event handlers are idempotent (handling the same event twice produces the same result)
**Severity if failed**: 🔴 Critical
**Applies to**: Event-driven systems

**Why this matters**: Message delivery "at least once" is the norm. Non-idempotent handlers produce duplicate side effects.

**CHECKPOINT [03.07.002]**
**Title**: Verify dead letter queue is configured for failed events
**Severity if failed**: 🟠 High
**Applies to**: Event-driven systems

---

## 3.8 Domain-Driven Design

**CHECKPOINT [03.08.001]**
**Title**: Verify aggregate roots enforce consistency boundaries (no cross-aggregate transactional updates)
**Severity if failed**: 🟠 High
**Applies to**: Projects claiming DDD

**CHECKPOINT [03.08.002]**
**Title**: Verify bounded context mapping is documented (shared kernel, anti-corruption layer, etc.)
**Severity if failed**: 🟡 Medium
**Applies to**: Projects claiming DDD

---

## 3.9 Modular Monolith

**CHECKPOINT [03.09.001]**
**Title**: Verify modules don't share database tables (each module has its own schema)
**Severity if failed**: 🟠 High
**Applies to**: Modular monoliths

**CHECKPOINT [03.09.002]**
**Title**: Verify module boundaries are enforced (module A cannot import module B's repository directly)
**Severity if failed**: 🟡 Medium
**Applies to**: Modular monoliths

---

## 3.10 Microservices

**CHECKPOINT [03.10.001]**
**Title**: Verify each service has its own datastore (no shared database across services)
**Severity if failed**: 🔴 Critical
**Applies to**: Microservice architectures

**CHECKPOINT [03.10.002]**
**Title**: Verify service-to-service communication is via API/events, not shared database
**Severity if failed**: 🔴 Critical
**Applies to**: Microservice architectures

**CHECKPOINT [03.10.003]**
**Title**: Verify each service can be deployed independently (no coordinated deploys)
**Severity if failed**: 🟠 High
**Applies to**: Microservice architectures

---

## 3.11 Serverless

**CHECKPOINT [03.11.001]**
**Title**: Verify cold start time is within acceptable limits for the use case
**Severity if failed**: 🟠 High
**Applies to**: Serverless (Lambda, Cloud Functions)

**CHECKPOINT [03.11.002]**
**Title**: Verify no shared mutable state between function invocations
**Severity if failed**: 🔴 Critical
**Applies to**: Serverless

---

## 3.12 Plugin Architecture

**CHECKPOINT [03.12.001]**
**Title**: Verify plugins are loaded via a stable interface, not by importing plugin modules directly
**Severity if failed**: 🟠 High
**Applies to**: Plugin-architecture projects

---

## Non-Checkpoint Deliverable: Pattern-Mismatch Red-Flag Table

| Claimed Pattern | Red Flag | Likely Actual Pattern |
|---|---|---|
| Clean Architecture | Domain entities import framework | MVC under the hood |
| Microservices | Shared database | Distributed monolith |
| CQRS | Same model for read/write | Single-path CRUD |
| Hexagonal | Port defined in infrastructure | Adapter leak |
| Event-Driven | Handlers are not idempotent | At-most-once delivery |
| DDD | No bounded context mapping | Undifferentiated Big Ball of Mud |

---

## Volume Scorecard Template

| Subsection | Score (0–10) | Top 3 Findings | Evidence |
|---|---|---|---|
| 3.1 Clean | | | Dependency direction check |
| 3.2 Hexagonal | | | Port/adapter separation |
| 3.3 Onion | | | Domain independence |
| 3.4 MVC | | | Controller thinness |
| 3.5 MVVM | | | View/ViewModel decoupling |
| 3.6 CQRS | | | Command/query separation |
| 3.7 Event-Driven | | | Idempotency, DLQ |
| 3.8 DDD | | | Aggregate boundaries |
| 3.9 Modular Monolith | | | Module isolation |
| 3.10 Microservices | | | Database isolation |
| 3.11 Serverless | | | Cold start, state |
| 3.12 Plugin | | | Plugin interface |

---

## Reusable Prompts

**PROMPT [ARCH.001] — Architecture Pattern Validation**
Check if a codebase's actual architecture matches its claimed pattern.

**PROMPT [ARCH.002] — Microservice Decomposition Review**
Evaluate whether a service should be split or merged based on coupling.

**PROMPT [ARCH.003] — Module Boundary Enforcement**
Detect boundary violations in a modular monolith.

---

## Closing Checklist

- [ ] 03.01.001 — Dependency rule verified (inner layers import nothing from outer)
- [ ] 03.06.001 — Commands return void in CQRS
- [ ] 03.07.001 — Event handlers idempotent
- [ ] 03.09.001 — Modular monolith modules have separate schemas
- [ ] 03.10.001 — Microservices have independent datastores
- [ ] 03.11.002 — No shared mutable state in serverless

---

*End of Volume 3*
