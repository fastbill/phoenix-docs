#!/bin/sh
set -e

DOCS_DIR="/project/docs"
TEMPLATES_DIR="/app/templates"

echo "Initializing documentation in $DOCS_DIR..."

# Create docs directory if it doesn't exist
mkdir -p "$DOCS_DIR"

# Copy templates, but don't overwrite existing files
copy_if_missing() {
  src="$1"
  dest="$2"
  if [ ! -f "$dest" ]; then
    cp "$src" "$dest"
    echo "  Created: $dest"
  else
    echo "  Skipped (exists): $dest"
  fi
}

copy_if_missing "$TEMPLATES_DIR/docs.json" "$DOCS_DIR/docs.json"
copy_if_missing "$TEMPLATES_DIR/getting-started.md" "$DOCS_DIR/getting-started.md"
copy_if_missing "$TEMPLATES_DIR/_documentation-guide.md" "$DOCS_DIR/_documentation-guide.md"
copy_if_missing "$TEMPLATES_DIR/_template.md" "$DOCS_DIR/_template.md"

echo ""
echo "Done! Next steps:"
echo "  1. Edit docs/docs.json with your project title and description"
echo "  2. Edit docs/getting-started.md with your content"
echo "  3. Run 'docker run -v \$(pwd):/project -p 4321:4321 ghcr.io/fastbill/phoenix-docs serve'"
