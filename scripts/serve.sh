#!/bin/sh
set -e

DOCS_DIR="/project/docs"

# Check if docs directory exists
if [ ! -d "$DOCS_DIR" ]; then
  echo "Error: docs/ directory not found"
  echo "Run 'docker run -v \$(pwd):/project ghcr.io/fastbill/phoenix-docs init' first"
  exit 1
fi

# Check if docs.json exists
if [ ! -f "$DOCS_DIR/docs.json" ]; then
  echo "Error: docs/docs.json not found"
  echo "Run 'docker run -v \$(pwd):/project ghcr.io/fastbill/phoenix-docs init' first"
  exit 1
fi

echo "Setting up documentation..."

# Sync docs with exclusions and generate sidebar (runs in background with watch mode)
node /app/scripts/sync-docs.mjs --watch &
SYNC_PID=$!

# Wait a moment for initial sync to complete
sleep 1

# Start dev server
echo "Starting dev server on http://localhost:4321"
cd /app && npm run dev

# Cleanup on exit
trap "kill $SYNC_PID 2>/dev/null" EXIT
