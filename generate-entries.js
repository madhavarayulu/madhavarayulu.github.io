#!/usr/bin/env node
/**
 * generate-entries.js
 * Single-source-of-truth static generator for Cairn.
 * Uses root index.html as the master shell — no separate templates/entry.html required!
 * Generates:
 *   - /entry/{slug}/index.html (with pre-rendered HTML, OpenGraph, & JSON-LD)
 *   - /archive/index.html & /trailhead/index.html (for clean URL routing on GitHub Pages)
 *   - /posts.json
 *   - /sitemap.xml
 *   - /rss.xml
 */
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const SITE = "https://madhavarayulu.github.io";
const POSTS_DIR = path.join(__dirname, "posts");
const ENTRY_DIR = path.join(__dirname, "entry");
const INDEX_PATH = path.join(__dirname, "index.html");

const escHtml = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

function parseFrontMatter(raw) {
  raw = String(raw).replace(/^\uFEFF/, "").replace(/^\s+/, "");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(\n|$)/);
  const meta = {
    title: "",
    date: "",
    tags: [],
    draft: "",
    verified: "",
    series: "",
    part: "",
  };
  let body = raw;

  if (match) {
    body = raw.slice(match[0].length);
    match[1].split(/\r?\n/).forEach((line) => {
      const kv = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (!kv) return;
      const key = kv[1].toLowerCase();
      const val = kv[2].trim();
      if (key === "title") meta.title = val;
      else if (key === "date") meta.date = val;
      else if (key === "tags")
        meta.tags = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      else if (key === "draft") meta.draft = val;
      else if (key === "verified") meta.verified = val;
      else if (key === "series") meta.series = val;
      else if (key === "part") meta.part = val;
    });
  }

  return { meta, body: body.trim() };
}

function excerpt(text, max = 160) {
  const clean = String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > max ? clean.slice(0, max).replace(/\s+\S*$/, "") + "…" : clean;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr || "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function readTime(text) {
  const w = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(w / 220)) + " min read";
}

