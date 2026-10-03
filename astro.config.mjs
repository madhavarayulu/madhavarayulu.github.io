import { defineConfig } from 'astro/config';
import githubPages from '@astrojs/github-pages';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourusername.github.io', // We will update this later with your actual domain
  base: 'madhavarayulu.github.io', // This matches your GitHub repository name
  output: 'static',
  adapter: githubPages(),
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark', // Beautiful syntax highlighting for code blocks
    },
  },
  vite: {
    // PWA configuration will go here in Phase 2
  }
});
