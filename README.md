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
  ],
  "exclude": [
    "_*"
  ]
}
```

### Configuration Options

| Option | Description |
|--------|-------------|
| `title` | Documentation site title |
| `description` | Site description |
| `group_order` | Sidebar group ordering (unlisted groups appear alphabetically at the end) |
| `exclude` | Patterns to exclude from docs (default: `["_*"]`) |

### Exclude Patterns

- `plans` - Exact directory/file name match
- `_*` - Wildcard prefix (matches `_draft.md`, `_notes/`, etc.)
- `*.draft.md` - Wildcard suffix

## Writing Documentation

Each markdown file needs frontmatter:

```yaml
---
title: Page Title
sidebar_group: Getting Started
sidebar_position: 1
description: Brief description
---
```

### Frontmatter Options

| Option | Description |
|--------|-------------|
| `title` | Page title (required) |
| `sidebar_group` | Navigation group - files are organized into subdirectories based on this |
| `sidebar_position` | Sort order within group (lower = higher) |
| `description` | Optional page description |

### How It Works

You write flat files with `sidebar_group` frontmatter:

```
docs/
├── installation.md      # sidebar_group: "Getting Started"
├── configuration.md     # sidebar_group: "Getting Started"
├── basics.md            # sidebar_group: "Guide"
├── quick-notes.md       # no frontmatter → goes to "Drafts"
└── index.md
```

The container automatically reorganizes them into Starlight's directory structure and generates the sidebar configuration.

### Auto-Grouping

Files without `sidebar_group` frontmatter are automatically grouped:

- **Files in subdirectories** → use directory name as group (`api/users.md` → "Api" group)
- **Files at root level** → placed in "Drafts" group
- **Title** → generated from filename if missing

This supports both flat and nested directory structures without requiring frontmatter.

### Plans Directory

Files in a `plans/` directory get special treatment:
- Placed in "Plans" sidebar group
- Title generated from filename without date prefix
- Sorted by date (newest first)

Example:
```
docs/plans/
├── 2024-01-15-api-redesign.md    → "Api Redesign" (appears first)
├── 2024-01-10-auth-flow.md       → "Auth Flow"
└── 2024-01-05-initial-plan.md    → "Initial Plan" (appears last)
```

Perfect for viewing AI-generated plans in Starlight without any manual frontmatter editing.

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
