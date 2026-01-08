#!/bin/sh
set -e

COMMAND=${1:-help}

case "$COMMAND" in
  init)
    exec /app/scripts/init.sh
    ;;
  serve)
    exec /app/scripts/serve.sh
    ;;
  build)
    exec /app/scripts/build.sh
    ;;
  help|--help|-h)
    echo "Phoenix Docs - Documentation generator for Phoenix Framework modules"
    echo ""
    echo "Usage: docker run -v \$(pwd):/project ghcr.io/fastbill/phoenix-docs <command>"
    echo ""
    echo "Commands:"
    echo "  init    Initialize docs/ folder with templates"
    echo "  serve   Start dev server with hot reload (port 4321)"
    echo "  build   Build static site to docs-dist/"
    echo "  help    Show this help message"
    echo ""
    echo "Examples:"
    echo "  docker run -v \$(pwd):/project ghcr.io/fastbill/phoenix-docs init"
    echo "  docker run -v \$(pwd):/project -p 4321:4321 ghcr.io/fastbill/phoenix-docs serve"
    echo "  docker run -v \$(pwd):/project ghcr.io/fastbill/phoenix-docs build"
    ;;
  *)
    echo "Unknown command: $COMMAND"
    echo "Run 'docker run ghcr.io/fastbill/phoenix-docs help' for usage"
    exit 1
    ;;
esac
