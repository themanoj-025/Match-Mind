# VOLUME 2 — PROJECT DISCOVERY

**Volume**: 2 of 25
**Title**: Project Discovery
**Assigned Personas**: Principal Architect (#1), Technical Writer (#14), DevOps/Platform Engineer (#10)
**Estimated Checkpoints**: 360
**Weight in Aggregate Scoring**: 1.0x (foundational — sets the stage for all subsequent analysis)
**Dependencies**: Volume 1 (Foundations)

---

## Volume Introduction

Before any checkpoint in Volumes 3–25 can be applied, the auditor must answer: What is this project? What language and framework does it use? How is it structured? How is it built and deployed? These questions form the Discover phase.

This volume covers nine discovery domains:

1. **Repository Analysis** — commit history health, branch strategy, CODEOWNERS, git hygiene.
2. **Folder Analysis** — structure-to-architecture mapping, monorepo vs. polyrepo signals.
3. **Dependency Analysis** — direct vs. transitive dependency quality, license scanning, unused dependencies.
4. **Tech Stack Detection** — fingerprinting a stack from lockfiles, configs, and extensions.
5. **Build Analysis** — build reproducibility, build time budget, tooling correctness.
6. **Runtime Analysis** — process model, resource footprint at idle, startup time.
7. **Configuration Review** — env var inventory, secret detection, config-as-code quality.
8. **Environment Review** — dev/staging/prod parity, environment-specific drift detection.
9. **Documentation Review** — completeness rubric, staleness detection, accuracy verification.

---

## 2.1 Repository Analysis

**CHECKPOINT [02.01.001]**
**Title**: Verify .gitignore covers all generated files, dependencies, secrets, and platform-specific files
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Bad pattern**: Missing .gitignore entries for `node_modules/`, `.env`, `.next/`, `dist/`, `*.log`.
**Good pattern**: .gitignore exists at repo root with entries for all generated/build artifacts, dependency directories, environment files, IDE configs, and OS files.

**CHECKPOINT [02.01.002]**
**Title**: Verify commit messages follow a consistent convention
**Severity if failed**: 🟢 Low
**Applies to**: Universal

**Bad pattern**: Mixed formats — some "fix bug", some "Update file.js", some empty messages.
**Good pattern**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) or consistent imperative style with issue references.

**CHECKPOINT [02.01.003]**
**Title**: Verify branch strategy fits team size and release cadence
**Severity if failed**: 🟢 Low
**Applies to**: Universal

**Bad pattern**: Single-developer commits directly to main. No branch protection.
**Good pattern**: Git Flow for scheduled releases, GitHub Flow for continuous deploy, protected main branch.

---

## 2.2 Folder Analysis

**CHECKPOINT [02.02.001]**
**Title**: Verify folder structure maps to architectural layers (not arbitrary grouping)
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Bad pattern**: Mixing controllers, services, models, and utilities in a single `/src` directory with no sub-folder organization.
**Good pattern**: `src/controllers/`, `src/services/`, `src/repositories/`, `src/middleware/`, `src/routes/`, `src/config/`.

**CHECKPOINT [02.02.002]**
**Title**: Verify no dead files (unused, no imports) exist in the source tree
**Severity if failed**: 🟢 Low
**Applies to**: Universal

**How to detect**: Use `npx depcheck` or similar to find files with zero imports.

---

## 2.3 Dependency Analysis

**CHECKPOINT [02.03.001]**
**Title**: Verify no dependencies are pinned to exact versions without reason
**Severity if failed**: 🟡 Medium
**Applies to**: Node.js (npm/pnpm/yarn)

**Why this matters**: Exact-version pinning (`"express": "4.18.2"`) blocks security patches. Use range or lockfile-based resolution. Exception: direct dependencies that have broken semver in practice.

**CHECKPOINT [02.03.002]**
**Title**: Verify no deprecated or unmaintained dependencies are in use
**Severity if failed**: 🟠 High
**Applies to**: Universal

**How to detect**: `npm audit`, `yarn audit`, `pip-audit`, or `trivy fs .`

**CHECKPOINT [02.03.003]**
**Title**: Verify dependency license compatibility (no GPL in commercial product dependencies)
**Severity if failed**: 🟠 High
**Applies to**: Universal

**How to detect**: `npx license-checker --summary`, `npx fossa`

---

## 2.4 Tech Stack Detection

