#!/usr/bin/env node
/**
 * generate-entries.js
 * Reads all .md files from /posts and generates static pages in /entry/{slug}/
 * Skips drafts. Removes stale dirs for deleted/renamed posts.
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const ENTRY_DIR = path.join(__dirname, 'entry');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'entry.html');

const escHtml = s => String(s).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(\n|$)/);
  const meta = { title: '', date: '', tags: [], draft: '', verified: '' };
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
      else if (key === 'draft') meta.draft = val;
      else if (key === 'verified') meta.verified = val;
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

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  if (!fs.existsSync(ENTRY_DIR)) fs.mkdirSync(ENTRY_DIR);

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('No markdown files found in /posts');
    return;
  }

  // remove stale dirs for posts that no longer exist
  const slugs = files.map(f => f.replace(/\.md$/, ''));
  fs.readdirSync(ENTRY_DIR).forEach(d => {
    if (!slugs.includes(d)) {
      fs.rmSync(path.join(ENTRY_DIR, d), { recursive: true, force: true });
      console.log(`- Removed stale: entry/${d}/`);
    }
  });

  let made = 0;
  files.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontMatter(raw);

    if (/^(true|yes|1)$/i.test(meta.draft || '')) {
      console.log(`- Skipped (draft): ${slug}`);
      return;
    }

    const title = meta.title || slug;
    const verified = meta.verified
      ? ` · <span style="color:var(--accent)">● Verified on ${escHtml(meta.verified)}</span>`
      : '';
    const date = formatDate(meta.date) + verified;
    const excerptText = excerpt(body);
    const bodyHtml = marked.parse(body);

    const html = template
      .replace(/\{\{TITLE\}\}/g, escHtml(title))
      .replace(/\{\{SLUG\}\}/g, slug)
      .replace(/\{\{DATE\}\}/g, date)
      .replace(/\{\{EXCERPT\}\}/g, escHtml(excerptText))
      .replace(/\{\{BODY_HTML\}\}/g, bodyHtml);

    const outDir = path.join(ENTRY_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`✓ Generated entry/${slug}/`);
    made++;
  });

  console.log(`\nDone. Generated ${made} entry pages.`);
}

main();
