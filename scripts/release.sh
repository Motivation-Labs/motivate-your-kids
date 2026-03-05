#!/bin/bash
# Usage: ./scripts/release.sh [version]
# Examples:
#   ./scripts/release.sh          → auto-detect version from conventional commits
#   ./scripts/release.sh 0.2.0   → explicit version
#
# Conventional commit bump rules:
#   BREAKING CHANGE / feat! / fix!  → major
#   feat:                           → minor
#   fix: / chore: / refactor: etc.  → patch
#
# What this does:
#   1. Verify you're on develop with a clean tree
#   2. Detect or validate the version bump
#   3. Bump package.json version
#   4. Commit the bump on develop
#   5. Push develop  →  GitHub Action deploys to staging
#   6. Merge develop → main (no-ff, preserves history)
#   7. Tag the merge commit
#   8. Push main + tag  →  GitHub Actions deploy production + create release notes + version alias
#   9. Return to develop

set -e

# ── Guard: must be on develop ────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "develop" ]; then
  echo "Error: must be on the 'develop' branch (currently on '$BRANCH')"
  exit 1
fi

# ── Guard: clean working tree ─────────────────────────────────────────────────
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# ── Auto-detect or validate version ──────────────────────────────────────────
VERSION="$1"
VERSION="${VERSION#v}"  # strip leading 'v' if supplied

if [ -z "$VERSION" ]; then
  # Find commits since the last tag
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -n "$LAST_TAG" ]; then
    COMMITS=$(git log "${LAST_TAG}..HEAD" --pretty=format:"%s")
  else
    COMMITS=$(git log --pretty=format:"%s")
  fi

  if [ -z "$COMMITS" ]; then
    echo "Error: no commits since last tag '$LAST_TAG'. Nothing to release."
    exit 1
  fi

  # Determine bump level
  if echo "$COMMITS" | grep -qE "^(feat|fix|refactor|perf)!:|BREAKING CHANGE:"; then
    BUMP="major"
  elif echo "$COMMITS" | grep -qE "^feat(\([^)]+\))?:"; then
    BUMP="minor"
  else
    BUMP="patch"
  fi

  # Parse current version and compute next
  CURRENT=$(node -p "require('./package.json').version")
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  case $BUMP in
    major) VERSION="$((MAJOR+1)).0.0" ;;
    minor) VERSION="${MAJOR}.$((MINOR+1)).0" ;;
    patch) VERSION="${MAJOR}.${MINOR}.$((PATCH+1))" ;;
  esac

  echo "Auto-detected $BUMP bump: $CURRENT → $VERSION"
  echo "(based on $(echo "$COMMITS" | wc -l | tr -d ' ') commit(s) since ${LAST_TAG:-the beginning})"
  echo ""
  read -r -p "Proceed with $VERSION? [Y/n] " CONFIRM
  CONFIRM="${CONFIRM:-Y}"
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

TAG="v$VERSION"

# ── Guard: tag must not already exist ────────────────────────────────────────
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: tag '$TAG' already exists."
  exit 1
fi

echo ""
echo "──────────────────────────────────────────"
echo "  Releasing $TAG"
echo "──────────────────────────────────────────"

# ── 1. Bump version in package.json ──────────────────────────────────────────
echo "→ Bumping package.json to $VERSION"
npm version "$VERSION" --no-git-tag-version
git add package.json package-lock.json 2>/dev/null || git add package.json
git commit -m "chore: release $TAG"

# ── 2. Push develop → triggers staging deploy ────────────────────────────────
echo "→ Pushing develop (staging deploy will start)"
git push origin develop

# ── 3. Merge develop → main ──────────────────────────────────────────────────
echo "→ Merging develop → main"
git checkout main
git merge develop --no-ff -m "chore: release $TAG"

# ── 4. Tag ───────────────────────────────────────────────────────────────────
echo "→ Tagging $TAG"
git tag "$TAG"

# ── 5. Push main + tag → triggers production deploy + release notes ───────────
echo "→ Pushing main + tag (production deploy + release notes will start)"
git push origin main
git push origin "$TAG"

# ── 6. Return to develop ─────────────────────────────────────────────────────
git checkout develop

echo ""
echo "✓ Release $TAG complete."
echo ""
echo "  Production : https://motivateyourkids.vercel.app"
echo "  Staging    : https://motivateyourkids-staging.vercel.app"
echo "  Archive    : https://motivateyourkids-${TAG//./-}.vercel.app  (aliasing in ~1 min)"
echo "  Release    : https://github.com/beingzy/motivate-your-kids/releases/tag/$TAG"
echo ""
echo "  Watch GitHub Actions:"
echo "  https://github.com/beingzy/motivate-your-kids/actions"
