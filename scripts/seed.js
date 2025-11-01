#!/usr/bin/env node
/**
 * InstantDB seed helper.
 * Requires the INSTANT_APP_ID and WORKER_BASE environment variables to be set.
 * Extend this script once InstantDB service tokens or admin APIs are available.
 */

import process from "node:process";

const appId = process.env.INSTANT_APP_ID || process.env.npm_package_config_instantAppId;
const workerBase = process.env.WORKER_BASE;

if (!appId || !workerBase) {
  console.error("Missing INSTANT_APP_ID or WORKER_BASE environment variables.");
  process.exit(1);
}

console.log("Seed script placeholder.");
console.log(`InstantDB app: ${appId}`);
console.log(`Worker base: ${workerBase}`);
console.log("Add your data seeding logic once authenticated endpoints are available.");
