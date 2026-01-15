import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync, existsSync } from 'fs';

// Read project config from mounted volume
let projectConfig = {
  title: 'Documentation',
  description: 'Project documentation'
};

const configPath = '/project/docs/docs.json';
if (existsSync(configPath)) {
  try {
    projectConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.warn('Warning: Could not parse docs.json, using defaults');
  }
}

// Import generated sidebar if it exists
let sidebar = [];
try {
  const sidebarModule = await import('./src/sidebar.generated.mjs');
  sidebar = sidebarModule.sidebar;
} catch (e) {
  // Sidebar will be generated before build
}

export default defineConfig({
  outDir: '/project/docs-dist',
  integrations: [
    starlight({
      title: projectConfig.title,
      description: projectConfig.description,
      sidebar,
    }),
  ],
});
