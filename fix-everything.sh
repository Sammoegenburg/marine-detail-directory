#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Step 1: Wipe database (non-admin users + leads) ==="
node wipe.js || echo "DB wipe had an issue, continuing..."

echo ""
echo "=== Step 2: Remove worktree submodules from git ==="
git rm -r --cached .claude/worktrees/ 2>/dev/null || echo "No worktrees to remove"

echo ""
echo "=== Step 3: Update .gitignore ==="
if ! grep -q ".claude/worktrees/" .gitignore 2>/dev/null; then
  echo ".claude/worktrees/" >> .gitignore
  echo "Added .claude/worktrees/ to .gitignore"
fi

echo ""
echo "=== Step 4: Commit and push ==="
git add -A
git commit -m "Fix: remove worktree submodules, clean build for Vercel" || echo "Nothing to commit"
git push origin main

echo ""
echo "=== DONE ==="
echo "Vercel should now build successfully."
