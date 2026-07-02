# VOLUME 6 — DATABASE ENGINEERING

**Volume**: 6 of 25
**Title**: Database Engineering
**Assigned Personas**: Database Engineer (#6), Scalability Architect (#23), Performance Engineer (#7)
**Estimated Checkpoints**: 400
**Weight in Aggregate Scoring**: 1.5x (core database volume)
**Dependencies**: Volume 1 (Foundations)

---

## Volume Introduction

Database engineering is where correctness and performance intersect most acutely. A missing index turns a 2ms query into a 30-second sequential scan. An incorrectly chosen isolation level causes phantom reads during financial reconciliation. A backup that has never been test-restored is not a backup.

This volume covers 12 domains: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, Neo4j, ClickHouse, SQLite, Indexes, Normalization/Denormalization, Partitioning/Replication/Sharding, and Migration Safety/Backup/Recovery.

---

## 6.1 PostgreSQL

**CHECKPOINT [06.01.001]**
**Title**: Verify every FK column has a matching index
**Severity if failed**: 🟠 High
**Applies to**: PostgreSQL

**Why this matters**: PostgreSQL does not auto-index FK columns. Unindexed FKs cause sequential scans on parent tables on every DELETE/UPDATE.

**How to detect**:
```sql
SELECT conrelid::regclass AS child_table, conname AS fk_name
FROM pg_constraint
WHERE contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = conrelid
      AND i.indkey::text LIKE '%' || conkey::text || '%'
  );
```

**Bad pattern**: No index on `"userId"` in a table referencing `"User"`.
**Good pattern**: `CREATE INDEX idx_prediction_user_id ON "Prediction"("userId");`

**CHECKPOINT [06.01.002]**
**Title**: Verify autovacuum is not disabled and runs at appropriate frequency
**Severity if failed**: 🟠 High
**Applies to**: PostgreSQL

**How to detect**: `SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables WHERE n_dead_tup > 1000 ORDER BY n_dead_tup DESC;`

**CHECKPOINT [06.01.003]**
**Title**: Verify CTEs are not used as optimization fences without understanding the planner impact
**Severity if failed**: 🟡 Medium
**Applies to**: PostgreSQL >= 12

**CHECKPOINT [06.01.004]**
**Title**: Verify connection pooling is configured for high-connection workloads
**Severity if failed**: 🟠 High
**Applies to**: PostgreSQL

**Why this matters**: PostgreSQL spawns one OS process per connection. At ~200 connections, context switching degrades throughput.

**Good pattern**: PgBouncer or PgCat configured in transaction mode with `default_pool_size=25`.

---

## 6.2 MySQL

**CHECKPOINT [06.02.001]**
**Title**: Verify all tables and connections use utf8mb4 charset (not utf8mb3)
**Severity if failed**: 🔴 Critical
**Applies to**: MySQL

**Why this matters**: MySQL's `utf8` is `utf8mb3` — only supports BMP characters. Emoji and CJK Extension B cause data truncation.

**How to detect**: `SELECT table_schema, table_name, table_collation FROM information_schema.tables WHERE table_collation LIKE 'utf8_%' AND table_collation NOT LIKE 'utf8mb4_%';`

**CHECKPOINT [06.02.002]**
**Title**: Verify InnoDB buffer pool is >= 70% of available RAM for dedicated DB servers
**Severity if failed**: 🟠 High
**Applies to**: MySQL

**CHECKPOINT [06.02.003]**
**Title**: Verify no MyISAM tables remain in production
**Severity if failed**: 🟠 High
**Applies to**: MySQL

**CHECKPOINT [06.02.004]**
**Title**: Verify sql_mode has STRICT_TRANS_TABLES and ONLY_FULL_GROUP_BY
**Severity if failed**: 🟡 Medium
**Applies to**: MySQL

---

## 6.3 MongoDB

**CHECKPOINT [06.03.001]**
**Title**: Verify every collection has at least one useful index beyond _id
**Severity if failed**: 🟠 High
**Applies to**: MongoDB

**How to detect**: `db.collection("Predictions").find({ userId: ... }).explain("executionStats")` — look for COLLSCAN.

**CHECKPOINT [06.03.002]**
**Title**: Verify no unbounded array growth in documents
**Severity if failed**: 🟠 High
**Applies to**: MongoDB

**Why this matters**: 16MB BSON document limit. Unbounded `$push` hits it; even before that, frequent document moves degrade write throughput.

**Good pattern**: Use `$slice` to cap arrays: `{ $push: { loginHistory: { $each: [...], $sort: { timestamp: -1 }, $slice: 20 } } }`.

**CHECKPOINT [06.03.003]**
**Title**: Verify aggregation pipeline stage order minimizes document throughput
**Severity if failed**: 🟡 Medium
**Applies to**: MongoDB

---

## 6.4 Redis

**CHECKPOINT [06.04.001]**
**Title**: Verify eviction policy is set appropriately
**Severity if failed**: 🟠 High
**Applies to**: Redis

**Bad pattern**: `maxmemory-policy noeviction` — writes fail when memory is full.
**Good pattern**: `allkeys-lru` for general caching, `volatile-ttl` for cache-pattern with explicit TTLs.

**CHECKPOINT [06.04.002]**
**Title**: Verify keys have appropriate TTLs and no unbounded accumulation
**Severity if failed**: 🟡 Medium
**Applies to**: Redis

**CHECKPOINT [06.04.003]**
**Title**: Verify persistence is configured appropriately (RDB vs. AOF)
**Severity if failed**: 🟡 Medium
**Applies to**: Redis

---

## 6.5 Elasticsearch

**CHECKPOINT [06.05.001]**
**Title**: Verify mappings are explicit (not dynamic) for production indices
**Severity if failed**: 🟠 High
**Applies to**: Elasticsearch

**Bad pattern**: `"dynamic": true` — mapping explosion from varied input.
**Good pattern**: `"dynamic": "strict"` with all fields declared in properties.

**CHECKPOINT [06.05.002]**
**Title**: Verify shard count is right-sized (20–40GB per shard)
**Severity if failed**: 🟡 Medium
**Applies to**: Elasticsearch

---

## 6.6 Neo4j

**CHECKPOINT [06.06.001]**
**Title**: Verify labels are used on all nodes (no unlabeled nodes)
**Severity if failed**: 🟠 High
**Applies to**: Neo4j

---

## 6.7 ClickHouse

**CHECKPOINT [06.07.001]**
**Title**: Verify ORDER BY columns match common query patterns
**Severity if failed**: 🟠 High
**Applies to**: ClickHouse

---

## 6.8 SQLite

**CHECKPOINT [06.08.001]**
**Title**: Verify WAL mode is enabled for concurrent-read workloads
**Severity if failed**: 🟠 High
**Applies to**: SQLite

---

## 6.9 Indexes (Cross-Cutting)

**CHECKPOINT [06.09.001]**
**Title**: Verify composite index column order follows equality-then-range-then-sort
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Bad pattern**: `CREATE INDEX ON "Match"("createdAt", "status")` — range first, equality second.
**Good pattern**: `CREATE INDEX ON "Match"("status", "createdAt")` — equality first, range second.

**CHECKPOINT [06.09.002]**
**Title**: Verify no duplicate or redundant indexes exist
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [06.09.003]**
**Title**: Verify covering indexes for frequently accessed query patterns
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [06.09.004]**
**Title**: Verify partial indexes for filtered query patterns
**Severity if failed**: 🟢 Low
**Applies to**: PostgreSQL, SQLite

---

## 6.10 Normalization & Denormalization

**CHECKPOINT [06.10.001]**
**Title**: Verify schema is at least 3NF unless deliberate denormalization is documented
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [06.10.002]**
**Title**: Verify each denormalized column has a documented invalidation trigger
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## 6.11 Partitioning, Replication & Sharding

**CHECKPOINT [06.11.001]**
**Title**: Verify table partitioning strategy matches query patterns (partition pruning)
**Severity if failed**: 🟠 High
**Applies to**: PostgreSQL, MySQL, ClickHouse

**CHECKPOINT [06.11.002]**
**Title**: Verify read replicas have documented staleness tolerance
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [06.11.003]**
**Title**: Verify replication lag is monitored and alerted
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## 6.12 Migration Safety & Backup/Recovery

**CHECKPOINT [06.12.001]**
**Title**: Verify all schema migrations follow the Expand/Contract pattern
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**Expand/Contract pattern**:
1. Expand: Add new column (nullable), dual-write
2. Migrate: Backfill, switch reads
3. Contract: Drop old column

**CHECKPOINT [06.12.002]**
**Title**: Verify migration rollback exists for every migration
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [06.12.003]**
**Title**: Verify backups are tested by restore at least quarterly
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

"A backup that has never been test-restored is not a backup."

**CHECKPOINT [06.12.004]**
**Title**: Verify DR plan includes a non-colocated secondary
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

---

## Non-Checkpoint Deliverables

### Index-Decision Flowchart

┌─ Slow query identified? ─────────────────┐
│ Yes                                       │
├─ Run EXPLAIN ANALYZE ─────────────────────┤
│ Sequential scan? → Add index on filter    │
│ Index used but slow? → Is it covering?   │
│   No → Add INCLUDE columns                │
│   Yes → Check composite ordering          │
│ Still slow? → Consider partial index      │
└───────────────────────────────────────────┘

### EXPLAIN ANALYZE Reading Guide

| Signal | Meaning | Action |
|---|---|---|
| actual rows >> estimated rows | Stale statistics | ANALYZE table |
| Sort Method: external merge disk | Sort spilled to disk | Increase work_mem |
| Heap Fetches > 0 with Index Scan | Index not covering | Add INCLUDE columns |
| Planning Time > 100ms | Too many schemas | Simplify search_path |

---

## Volume Scorecard Template

| Subsection | Score (0–10) | Top 3 Findings | Evidence Required |
|---|---|---|---|
| 6.1 PostgreSQL | | | FK indexes, autovacuum, pool config |
| 6.2 MySQL | | | utf8mb4, InnoDB, sql_mode |
| 6.3 MongoDB | | | Indexes, array growth, pipeline order |
| 6.4 Redis | | | Eviction, TTL, persistence |
| 6.5 Elasticsearch | | | Mappings, shard sizing |
| 6.9 Indexes | | | Redundant indexes, composite ordering |
| 6.10 Normalization | | | 3NF, documented denormalization |
| 6.12 Migration/Backup | | | Expand/Contract, restore test |

---

## Closing Checklist

- [ ] 06.01.001 — FK columns indexed (PostgreSQL)
- [ ] 06.02.001 — utf8mb4 charset (MySQL)
- [ ] 06.03.002 — No unbounded array growth (MongoDB)
- [ ] 06.04.001 — Eviction policy set (Redis)
- [ ] 06.09.001 — Composite indexes: equality first, range second, sort last
- [ ] 06.09.002 — No redundant indexes
- [ ] 06.12.001 — Expand/Contract pattern used
- [ ] 06.12.003 — Backups test-restored quarterly

---

*End of Volume 6*
