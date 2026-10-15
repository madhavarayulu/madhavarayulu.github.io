#!/usr/bin/env node
/**
 * generate-entries.js
 * Single-source-of-truth static generator for Cairn.
 * Builds static entries, archive/about routes, posts.json, sitemap.xml, rss.xml,
 * 404 fallback, and unique per-post preview cards (SVG stencil + PNG for scrapers).
 * Cards render at 2x (2400x1256) so display-cut hairlines survive scraper downscaling.
 * Fonts in fonts/ are probed and logged; a display-cut instance (72pt) is
 * auto-detected and pinned into the card for the PNG rasterizer.
 */
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

/* resvg is optional at dev time; the workflow installs it for CI */
let Resvg = null;
try {
  ({ Resvg } = require("@resvg/resvg-js"));
} catch (_) {
  console.log("- @resvg/resvg-js not installed — card.png will be skipped (npm i @resvg/resvg-js)");
}

const SITE = "https://madhavarayulu.github.io";
const POSTS_DIR = path.join(__dirname, "posts");
const ENTRY_DIR = path.join(__dirname, "entry");
const INDEX_PATH = path.join(__dirname, "index.html");
const CARD_TEMPLATE_PATH = path.join(__dirname, "cairn-card-template.svg");

const escHtml = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/* Font setup for the PNG rasterizer: fonts/ dir if present, else system fonts.
   Files under 10KB are ignored — a truncated/empty TTF must never poison rendering. */
function cardFontConfig() {
  const fontsDir = path.join(__dirname, "fonts");
  if (fs.existsSync(fontsDir)) {
    const files = fs
      .readdirSync(fontsDir)
      .filter((f) => /\.(ttf|otf)$/i.test(f))
      .filter((f) => {
        const ok = fs.statSync(path.join(fontsDir, f)).size > 10000;
        if (!ok) console.log(`- fonts/${f} ignored (too small to be a real font file)`);
        return ok;
      })
      .map((f) => path.join(fontsDir, f));
    if (files.length) {
      return { loadSystemFonts: false, fontFiles: files, defaultFontFamily: "Fraunces" };
    }
  }
  console.log("- No fonts/ TTFs found — card.png will render with runner system fonts");
  return { loadSystemFonts: true };
}

/* Read internal family names (nameID 1 + 16) from a TTF/OTF — parses the 'name' table, no deps. */
function readFontNames(buf) {
  const numTables = buf.readUInt16BE(4);
  let nameOff = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString("ascii", rec, rec + 4) === "name") {
      nameOff = buf.readUInt32BE(rec + 8);
      break;
    }
  }
  if (nameOff < 0) return [];
  const count = buf.readUInt16BE(nameOff + 2);
  const strOff = nameOff + buf.readUInt16BE(nameOff + 4);
  const names = [];
  for (let i = 0; i < count; i++) {
    const rec = nameOff + 6 + i * 12;
    const platformID = buf.readUInt16BE(rec);
    const encodingID = buf.readUInt16BE(rec + 2);
    const nameID = buf.readUInt16BE(rec + 6);
    const len = buf.readUInt16BE(rec + 8);
    const off = buf.readUInt16BE(rec + 10);
    if (nameID !== 1 && nameID !== 16) continue;
    let s = "";
    if (platformID === 3 && (encodingID === 1 || encodingID === 10) && len % 2 === 0) {
      s = Buffer.from(buf.subarray(strOff + off, strOff + off + len)).swap16().toString("utf16le");
    } else if (platformID === 1) {
      s = buf.toString("latin1", strOff + off, strOff + off + len);
    } else continue;
    s = s.replace(/\0/g, "").trim();
    if (s && !names.includes(s)) names.push(s);
  }
  return names;
}

/* Probe fonts/: log every family name resvg will see, and auto-detect a
   display-cut (72pt) instance for the card title. Returns the chosen families. */
function probeFonts() {
  const fontsDir = path.join(__dirname, "fonts");
  if (!fs.existsSync(fontsDir)) {
    console.log("font probe: no fonts/ directory");
    return { display: null, brand: null };
  }
  const files = fs
    .readdirSync(fontsDir)
    .filter((f) => /\.(ttf|otf)$/i.test(f) && fs.statSync(path.join(fontsDir, f)).size > 10000);
  if (!files.length) {
    console.log("font probe: no usable ttf/otf files in fonts/");
    return { display: null, brand: null };
  }
  const names = [];
  for (const f of files) {
    try {
      const n = readFontNames(fs.readFileSync(path.join(fontsDir, f)));
      console.log(`font probe ${f}: ${JSON.stringify(n)}`);
      names.push(...n);
    } catch (e) {
      console.log(`font probe ${f}: failed (${e.message})`);
    }
  }
  const uniq = [...new Set(names)];
  const display = uniq.find((n) => /72\s*pt/i.test(n)) || null;
  const brand = uniq.find((n) => /72\s*pt/i.test(n) && /medium/i.test(n)) || display;
  console.log(`font probe: display family = ${display || "(none — variable Fraunces will be used)"}`);
  return { display, brand };
}

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

