#!/usr/bin/env node
/**
 * install-if-needed.js
 *
 * Bootstrap helper that runs automatically before the dev workflows
 * (`server:dev`, `expo:dev`) via npm pre-script hooks.
 *
 * Goal: when this project is extracted into a fresh Replit account from a zip
 * and the user clicks "Run", the workflow command is executed immediately —
 * but `node_modules/` may not exist yet (and Replit's account-level
 * `omit=dev` means typical autoinstalls would skip dev dependencies like
 * `tsx`, `drizzle-kit`, and `babel-plugin-module-resolver` that we need).
 *
 * This script checks for a few critical packages and runs
 * `npm install --include=dev` if any of them are missing. Once the install
 * completes, the actual workflow command (e.g. `tsx server/index.ts`) takes
 * over without further intervention.
 *
 * Uses only Node built-ins so it works before any deps are installed.
 */
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = path.resolve(__dirname, "..");
const nodeModules = path.join(root, "node_modules");

// A small set of packages that MUST be present for the dev workflows to run.
// Check both runtime ("expo") and dev-only ("tsx", "drizzle-kit",
// "babel-plugin-module-resolver") tools so a partial install is detected.
const requiredPackages = [
  "tsx",
  "expo",
  "drizzle-kit",
  "babel-plugin-module-resolver",
];

function isInstalled(pkg) {
  return fs.existsSync(path.join(nodeModules, pkg, "package.json"));
}

function needsInstall() {
  if (!fs.existsSync(nodeModules)) return true;
  return requiredPackages.some((pkg) => !isInstalled(pkg));
}

if (!needsInstall()) {
  process.exit(0);
}

console.log(
  "[install-if-needed] node_modules missing or incomplete — running `npm install --include=dev`...",
);

try {
  cp.execSync("npm install --include=dev --no-audit --no-fund", {
    cwd: root,
    stdio: "inherit",
  });
} catch (err) {
  console.error("[install-if-needed] npm install failed:", err.message);
  process.exit(1);
}

// Normalize any Replit-internal registry URLs in the lockfile so the committed
// package-lock.json always uses the public npm registry. This keeps Railway
// (and any other CI) able to run `npm install` / `npm ci` without hitting
// Replit's internal package firewall, which is unreachable outside Replit.
try {
  const lockfilePath = path.join(root, "package-lock.json");
  if (fs.existsSync(lockfilePath)) {
    const original = fs.readFileSync(lockfilePath, "utf-8");
    const REPLIT_REGISTRY = "http://package-firewall.replit.local/npm";
    const NPM_REGISTRY = "https://registry.npmjs.org";
    if (original.includes(REPLIT_REGISTRY)) {
      const normalized = original.split(REPLIT_REGISTRY).join(NPM_REGISTRY);
      fs.writeFileSync(lockfilePath, normalized);
      console.log(
        "[install-if-needed] Normalized lockfile registry URLs (Replit → npm registry)",
      );
    }
  }
} catch (normErr) {
  // Non-fatal: log but don't abort the workflow startup.
  console.warn(
    "[install-if-needed] Could not normalize lockfile:",
    normErr.message,
  );
}
