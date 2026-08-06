---
name: npm tar security block fix
description: How to fix the Replit security policy blocking tar package during npm install
---

# npm tar Security Block Fix

## Problem
Replit's security policy blocks `tar@7.5.7` (and certain older versions) with a 403 error during npm install. This causes all npm installs to fail if the lockfile pins a blocked version.

## Fix
1. Add `overrides: { "tar": "7.5.22" }` (or latest) to package.json
2. Delete package-lock.json: `rm package-lock.json`
3. Regenerate lockfile: `npm install --package-lock-only --no-audit --no-fund`
4. Install packages: `npm install --no-audit --no-fund`

**Why:** The lockfile was pinning tar@7.5.7 which has a critical CVE. Regenerating without the lockfile forces resolution to the version specified in overrides.
**How to apply:** Any time npm install fails with 403 on tar from package-firewall.replit.local.
