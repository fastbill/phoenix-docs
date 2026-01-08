# Phoenix Docs

Docker image for generating documentation for Phoenix Framework modules.

## Quick Start

### Initialize documentation

```bash
docker run -v $(pwd):/project ghcr.io/fastbill/phoenix-docs init
```

This creates a `docs/` folder with:
- `docs.json` - Configuration (title, description)
- `getting-started.md` - Example documentation
- `_documentation-guide.md` - Writing guidelines
- `_template.md` - Templates for reference docs

### Start dev server

```bash
docker run -v $(pwd):/project -p 4321:4321 ghcr.io/fastbill/phoenix-docs serve
```

Open http://localhost:4321 to view your docs with hot reload.

### Build static site

```bash
docker run -v $(pwd):/project ghcr.io/fastbill/phoenix-docs build
```

Output goes to `docs-dist/` - ready for GitHub/GitLab Pages.

## Configuration

Edit `docs/docs.json`:

```json
{
  "title": "My Module",
  "description": "Documentation for My Module",
  "group_order": [
    "Getting Started",
    "Guide",
    "Reference"
  ]
}
```

## Writing Documentation

Each markdown file needs frontmatter:

```yaml
---
title: Page Title
sidebar_group: Getting Started
sidebar_position: 1
description: Brief description for table of contents
---
```

- `title` - Page title (required)
- `sidebar_group` - Navigation group (required for inclusion in sidebar)
- `sidebar_position` - Sort order within group
- `description` - Optional, shown in TOC

Files starting with `_` are excluded from navigation.

## CI/CD

### GitHub Actions

```yaml
name: Build Docs

on:
  push:
    paths:
      - 'docs/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build documentation
        run: docker run -v $(pwd):/project ghcr.io/fastbill/phoenix-docs build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-dist
```

## Development

Build the image locally:

```bash
docker build -t phoenix-docs .
docker run -v $(pwd):/project phoenix-docs init
```
