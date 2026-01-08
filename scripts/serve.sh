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

# Create symlink from src/content/docs to project docs
rm -rf /app/src/content/docs
ln -s "$DOCS_DIR" /app/src/content/docs

# Generate sidebar
echo "Generating sidebar..."
node /app/scripts/generate-sidebar.mjs

# Start dev server
echo "Starting dev server on http://localhost:4321"
cd /app && npm run dev
