# VOLUME 1 — FOUNDATIONS

**Volume**: 1 of 25
**Title**: Foundations
**Assigned Personas**: Principal Architect (#1), Technical Due Diligence Lead (#21)
**Estimated Checkpoints**: 340
**Weight in Aggregate Scoring**: 1.0x (foundational, applies to all audits)
**Dependencies**: None (starting volume)

---

## Volume Introduction

Every engineering audit — whether a pre-merger technical due diligence, a pre-launch security review, a refactoring cost estimate, or a hiring committee code evaluation — rests on a foundation of methodology, vocabulary, and shared standards. Without that foundation, two reviewers auditing the same codebase can produce contradictory conclusions not because the code changed, but because they applied different severity rubrics, different definitions of "good," or different scoping decisions.

This volume defines ten foundations:

1. **Engineering Mindset** — the cognitive posture an auditor must adopt: evidence-driven, tradeoff-aware, and scoped to risk.
2. **Audit Philosophy** — what an audit is (empirical assessment with explicit criteria) and what it is not.
3. **Review Methodology** — top-down vs. bottom-up, static vs. dynamic, manual vs. automated approaches.
4. **Review Rules** — the operating principles of this framework.
5. **Severity System** — the five-level severity scale with worked examples.
6. **Scoring Framework** — the 0–10 category scoring rubric and weighted aggregate formula.
7. **Engineering Standards** — what "professional grade" means per discipline.
8. **Reviewer Personas** — the 24-lens panel whose combined judgment informs every checkpoint.
9. **Decision Trees** — branching flowcharts for architectural and methodological choices.
10. **Audit Workflow** — the five-phase process (Discover → Analyze → Score → Recommend → Verify).

---

## 1.1 Engineering Mindset

**CHECKPOINT [01.01.001]**
**Title**: Verify the auditor separates observation from interpretation
**Severity if failed**: ⚪ Info
**Applies to**: Universal

**Why this matters**: The most common failure in engineering audits is conflating observation with interpretation. An observation — "this function has 400 lines" — is a fact. An interpretation — "this function should be refactored" — is a judgment. The audit report must clearly distinguish the two.

**Bad pattern**: "The authentication logic is poorly designed." (Opinion, no evidence.)
**Good pattern**: "The auth route handler (src/routes/auth.js:15–95) directly queries the database, performs password comparison, and generates JWT tokens — three distinct responsibilities in one function." (Observation + scope.)

**CHECKPOINT [01.01.002]**
**Title**: Verify the auditor calibrates severity to project stage
**Severity if failed**: ⚪ Info
**Applies to**: Universal

**Why this matters**: A missing test suite is Critical for a production payments service but Low for a two-week MVP. Severity is a function of risk, not of gap-to-ideal.

**Bad pattern**: "No unit tests → Critical." (Absolute, context-free.)
**Good pattern**: "No unit tests → High. This is a pre-launch PCI-compliant payments service."

---

## 1.2 Audit Philosophy

**CHECKPOINT [01.02.001]**
**Title**: Verify every finding is traceable to an observable artifact
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Why this matters**: A finding without a traceable artifact (file:line, config key, metric, log line) cannot be verified or fixed.

**Bad pattern**: "The error handling is inconsistent." (No artifact reference.)
**Good pattern**: "src/middleware/errorHandler.js:22–45 sends HTML error pages for API routes; src/routes/api/users.js:12 sends JSON errors."

**CHECKPOINT [01.02.002]**
**Title**: Verify the auditor distinguishes "absence of evidence" from "evidence of absence"
**Severity if failed**: ⚪ Info
**Applies to**: Universal

**Bad pattern**: "No vulnerabilities found." (Implies exhaustive search.)
**Good pattern**: "Reviewed auth middleware, rate limiter, and 3 route files for authentication bypass. No vulnerabilities found in the reviewed scope."

---

## 1.3 Review Methodology

**CHECKPOINT [01.03.001]**
**Title**: Verify the auditor applies both top-down and bottom-up analysis
**Severity if failed**: ⚪ Info
**Applies to**: Universal

**Why this matters**: Top-down (architecture → module → function) finds structural issues. Bottom-up (function → module → architecture) finds implementation issues. Using only one misses the other half.

---

## 1.4 Review Rules

**CHECKPOINT [01.04.001]**
**Title**: Verify findings are prioritized by risk, not by discoverability
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Why this matters**: Auditors naturally report what they found first. But the first finding may be low-severity while a harder-to-detect high-severity issue goes unreported.

---

## 1.5 Severity System

**CHECKPOINT [01.05.001]**
**Title**: Verify severity is computed from Likelihood × Impact, not subjective feel
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Severity matrix**:

| Level | Code | Definition | SLA |
|---|---|---|---|
| 🔴 Critical | C | Actively exploitable, data-loss, or complete-outage risk | Fix before any further deploy |
| 🟠 High | H | Significant risk under realistic conditions | Fix this sprint |
| 🟡 Medium | M | Real but bounded risk, maintainability/velocity tax | Fix this quarter |
| 🟢 Low | L | Polish, best-practice deviation, minor inefficiency | Backlog |
| ⚪ Info | I | Observation, not a defect | No action required |

---

## 1.6 Scoring Framework

**CHECKPOINT [01.06.001]**
**Title**: Verify category scores are computed with explicit evidence justification
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

**Category scoring rubric (0–10)**:
- **0–2**: Absent or actively broken; would fail any professional review.
- **3–4**: Present but fundamentally inadequate; prototype-grade.
- **5–6**: Functional with known, material gaps; MVP-grade.
- **7–8**: Solid, production-viable, minor gaps only.
- **9–10**: Best-in-class; would pass FAANG-level internal review with no notes.

**Aggregate score formula**:
```
Overall Score = Σ (Volume Score × Volume Weight) / Σ (Volume Weight)
```

Default weights: Architecture/Backend/Frontend/API/Database = 1.5x, Security/Testing = 2.0x, Performance/Scalability/SRE = 1.25x, DevOps/Cloud = 1.0x, AI/RAG/Multi-Agent = 1.5x (if in scope, 0x if not), Product/Docs/Open Source = 0.75x, Enterprise/Compliance/Due-Diligence/Hiring = 0.5x.

---

## 1.7 Engineering Standards

**CHECKPOINT [01.07.001]**
**Title**: Verify the codebase meets minimum professional-grade standards for its language/framework
**Severity if failed**: 🟡 Medium
**Applies to**: Universal

Professional-grade code meets these minimums: (1) consistent error handling, (2) automated tests for critical paths, (3) documented interfaces, (4) no secrets in code, (5) dependency declarations with version pins.

---

## 1.8 Reviewer Personas

The 24-persona panel whose combined judgment informs every checkpoint. See Section 2 of the master prompt for the full table. Auditors should consider which 2–4 personas would weight each finding most heavily.

---

## 1.9 Decision Trees

**Should this be a microservice?**
```
Team size < 8? → No. Monolith.
Domain complexity low? → No. Monolith.
Independent deploy cycle needed? → Maybe. Consider modular monolith first.
Different scaling requirements per component? → Yes. Microservices.
```

**REST or GraphQL?**
```
Multiple data sources aggregated per view? → GraphQL.
Simple CRUD, well-defined resources? → REST.
Third-party API consumers? → REST (better tooling/caching).
Mobile-first? → GraphQL (reduced over-fetching).
```

---

## 1.10 Audit Workflow

The five-phase process:

1. **Discover** — What exists? Repository structure, dependencies, tech stack, environments.
2. **Analyze** — Is it correct? Apply checkpoints, gather evidence per Volume 4 schema.
3. **Score** — How good is it? Compute category and aggregate scores with justification.
4. **Recommend** — What to fix? Priority table (severity × effort), refactoring roadmap.
5. **Verify** — Did it work? Re-audit after fixes, close findings.

---

## Volume Scorecard Template

| Subsection | Score (0–10) | Top 3 Findings | Evidence Required |
|---|---|---|---|
| 1.1 Engineering Mindset | | | Auditor self-assessment |
| 1.2 Audit Philosophy | | | Report sample |
| 1.3 Review Methodology | | | Workflow documentation |
| 1.4 Review Rules | | | Finding prioritization |
| 1.5 Severity System | | | Severity assignments |
| 1.6 Scoring Framework | | | Score justifications |
| 1.7 Engineering Standards | | | Code sample |
| 1.8 Reviewer Personas | | | Persona usage evidence |
| 1.9 Decision Trees | | | Decision documentation |
| 1.10 Audit Workflow | | | Process adherence |

---

## Reusable Prompts

**PROMPT [FOUNDATIONS.001] — Severity Calibration**
Use the five-level severity matrix to score findings consistently across any codebase.

**PROMPT [FOUNDATIONS.002] — Five-Phase Audit Workflow**
Apply the Discover → Analyze → Score → Recommend → Verify process to any codebase.

**PROMPT [FOUNDATIONS.003] — Architecture Decision Evaluation**
Use the decision trees to evaluate whether the project's architecture choices are justified.

---

## Closing Checklist

- [ ] 01.01.001 — Observations separated from interpretations
- [ ] 01.02.001 — Every finding traceable to artifact (file:line)
- [ ] 01.05.001 — Severity from Likelihood × Impact (not subjective feel)
- [ ] 01.06.001 — Scores with evidence justification and stated weights
- [ ] 01.10.001 — Five-phase workflow followed
- [ ] Severity matrix consistently applied across all findings
- [ ] Persona lens stated per finding

---

*End of Volume 1*
