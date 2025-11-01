#!/usr/bin/env node
/**
 * Deploy helper: stages changes, creates a conventional commit, and pushes to main.
 * Usage: node scripts/deploy.js "feat: message"
 */

import { execSync } from "node:child_process";

const message = process.argv[2] || "chore: deploy";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

try {
  run("git add .");
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  run("git push origin main");
  console.log("✅ Deployment push completed.");
} catch (error) {
  console.error("⚠️ Deployment script failed.", error.message);
  process.exitCode = 1;
}
