#!/usr/bin/env node
/**
 * generate-entries.js
 * Reads all .md files from /posts, generates static pages in /entry/{slug}/,
 * injects Older/Newer navigation, and creates posts.json for the SPA.
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const ENTRY_DIR = path.join(__dirname, 'entry');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'entry.html');

const escHtml = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
);

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(\n|$)/);
  const meta = {
    title: '', date: '', tags: [], draft: '',
    verified: '', series: '', part: ''
  };
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

  return { meta, body: body.trim() };
}

function excerpt(text, max = 160) {
  const clean = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > max
    ? clean.slice(0, max).replace(/\s+\S*$/, '') + '…'
    : clean;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr || '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function buildNav(posts, index) {
  // posts are sorted newest → oldest
  const newer = posts[index - 1]; // previous in array = newer date
  const older = posts[index + 1]; // next in array = older date

  let html = '';

  if (newer) {
    html += `<a href="/entry/${escHtml(newer.slug)}/" class="nav-link prev">
      <span class="nav-label">← Newer</span>
      <span class="nav-title">${escHtml(newer.title)}</span>
    </a>`;
  } else {
    html += '<div></div>';
  }

  if (older) {
    html += `<a href="/entry/${escHtml(older.slug)}/" class="nav-link next">
      <span class="nav-label">Older →</span>
      <span class="nav-title">${escHtml(older.title)}</span>
    </a>`;
  } else {
    html += '<div></div>';
  }

  return html;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('No /posts folder found');
    process.exit(1);
  }

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('No templates/entry.html found');
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  if (!fs.existsSync(ENTRY_DIR)) fs.mkdirSync(ENTRY_DIR);

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('No markdown files found in /posts');
    return;
  }

  // Parse all posts first
  const parsed = [];
  files.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontMatter(raw);

    if (/^(true|yes|1)$/i.test(meta.draft || '')) {
      console.log(`- Skipped (draft): ${slug}`);
      return;
    }

    const title = meta.title || slug;
    const dateMs = meta.date ? (new Date(meta.date).getTime() || 0) : 0;

    parsed.push({
      slug,
      title,
      date: meta.date,
      dateMs,
      tags: meta.tags,
      series: meta.series,
      part: meta.part ? parseInt(meta.part, 10) : 0,
      verified: meta.verified,
      excerpt: excerpt(body),
      body
    });
  });

  // Newest first
  parsed.sort((a, b) => b.dateMs - a.dateMs);

  // Remove stale entry folders
  const slugs = parsed.map(p => p.slug);
  fs.readdirSync(ENTRY_DIR).forEach(d => {
    if (!slugs.includes(d)) {
      fs.rmSync(path.join(ENTRY_DIR, d), { recursive: true, force: true });
      console.log(`- Removed stale: entry/${d}/`);
    }
  });

  // Generate each entry page
  let made = 0;
  parsed.forEach((p, index) => {
    const verified = p.verified
      ? ` · <span style="color:var(--accent)">● Verified on ${escHtml(p.verified)}</span>`
      : '';
    const date = formatDate(p.date) + verified;
    const bodyHtml = marked.parse(p.body);
    const nav = buildNav(parsed, index);

    const html = template
      .replace(/\{\{TITLE\}\}/g, escHtml(p.title))
      .replace(/\{\{SLUG\}\}/g, p.slug)
      .replace(/\{\{DATE\}\}/g, date)
      .replace(/\{\{EXCERPT\}\}/g, escHtml(p.excerpt))
      .replace(/\{\{BODY_HTML\}\}/g, bodyHtml)
      .replace(/\{\{NAV\}\}/g, nav);

    const outDir = path.join(ENTRY_DIR, p.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`✓ Generated entry/${p.slug}/`);
    made++;
  });

  // posts.json for the SPA
  const postsMeta = parsed.map(p => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags,
    series: p.series,
    part: p.part,
    verified: p.verified,
    excerpt: p.excerpt,
    raw: p.body
  }));

  fs.writeFileSync(
    path.join(__dirname, 'posts.json'),
    JSON.stringify(postsMeta, null, 2)
  );
  console.log('✓ Generated posts.json for instant loading');
  console.log(`\nDone. Generated ${made} entry pages.`);

    // sitemap.xml for search engines
  const SITE = 'https://madhavarayulu.github.io';
  const urls = [
    { loc: SITE + '/', lastmod: parsed[0] && parsed[0].dateMs ? new Date(parsed[0].dateMs).toISOString().slice(0,10) : '' },
    ...parsed.map(p => ({
      loc: `${SITE}/entry/${p.slug}/`,
      lastmod: p.dateMs ? new Date(p.dateMs).toISOString().slice(0,10) : ''
    }))
  ];
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(u => '  <url><loc>' + u.loc + '</loc>'
        + (u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : '')
        + '</url>').join('\n')
    + '\n</urlset>\n';
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
  console.log('✓ Generated sitemap.xml');
  
}

main();
