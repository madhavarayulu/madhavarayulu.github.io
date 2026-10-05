#!/usr/bin/env node
/**
 * generate-entries.js
 * Reads all .md files from /posts, generates static pages in /entry/{slug}/,
 * and creates a root posts.json for instant, rate-limit-free frontend loading.
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
  const meta = { title: '', date: '', tags: [], draft: '', verified: '', series: '', part: '' };
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
      else if (key === 'series') meta.series = val;
      else if (key === 'part') meta.part = val;
    });
  }
  return { meta, body: body.trim(), raw };
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

  // 1. Parse all valid posts first
  const validPosts = [];
  files.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body, raw: rawBody } = parseFrontMatter(raw);
    if (!/^(true|yes|1)$/i.test(meta.draft || '')) {
      validPosts.push({ slug, meta, body, raw: rawBody });
    } else {
      console.log(`- Skipped (draft): ${slug}`);
    }
  });

  // 2. Sort by date descending (newest first)
  validPosts.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  // Remove stale dirs for posts that no longer exist
  const slugs = validPosts.map(p => p.slug);
  fs.readdirSync(ENTRY_DIR).forEach(d => {
    if (!slugs.includes(d)) {
      fs.rmSync(path.join(ENTRY_DIR, d), { recursive: true, force: true });
      console.log(`- Removed stale: entry/${d}/`);
    }
  });

  // 3. Generate HTML with neighbor context
  const postsMeta = [];
  let made = 0;

  validPosts.forEach((post, index) => {
    const { slug, meta, body, raw } = post;
    const newerPost = validPosts[index - 1]; // newer is previous in array (newer date)
    const olderPost = validPosts[index + 1]; // older is next in array (older date)

    const newerHtml = newerPost 
      ? `<a href="/entry/${newerPost.slug}/" class="nav-link prev"><span class="nav-label">← Newer</span><span class="nav-title">${escHtml(newerPost.meta.title)}</span></a>` 
      : '<div></div>';
      
    const olderHtml = olderPost 
      ? `<a href="/entry/${olderPost.slug}/" class="nav-link next"><span class="nav-label">Older →</span><span class="nav-title">${escHtml(olderPost.meta.title)}</span></a>` 
      : '<div></div>';

    const title = meta.title || slug;
    const verified = meta.verified
      ? ` · <span style="color:var(--accent)">● Verified on ${escHtml(meta.verified)}</span>`
      : '';
    const date = formatDate(meta.date) + verified;
    const excerptText = excerpt(body);
    const bodyHtml = marked.parse(body);

    let html = template
      .replace(/\{\{TITLE\}\}/g, escHtml(title))
      .replace(/\{\{SLUG\}\}/g, slug)
      .replace(/\{\{DATE\}\}/g, date)
      .replace(/\{\{EXCERPT\}\}/g, escHtml(excerptText))
      .replace(/\{\{BODY_HTML\}\}/g, bodyHtml)
      .replace(/\{\{NEWER_LINK\}\}/g, newerHtml)
      .replace(/\{\{OLDER_LINK\}\}/g, olderHtml);

    const outDir = path.join(ENTRY_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`✓ Generated entry/${slug}/`);
    made++;

    postsMeta.push({
      slug,
      title,
      date: meta.date,
      tags: meta.tags,
      series: meta.series,
      part: meta.part ? parseInt(meta.part, 10) : 0,
      verified: meta.verified,
      excerpt: excerptText,
      raw: body
    });
  });

  // Sort by date descending and write to root posts.json
  postsMeta.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(postsMeta, null, 2));
  console.log(`✓ Generated posts.json for instant loading`);
  console.log(`\nDone. Generated ${made} entry pages.`);
}

main();
