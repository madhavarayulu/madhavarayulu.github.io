#!/usr/bin/env node
/**
 * generate-entries.js
 * Reads all .md files from /posts and generates static pages in /entry/{slug}/
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked'); // npm install marked

const POSTS_DIR = path.join(__dirname, 'posts');
const ENTRY_DIR = path.join(__dirname, 'entry');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'entry.html');

// Simple front-matter parser
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(\n|$)/);
  const meta = { title: '', date: '', tags: [] };
  let body = raw;

  if (match) {
    body = raw.slice(match[0].length);
    match[1].split(/\r?\n/).forEach(line => {
      const kv = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (!kv) return;
      const key = kv[1].toLowerCase();
      const val = kv[2].trim();
      if (key === 'title') meta.title = val;
      else if (key === 'date') meta.date = val;
      else if (key === 'tags') meta.tags = val.split(',').map(s => s.trim()).filter(Boolean);
    });
  }
  return { meta, body: body.trim() };
}

function excerpt(text, max = 160) {
  const clean = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > max ? clean.slice(0, max).replace(/\s+\S*$/, '') + '…' : clean;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr || '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('No /posts folder found');
    process.exit(1);
  }

  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Ensure entry directory exists
  if (!fs.existsSync(ENTRY_DIR)) fs.mkdirSync(ENTRY_DIR);

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.log('No markdown files found in /posts');
    return;
  }

  files.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontMatter(raw);

    const title = meta.title || slug;
    const date = formatDate(meta.date);
    const excerptText = excerpt(body);
    const bodyHtml = marked.parse(body);

    const html = template
      .replace(/\{\{TITLE\}\}/g, title)
      .replace(/\{\{SLUG\}\}/g, slug)
      .replace(/\{\{DATE\}\}/g, date)
      .replace(/\{\{EXCERPT\}\}/g, excerptText)
      .replace(/\{\{BODY_HTML\}\}/g, bodyHtml);

    const outDir = path.join(ENTRY_DIR, slug);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`✓ Generated entry/${slug}/`);
  });

  console.log(`\nDone. Generated ${files.length} entry pages.`);
}

main();
