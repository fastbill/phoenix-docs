#!/bin/sh
set -e

DOCS_DIR="/project/docs"
OUTPUT_DIR="/project/docs-dist"

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

echo "Building documentation..."

# Sync docs with exclusions and generate sidebar
node /app/scripts/sync-docs.mjs

# Clean output directory
rm -rf "$OUTPUT_DIR"

# Build
echo "Running Astro build..."
cd /app && npm run build

echo ""
echo "Build complete! Static files are in docs-dist/"
