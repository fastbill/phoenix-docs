#!/usr/bin/env node
/**
 * Generates Starlight sidebar and docs/index.md TOC from doc frontmatter
 *
 * Each doc file should have frontmatter:
 *   ---
 *   title: Page Title
 *   description: Brief description shown in TOC
 *   sidebar_group: Section Name
 *   sidebar_position: 1
 *   ---
 *
 * Files without sidebar_group are excluded from navigation.
 * Files starting with _ are always excluded.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use /project/docs when running in Docker, fallback for local dev
const projectDocsDir = '/project/docs';
const localDocsDir = join(__dirname, '../docs');
const docsDir = existsSync(projectDocsDir) ? projectDocsDir : localDocsDir;

const sidebarOutput = join(__dirname, '../src/sidebar.generated.mjs');
const indexOutput = join(docsDir, 'index.md');

// Default group order - projects can override via docs.json
const DEFAULT_GROUP_ORDER = [
  'Getting Started',
  'Guide',
  'Reference',
  'API',
  'Advanced',
  'Migration',
];

// Read custom group order from docs.json if available
let GROUP_ORDER = DEFAULT_GROUP_ORDER;
const configPath = join(docsDir, 'docs.json');
if (existsSync(configPath)) {
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (config.group_order && Array.isArray(config.group_order)) {
      GROUP_ORDER = config.group_order;
    }
  } catch (e) {
    // Use defaults
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }
  return frontmatter;
}

function getAllDocs(dir, prefix = '') {
  const docs = [];

  if (!existsSync(dir)) {
    console.error(`Error: docs directory not found at ${dir}`);
    process.exit(1);
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!entry.startsWith('_') && entry !== 'plans') {
        docs.push(...getAllDocs(fullPath, prefix ? `${prefix}/${entry}` : entry));
      }
    } else if (entry.endsWith('.md') && !entry.startsWith('_')) {
      const content = readFileSync(fullPath, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      const slug = prefix
        ? `${prefix}/${entry.replace(/\.md$/, '')}`
        : entry.replace(/\.md$/, '');

      if (frontmatter.title) {
        docs.push({
          slug,
          filename: entry,
          path: fullPath,
          ...frontmatter,
          sidebar_position: frontmatter.sidebar_position
            ? parseInt(frontmatter.sidebar_position, 10)
            : 999,
        });
      }
    }
  }

  return docs;
}

function groupDocs(docs) {
  const groups = new Map();

  for (const doc of docs) {
    if (!doc.sidebar_group) continue;

    if (!groups.has(doc.sidebar_group)) {
      groups.set(doc.sidebar_group, []);
    }
    groups.get(doc.sidebar_group).push(doc);
  }

  for (const items of groups.values()) {
    items.sort((a, b) => a.sidebar_position - b.sidebar_position);
  }

  const sortedGroups = [];
  for (const groupName of GROUP_ORDER) {
    if (groups.has(groupName)) {
      sortedGroups.push({
        label: groupName,
        items: groups.get(groupName),
      });
      groups.delete(groupName);
    }
  }

  for (const [label, items] of groups) {
    sortedGroups.push({ label, items });
  }

  return sortedGroups;
}

function generateSidebarConfig(groups) {
  const sections = groups.map(group => {
    const items = group.items.map(item => {
      return `      { label: '${item.title.replace(/'/g, "\\'")}', slug: '${item.slug}' }`;
    }).join(',\n');

    return `  {
    label: '${group.label.replace(/'/g, "\\'")}',
    items: [
${items},
    ],
  }`;
  }).join(',\n');

  return `// AUTO-GENERATED FILE - Do not edit directly
// Run: npm run generate-sidebar
// Source: frontmatter in docs/*.md files

export const sidebar = [
${sections},
];
`;
}

function generateIndexMd(groups, config) {
  const title = config.title || 'Documentation';
  const description = config.description || '';

  let toc = '';

  for (const group of groups) {
    toc += `\n### ${group.label}\n\n`;
    for (const item of group.items) {
      const desc = item.description ? ` - ${item.description}` : '';
      toc += `- [${item.title}](./${item.slug}.md)${desc}\n`;
    }
  }

  return `---
title: ${title}
sidebar_position: 0
---

# ${title}

${description}

## Table of Contents
${toc}
`;
}

// Main
console.log(`Scanning docs directory: ${docsDir}`);
const docs = getAllDocs(docsDir);
console.log(`Found ${docs.length} documentation files`);

const withGroup = docs.filter(d => d.sidebar_group);
const withoutGroup = docs.filter(d => !d.sidebar_group);

if (withoutGroup.length > 0) {
  console.log(`\nFiles without sidebar_group (excluded from navigation):`);
  for (const doc of withoutGroup) {
    console.log(`  - ${doc.slug}`);
  }
}

const groups = groupDocs(docs);
console.log(`\nOrganized into ${groups.length} groups:`);
for (const group of groups) {
  console.log(`  ${group.label}: ${group.items.length} items`);
}

// Read config for index generation
let config = {};
if (existsSync(configPath)) {
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (e) {
    // Use defaults
  }
}

// Generate sidebar config
const sidebarConfig = generateSidebarConfig(groups);
writeFileSync(sidebarOutput, sidebarConfig);
console.log(`\nGenerated: ${sidebarOutput}`);

// Generate index.md
const indexContent = generateIndexMd(groups, config);
writeFileSync(indexOutput, indexContent);
console.log(`Generated: ${indexOutput}`);

console.log('\nDone!');