function injectPage(shellHtml, seoBlock, viewBlock) {
  return shellHtml
    .replace(/<!--SEO_START-->[\s\S]*?<!--SEO_END-->/, `<!--SEO_START-->\n${seoBlock}\n    <!--SEO_END-->`)
    .replace(
      /<!--STATIC_VIEW_START-->[\s\S]*?<!--STATIC_VIEW_END-->/,
      `<!--STATIC_VIEW_START-->\n${viewBlock}\n        <!--STATIC_VIEW_END-->`
    );
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error("No /posts folder found");
    process.exit(1);
  }
  if (!fs.existsSync(INDEX_PATH)) {
    console.error("No root index.html found");
    process.exit(1);
  }

  const shell = fs.readFileSync(INDEX_PATH, "utf8");
  if (!fs.existsSync(ENTRY_DIR)) fs.mkdirSync(ENTRY_DIR, { recursive: true });

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const parsed = [];

  files.forEach((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { meta, body } = parseFrontMatter(raw);

    if (/^(true|yes|1)$/i.test(meta.draft || "")) {
      console.log(`- Skipped (draft): ${slug}`);
      return;
    }

    const title = meta.title || slug;
    const dateMs = meta.date ? new Date(meta.date).getTime() || 0 : 0;

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
      body,
    });
  });

  parsed.sort((a, b) => b.dateMs - a.dateMs);

  // Remove stale entry directories
  const validSlugs = parsed.map((p) => p.slug);
  fs.readdirSync(ENTRY_DIR).forEach((d) => {
    if (!validSlugs.includes(d)) {
      fs.rmSync(path.join(ENTRY_DIR, d), { recursive: true, force: true });
      console.log(`- Removed stale: entry/${d}/`);
    }
  });

  // 1. Generate static /entry/{slug}/index.html pages
  parsed.forEach((p, index) => {
    const newer = parsed[index - 1];
    const older = parsed[index + 1];
    const bodyHtml = marked.parse(p.body);
    const url = `${SITE}/entry/${p.slug}/`;
    const isoDate = p.dateMs ? new Date(p.dateMs).toISOString() : "";

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: p.title,
      description: p.excerpt,
      datePublished: isoDate,
      author: { "@type": "Person", name: "Madhava Rayulu", url: SITE },
      publisher: { "@type": "Organization", name: "Cairn" },
      mainEntityOfPage: url,
    });

    const seoBlock = `    <title>${escHtml(p.title)} · Cairn</title>
    <meta name="description" content="${escHtml(p.excerpt)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escHtml(p.title)}" />
    <meta property="og:description" content="${escHtml(p.excerpt)}" />
    <meta property="og:url" content="${url}" />
    <link rel="canonical" href="${url}" />
    <meta name="twitter:title" content="${escHtml(p.title)}" />
    <meta name="twitter:description" content="${escHtml(p.excerpt)}" />
    <script type="application/ld+json">${jsonLd}</script>`;

    const viewBlock = `
        <div class="page-grid">
          <div class="main-col">
            <a class="back-chip" href="/" data-nav><span class="ms-icon">arrow_back</span> Field notes</a>
            <header class="art-header">
              <h1 class="art-title">${escHtml(p.title)}</h1>
              <div class="meta-line">
                <span>${formatDate(p.date)}</span>
                <span class="mdot">·</span>
                <span>${readTime(p.body)}</span>
                ${p.verified ? `<span class="mdot">·</span><span class="vfy-chip">● Verified on ${escHtml(p.verified)}</span>` : ""}
              </div>
            </header>
            <div class="prose entry-prose">${bodyHtml}</div>
            <nav class="nav-row">
              ${newer ? `<a class="nav-link prev" href="/entry/${escHtml(newer.slug)}/" data-nav><span class="nav-label">← Newer Note</span><span class="nav-title">${escHtml(newer.title)}</span></a>` : `<div></div>`}
              ${older ? `<a class="nav-link next" href="/entry/${escHtml(older.slug)}/" data-nav><span class="nav-label">Older Note →</span><span class="nav-title">${escHtml(older.title)}</span></a>` : `<div></div>`}
            </nav>
          </div>
        </div>`;

    const outDir = path.join(ENTRY_DIR, p.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), injectPage(shell, seoBlock, viewBlock));
    console.log(`✓ Generated entry/${p.slug}/index.html`);
  });

  // 2. Generate /archive/index.html & /trailhead/index.html route shells
  ["archive", "trailhead"].forEach((route) => {
    const dir = path.join(__dirname, route);
    fs.mkdirSync(dir, { recursive: true });
    const routeTitle = route === "archive" ? "The Pile · Cairn" : "Trailhead · Cairn";
    const seo = `    <title>${routeTitle}</title>\n    <link rel="canonical" href="${SITE}/${route}/" />`;
    fs.writeFileSync(path.join(dir, "index.html"), injectPage(shell, seo, ""));
    console.log(`✓ Generated ${route}/index.html`);
  });

  // 3. Write posts.json
  const postsMeta = parsed.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    tags: p.tags,
    series: p.series,
    part: p.part,
    verified: p.verified,
    excerpt: p.excerpt,
    raw: p.body,
  }));
  fs.writeFileSync(path.join(__dirname, "posts.json"), JSON.stringify(postsMeta, null, 2));
  console.log("✓ Generated posts.json");

  // 4. Write sitemap.xml
  const latestMod = parsed[0] && parsed[0].dateMs ? new Date(parsed[0].dateMs).toISOString().slice(0, 10) : "";
  const urls = [
    { loc: `${SITE}/`, lastmod: latestMod },
    { loc: `${SITE}/archive/`, lastmod: latestMod },
    { loc: `${SITE}/trailhead/`, lastmod: latestMod },
    ...parsed.map((p) => ({
      loc: `${SITE}/entry/${p.slug}/`,
      lastmod: p.dateMs ? new Date(p.dateMs).toISOString().slice(0, 10) : "",
    })),
  ];
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
      .join("\n") +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap);
  console.log("✓ Generated sitemap.xml");

  // 5. Write rss.xml
  const rssItems = parsed
    .slice(0, 25)
    .map(
      (p) => `    <item>
      <title>${escHtml(p.title)}</title>
      <link>${SITE}/entry/${p.slug}/</link>
      <guid>${SITE}/entry/${p.slug}/</guid>
      <pubDate>${p.dateMs ? new Date(p.dateMs).toUTCString() : ""}</pubDate>
      <description>${escHtml(p.excerpt)}</description>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Cairn — Oracle Fusion Finance Field Notes</title>
    <link>${SITE}/</link>
    <description>Field notes from an Oracle Fusion Finance functional consultant.</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>\n`;
  fs.writeFileSync(path.join(__dirname, "rss.xml"), rss);
  console.log("✓ Generated rss.xml");
}

main();
