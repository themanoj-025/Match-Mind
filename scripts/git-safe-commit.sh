#!/usr/bin/env bash
#
# git safe-commit — Production-grade commit safety pipeline
#
# Enforces: lint → format → typecheck → test → build → security → stage → commit
#
# Usage:
#   git safe-commit        # run full pipeline and commit staged files
#   git safe-commit -m "msg"  # run full pipeline and commit with message
#   git safe-commit --check   # run pipeline only (no commit)
#
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

STEP=0
FAILED=0
COMMIT_MSG=""

# ──────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────
info()  { echo -e "${CYAN}ℹ${NC}  $*"; }
ok()    { echo -e "${GREEN}✓${NC}  $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
fail()  { echo -e "${RED}✗${NC}  $*"; FAILED=$((FAILED + 1)); }
header() {
  STEP=$((STEP + 1))
  echo ""
  echo -e "${BOLD}[Step ${STEP}]${NC} $*"
}

run_check() {
  local name="$1"; shift
  if "$@" 2>&1; then
    ok "${name}"
  else
    fail "${name} — see output above"
    return 1
  fi
}

# ──────────────────────────────────────────────
#  Step 0: Parse arguments
# ──────────────────────────────────────────────
DO_COMMIT=true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) DO_COMMIT=false; shift ;;
    -m) COMMIT_MSG="$2"; shift 2 ;;
    -m*) COMMIT_MSG="${1#-m}"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ──────────────────────────────────────────────
#  Step 1: Git status check
# ──────────────────────────────────────────────
header "Git State Check"

# Check working tree
if ! git status --porcelain > /dev/null 2>&1; then
  fail "Git repository not found or corrupted"
  exit 1
fi

# Check for merge conflicts
if grep -rn '<<<<<<<' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.json' --include='*.md' . 2>/dev/null | grep -v 'node_modules/' | grep -v '.git/' | head -5; then
  fail "Merge conflict markers detected! Resolve conflicts first."
fi

# Check detached HEAD
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ "$BRANCH" = "HEAD" ]; then
  warn "Detached HEAD state — committing is risky"
fi

ok "Git state is stable (branch: ${BRANCH})"

# ──────────────────────────────────────────────
#  Step 2: ESLint auto-fix
# ──────────────────────────────────────────────
header "ESLint"

if [ -f "node_modules/.bin/eslint" ]; then
  # Run ESLint on staged files if possible, otherwise on all
  if command -v npx &>/dev/null; then
    # Check both root and sub-projects
    if [ -f ".eslintrc*" ] || [ -f "eslint.config.*" ]; then
      run_check "Root ESLint" npx eslint . --fix --quiet 2>/dev/null || true
    fi
    if [ -f "backend/eslint.config.*" ] || [ -f "backend/.eslintrc*" ]; then
      run_check "Backend ESLint" npx eslint backend/ --fix --quiet 2>/dev/null || true
    fi
    if [ -f "frontend/eslint.config.*" ] || [ -f "frontend/.eslintrc*" ]; then
      run_check "Frontend ESLint" npx eslint frontend/ --fix --quiet 2>/dev/null || true
    fi
  fi
else
  warn "ESLint not installed — skipping"
fi

# ──────────────────────────────────────────────
#  Step 3: Prettier format
# ──────────────────────────────────────────────
header "Prettier"

if [ -f "node_modules/.bin/prettier" ]; then
  run_check "Prettier format check" npx prettier --check "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}" \
    --ignore-path .gitignore 2>/dev/null || {
    warn "Prettier found formatting issues — run 'npx prettier --write .' to fix"
  }
else
  warn "Prettier not installed — skipping"
fi

# ──────────────────────────────────────────────
#  Step 4: TypeScript check
# ──────────────────────────────────────────────
header "TypeScript Type Check"

if [ -f "node_modules/.bin/tsc" ]; then
  run_check "TypeScript" npx tsc --noEmit 2>/dev/null || true