/* Wrap a card title into balanced lines for the SVG stencil (max 3 lines). */
function wrapCardTitle(title, max = 32, maxLines = 3) {
  const words = String(title || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const cand = cur ? cur + " " + w : w;
    if (cand.length <= max) cur = cand;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
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

  let cardTemplate = null;
  if (fs.existsSync(CARD_TEMPLATE_PATH)) {
    cardTemplate = fs.readFileSync(CARD_TEMPLATE_PATH, "utf8");
  }

  const CARD_FONTS = cardFontConfig();
  const CARD_FAMILIES = probeFonts();

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

  const validSlugs = parsed.map((p) => p.slug);
  fs.readdirSync(ENTRY_DIR).forEach((d) => {
    if (!validSlugs.includes(d)) {
      fs.rmSync(path.join(ENTRY_DIR, d), { recursive: true, force: true });
      console.log(`- Removed stale: entry/${d}/`);
    }
  });

  parsed.forEach((p, index) => {
    const newer = parsed[index - 1];
    const older = parsed[index + 1];
    const bodyHtml = marked.parse(p.body);
    const url = `${SITE}/entry/${p.slug}/`;
    const cardImgUrl =
      cardTemplate && Resvg
        ? `${SITE}/entry/${p.slug}/card.png`
        : `${SITE}/cairn-card-wide.png`;
    const isoDate = p.dateMs ? new Date(p.dateMs).toISOString() : "";

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: p.title,
      description: p.excerpt,
      datePublished: isoDate,
      dateModified: isoDate,
      author: { "@type": "Person", name: "Madhava Rayulu", url: SITE },
      publisher: { "@type": "Organization", name: "Cairn" },
      mainEntityOfPage: url,
    });

    const seoBlock = `    <title>${escHtml(p.title)} · Cairn</title>
    <meta name="description" content="${escHtml(p.excerpt)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Cairn" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${escHtml(p.title)}" />
    <meta property="og:description" content="${escHtml(p.excerpt)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${cardImgUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="628" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="Article preview card: ${escHtml(p.title)} — Cairn, field notes by Madhava Rayulu" />
    <link rel="canonical" href="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escHtml(p.title)}" />
    <meta name="twitter:description" content="${escHtml(p.excerpt)}" />
    <meta name="twitter:image" content="${cardImgUrl}" />
    <script type="application/ld+json">${jsonLd}</script>`;

    const viewBlock = `
        <div class="page-grid">
          <div class="main-col">
            <a class="back-chip" href="/" data-nav><span class="ms-icon" aria-hidden="true">arrow_back</span> Field notes</a>
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

    // Stamp the post title into the card stencil, then rasterize to PNG for scrapers.
    // Rendered at 2x (2400x1256): display-cut hairlines survive only when there are
    // enough pixels for them; scrapers downscale, which restores the intended contrast.
    if (cardTemplate) {
      const lines = wrapCardTitle(p.title);
      const y0 = 300 - (lines.length - 1) * 31;
      const titleBlock =
        '<text x="110" y="' + y0 + '" class="title">' +
        lines.map((l, i) => `<tspan x="110"${i ? ' dy="62"' : ""}>${escHtml(l)}</tspan>`).join("") +
        "</text>";
      let cardSvg = cardTemplate.replace("<!--TITLE_BLOCK-->", titleBlock);

      // Pin the detected families ahead of the fallbacks (idempotent with the template's own pins)
      if (CARD_FAMILIES.display) {
        const override =
          `\n      .title { font-family: '${CARD_FAMILIES.display}', 'Fraunces', Georgia, serif; }` +
          `\n      .brand { font-family: '${CARD_FAMILIES.brand || CARD_FAMILIES.display}', 'Fraunces', Georgia, serif; }\n  `;
        cardSvg = cardSvg.replace("</style>", override + "</style>");
      }

      fs.writeFileSync(path.join(outDir, "card.svg"), cardSvg);

      if (Resvg) {
        const resvg = new Resvg(cardSvg, {
          fitTo: { mode: "width", value: 2400 },
          background: "#12100e",
          font: CARD_FONTS,
        });
        fs.writeFileSync(path.join(outDir, "card.png"), resvg.render().asPng());
      }
    }

    console.log(`✓ Generated entry/${p.slug}/`);
  });

  ["archive", "about"].forEach((route) => {
    const dir = path.join(__dirname, route);
    fs.mkdirSync(dir, { recursive: true });
    const routeTitle = route === "archive" ? "Archive · Cairn" : "About · Cairn";
    const siteDesc = "Field notes from an Oracle Fusion Finance functional consultant.";
    const seo = `    <title>${routeTitle}</title>
    <link rel="canonical" href="${SITE}/${route}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Cairn" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${routeTitle}" />
    <meta property="og:description" content="${siteDesc}" />
    <meta property="og:url" content="${SITE}/${route}/" />
    <meta property="og:image" content="${SITE}/cairn-card-wide.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="628" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="Cairn — a small stack of stones on a dark field, with the wordmark and tagline" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${routeTitle}" />
    <meta name="twitter:description" content="${siteDesc}" />
    <meta name="twitter:image" content="${SITE}/cairn-card-wide.png" />`;
    fs.writeFileSync(path.join(dir, "index.html"), injectPage(shell, seo, ""));
    console.log(`✓ Generated ${route}/index.html`);
  });

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

  const latestMod = parsed[0] && parsed[0].dateMs ? new Date(parsed[0].dateMs).toISOString().slice(0, 10) : "";
  const urls = [
    { loc: `${SITE}/`, lastmod: latestMod },
    { loc: `${SITE}/archive/`, lastmod: latestMod },
    { loc: `${SITE}/about/`, lastmod: latestMod },
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

  fs.writeFileSync(path.join(__dirname, "404.html"), shell);
  console.log("✓ Generated 404.html fallback for graceful routing");

  const rssItems = parsed
    .slice(0, 25)
    .map((p) => {
      const pub = p.dateMs ? `\n      <pubDate>${new Date(p.dateMs).toUTCString()}</pubDate>` : "";
      return `    <item>
      <title>${escHtml(p.title)}</title>
      <link>${SITE}/entry/${p.slug}/</link>
      <guid>${SITE}/entry/${p.slug}/</guid>${pub}
      <description>${escHtml(p.excerpt)}</description>
    </item>`;
    })
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
