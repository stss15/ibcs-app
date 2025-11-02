#!/bin/bash
set -e

# Convenience wrapper for the full deployment flow
# This just delegates to deploy-everything.sh which:
#   1. Pushes the InstantDB schema
#   2. Builds the frontend
#   3. Deploys the Cloudflare Worker
#   4. Seeds the teacher account (idempotent)
#   5. Pushes the GitHub Pages build

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

"$SCRIPT_DIR/deploy-everything.sh"