fi
if [ -f "backend/node_modules/.bin/tsc" ]; then
  run_check "Backend TypeScript" npx tsc --noEmit -p backend/tsconfig.json 2>/dev/null || true
fi
if [ -f "frontend/node_modules/.bin/tsc" ]; then
  run_check "Frontend TypeScript" npx tsc --noEmit -p frontend/tsconfig.json 2>/dev/null || true
fi

# ──────────────────────────────────────────────
#  Step 5: Run tests
# ──────────────────────────────────────────────
header "Tests"

if [ -f "node_modules/.bin/vitest" ]; then
  run_check "Tests" npx vitest run 2>/dev/null || true
fi
if [ -f "backend/node_modules/.bin/vitest" ]; then
  run_check "Backend tests" npx vitest run --config backend/vitest.config.js 2>/dev/null || true
fi
if [ -f "frontend/node_modules/.bin/vitest" ]; then
  run_check "Frontend tests" npx vitest run --config frontend/vitest.config.ts 2>/dev/null || true
fi

# ──────────────────────────────────────────────
#  Step 6: Build validation
# ──────────────────────────────────────────────
header "Build"

if [ -f "frontend/node_modules/.bin/vite" ]; then
  run_check "Frontend build" npx vite build frontend/ 2>/dev/null || true
fi

# ──────────────────────────────────────────────
#  Step 7: Security scan (basic)
# ──────────────────────────────────────────────
header "Security Scan"

# Safe single-quote helper for grep patterns (avoids bash single-quote escaping issues)
SQ="'"

# Check for hardcoded secrets
SECRET_PATTERNS="(api[_-]?key|secret|token|password|credential)[\"\s:=]+[\"${SQ}][A-Za-z0-9_\-]{20,}[\"${SQ}]"
if grep -rn -i -E "$SECRET_PATTERNS" --include='*.ts' --include='*.tsx' --include='*.js' --include='*.py' . 2>/dev/null | grep -v 'node_modules/' | grep -v '.git/' | grep -v '.env'; then
  warn "Possible hardcoded secrets detected — review flagged lines above"
else
  ok "No obvious secrets detected"
fi

# Check for .env in staging
if git diff --cached --name-only | grep -q '\.env$'; then
  fail ".env file is staged! This should NEVER be committed."
fi

# ──────────────────────────────────────────────
#  Step 8: Stage safe files only
# ──────────────────────────────────────────────
header "Staging Safety Check"

# Ensure no generated artifacts are staged
DANGEROUS_PATTERNS="node_modules|\.next|dist|build|\.turbo|\.cache|__pycache__|\.pyc|coverage|logs"
STAGED_DANGEROUS=$(git diff --cached --name-only | grep -E "$DANGEROUS_PATTERNS" || true)
if [ -n "$STAGED_DANGEROUS" ]; then
  fail "Dangerous files staged — removing:"
  echo "$STAGED_DANGEROUS" | while read -r f; do
    echo "  ✗ $f"
    git reset HEAD "$f" 2>/dev/null || true
  done
fi

# ──────────────────────────────────────────────
#  Result
# ──────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}  ✓ All checks passed!${NC}"
  echo "═══════════════════════════════════════════"

  if [ "$DO_COMMIT" = true ]; then
    if [ -n "$COMMIT_MSG" ]; then
      git commit -m "$COMMIT_MSG"
      echo ""
      echo -e "${GREEN}${BOLD}  ✓ Commit successful!${NC}"
      echo ""
      echo "To push: git push origin $(git rev-parse --abbrev-ref HEAD)"
    else
      echo ""
      warn "No commit message provided. Files are staged and ready."
      echo "  Run: git commit -m \"message\""
      echo "  Or:  git safe-commit -m \"message\""
    fi
  else
    echo ""
    ok "Check mode — no commit made. Files are safe."
  fi
else
  echo -e "${RED}${BOLD}  ✗ ${FAILED} check(s) failed. Commit BLOCKED.${NC}"
  echo "═══════════════════════════════════════════"
  echo ""
  echo "Fix the errors above and run git safe-commit again."
  exit 1
fi
