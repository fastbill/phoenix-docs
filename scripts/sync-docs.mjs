#!/usr/bin/env node
/**
 * Syncs documentation files from source to destination with:
 * - Exclusion support (configurable via docs.json)
 * - Directory reorganization based on sidebar_group frontmatter
 * - Frontmatter transformation (sidebar_position → sidebar.order)
 *
 * Usage:
 *   node sync-docs.mjs [--watch]
 *
 * Source files with sidebar_group frontmatter are moved to subdirectories:
 *   docs/my-page.md (sidebar_group: "Getting Started")
 *   → src/content/docs/getting-started/my-page.md
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const sourceDir = '/project/docs';
const destDir = '/app/src/content/docs';
const configPath = join(sourceDir, 'docs.json');
const sidebarConfigOutput = join(__dirname, '../src/sidebar.generated.mjs');

// Default exclude patterns
const DEFAULT_EXCLUDES = ['_*'];

// Parse command line args
const watchMode = process.argv.includes('--watch');

function loadConfig() {
  let config = {
    exclude: DEFAULT_EXCLUDES,
    group_order: [],
  };

  if (existsSync(configPath)) {
    try {
      const parsed = JSON.parse(readFileSync(configPath, 'utf-8'));
      if (parsed.exclude && Array.isArray(parsed.exclude)) {
        config.exclude = parsed.exclude;
      }
      if (parsed.group_order && Array.isArray(parsed.group_order)) {
        config.group_order = parsed.group_order;
      }
    } catch (e) {
      // Use defaults
    }
  }

  return config;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function filenameToTitle(filename) {
  // Remove extension and convert to title case
  // "my-awesome-page.md" → "My Awesome Page"
  return filename
    .replace(/\.(md|mdx)$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { frontmatter: {}, body: content, raw: '' };

  const frontmatter = {};
  const raw = match[0];
  const body = content.slice(raw.length).replace(/^\r?\n/, '');

  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body, raw };
}

function transformFrontmatter(frontmatter) {
  const transformed = { ...frontmatter };

  // Transform sidebar_position to sidebar.order
  if (transformed.sidebar_position !== undefined) {
    const order = parseInt(transformed.sidebar_position, 10);
    delete transformed.sidebar_position;
    transformed['sidebar'] = { order };
  }

  // Remove sidebar_group from output (used for directory placement)
  delete transformed.sidebar_group;

  return transformed;
}

function serializeFrontmatter(frontmatter) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects like sidebar: { order: 1 }
      lines.push(`${key}:`);
      for (const [subKey, subValue] of Object.entries(value)) {
        lines.push(`  ${subKey}: ${subValue}`);
      }
    } else if (typeof value === 'string' && (value.includes(':') || value.includes('#') || value.includes("'"))) {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

function matchesPattern(name, pattern) {
  if (pattern.startsWith('*') && pattern.length > 1) {
    return name.endsWith(pattern.slice(1));
  } else if (pattern.endsWith('*') && pattern.length > 1) {
    return name.startsWith(pattern.slice(0, -1));
  } else if (pattern === '*') {
    return true;
  } else {
    return name === pattern;
  }
}

function shouldExclude(name, excludes) {
  return excludes.some(pattern => matchesPattern(name, pattern));
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

const DRAFTS_GROUP = 'Drafts';

function processMarkdownFile(srcPath, destDir, excludes) {
  const filename = basename(srcPath);
  const content = readFileSync(srcPath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  // If no title, generate from filename
  if (!frontmatter.title) {
    frontmatter.title = filenameToTitle(filename);
  }

  // index.md stays at root level, others without sidebar_group go to Drafts
  const isIndex = filename === 'index.md' || filename === 'index.mdx';

  if (!frontmatter.sidebar_group && !isIndex) {
    frontmatter.sidebar_group = DRAFTS_GROUP;
  }

  // Determine destination directory based on sidebar_group
  let targetDir = destDir;
  let group = null;

  if (frontmatter.sidebar_group) {
    group = frontmatter.sidebar_group;
    const groupSlug = slugify(group);
    targetDir = join(destDir, groupSlug);
  }

  // Transform frontmatter
  const transformed = transformFrontmatter(frontmatter);
  const newContent = serializeFrontmatter(transformed) + '\n' + body;

  // Write to destination
  ensureDir(targetDir);
  const destPath = join(targetDir, filename);
  writeFileSync(destPath, newContent);

  return { group, destPath };
}

function copyFile(src, dest) {
  ensureDir(dirname(dest));
  const content = readFileSync(src);
  writeFileSync(dest, content);
}

function syncDirectory(src, dest, excludes, groups = new Set(), relativePath = '') {
  if (!existsSync(src)) {
    console.error(`Error: Source directory not found: ${src}`);
    process.exit(1);
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    if (shouldExclude(entry, excludes)) {
      continue;
    }

    const srcPath = join(src, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      syncDirectory(srcPath, dest, excludes, groups, relativePath ? `${relativePath}/${entry}` : entry);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      // Process markdown files
      const result = processMarkdownFile(srcPath, dest, excludes);
      if (result.group) {
        groups.add(result.group);
      }
    } else if (!entry.endsWith('.json')) {
      // Copy non-markdown, non-json files as-is (images, etc.)
      const destPath = join(dest, relativePath, entry);
      copyFile(srcPath, destPath);
    }
  }

  return groups;
}

function generateSidebarConfig(groups, groupOrder) {
  // Sort groups by configured order, then alphabetically for unlisted ones
  const orderedGroups = [];
  const groupSet = new Set(groups);

  // First add groups in configured order
  for (const group of groupOrder) {
    if (groupSet.has(group)) {
      orderedGroups.push(group);
      groupSet.delete(group);
    }
  }

  // Then add remaining groups alphabetically
  const remaining = Array.from(groupSet).sort();
  orderedGroups.push(...remaining);

  // Generate sidebar config
  const sidebarItems = orderedGroups.map(group => {
    const slug = slugify(group);
    return `  {
    label: '${group.replace(/'/g, "\\'")}',
    autogenerate: { directory: '${slug}' },
  }`;
  });

  return `// AUTO-GENERATED FILE - Do not edit directly
// Generated by sync-docs.mjs based on sidebar_group frontmatter

export const sidebar = [
  { label: 'Introduction', slug: 'index' },
${sidebarItems.join(',\n')},
];
`;
}

function initialSync() {
  const config = loadConfig();
  console.log(`Syncing docs from ${sourceDir} to ${destDir}`);
  console.log(`Excluding: ${config.exclude.join(', ')}`);

  // Clean destination
  if (existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
  ensureDir(destDir);

  // Sync and collect groups
  const groups = syncDirectory(sourceDir, destDir, config.exclude);

  console.log(`Found ${groups.size} sidebar groups: ${Array.from(groups).join(', ')}`);

  // Generate sidebar config
  const sidebarConfig = generateSidebarConfig(groups, config.group_order);
  writeFileSync(sidebarConfigOutput, sidebarConfig);
  console.log(`Generated: ${sidebarConfigOutput}`);

  console.log('Sync complete');
}

async function watchAndSync() {
  const chokidar = await import('chokidar');
  const config = loadConfig();

  // Build ignore patterns
  const ignorePatterns = config.exclude.map(pattern => {
    if (pattern.endsWith('*')) {
      return new RegExp(`(^|/)${pattern.slice(0, -1)}[^/]*$`);
    } else if (pattern.startsWith('*')) {
      return new RegExp(`(^|/)[^/]*${pattern.slice(1)}$`);
    } else {
      return new RegExp(`(^|/)${pattern}(/|$)`);
    }
  });

  const watcher = chokidar.watch(sourceDir, {
    ignored: [
      /(^|[\/\\])\../,
      ...ignorePatterns,
    ],
    persistent: true,
    ignoreInitial: true,
  });

  // Track groups for sidebar regeneration
  let knownGroups = new Set();

  // Collect initial groups
  const collectGroups = (dir) => {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const path = join(dir, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        collectGroups(path);
      } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
        const content = readFileSync(path, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);
        const isIndex = entry === 'index.md' || entry === 'index.mdx';
        if (frontmatter.sidebar_group) {
          knownGroups.add(frontmatter.sidebar_group);
        } else if (!isIndex) {
          knownGroups.add(DRAFTS_GROUP);
        }
      }
    }
  };
  collectGroups(sourceDir);

  const handleFileChange = (srcPath) => {
    const ext = extname(srcPath);
    const filename = basename(srcPath);

    if (ext === '.md' || ext === '.mdx') {
      const result = processMarkdownFile(srcPath, destDir, config.exclude);
      if (result.group && !knownGroups.has(result.group)) {
        knownGroups.add(result.group);
        // Regenerate sidebar config when new group appears
        const sidebarConfig = generateSidebarConfig(knownGroups, config.group_order);
        writeFileSync(sidebarConfigOutput, sidebarConfig);
        console.log('Regenerated sidebar config (new group)');
      }
    } else if (ext !== '.json') {
      // Copy non-markdown files
      const rel = relative(sourceDir, srcPath);
      const destPath = join(destDir, rel);
      copyFile(srcPath, destPath);
    }
  };

  watcher
    .on('add', (path) => {
      console.log(`+ ${relative(sourceDir, path)}`);
      handleFileChange(path);
    })
    .on('change', (path) => {
      console.log(`~ ${relative(sourceDir, path)}`);
      handleFileChange(path);
    })
    .on('unlink', (path) => {
      console.log(`- ${relative(sourceDir, path)}`);
      // For deletions, do a full resync to handle group changes
      initialSync();
    })
    .on('unlinkDir', (path) => {
      console.log(`-/ ${relative(sourceDir, path)}`);
      initialSync();
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    })
    .on('ready', () => {
      console.log('Watching for changes...');
    });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

// Main
initialSync();

if (watchMode) {
  watchAndSync();
}
