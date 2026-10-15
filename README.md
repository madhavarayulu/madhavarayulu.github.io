# Cairn — field notes by Madhava Rayulu

[![Deploy to GitHub Pages](https://github.com/madhavarayulu/madhavarayulu.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/madhavarayulu/madhavarayulu.github.io/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/site-live-E06D44?style=flat-square&logo=safari&logoColor=white)](https://madhavarayulu.github.io/)
[![RSS Feed](https://img.shields.io/badge/rss-feed-8AB49B?style=flat-square&logo=rss&logoColor=white)](https://madhavarayulu.github.io/rss.xml)

> Field notes from an Oracle Fusion Finance functional consultant — implementations,
> process design, and the edge cases official documentation misses.

**Read at [madhavarayulu.github.io](https://madhavarayulu.github.io/)**

## Why "Cairn"

Above the treeline the trail stops being a trail. What keeps you from wandering off
is a pile of stones somebody stacked before you arrived — a stranger's twenty minutes
balancing rocks so you don't get lost. This blog is that pile, made of words instead
of granite: field notes, gotchas, and half-finished thoughts, stacked one on top of
another as they come.

## What you'll find

Practical writing on Oracle Fusion Finance from the implementation trenches:
deployment realities, release cycles, financial process design, and the edge cases
that official documentation quietly skips.

## How it's built

- **Zero-framework Material 3 SPA** — vanilla JS History API router, Markdown rendered with
  [marked](https://github.com/markedjs/marked)
- **Single-Source-of-Truth Static Pages** — a robust Node script (`generate-entries.js`) uses root `index.html` as the master template to pre-render individual posts to `/entry/<slug>/` with full Open Graph, Twitter cards, and structured JSON-LD data for SEO
- **Instant loading** — `posts.json` generated at build time; the SPA renders from
  it without round-trips
- **CI/CD** — GitHub Actions regenerates entries, `posts.json`, `sitemap.xml`, and `rss.xml`
  on every push to `main`, then deploys to GitHub Pages
- **Installable** — PWA manifest with maskable icons; add to home screen on
  Android or iOS and Cairn opens standalone
- **A single canonical mark** — every favicon, app icon, and share card derives
  from one SVG cairn; palette and stone geometry never drift

## Repository structure

~~~text
├── index.html             # Master SPA shell & pre-render template
├── generate-entries.js    # Markdown → static entry pages, posts.json, sitemap, RSS
├── posts/                 # Source notes (.md, front-matter driven)
├── entry/                 # Generated static pages (do not edit by hand)
├── archive/               # Generated archive route shell
├── about/                 # Generated about route shell
├── posts.json             # Build-time post index for the SPA
├── sitemap.xml            # Generated on every push
├── rss.xml                # RSS feed for feed readers
├── robots.txt             # Points crawlers at the sitemap
├── manifest.webmanifest   # PWA manifest
├── favicon.png            # 192 px — Google SERP + Safari
├── apple-touch-icon.png     # 180 px — iOS home screen
├── cairn-maskable-512.png   # 512 px maskable — Android launcher
├── cairn-favicon.svg      # The canonical mark
└── cairn-card-wide.png    # 1200 × 628 social share card
~~~

## Publishing a note

Add a Markdown file to `posts/` and push to `main`:

~~~markdown
---
title: The note's title
date: 2026-01-09
tags: fusion, receivables
series: optional-series-name    # optional
part: 1                        # optional, with series
verified: 25A                  # optional — Oracle release verification stamp
draft: false                   # true = skip generation
---
Body in Markdown.
~~~

The workflow does the rest: static page, SPA index, sitemap entry, RSS feed item, and navigation links between adjacent posts.

## Colophon

Set in Fraunces, Newsreader, and Spline Sans Mono. Palette and mark cut from a
single canonical cairn. No trackers, no analytics, no framework — just stones.

---

## License, Disclaimer & Copyright

*Writing © Madhava Rayulu. The code is yours to learn from.*

> **Disclaimer:** This site is an independent project and is not affiliated with, endorsed by, or sponsored by Oracle Corporation. Oracle and related trademarks are the property of their respective owners. Content is provided for informational purposes based on personal implementation experience and does not constitute official documentation or professional advice.
