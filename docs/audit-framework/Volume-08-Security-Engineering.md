# VOLUME 8 — SECURITY ENGINEERING

**Volume**: 8 of 25
**Title**: Security Engineering
**Assigned Personas**: Security Engineer (AppSec) (#4), Security Engineer (Infra) (#5), Compliance/Governance Reviewer (#20)
**Estimated Checkpoints**: 420
**Weight in Aggregate Scoring**: 2.0x (security weighted double — 2.5x for fintech/healthtech)
**Dependencies**: Volume 1 (Foundations), Volume 2 (Project Discovery), Volume 3 (Architecture)

---

## Volume Introduction

Security is the dimension where the cost of failure is highest and detection difficulty is greatest. A missing auth check, unvalidated input, or hardcoded secret can remain undetected for years and then cause a breach costing millions.

This volume covers 15 security domains: OWASP Top 10 (2021), JWT, OAuth 2.0, OIDC, CSRF, XSS, SSRF, SQL Injection, Prompt Injection (LLM-specific), Secrets Management, Cloud IAM, Docker Security, Kubernetes Security, Dependency Attacks, and SBOM/Supply Chain.

---

## 8.1 OWASP Top 10 (2021)

**CHECKPOINT [08.01.001] — A01 Broken Access Control**
**Title**: Verify every protected endpoint applies authorization, not just authentication
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**Why this matters**: Authentication proves identity. Authorization proves permission. Most breaches exploit endpoints that check "are you logged in?" but not "are you allowed to access this specific resource?"

**Bad pattern**: `if (!req.user) return res.status(401)` — checks auth only, no ownership/permission check.
**Good pattern**: `if (req.user.id !== prediction.userId && req.user.role !== 'ADMIN') return res.status(403)`

**CHECKPOINT [08.01.002] — A02 Cryptographic Failures**
**Title**: Verify passwords are hashed with bcrypt (or Argon2), not SHA-256 or MD5
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**Bad pattern**: `require('crypto').createHash('sha256').update(password).digest('hex')`
**Good pattern**: `await bcrypt.hash(password, 12)` — bcrypt with cost factor >= 12.

**CHECKPOINT [08.01.003] — A03 Injection**
**Title**: Verify all SQL queries use parameterized queries or an ORM (no string interpolation)
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**Bad pattern**: `db.query(`SELECT * FROM users WHERE id = '${userId}'`)`
**Good pattern**: `db.query('SELECT * FROM users WHERE id = $1', [userId])`

**CHECKPOINT [08.01.004] — A04 Insecure Design**
**Title**: Verify rate limiting exists on all mutation endpoints
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [08.01.005] — A05 Security Misconfiguration**
**Title**: Verify default credentials are changed and unnecessary features disabled
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**CHECKPOINT [08.01.006] — A06 Vulnerable Components**
**Title**: Verify no dependencies with known CVEs are in the dependency tree
**Severity if failed**: 🟠 High
**Applies to**: Universal

**How to detect**: `npm audit`, `snyk test`, `trivy fs .`

**CHECKPOINT [08.01.007] — A07 Identification & Authentication Failures**
**Title**: Verify JWT secret is not empty, not hardcoded, and rotated at least annually
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**Bad pattern**: `jwt.sign(payload, 'secret123')` or `jwt.sign(payload, process.env.JWT_SECRET)` with no startup validation.
**Good pattern**:
```javascript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters');
}
```

**CHECKPOINT [08.01.008] — A08 Software/Data Integrity Failures**
**Title**: Verify CI/CD pipeline signs artifacts (or at minimum verifies checksums)
**Severity if failed**: 🟠 High
**Applies to**: CI/CD

**CHECKPOINT [08.01.009] — A09 Security Logging & Monitoring**
**Title**: Verify security-relevant events (login, logout, permission denied, data export) are logged
**Severity if failed**: 🟠 High
**Applies to**: Universal

**CHECKPOINT [08.01.010] — A10 SSRF**
**Title**: Verify URL input to server-side fetches is validated against an allowlist
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## 8.2 JWT

**CHECKPOINT [08.02.001]**
**Title**: Verify algorithm is explicitly set and RS256/ES256 is preferred over HS256 for multi-service deployments
**Severity if failed**: 🔴 Critical
**Applies to**: JWT

**Bad pattern**: `jwt.verify(token, secret)` — algorithm is inferred from JWT header (algorithm confusion attack).
**Good pattern**: `jwt.verify(token, publicKey, { algorithms: ['RS256'] })`

**CHECKPOINT [08.02.002]**
**Title**: Verify token expiry is set (typically 15–60 minutes for access tokens)
**Severity if failed**: 🟠 High
**Applies to**: JWT

**Bad pattern**: No `exp` claim set.
**Good pattern**: `jwt.sign(payload, secret, { expiresIn: '15m' })`

**CHECKPOINT [08.02.003]**
**Title**: Verify refresh tokens are stored securely (hashed in DB, not plaintext)
**Severity if failed**: 🟠 High
**Applies to**: JWT

---

## 8.3 OAuth 2.0

**CHECKPOINT [08.03.001]**
**Title**: Verify redirect URIs are validated exactly (not prefix-matched)
**Severity if failed**: 🔴 Critical
**Applies to**: OAuth 2.0

**Bad pattern**: Allowing `https://example.com/*` — attacker uses `https://example.com.evil.com`.
**Good pattern**: Exact match: `https://example.com/callback`.

**CHECKPOINT [08.03.002]**
**Title**: Verify state parameter is used to prevent CSRF on OAuth callback
**Severity if failed**: 🔴 Critical
**Applies to**: OAuth 2.0

**CHECKPOINT [08.03.003]**
**Title**: Verify PKCE is used for mobile/native app flows
**Severity if failed**: 🔴 Critical
**Applies to**: OAuth 2.0 (mobile)

---

## 8.4 OIDC

**CHECKPOINT [08.04.001]**
**Title**: Verify ID token is validated (iss, aud, exp, nonce, signature)
**Severity if failed**: 🔴 Critical
**Applies to**: OIDC

---

## 8.5 CSRF

**CHECKPOINT [08.05.001]**
**Title**: Verify CSRF protection exists for all state-changing requests
**Severity if failed**: 🔴 Critical
**Applies to**: Web applications

**Good pattern**: CSRF token in forms or `SameSite=Strict/Lax` cookie attribute.

---

## 8.6 XSS

**CHECKPOINT [08.06.001]**
**Title**: Verify user-generated content is escaped before rendering
**Severity if failed**: 🔴 Critical
**Applies to**: Web applications

**CHECKPOINT [08.06.002]**
**Title**: Verify Content-Security-Policy header is set
**Severity if failed**: 🟠 High
**Applies to**: Web applications

---

## 8.7 SSRF

**CHECKPOINT [08.07.001]**
**Title**: Verify outbound HTTP requests to user-supplied URLs are blocked for internal IP ranges
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**How to detect**: `grep -r "fetch|axios.get|request(" src/` and check for user-supplied URL parameters.

---

## 8.8 SQL Injection

**CHECKPOINT [08.08.001]**
**Title**: Verify raw queries use parameterized placeholders, not string formatting
**Severity if failed**: 🔴 Critical
**Applies to**: SQL databases

---

## 8.9 Prompt Injection (LLM-Specific)

**CHECKPOINT [08.09.001]**
**Title**: Verify user input to LLM prompts is isolated from system prompts
**Severity if failed**: 🔴 Critical
**Applies to**: LLM-integrated applications

**Bad pattern**: ```const prompt = `System: Be helpful. User: ${userInput}`;```
**Good pattern**: Use structured prompt templates with input delimiters, or API-level user/assistant role separation.

**CHECKPOINT [08.09.002]**
**Title**: Verify output validation/guardrails exist on LLM responses before rendering to users
**Severity if failed**: 🟠 High
**Applies to**: LLM-integrated applications

---

## 8.10 Secrets Management

**CHECKPOINT [08.10.001]**
**Title**: Verify no secrets are hardcoded in source code or config files
**Severity if failed**: 🔴 Critical
**Applies to**: Universal

**How to detect**: `gitleaks detect --source .`, `trufflehog filesystem .`

**CHECKPOINT [08.10.002]**
**Title**: Verify secrets are rotated at least every 90 days
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## 8.11 Cloud IAM

**CHECKPOINT [08.11.001]**
**Title**: Verify service accounts have the minimum permissions needed (least privilege)
**Severity if failed**: 🔴 Critical
**Applies to**: Cloud IAM

---

## 8.12 Docker Security

**CHECKPOINT [08.12.001]**
**Title**: Verify containers run as non-root user
**Severity if failed**: 🔴 Critical
**Applies to**: Docker

**Bad pattern**: No `USER` directive in Dockerfile — runs as root.
**Good pattern**: `USER node` or `USER 1001` with explicit user creation.

**CHECKPOINT [08.12.002]**
**Title**: Verify base image is minimal (alpine or distroless, not full Ubuntu)
**Severity if failed**: 🟡 Medium
**Applies to**: Docker

---

## 8.13 Kubernetes Security

**CHECKPOINT [08.13.001]**
**Title**: Verify Pod Security Standards are set (baseline or restricted)
**Severity if failed**: 🔴 Critical
**Applies to**: Kubernetes

**CHECKPOINT [08.13.002]**
**Title**: Verify no containers run in privileged mode
**Severity if failed**: 🔴 Critical
**Applies to**: Kubernetes

---

## 8.14 Dependency Attacks

**CHECKPOINT [08.14.001]**
**Title**: Verify package lockfiles are checked in (prevent dependency confusion)
**Severity if failed**: 🟠 High
**Applies to**: Universal

---

## 8.15 SBOM & Supply Chain

**CHECKPOINT [08.15.001]**
**Title**: Verify SBOM is generated for every release
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**How to detect**: `grep -r "syft|cyclonedx|spdx"`

---

## Non-Checkpoint Deliverables

### Severity/CVSS Alignment Table

| Our Severity | CVSS Range | OWASP Risk Rating |
|---|---|---|
| Critical (C) | 9.0–10.0 | Critical |
| High (H) | 7.0–8.9 | High |
| Medium (M) | 4.0–6.9 | Medium |
| Low (L) | 0.1–3.9 | Low |
| Info (I) | N/A | Note |

### Secrets Sweep Command Reference

```bash
# Gitleaks
gitleaks detect --source . --verbose

# TruffleHog
trufflehog filesystem . --no-verification

# Custom regex patterns
grep -rn "-----BEGIN.*PRIVATE KEY-----" .
grep -rn "sk_live_|pk_live_" .
grep -rn "AKIA[0-9A-Z]{16}" .  # AWS access keys
grep -rn "ghp_|gho_|ghu_|ghs_" .  # GitHub tokens
grep -rn "xox[baprs]-" .  # Slack tokens
```

---

## Volume Scorecard Template

| Subsection | Score (0–10) | Top 3 Findings | Evidence Required |
|---|---|---|---|
| 8.1 OWASP Top 10 | | | Per-category evidence list |
| 8.2 JWT | | | Token config, validation code |
| 8.3 OAuth 2.0 | | | Redirect URI, state, PKCE |
| 8.5 CSRF | | | Token/samesite config |
| 8.6 XSS | | | CSP header, escaping |
| 8.7 SSRF | | | URL validation, IP blocking |
| 8.8 SQL Injection | | | Parameterized queries audit |
| 8.9 Prompt Injection | | | Prompt isolation, guardrails |
| 8.10 Secrets Management | | | Gitleaks output |
| 8.12 Docker | | | Dockerfile review |
| 8.13 Kubernetes | | | Pod Security, PSP config |

---

## Reusable Prompts

**PROMPT [SEC.001] — OWASP Top 10 Full Audit**
Walk through all 10 OWASP categories with concrete checks per category.

**PROMPT [SEC.002] — JWT Hardening Audit**
Audit JWT secret strength, algorithm validation, expiry, refresh token storage.

**PROMPT [SEC.003] — Secret Scan Deep Dive**
Run gitleaks/trufflehog and investigate each finding.

**PROMPT [SEC.004] — Container Security Audit**
Audit Dockerfile and K8s manifests for root user, privileged mode, base image, network policies.

**PROMPT [SEC.005] — LLM Prompt Injection Audit**
Audit prompt structure, input isolation, output guardrails, cost controls.

---

## Incident Response Quick Reference

| Vulnerability | Immediate Action | Root Cause Fix |
|---|---|---|
| SQL Injection | WAF block, rotate DB creds | Parameterized queries |
| XSS | CSP enforce, sanitize input | Output encoding |
| JWT algorithm confusion | Revoke all tokens | Explicit algorithm in verify() |
| Secrets exposure | Rotate leaked secret, git purge | Secret vault |
| SSRF | Block outbound to internal IPs | URL allowlist |
| Prompt injection | Disable affected prompt | Input/output isolation |

---

## Closing Checklist

- [ ] 08.01.001 — Authorization on every protected endpoint
- [ ] 08.01.002 — Passwords hashed with bcrypt/Argon2
- [ ] 08.01.003 — All SQL queries parameterized
- [ ] 08.01.006 — No dependencies with known CVEs
- [ ] 08.01.007 — JWT secret validated at startup, >= 32 chars
- [ ] 08.02.001 — JWT algorithm explicitly set in verify()
- [ ] 08.03.001 — OAuth redirect URIs exact-matched
- [ ] 08.05.001 — CSRF protection on state-changing requests
- [ ] 08.09.001 — LLM prompt input isolated from system prompt
- [ ] 08.10.001 — No secrets in source code
- [ ] 08.12.001 — Containers run as non-root
- [ ] 08.13.001 — Pod Security Standards set
- [ ] HTTPS enforced, CSP header set, CORS origin-allowlisted

---

*End of Volume 8*