**CHECKPOINT [02.04.001]**
**Title**: Verify the tech stack is detectable from lockfiles/configs alone
**Severity if failed**: ⚪ Info
**Applies to**: Universal

**How to detect**: `find . -name 'package.json' -o -name 'Cargo.toml' -o -name 'requirements.txt' -o -name 'go.mod' -o -name 'Gemfile' -o -name 'build.gradle' -o -name 'pom.xml' -o -name 'composer.json'`

---

## 2.5 Build Analysis

**CHECKPOINT [02.05.001]**
**Title**: Verify build is reproducible from a clean checkout
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**How to detect**: Clone fresh → run build → compare checksums of output.

**CHECKPOINT [02.05.002]**
**Title**: Verify build time is under 10 minutes for CI
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Why this matters**: Build times > 10 minutes discourage frequent commits and delay deployment.

---

## 2.6 Runtime Analysis

**CHECKPOINT [02.06.001]**
**Title**: Verify the application starts within 30 seconds in production mode
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**How to detect**: `time npm run start` or time the container startup from docker logs.

---

## 2.7 Configuration Review

**CHECKPOINT [02.07.001]**
**Title**: Verify all configuration values have a documented source (env var, config file, or default)
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Bad pattern**: `const port = process.env.PORT || 3000;` with no documentation of what PORT is.
**Good pattern**: `const port = parseInt(process.env.PORT, 10) || 3000;` with a comment or entry in `.env.example`.

**CHECKPOINT [02.07.002]**
**Title**: Verify no secrets (API keys, passwords, tokens) are committed to the repository
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**How to detect**: `grep -r "-----BEGIN.*PRIVATE KEY" .`, `grep -r "sk_live_|sk_test_" .`, `gitleaks detect`

---

## 2.8 Environment Review

**CHECKPOINT [02.08.001]**
**Title**: Verify dev/staging/prod environments are as identical as possible
**Severity if failed**: 🟠 High
**Applies to**: Universal

**Bad pattern**: Using SQLite in dev, PostgreSQL in production. Using different OS base images.

---

## 2.9 Documentation Review

**CHECKPOINT [02.09.001]**
**Title**: Verify README contains setup instructions, prerequisites, and run commands
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**CHECKPOINT [02.09.002]**
**Title**: Verify architecture docs exist and match the actual code structure
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**How to detect**: Read architecture doc → check folder structure → identify mismatches.

---

## Non-Checkpoint Deliverable: First 30 Minutes Runbook

1. Clone repo → `git log --oneline -30` (commit health check)
2. Read README.md (setup, architecture, contribution)
3. `find . -name 'package.json' -o -name 'Cargo.toml'` (stack detection)
4. `npx depcheck` (dead dependencies)
5. Check .gitignore completeness
6. Run `gitleaks detect` or equivalent secret scanner
7. Check build time: time + build command
8. Read CI pipeline file (.github/workflows, Jenkinsfile, etc.)
9. Check for .env.example and compare to actual .env usage
10. Browse folder structure → identify architectural pattern claimed vs. actual

---

## Volume Scorecard Template

| Subsection | Score (0–10) | Top 3 Findings | Evidence Required |
|---|---|---|---|
| 2.1 Repository Analysis | | | Git log, branch config, .gitignore |
| 2.2 Folder Analysis | | | Directory listing, depcheck output |
| 2.3 Dependency Analysis | | | npm audit, license-checker output |
| 2.4 Tech Stack | | | Lockfiles, config files |
| 2.5 Build Analysis | | | Build time, CI logs |
| 2.6 Runtime Analysis | | | Startup time, memory usage |
| 2.7 Configuration | | | .env.example, grep for secrets |
| 2.8 Environment | | | Docker/Compose configs |
| 2.9 Documentation | | | README, docs/ contents |

---

## Closing Checklist

- [ ] 02.01.001 — .gitignore covers all generated files and secrets
- [ ] 02.01.002 — Consistent commit message convention
- [ ] 02.03.002 — No deprecated/unmaintained dependencies
- [ ] 02.03.003 — Dependency license compatibility verified
- [ ] 02.05.001 — Build reproducible from clean checkout
- [ ] 02.07.001 — All config values have documented source
- [ ] 02.07.002 — No secrets committed to repository
- [ ] 02.08.001 — Dev/staging/prod environment parity
- [ ] 02.09.001 — README has setup instructions

---

*End of Volume 2*
